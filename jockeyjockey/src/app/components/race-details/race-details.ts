import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CsvService } from '../../services/csv.service';
import { RaceDetailsTable } from '../race-details-table/race-details-table';

@Component({
  selector: 'race-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    RaceDetailsTable
  ],
  templateUrl: './race-details.html',
  styleUrl: './race-details.scss'
})
export class RaceDetails {

  // probs remove this
  noteDraft = signal<string>('');

  constructor(private csv: CsvService) {
    effect(() => {
      this.noteDraft.set(this.csv.selectedRaceNote());
    });
  }

  get selectedRaceName() {
    return this.csv.selectedRaceName();
  }

  onNoteInput(ev: Event) {
    // Support both <textarea> and <input>
    const target = ev.target as HTMLTextAreaElement | HTMLInputElement | null;
    const val = target?.value ?? '';
    
    this.noteDraft.set(val);
    this.csv.setSelectedRaceNote(val); // remove if you prefer explicit "Save"
  }

  clearNote() {
    this.noteDraft.set('');
    this.csv.setSelectedRaceNote('');
  }
}
