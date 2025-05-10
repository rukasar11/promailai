import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReplySchedulerComponent } from './auto-reply-scheduler.component';

describe('AutoReplySchedulerComponent', () => {
  let component: AutoReplySchedulerComponent;
  let fixture: ComponentFixture<AutoReplySchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoReplySchedulerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoReplySchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
