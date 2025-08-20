import { Injectable, computed, signal } from '@angular/core';
import Papa from 'papaparse';
import { JockeyRanking, RawRaceRow, ScoringConfig, WinnerRow } from '../models/models'
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { firstPlacePoints, mapToWinner, placingPoints, timeBehindSeconds, validateScoringConfig } from './helpers';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private readonly _winners = signal<WinnerRow[]>([]);
  private readonly _horses = signal<string[]>([]);
  private readonly _rawRows = signal<RawRaceRow[]>([]);

  readonly rows = computed(() => this._rawRows());
  readonly winners = computed(() => {
    const jockey = this._selectedJockey();
    if (!jockey) return this._winners();

    const jockeyRaces = this._rawRows().filter(r => r.Jockey === jockey).map(r => r.Race);
    return this._winners().filter(w => jockeyRaces.includes(w.raceName));
  });

  private readonly _selectedRaceName = signal<string | null>(null);
  private readonly _selectedJockey = signal<string | null>(null);
  readonly selectedRaceName = computed(() => this._selectedRaceName());
  readonly selectedJockey = computed(() => this._selectedJockey());

  readonly fieldSizesByRace = computed<Record<string, number>>(() => {
    const fieldSizes: Record<string, number> = {};
    const rows = this._rawRows();

    for (const row of rows) {
      if (fieldSizes[row.Race] === undefined) {
        fieldSizes[row.Race] = 1;
      } else {
        fieldSizes[row.Race] += 1;
      }
    }

    return fieldSizes;
  });

  private scoring: ScoringConfig = {
    placingPoints: { 1: 5, 2: 3, 3: 1 },
    photoThresholdSec: 0.05,
    nearWinFactor: 0.4,
    flatLengthsPerSecond: 6,
    jumpingLengthsPerSecond: 4,
    closeMinSec: 0.00,
    closeMaxSec: 0.5,
    maxCloseFactor: 0.6,
    finishPercentWeight: 0.05,
    shrinkageK: 0
  };

  // bump version to recompute standings when config changes
  private _scoringVersion = signal(0);

  setScoringConfig(partial: Partial<ScoringConfig>): void {
    this.scoring = { ...this.scoring, ...partial };
    validateScoringConfig(this.scoring);
    this._scoringVersion.update(n => n + 1);
  }

  readonly jockeyRankings = computed<JockeyRanking[]>(() => {
    const _ = this._scoringVersion();

    const rows = this._rawRows();
    if (!rows) { return []; }
    
    const cfg = this.scoring;
    const firstPoints = firstPlacePoints(cfg);
    const fieldSizes = this.fieldSizesByRace();

    // accumulate per jockey
    const accumulators: Record<string, { rides: number; wins: number; scoreSum: number }> = {};

    for (const row of rows) {
      const position = row.FinishingPosition;

      // 1) base placing points
      const basePoints = placingPoints(position, cfg);

      // 2) near-win bonus for 2nd place within threshold
      const behind = timeBehindSeconds(row, cfg);
      let nearWinBonus = 0;
      if (position === 2 && behind <= cfg.photoThresholdSec) {
        nearWinBonus = cfg.nearWinFactor * (placingPoints(1, cfg) - placingPoints(2, cfg));
      }

      // 3) close-to-winner credit for any position
      let closeCredit = 0;
      if (behind <= cfg.closeMinSec) {
        closeCredit = cfg.maxCloseFactor * firstPoints;
      } else if (behind < cfg.closeMaxSec) {
        const t = (behind - cfg.closeMinSec) / (cfg.closeMaxSec - cfg.closeMinSec);
        closeCredit = (1 - t) * cfg.maxCloseFactor * firstPoints;
      }

      // 4) finish percentile light bonus
      const fieldSize = fieldSizes[row.Race];
      let finishPercent = 0;
      if (fieldSize > 1) {
        finishPercent = (position < 1 || position > fieldSize) ? 
          0 :
          (fieldSize - position) / (fieldSize - 1);
      }
      const finishBonus = cfg.finishPercentWeight * firstPoints * finishPercent;

      const rideScore = basePoints + nearWinBonus + closeCredit + finishBonus;

      const jockey = row.Jockey;
      accumulators[jockey] ??= { rides: 0, wins: 0, scoreSum: 0 };

      accumulators[jockey].rides += 1;
      if (position === 1) {
        accumulators[jockey].wins += 1;
      }
      accumulators[jockey].scoreSum += rideScore;
    }

    let totalScore = 0;
    let totalRides = 0;
    for (const jockey in accumulators) {
      totalScore += accumulators[jockey].scoreSum;
      totalRides += accumulators[jockey].rides;
    }
    
    // Some logic here supposed to normalize points a bit so that jockeys with more races but lower placing
    // have more points than those with less races but more points, but I have commented it out cus 
    // I am not sure if it's needed.

    // const leagueMean = totalRides === 0 ? 0 : totalScore / totalRides;
    const rankings: JockeyRanking[] = [];
    for (const jockey in accumulators) {
      const a = accumulators[jockey];
      // const rawAverage = a.scoreSum / a.rides;
      const n = a.rides;
      const k = cfg.shrinkageK;

      // const points = (n / (n + k)) * rawAverage + (k / (n + k)) * leagueMean;
      const winPercentage = (a.wins / a.rides) * 100;

      rankings.push({
        jockey,
        points: a.scoreSum,
        races: a.rides,
        winPercentage
      });
    }
    
    rankings.sort((a, b) =>
      b.points - a.points ||
      b.winPercentage - a.winPercentage ||
      b.races - a.races ||
      a.jockey.localeCompare(b.jockey)
    );

    return rankings;
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
  
  constructor(private http: HttpClient) {
    validateScoringConfig(this.scoring);
  }

  async initFrom(url: string): Promise<void> {
    const csvText = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
    const parsed = this.parseCsv<RawRaceRow>(csvText);
    const cleanedData = this.cleanData(parsed);
    this._rawRows.set(cleanedData);

    const winners = cleanedData
      .filter(r => `${r.FinishingPosition}`.trim() === '1')
      .map(r => mapToWinner(r))
      .filter((x): x is WinnerRow => !!x);
    
    console.log("Parsed winner rows:", winners.length);

    const horses = [...new Set(cleanedData.map(r => r.Horse))]
      .sort((a, b) => a.localeCompare(b));
    this._horses.set(horses);
    // sort by date descending, most recent first
    winners.sort((a,b) => b.raceDateTime.getTime() - a.raceDateTime.getTime());
    this._winners.set(winners);
  }

  setSelectedRaceNote(note: string) {
    const raceName = this.selectedRaceName();
    if (!raceName) return;

    const trimmed = note.trim();

    this._raceNotes.update(prev => {
      if (trimmed) {
        const { [raceName]: _removed, ...rest } = prev;
        return rest;
      }

      if (prev[raceName] === trimmed) return prev;
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

  public selectJockey(jockey: string | null): void {
    this._selectedJockey.set(jockey);
  }

  public clearSelectedJockey(): void {
    this._selectedJockey.set(null);
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
      if (!row.Horse || !row.Jockey || !row.Race || !row.RaceDate)
      {
        console.log("Found null in data", row);
        return null;
      }
      return row;
    })
    .filter(m => !!m);
  }
}
