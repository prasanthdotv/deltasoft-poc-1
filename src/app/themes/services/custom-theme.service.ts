import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ICXLightTheme } from '../custom-themes/icx-light-theme';
import { ICXDarkTheme } from '../custom-themes/icx-dark-theme';

@Injectable()
export class CustomThemeService {
  constructor() {
    this.icxLightTheme = new ICXLightTheme();
    this.icxDarkTheme = new ICXDarkTheme();
  }

  private themeChanged = new Subject();
  themeChanged$ = this.themeChanged.asObservable();
  icxLightTheme;
  icxDarkTheme;

  get ICXLightThemeValues() {
    const themeContent = this.icxLightTheme.theme;
    return themeContent;
  }

  get ICXDarkThemeValues() {
    const themeContent = this.icxDarkTheme.theme;
    return themeContent;
  }

  nebularThemeChanged(themeName) {
    this.themeChanged.next(themeName);
  }
}
