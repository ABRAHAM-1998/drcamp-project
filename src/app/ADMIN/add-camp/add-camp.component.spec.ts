import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCampComponent } from './add-camp.component';

describe('AddCampComponent', () => {
  let component: AddCampComponent;
  let fixture: ComponentFixture<AddCampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCampComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
