import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCreateResultComponent } from './doctor-create-result.component';

describe('DoctorCreateResultComponent', () => {
  let component: DoctorCreateResultComponent;
  let fixture: ComponentFixture<DoctorCreateResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCreateResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCreateResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
