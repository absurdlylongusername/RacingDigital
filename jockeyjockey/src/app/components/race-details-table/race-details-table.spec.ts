import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceDetailsTable } from './race-details-table';

describe('RaceDetailsTable', () => {
  let component: RaceDetailsTable;
  let fixture: ComponentFixture<RaceDetailsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceDetailsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaceDetailsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
