import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatdashboardComponent } from './chatdashboard.component';

describe('ChatdashboardComponent', () => {
  let component: ChatdashboardComponent;
  let fixture: ComponentFixture<ChatdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
