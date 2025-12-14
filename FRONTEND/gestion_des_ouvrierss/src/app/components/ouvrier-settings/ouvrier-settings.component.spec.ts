import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OuvrierSettingsComponent } from './ouvrier-settings.component';

describe('OuvrierSettingsComponent', () => {
  let component: OuvrierSettingsComponent;
  let fixture: ComponentFixture<OuvrierSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OuvrierSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OuvrierSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
