import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { AppConfigService } from './services/app-config/app-config.service';
import { DashBoardService } from './services/dashboard/dashboard.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule],
  providers: [AppConfigService, DashBoardService]
})
export class CoreModule {}
