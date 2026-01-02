import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionDailyListComponent } from './reception-daily-list.component';

describe('ReceptionDailyListComponent', () => {
  let component: ReceptionDailyListComponent;
  let fixture: ComponentFixture<ReceptionDailyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionDailyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionDailyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
