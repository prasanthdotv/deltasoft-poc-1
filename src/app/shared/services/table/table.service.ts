import { Injectable } from '@angular/core';

@Injectable()
export class TableService {
  constructor() {}

  compare(exp1, exp2) {
    const date1 = new Date(exp1.time);
    const date2 = new Date(exp2.time);
    if (date1.getTime() > date2.getTime()) {
      return -1;
    } else if (date1.getTime() < date2.getTime()) {
      return 1;
    } else return 0;
  }
}
