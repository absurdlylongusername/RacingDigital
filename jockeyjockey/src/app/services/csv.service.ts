import { Injectable, computed, signal } from '@angular/core';
import Papa from 'papaparse';
import { RawRaceRow, WinnerRow } from '../models/models'
import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private readonly _winners = signal<WinnerRow[]>([]);
  private readonly _rawRows = signal<RawRaceRow[]>([]);

  readonly rows = computed(() => this._rawRows());
  readonly winners = computed(() => this._winners());

  private readonly _selectedRaceName = signal<string | null>(null);
  readonly selectedRaceName = computed(() => this._selectedRaceName());

  // notes per race, keyed by race name
  private readonly _raceNotes = signal<Map<string, string>>(new Map());

  /** Current note for the selected race ('' if none/empty) */
  readonly selectedRaceNote = computed(() => {
    const race = this._selectedRaceName();
    const map = this._raceNotes();
    return race ? (map.get(race) ?? '') : '';
  });
  
  readonly selectedRaceDetailsRows = computed(() => {
    const raceName = this._selectedRaceName();
    const allRows = this._rawRows();
    if (!raceName) return [];
    return allRows.filter(r => r.Race.trim() === raceName);
  })
  
  constructor(private http: HttpClient) {}
  async initFrom(url: string): Promise<void> {
    const csvText = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
    const parsed = this.parseCsv<RawRaceRow>(csvText);
    const cleanedData = this.cleanData(parsed);
    this._rawRows.set(cleanedData);

    const winners = cleanedData
      .filter(r => `${r.FinishingPosition}`.trim() === '1')
      .map(r => this.mapToWinner(r))
      .filter((x): x is WinnerRow => !!x);
    
    console.log("Parsed winner rows:", winners.length);
    // sort by date descending, most recent first
    winners.sort((a,b) => b.raceDateTime.getTime() - a.raceDateTime.getTime());
    this._winners.set(winners);
  }

  public setSelectedRaceNote(text: string) {
    const race = this._selectedRaceName();
    if (!race) return;
    const next = new Map(this._raceNotes());
    if (text?.trim().length) next.set(race, text);
    else next.delete(race); // remove empty notes
    this._raceNotes.set(next);
  }

  public getNote(raceName: string): string {
    return this._raceNotes().get(raceName) ?? '';
  }

  public selectRace(row: WinnerRow | null): void {
    this._selectedRaceName.set(row?.raceName ?? null);
  }
  public clearSelectedRace(): void {
    this._selectedRaceName.set(null);
  }

  private parseCsv<T>(text: string): T[] {
    const res = Papa.parse<T>(text ?? '',
      {
        header: true, skipEmptyLines: true, dynamicTyping: true
      }).data ?? [];
    console.log("Parsed CSV rows:", res.length);
    return res;
  }

  private cleanData(rows: RawRaceRow[]): RawRaceRow[] {
    return rows.map(row => {
      row.Horse = row.Horse?.trim() ?? '';
      row.Jockey = row.Jockey?.trim() ?? '';
      row.Race = row.Race?.trim() ?? '';
      row.RaceDate = row.RaceDate?.trim() ?? '';
      return row;
    });
  }

  private mapToWinner(r: RawRaceRow): WinnerRow | null {
    const raceName = r.Race?.toString().trim() || 'Race';
    const dateStr  = r.RaceDate?.toString().trim();
    const timeStr  = r.RaceTime?.toString().trim();
    const horse    = r.Horse?.toString().trim();
    const jockey   = r.Jockey?.toString().trim();
    
    if (!dateStr || !timeStr || !horse || !jockey) {
      console.log("Something is null")
      return null;
    }

    const iso = `${dateStr} ${timeStr}`;
    const parsedRaceDateTime = DateTime.fromFormat(iso, 'dd/MM/yyyy HHmm');
    if (!parsedRaceDateTime.isValid) {
      console.log("Invalid date:", iso);
      return null;
    }

    return { raceName, raceDateTime: parsedRaceDateTime.toJSDate(), horse, jockey };
  }
}
