import { Component, AfterViewInit, ViewChild, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { CsvService } from '../../services/csv.service';
import { JockeyRanking } from '../../models/models';

type Col = 'jockey' | 'points' | 'races' | 'winPercentage';

@Component({
  selector: 'jockey-leaderboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule,
    MatTableModule, MatSortModule, MatDividerModule
  ],
  templateUrl: './jockey-leaderboard.html',
  styleUrl: './jockey-leaderboard.scss'
})
export class JockeyLeaderboard implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  cols: Col[] = ['jockey', 'points', 'races', 'winPercentage'];

  horses = signal<string[]>([]);
  selectedHorse = signal<string | null>(null);
  horseRaceCounts = signal<Record<string, number>>({});
  data = signal<JockeyRanking[]>([]);
  dataSource = new MatTableDataSource<JockeyRanking>([]);

  constructor(private csv: CsvService) {
    effect(() => this.horses.set(this.csv.horses()));
    effect(() => this.selectedHorse.set(this.csv.selectedHorse()));

    // Keep table in sync with service; simple sort by finishing position asc
    effect(() => {
      const rows = this.csv.jockeyRankings();
      // TODO: ranking logic here
      this.data.set(rows);
      this.dataSource.data = rows;
    });

    effect(() => this.horseRaceCounts.set(this.csv.horseRaceCounts()));
  }

  onHorseChange(horse: string | null) {
    this.csv.selectHorse(horse);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
