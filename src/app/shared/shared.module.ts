import { StandardDeviationChartService } from './services/standard-deviation/standard-deviation-chart.service';
import { ThresholdSettingsService } from './services/threshold-settings/threshold-settings.service';
import { LineChartService } from './services/line-chart/line-chart.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerModule } from 'ngx-logger';
import { ToastrModule } from 'ngx-toastr';
import { environment } from '@environment/environment';
import { LoggerService } from '@app/shared/services/logger/logger.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RestClientService } from './services/restclient/rest-client.service';
import { LocalStorageService } from './services/localstorage/local-storage.service';
import { BarChartComponent } from './components/bar-category-chart/bar-category-chart.component';
import { MultiLineChartComponent } from './components/multi-line-chart/multi-line-chart.component';
import { PrimeNGModule } from './modules/primeNG/prime.module';
import { NebularModule } from './modules/nebular/nebular.module';
import { BoxComponent } from './components/box/box.component';
import { ChartService } from './services/chart/chart.service';
import { DialChartComponent } from './components/dial-chart/dial-chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HexagonalChartComponent } from './components/hexagonal-chart/hexagonal-chart.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { NbDialogModule } from '@nebular/theme';
import { PanelHeaderComponent } from './components/panel-header/panel-header.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { MultiBoxComponent } from './components/multi-box/multi-box.component';
import { DialChartService } from './services/dial-chart/dial-chart.service';
import { PieChartService } from './services/pie-chart/pie-chart.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { FilterComponent } from './components/filter/filter.component';
import { VerticalBarChartComponent } from './components/vertical-bar-category-chart/vertical-bar-category-chart.component';
import { VerticalBarChartService } from './services/vertical-bar-category-chart/vertical-bar-category-chart.service';
import { VerticalStackedChartComponent } from './components/vertical-stacked-chart/vertical-stacked-chart.component';
import { VerticalStackedChartService } from './services/vertical-stacked-chart/vertical-stacked-chart.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BarLineChartComponent } from './components/bar-line-category-chart/bar-line-category-chart.component';
import { BarLineChartService } from './services/bar-line-category-chart/bar-line-category-chart.service';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { ThresholdSettingsComponent } from './components/threshold-settings/threshold-settings.component';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { HeaderBlockComponent } from './components/table/header-block/header-block.component';
import { NormalTableComponent } from './components/table/normal-table/normal-table.component';
import { LazyTableComponent } from './components/table/lazy-table/lazy-table.component';
import { StandardDeviationChartComponent } from './components/standard-deviation-chart/standard-deviation-chart.component';
import { CustomDateSelectorComponent } from './components/custom-date-selector/custom-date-selector.component';
import { RefreshComponent } from './components/refresh/refresh.component';
import { TableService } from './services/table/table.service';
import { BasicTitleComponent } from './components/basic-title/basic-title.component';
import { MultiInfoComponent } from './components/multi-info/multi-info.component';
import { MultiAxisLineChartComponent } from './components/multi-axis-line-chart/multi-axis-line-chart.component';
import { MultiAxisLineChartService } from './services/multi-axis-line-chart/multi-axis-line-chart.service';
import { ShowDataComponent } from './components/show-data/show-data.component';
import { StackedBarLineChartComponent } from './components/stacked-bar-line-time-chart/stacked-bar-line-time-chart.component';
import { StackedBarLineChartService } from './services/stacked-bar-line-time-chart/stacked-bar-line-time-chart.service';
import { BarChartService } from './services/bar-category-chart/bar-category-chart.service';
import { ConfirmationPopUp } from './components/confirmation-pop-up/confirmation-pop-up.component';
import { CustomDialogComponent } from './components/custom-dialog/custom-dialog.component';
import { ParamOverviewComponent } from './components/param-overview/param-overview.component';
import { GaugeComponent } from './components/gauge/gauge.component';
import { MultiGaugeComponent } from './components/multi-gauge/multi-gauge.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';

const services = [
  LoggerService,
  RestClientService,
  LocalStorageService,
  ChartService,
  DialChartService,
  PieChartService,
  VerticalBarChartService,
  VerticalStackedChartService,
  BarLineChartService,
  LineChartService,
  ThresholdSettingsService,
  StandardDeviationChartService,
  TableService,
  MultiAxisLineChartService,
  StackedBarLineChartService,
  BarChartService
];

@NgModule({
  declarations: [
    BarChartComponent,
    MultiLineChartComponent,
    NormalTableComponent,
    LazyTableComponent,
    BoxComponent,
    DialChartComponent,
    HexagonalChartComponent,
    PopUpComponent,
    PanelHeaderComponent,
    PieChartComponent,
    MultiBoxComponent,
    VerticalBarChartComponent,
    VerticalStackedChartComponent,
    FilterComponent,
    BarLineChartComponent,
    LineChartComponent,
    ThresholdSettingsComponent,
    HeaderBlockComponent,
    StandardDeviationChartComponent,
    CustomDateSelectorComponent,
    RefreshComponent,
    BasicTitleComponent,
    MultiInfoComponent,
    MultiAxisLineChartComponent,
    ShowDataComponent,
    StackedBarLineChartComponent,
    ConfirmationPopUp,
    CustomDialogComponent,
    ParamOverviewComponent,
    GaugeComponent,
    MultiGaugeComponent,
    ChatBoxComponent
  ],
  providers: [...services, { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoggerModule.forRoot({
      level: environment.logLevel,
      serverLogLevel: environment.serverLogLevel
    }),
    NgxEchartsModule,
    PrimeNGModule,
    NebularModule,
    NbDialogModule.forChild(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-center',
      maxOpened: 1,
      preventDuplicates: true
    }),
    NgxSpinnerModule
  ],
  exports: [
    BarChartComponent,
    MultiLineChartComponent,
    HexagonalChartComponent,
    NormalTableComponent,
    LazyTableComponent,
    BoxComponent,
    NebularModule,
    PrimeNGModule,
    DialChartComponent,
    PieChartComponent,
    MultiBoxComponent,
    VerticalBarChartComponent,
    VerticalStackedChartComponent,
    BarLineChartComponent,
    LineChartComponent,
    FilterComponent,
    NgxSpinnerModule,
    ThresholdSettingsComponent,
    HeaderBlockComponent,
    StandardDeviationChartComponent,
    CustomDateSelectorComponent,
    RefreshComponent,
    BasicTitleComponent,
    MultiInfoComponent,
    MultiAxisLineChartComponent,
    ShowDataComponent,
    StackedBarLineChartComponent,
    CustomDialogComponent,
    ParamOverviewComponent,
    GaugeComponent,
    MultiGaugeComponent,
    ChatBoxComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [PopUpComponent, ThresholdSettingsComponent, ConfirmationPopUp, CustomDialogComponent]
})
export class SharedModule {}
