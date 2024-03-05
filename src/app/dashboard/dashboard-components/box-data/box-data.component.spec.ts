import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxdataComponent } from './box-data.component';

describe('ContactsComponent', () => {
  let component: BoxdataComponent;
  let fixture: ComponentFixture<BoxdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
