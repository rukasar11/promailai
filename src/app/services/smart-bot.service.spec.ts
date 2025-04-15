import { TestBed } from '@angular/core/testing';

import { SmartBotService } from './smart-bot.service';

describe('SmartBotService', () => {
  let service: SmartBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartBotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
