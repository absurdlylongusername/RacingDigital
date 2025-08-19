import { Component, AfterViewInit, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import { CsvService } from '../../services/csv.service';
import { WinnerRow } from '../../models/models';



@Component({
  selector: 'winners-table',
  imports: [CommonModule, MatSortModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './winners-table.html',
  styleUrl: './winners-table.scss'
})
export class WinnersTable implements AfterViewInit {
  cols = ['race','dateTime','horse','jockey'];
  data = signal<WinnerRow[]>([]);
  dataSource = new MatTableDataSource<WinnerRow>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private csv: CsvService) {
    effect(() => {
      this.data.set(this.csv.winners());
      this.dataSource.data = this.data();
    })

    this.dataSource.sortingDataAccessor = (row, column) => {
    if (column === 'dateTime') return row.raceDateTime?.getTime?.() ?? 0;
    if (column === 'race') return row.raceName?.toLowerCase?.() ?? '';
    return (row as any)[column]?.toString?.().toLowerCase?.() ?? (row as any)[column] ?? '';
    };
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
