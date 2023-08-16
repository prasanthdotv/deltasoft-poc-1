import { Injectable } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class NebularThemeService {
  constructor(private themeService: NbThemeService) {}

  get NebularTheme() {
    return this.themeService;
  }
}
