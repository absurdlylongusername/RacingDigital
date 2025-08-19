import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JockeyLeaderboard } from './jockey-leaderboard';

describe('JockeyLeaderboard', () => {
  let component: JockeyLeaderboard;
  let fixture: ComponentFixture<JockeyLeaderboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JockeyLeaderboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JockeyLeaderboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
