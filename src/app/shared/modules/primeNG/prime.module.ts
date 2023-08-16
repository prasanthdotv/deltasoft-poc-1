import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  imports: [TableModule, ButtonModule, MenuModule, CalendarModule, InputTextModule, SliderModule, DropdownModule, MultiSelectModule],
  providers: [],
  declarations: [],
  exports: [TableModule, ButtonModule, MenuModule, CalendarModule, InputTextModule, SliderModule, DropdownModule, MultiSelectModule]
})
export class PrimeNGModule { }
