import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCreateRecordComponent } from './doctor-create-record.component';

describe('DoctorCreateRecordComponent', () => {
  let component: DoctorCreateRecordComponent;
  let fixture: ComponentFixture<DoctorCreateRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCreateRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCreateRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
