import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UploadComponent } from './components/upload/upload';
import { WinnersTable } from './components/winners-table/winners-table';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            CommonModule, 
            MatTableModule, 
            MatCardModule,
            MatButtonModule, 
            MatIconModule, 
            MatDividerModule, 
            UploadComponent, 
            WinnersTable],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // protected readonly title = signal('jockeyjockey');

  // async onFile(ev: Event) {
  //   console.log("onFile called with", ev);
  //   const input = ev.target as HTMLInputElement;
  //   const file = input.files?.[0];
  //   if (!file) return;
  //   try {
  //     const winners = await this.csv.parseWinners(file);
  //     this.data.set(winners.sort((a,b) => a.raceDateTime.getTime() - b.raceDateTime.getTime()));
  //   } catch (e) {
  //     console.error(e);
  //     this.data.set([]);
  //     alert('Failed to parse CSV. Check the headers (Race/Racecourse, RaceDate, RaceTime, Horse, Jockey, FinishingPosition).');
  //   } finally {
  //     input.value = ''; // allow re-upload of same file
  //   }
  // }
}
