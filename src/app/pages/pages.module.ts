import { DeviceDetailsService } from './services/device-details/device-details.service';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { DashboardPagesComponent } from './components/dashboard-pages/dashboard-pages.component';
import { SharedModule } from '@app/shared/shared.module';
import { DashboardPagesService } from './services/dashboard-pages/dashboard-pages.service';
import { ThemesModule } from '@app/themes/themes.module';
import { GridsterModule } from 'angular-gridster2';
import { PagesComponent } from './components/pages/pages.component';

@NgModule({
  declarations: [DashboardPagesComponent, PagesComponent],
  providers: [DashboardPagesService, DeviceDetailsService],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,
    SharedModule,
    ThemesModule,
    GridsterModule
  ]
})
export class PagesModule {}
