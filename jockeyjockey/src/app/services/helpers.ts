import { DateTime } from "luxon";
import { RawRaceRow, ScoringConfig, WinnerRow } from "../models/models";


const JUMP_RACE_STRING = 'to be ridden by professional jump jockeys';

  export function isJumpRace(raceName: string): boolean {
    return raceName.toLowerCase().includes(JUMP_RACE_STRING);
  }

  export function firstPlacePoints(cfg: ScoringConfig): number {
    return cfg.placingPoints[1];
  }

  export function placingPoints(position: number, cfg: ScoringConfig): number {
    const pts = cfg.placingPoints[position];
    if (pts === undefined) {
      return 0;
    }
    return pts;
  }

  export function getLengthsPerSecondFromRace(row: RawRaceRow, cfg: ScoringConfig): number {
    return isJumpRace(row.Race)
      ? cfg.jumpingLengthsPerSecond
      : cfg.flatLengthsPerSecond;
  }

  export function timeBehindSeconds(row: RawRaceRow, cfg: ScoringConfig): number {
    const lengthsPerSecond = getLengthsPerSecondFromRace(row, cfg);
    const fromLengths = row.DistanceBeaten / lengthsPerSecond;
    return Math.min(row.TimeBeaten, fromLengths);
  }

  export function mapToWinner(r: RawRaceRow): WinnerRow | null {
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

  export function validateScoringConfig(cfg: ScoringConfig): void {
    if (!cfg.placingPoints || !(1 in cfg.placingPoints) || !(2 in cfg.placingPoints)) {
      throw new Error('placingPoints must include at least positions 1 and 2');
    }

    const p1 = cfg.placingPoints[1];
    const p2 = cfg.placingPoints[2];
    if (p1 <= 0) {
      throw new Error('points for 1st must be > 0');
    }
    if (p2 < 0) {
      throw new Error('points for 2nd must be >= 0');
    }
    if (3 in cfg.placingPoints) {
      const p3 = cfg.placingPoints[3];
      if (p3 < 0) {
        throw new Error('points for 3rd must be >= 0');
      }
      if (!(p1 >= p2 && p2 >= p3)) {
        throw new Error('placingPoints must be non-increasing with position');
      }
    } else {
      if (!(p1 >= p2)) {
        throw new Error('placingPoints must be non-increasing with position');
      }
    }

    if (!(cfg.nearWinFactor >= 0 && cfg.nearWinFactor <= 1)) {
      throw new Error('nearWinFactor must be in [0,1]');
    }
    if (!(cfg.finishPercentWeight >= 0 && cfg.finishPercentWeight <= 1)) {
      throw new Error('finishPercentWeight must be in [0,1]');
    }
    if (!(cfg.flatLengthsPerSecond > 0 && cfg.jumpingLengthsPerSecond > 0)) {
      throw new Error('lengthsPerSecond must be > 0');
    }
    if (!(cfg.closeMinSec >= 0 && cfg.closeMaxSec > cfg.closeMinSec)) {
      throw new Error('closeMinSec must be >= 0 and closeMaxSec > closeMinSec');
    }
    if (!(cfg.maxCloseFactor >= 0)) {
      throw new Error('maxCloseFactor must be >= 0');
    }
    if (!(cfg.shrinkageK >= 0)) {
      throw new Error('shrinkageK must be >= 0');
    }
  }