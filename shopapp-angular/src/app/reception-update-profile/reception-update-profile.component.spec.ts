import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionUpdateProfileComponent } from './reception-update-profile.component';

describe('ReceptionUpdateProfileComponent', () => {
  let component: ReceptionUpdateProfileComponent;
  let fixture: ComponentFixture<ReceptionUpdateProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionUpdateProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionUpdateProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
