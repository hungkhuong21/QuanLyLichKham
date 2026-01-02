import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionDirectComponent } from './reception-direct.component';

describe('ReceptionDirectComponent', () => {
  let component: ReceptionDirectComponent;
  let fixture: ComponentFixture<ReceptionDirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionDirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
