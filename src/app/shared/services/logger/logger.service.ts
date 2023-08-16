import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { LoggerType } from '@app/shared/types/logger-types.enum';
@Injectable()
export class LoggerService {
  constructor(private logger: NGXLogger) {}
  log(type: LoggerType, object) {
    if (type === LoggerType.DEBUG) {
      this.logger.debug(object);
    } else if (type === LoggerType.WARN) {
      this.logger.warn(object);
    } else if (type === LoggerType.INFO) {
      this.logger.info(object);
    } else if (type === LoggerType.ERROR) {
      this.logger.error(object);
    } else if (type === LoggerType.LOG) {
      this.logger.log(object);
    }
  }
}
