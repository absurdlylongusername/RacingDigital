import { Injectable, computed, signal } from '@angular/core';
import Papa from 'papaparse';
import { JockeyLeaderboardRow, RawRaceRow, WinnerRow } from '../models/models'
import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private readonly _winners = signal<WinnerRow[]>([]);
  private readonly _horses = signal<string[]>([]);
  private readonly _rawRows = signal<RawRaceRow[]>([]);
  // private readonly _jockeyLeaderboardRows = signal<JockeyLeaderboardRow[]>([]);

  readonly rows = computed(() => this._rawRows());
  readonly winners = computed(() => this._winners());
  // readonly jockeyLeaderboardRows = computed(() => this._jockeyLeaderboardRows());
  readonly horses = computed(() => this._horses());

  private readonly _selectedRaceName = signal<string | null>(null);
  private readonly _selectedHorse = signal<string | null>(null);
  readonly selectedRaceName = computed(() => this._selectedRaceName());
  readonly selectedHorse = computed(() => this._selectedHorse());

  readonly horseRaceCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    const rows = this._rawRows();
    for (const r of rows) {
      counts[r.Horse] = (counts[r.Horse] ?? 0) + 1;
    }
    return counts;
  });

  private readonly _raceNotes = signal<Record<string, string>>({});

  readonly selectedRaceNote = computed(() => {
    const race = this._selectedRaceName();
    const map = this._raceNotes();
    return race ? (map[race] ?? '') : '';
  });
  
  readonly selectedRaceDetailsRows = computed(() => {
    const raceName = this._selectedRaceName();
    const allRows = this._rawRows();
    if (!raceName) return [];
    return allRows.filter(r => r.Race === raceName);
  })

  readonly selectedHorseJockeyLeaderboardRows = computed(() => {
    const horse = this._selectedHorse();
    const allRows = this._rawRows();
    if (!horse) return [];
    // find
    return allRows
      .filter(r => r.Horse === horse)
      .map(this.mapToJockeyLeaderboardRow)
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

    const horses = [...new Set(cleanedData.map(r => r.Horse))]
      .sort((a, b) => a.localeCompare(b));
    this._horses.set(horses);
    // sort by date descending, most recent first
    winners.sort((a,b) => b.raceDateTime.getTime() - a.raceDateTime.getTime());
    this._winners.set(winners);
  }

  public raceCountForHorse = (horse: string) => this.horseRaceCounts()[horse] ?? 0

  setSelectedRaceNote(note: string) {
    const raceName = this.selectedRaceName();
    if (!raceName) return;

    const trimmed = note.trim();

    this._raceNotes.update(prev => {
      if (trimmed) {
        const { [raceName]: _removed, ...rest } = prev;
        return rest;
      }

      // set/update key
      if (prev[raceName] === trimmed) return prev; // no-op if unchanged
      return { ...prev, [raceName]: trimmed };
    });
  }

  public getNote(raceName: string): string {
    return this._raceNotes()[raceName] ?? '';
  }

  public selectRace(row: WinnerRow | null): void {
    this._selectedRaceName.set(row?.raceName ?? null);
  }
  public clearSelectedRace(): void {
    this._selectedRaceName.set(null);
  }

  public selectHorse(horse: string | null): void {
    this._selectedHorse.set(horse);
  }

  public clearSelectedHorse(): void {
    this._selectedHorse.set(null);
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

  private mapToJockeyLeaderboardRow(r: RawRaceRow): JockeyLeaderboardRow {
    const raceName = r.Race;
    const jockey   = r.Jockey;
    const position  = r.FinishingPosition;
    const distanceBeaten  = r.DistanceBeaten;
    const timeBeaten    = r.TimeBeaten;
    
    return { raceName, jockey, position, distanceBeaten, timeBeaten };
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
