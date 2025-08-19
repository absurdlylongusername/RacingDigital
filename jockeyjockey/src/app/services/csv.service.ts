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

  constructor(private http: HttpClient) {}
  async initFrom(url: string): Promise<void> {
    const csvText = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
    const parsed = Papa.parse<RawRaceRow>(csvText ?? '',
      {
        header: true, skipEmptyLines: true, dynamicTyping: true
      }).data ?? [];
    console.log("Parsed CSV rows:", parsed.length);
    this._rawRows.set(parsed);
    
    const winners = parsed
    .filter(r => `${r.FinishingPosition}`.trim() === '1')
    .map(r => this.mapToWinner(r))
    .filter((x): x is WinnerRow => !!x);
    
    console.log("Parsed winner rows:", winners.length);
    // sort by date descending, most recent first
    winners.sort((a,b) => b.raceDateTime.getTime() - a.raceDateTime.getTime());
    this._winners.set(winners);
  }
  
  parseWinners(file: File): Promise<WinnerRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<RawRaceRow>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const rows = (results.data || []).filter(Boolean);
            const winners: WinnerRow[] = rows
              .filter(r => `${r.FinishingPosition}`.trim() === '1')
              .map(r => this.mapToWinner(r))
              .filter((x): x is WinnerRow => !!x);
            resolve(winners);
          } catch (e) { reject(e); }
        },
        error: (err) => reject(err)
      });
    });
  }

  async loadWinnersFromAssets(url: string): Promise<WinnerRow[]> {
    const csvText = await this.http.get(url, { responseType: 'text' }).toPromise();
    console.log("Got CSV text", csvText);
    const rows = this.parseCsv<RawRaceRow>(csvText ?? '');
    console.log(rows.length, "rows parsed from CSV");
    return rows
      .filter(r => `${r.FinishingPosition}`.trim() === '1')
      .map(r => this.mapToWinner(r))
      .filter((x): x is WinnerRow => !!x);
  }

  private parseCsv<T>(text: string): T[] {
    const res = Papa.parse<T>(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
    return (res.data as T[]) ?? [];
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
