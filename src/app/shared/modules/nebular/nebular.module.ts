import { NgModule } from '@angular/core';
import {
  NbCardModule,
  NbSpinnerModule,
  NbSelectModule,
  NbLayoutModule,
  NbSidebarModule,
  NbIconModule,
  NbActionsModule,
  NbContextMenuModule,
  NbUserModule,
  NbMenuModule,
  NbInputModule,
  NbTooltipModule,
  NbPopoverModule,
  NbDatepickerModule,
  NbTabsetModule
} from '@nebular/theme';
import { NebularSidebarService } from './services/nebular-sidebar.service';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [],
  providers: [NebularSidebarService],
  imports: [
    NbCardModule,
    NbSpinnerModule,
    NbSelectModule,
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NbActionsModule,
    NbContextMenuModule,
    NbUserModule,
    NbMenuModule.forRoot(),
    NbInputModule,
    NbTooltipModule,
    NbPopoverModule,
    NbDatepickerModule.forRoot(),
    NbTabsetModule
  ],
  exports: [
    NbCardModule,
    NbSpinnerModule,
    NbSelectModule,
    NbLayoutModule,
    NbSidebarModule,
    NbEvaIconsModule,
    NbIconModule,
    NbActionsModule,
    NbContextMenuModule,
    NbUserModule,
    NbMenuModule,
    NbInputModule,
    NbTooltipModule,
    NbPopoverModule,
    NbDatepickerModule,
    NbTabsetModule
  ]
})
export class NebularModule {}
