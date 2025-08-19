export interface RawRaceRow {
  Race: string;
  Racecourse: string;
  RaceDate: string;   // dd/MM/YYYY 
  RaceTime: string;   // e.g. hhmm
  Horse: string;
  Jockey: string;
  FinishingPosition: number;
  // keep others for later (DistanceBeaten, TimeBeaten, RaceDistance, FieldSize...)
}

export interface WinnerRow {
  raceName: string;         // Race or Racecourse
  raceDateTime: Date;        // combined date + time
  horse: string;
  jockey: string;
}
