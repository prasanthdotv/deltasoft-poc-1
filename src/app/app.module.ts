import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemesModule } from './themes/themes.module';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { CoreModule } from './core/core.module';
import { NbThemeModule } from '@nebular/theme';

export function initApp(appConfigService: AppConfigService) {
  return () => {
    return appConfigService.getAppConfig();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NbThemeModule.forRoot({ name: 'icx-dark-theme' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    ThemesModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [AppConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
