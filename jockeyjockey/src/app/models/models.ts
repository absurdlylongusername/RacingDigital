export interface RawRaceRow {
  Race: string;
  Racecourse: string;
  RaceDistance: number;
  RaceDate: string;   // dd/MM/YYYY 
  RaceTime: string;   // e.g. hhmm
  Horse: string;
  Jockey: string;
  Trainer: string;
  FinishingPosition: number;
  DistanceBeaten: number;
  TimeBeaten: number;
}

export interface WinnerRow {
  raceName: string;
  raceDateTime: Date;
  horse: string;
  jockey: string;
}

export interface JockeyLeaderboardRow {
  raceName: string;
  jockey: string;
  position: number;
  distanceBeaten: number;
  timeBeaten: number;
}

export interface JockeyRanking {
  jockey: string;
  points: number; // 1st=3, 2nd=2, 3rd=1
  races: number;
  winPercentage: number; // 0–100
}

// ---- Scoring config ----
export type PlacingPoints = Record<number, number>;

export interface ScoringConfig {
  placingPoints: PlacingPoints;          // e.g. {1:5, 2:3, 3:1}
  photoThresholdSec: number;             // near-win window for 2nd place
  nearWinFactor: number;                 // 0..1 of (points(1st) - points(2nd))
  flatLengthsPerSecond: number;          // 6
  jumpingLengthsPerSecond: number;       // 4
  closeMinSec: number;                   // full close bonus if <= this
  closeMaxSec: number;                   // zero close bonus if >= this
  maxCloseFactor: number;                // fraction of points(1st)
  finishPercentWeight: number;           // 0..1, scaled by points(1st)
  shrinkageK: number;                    // >= 0
}