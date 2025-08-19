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
    effect(() => {
      const rows = this.csv.selectedRaceDetailsRows();
      this.data.set(rows);
      this.dataSource.data = rows;
    });
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'finishingPosition': return item.FinishingPosition;
        case 'distanceBeaten': return item.DistanceBeaten;
        case 'jockey': return item.Jockey;
        case 'horse': return item.Horse;
        case 'trainer': return item.Trainer;
        case 'timeBeaten': return item.TimeBeaten;
        default: return (item as any)[property];
      }
    };
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
