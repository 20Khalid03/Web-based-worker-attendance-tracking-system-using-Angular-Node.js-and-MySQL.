import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsentListComponent } from './absent-list.component';

describe('AbsentListComponent', () => {
  let component: AbsentListComponent;
  let fixture: ComponentFixture<AbsentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbsentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
