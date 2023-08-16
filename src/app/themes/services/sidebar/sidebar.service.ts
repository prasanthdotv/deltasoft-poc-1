import { Injectable } from '@angular/core';
import { Dashboards } from '@app/themes/config/dashboards';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  menuItems = null;
  constructor() {}

  getMenuItems() {
    const allowedDashboards = this.getMainMenu();
    const menuItemsPermitted = allowedDashboards.filter(menuItem => menuItem.showOnSidebar);
    return menuItemsPermitted;
  }

  getMainMenu() {
    if (!this.menuItems) {
      this.menuItems = new Dashboards().dashboards;
    }
    return this.menuItems;
  }
}
