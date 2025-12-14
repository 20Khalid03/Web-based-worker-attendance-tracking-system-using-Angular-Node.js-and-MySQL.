import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOuvrierComponent } from './dashboard-ouvrier.component';

describe('DashboardOuvrierComponent', () => {
  let component: DashboardOuvrierComponent;
  let fixture: ComponentFixture<DashboardOuvrierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardOuvrierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardOuvrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
