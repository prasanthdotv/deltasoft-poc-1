import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isSidebarNeeded = false;
  constructor(private currentRoute: ActivatedRoute) {}

  ngOnInit() {
    this.currentRoute.parent.url.subscribe(async routeData => {
      // if (routeData.length > 0 && this.authService.isLoggedIn) {
      this.isSidebarNeeded = routeData[0].path === 'pages';
      // }
    });
  }
}
