import { Injectable } from '@angular/core';
@Injectable()
export class LocalStorageService {
  constructor() {}

  set(key: string, value: any): boolean {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  }

  get(key: string) {
    const value = localStorage.getItem(key);
    try {
      return { data: JSON.parse(value) };
    } catch (e) {
      return { data: value };
    }
  }

  remove(key: string) {
    localStorage.removeItem(key);
    return true;
  }

  removeAll() {
    localStorage.clear();
    return true;
  }
}
