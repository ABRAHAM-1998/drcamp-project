import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampSupervisorComponent } from './camp-supervisor.component';

describe('CampSupervisorComponent', () => {
  let component: CampSupervisorComponent;
  let fixture: ComponentFixture<CampSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampSupervisorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CampSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
