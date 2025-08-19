import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersTable } from './winners-table';

describe('WinnersTable', () => {
  let component: WinnersTable;
  let fixture: ComponentFixture<WinnersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinnersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
