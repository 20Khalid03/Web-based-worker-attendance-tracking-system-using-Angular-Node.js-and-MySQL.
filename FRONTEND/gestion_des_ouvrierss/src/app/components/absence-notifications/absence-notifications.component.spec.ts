import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceNotificationsComponent } from './absence-notifications.component';

describe('AbsenceNotificationsComponent', () => {
  let component: AbsenceNotificationsComponent;
  let fixture: ComponentFixture<AbsenceNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbsenceNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
