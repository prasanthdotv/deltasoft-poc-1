import { Injectable } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';

@Injectable()
export class NebularSidebarService {
  constructor(private nbSidebarProvider: NbSidebarService) {}

  get NebularSidebar() {
    return this.nbSidebarProvider;
  }
}
