import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ThresholdSettingsComponent } from '../../../shared/components/threshold-settings/threshold-settings.component';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { NbSidebarService, NbThemeService, NbMenuService, NbDialogService } from '@nebular/theme';
import { map, filter } from 'rxjs/operators';
import { Themes } from '../../types/themes.enum';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@app/shared/services/localstorage/local-storage.service';
import { HeaderService } from '@app/themes/services/header/header.service';
import { SidebarService } from '@app/themes/services/sidebar/sidebar.service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { Subscription } from 'rxjs';
import { FilterService } from '@app/shared/services/filter/filter.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss']
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  @Input() isMainPageLoaded = false;
  userMenu: any[];
  themeMenu: any[];
  settingsMenu: any[];
  menuSubscription;
  user: any;
  themeIcon: any;
  appConstants: any;
  settingsIcon: any;
  userPictureOnly = true;
  currentTheme: any;
  menuItems: any;
  displayName = '';
  dashboardName = '';
  timezoneString: string;
  tzSubscription;
  filterSubscription: Subscription;
  dataUpdateSubscription: Subscription;
  badgeText = '';
  currentTime: any;

  constructor(
    private appConfig: AppConfigService,
    private nbSidebarService: NbSidebarService,
    private themeService: NbThemeService,
    private nbMenuService: NbMenuService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    private customTheme: CustomThemeService,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService,
    private sidebarService: SidebarService,
    private dataUpdateService: DataUpdateService,
    private filterService: FilterService
  ) {
    this.appConstants = this.appConfig.getConstants();
    this.menuItems = this.sidebarService.getMainMenu();
  }

  ngOnInit() {
    this.getHeaderConfig();
    this.onPageChange();
    this.onFilterItemChange();
    this.currentTheme = this.themeService.currentTheme as Themes;
    this.init();
    this.setTimezone();
    this.updateDashboardName();
  }

  onFilterItemChange() {
    this.filterSubscription = this.dataUpdateService.filterItemChanged$.subscribe(() => {
      const filterItemChanged = this.checkIfPanelItemChanged();
      this.badgeText = filterItemChanged ? '\u2022' : '';
    });
  }

  checkIfPanelItemChanged() {
    let isFilterItemChanged = false;
    const appliedFilters: any = this.filterService.getAppliedFilters();
    const filterDropdown: any = this.filterService.getFilterDropDowns();
    for (const filterItem in appliedFilters) {
      if (filterItem) {
        const appliedFilter = appliedFilters[filterItem];
        if (appliedFilter instanceof Array) {
          isFilterItemChanged = !filterDropdown[filterItem].every(item =>
            appliedFilter.includes(item.value)
          );
        } else {
          const defaultFilter = filterDropdown[filterItem][0].value;
          if (defaultFilter !== appliedFilter) {
            isFilterItemChanged = true;
          }
        }
        if (isFilterItemChanged) {
          break;
        }
      }
    }
    if (!isFilterItemChanged) {
      const { defaultRefreshTime, defaultTimeRange } = this.appConstants;
      const currentTimeRange = this.dataUpdateService.getSelectedTimeRange();
      const currentRefreshTime = this.dataUpdateService.getSelectedRefreshTime();
      if (currentRefreshTime !== defaultRefreshTime || currentTimeRange !== defaultTimeRange) {
        isFilterItemChanged = true;
      }
    }
    return isFilterItemChanged;
  }

  setTimezone() {
    setInterval(() => {
      const options = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };

      const date = new Date(); // Replace this with your desired date
      this.currentTime = new Intl.DateTimeFormat('en-US', options).format(date).replace('at', ',');
    }, 1000);
    this.tzSubscription = this.dataUpdateService.updateTimezone$.subscribe(() => {
      this.timezoneString = this.dataUpdateService.tzString;
    });
  }
  getHeaderConfig() {
    const {
      userMenu,
      userInfo,
      settingsMenu,
      settingsIcon
    } = this.headerService.getHeaderConfig();
    this.userMenu = userMenu;
    this.user = userInfo;
    this.settingsMenu = _.clone(settingsMenu);
    if (this.isMainPageLoaded) {
      // const { userId } = this.authService.getTokenDetails();
      this.user.id = 'userId';
      this.settingsMenu.push({ title: 'Thresholds' });
      this.settingsMenu.push({ title: 'Filter', icon: 'funnel-outline' });
      this.dataUpdateService.setTimezoneString();
    }
    this.settingsIcon = settingsIcon;
  }

  init() {
    this.themeService
      .onThemeChange()
      .pipe(map(({ name }) => name))
      .subscribe(themeName => (this.currentTheme = themeName));
    this.menuSubscription = this.nbMenuService
      .onItemClick()
      .pipe(map(({ item: { title } }) => title))
      .subscribe(title => {
        if (title === 'Light') {
          this.changeTheme(Themes.ICX_LIGHT);
        } else if (title === 'Dark') {
          this.changeTheme(Themes.ICX_DARK);
        } else if (title === 'Log out') {
          this.logOutUser();
        } else if (title === 'Thresholds') {
          this.openThresholds(false);
        } else if (title === 'Filter') {
          this.filterService.onFilterToggle();
        }
      });
    this.nbMenuService
      .onItemClick()
      .pipe(filter(context => context.tag === 'sidebar-menu'))
      .subscribe(() => this.nbSidebarService.compact('menu-sidebar'));
  }

  onPageChange() {
    this.currentRoute.parent.url.subscribe(async () => {
      if (this.isMainPageLoaded) {
        const urlSnapshot = this.router.routerState.snapshot.url;
        this.checkSettingsMenu(urlSnapshot);
        this.showDashboardName(urlSnapshot);
      }
    });
  }

  checkSettingsMenu(snapshot) {
    const urlNames = snapshot.split('/');
    let index = _.findIndex(this.settingsMenu, ['title', 'Filter']);
    if (urlNames.includes('device') && index > -1) {
      this.settingsMenu.splice(index, 1);
    } else if (!urlNames.includes('device') && index === -1) {
      this.settingsMenu.push({ title: 'Filter', icon: 'funnel-outline' });
    }
  }

  showDashboardName(page) {
    let pageId;
    const currentPage = page.split('/');
    const pageIdExtended = currentPage[currentPage.length - 1];
    if (pageIdExtended.includes('?')) {
      const pageInfo = pageIdExtended.split('?');
      pageId = pageInfo[0];
    } else {
      pageId = pageIdExtended;
    }
    if (pageId) {
      const menuItem = this.menuItems.filter(item => {
        return item.page_id === pageId || item.page_id.includes(pageId);
      });
      if (menuItem[0] && menuItem[0].title) {
        const { title } = menuItem[0];
        this.dashboardName = title;
        this.displayName = title;
      }
    }
  }

  openThresholds(closeOnEsc: boolean) {
    try {
      this.dialogService.open(ThresholdSettingsComponent, { closeOnEsc });
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    }
  }

  logOutUser() {
    // this.authService.logOut();
  }

  toggleCompact() {
    this.nbSidebarService.toggle(true, 'menu-sidebar');
  }

  changeTheme(themeName: string) {
    this.customTheme.nebularThemeChanged(themeName);
    this.themeService.changeTheme(themeName);
    this.localStorageService.set(this.appConstants.themeVariable, themeName);
  }
  updateDashboardName() {
    this.dataUpdateSubscription = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      if (this.dashboardName.includes('Daily Device Statistics')) {
        const filterParams = this.filterService.getAppliedFilters();
        const response = await this.headerService.getLastConsolidatedDate(filterParams);
        const date = response.data;
        if (date && date.consolidatedate) {
          this.displayName = ` ${this.dashboardName} (${date.consolidatedate})`;
        }
      }
    });
  }

  ngOnDestroy() {
    this.menuSubscription.unsubscribe();
    this.tzSubscription.unsubscribe();
    this.filterSubscription.unsubscribe();
    this.dataUpdateSubscription.unsubscribe();
  }
}
