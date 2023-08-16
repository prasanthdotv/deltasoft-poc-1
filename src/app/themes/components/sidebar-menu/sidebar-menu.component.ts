import { Component, OnInit } from '@angular/core';
import { NebularMenuItem } from '@app/shared/modules/nebular/models/nebularMenuItem';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '@app/themes/services/sidebar/sidebar.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  menuItems: NebularMenuItem[];
  constructor(private router: Router, private sidebarService: SidebarService) {}

  ngOnInit() {
    this.menuItems = this.sidebarService.getMenuItems();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(params => {
      this.selectCurrentMenuItem(params, this.menuItems);
    });
  }

  /**
   * To highlight the current menu item.
   *
   */
  selectCurrentMenuItem(currentMenu, mainMenus) {
    const currentMenuItem = currentMenu.url.split('?')[0].split('/');
    const currentMenuPageId = currentMenuItem[currentMenuItem.length - 1];
    mainMenus.map((item, i) => {
      this.menuItems[i].selected = item.page_id.includes(currentMenuPageId);
    });
  }
}
