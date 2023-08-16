import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbIconLibraries } from '@nebular/theme';
import { LayoutComponent } from './layout/layout.component';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';
import { FooterComponent } from './components/footer/footer.component';
import { customIcons } from './custom-icons';
import { SharedModule } from '@app/shared/shared.module';
import { CustomThemeService } from './services/custom-theme.service';
import { FooterService } from './services/footer/footer.service';
import { HeaderService } from './services/header/header.service';

const themesComponents = [LayoutComponent, SiteHeaderComponent, SidebarMenuComponent, FooterComponent];

@NgModule({
  declarations: [...themesComponents],
  imports: [CommonModule, SharedModule],
  providers: [CustomThemeService, FooterService, HeaderService],
  exports: [...themesComponents]
})
export class ThemesModule {
  constructor(private iconLibraries: NbIconLibraries) {
    this.iconLibraries.registerFontPack('font-awesome', {
      packClass: 'fa',
      iconClassPrefix: 'fa'
    });
    this.iconLibraries.registerSvgPack('custom-icons', customIcons);
  }
}
