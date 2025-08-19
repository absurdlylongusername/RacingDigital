import { Component, AfterViewInit, ViewChild, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { CsvService } from '../../services/csv.service';
import { RawRaceRow } from '../../models/models';

type Col = 'jockey' | 'trainer' | 'horse' | 'finishingPosition' | 'distanceBeaten' | 'timeBeaten';

@Component({
  selector: 'race-details-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatTableModule, MatSortModule],
  templateUrl: './race-details-table.html',
  styleUrl: './race-details-table.scss'
})
export class RaceDetailsTable implements AfterViewInit {
  cols: Col[] = [
    'finishingPosition',
    'jockey',
    'horse',
    'distanceBeaten',
    'timeBeaten',
    'trainer',
  ];
  data = signal<RawRaceRow[]>([]);
  dataSource = new MatTableDataSource<RawRaceRow>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private csv: CsvService) {
    // react to store updates
    effect(() => {
      const rows = this.csv.selectedRaceDetailsRows(); // all parsed rows
      this.data.set(rows);
      this.dataSource.data = rows ?? [];
    });

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
