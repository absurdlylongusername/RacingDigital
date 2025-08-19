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

