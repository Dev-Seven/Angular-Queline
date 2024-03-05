import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestspotComponent } from './latestspot.component';

describe('LatestspotComponent', () => {
  let component: LatestspotComponent;
  let fixture: ComponentFixture<LatestspotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestspotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestspotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
