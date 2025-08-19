export interface RawRaceRow {
  Race: string;
  Racecourse: string;
  RaceDate: string;   // e.g. 2024-05-01
  RaceTime: string;   // e.g. 14:35
  Horse: string;
  Jockey: string;
  FinishingPosition: string | number;
  // keep others for later (DistanceBeaten, TimeBeaten, RaceDistance, FieldSize...)
}

export interface WinnerRow {
  raceName: string;         // Race or Racecourse
  raceDateTime: Date;        // combined date + time
  horse: string;
  jockey: string;
}
