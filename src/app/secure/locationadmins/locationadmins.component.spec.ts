import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationadminsComponent } from './locationadmins.component';

describe('LocationadminsComponent', () => {
  let component: LocationadminsComponent;
  let fixture: ComponentFixture<LocationadminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationadminsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationadminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
