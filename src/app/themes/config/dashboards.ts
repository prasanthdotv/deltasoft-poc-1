export class Dashboards {
  dashboards = [
    {
      id: 1,
      title: 'Information',
      icon: { icon: 'line-chart', pack: 'font-awesome' },
      page_id: ['information'],
      rootPath: '/pages',
      link: '/pages/information',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    },
    {
      id: 2,
      title: 'System Performance 1',
      icon: { icon: 'crosshairs', pack: 'font-awesome' },
      page_id: ['system_performance_1'],
      rootPath: '/pages',
      link: '/pages/system_performance_1',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    },
    {
      id: 3,
      title: 'System Performance 2',
      icon: { icon: 'arrows-v', pack: 'font-awesome' },
      page_id: ['system_performance_2'],
      rootPath: '/pages',
      link: '/pages/system_performance_2',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    },
    {
      id: 4,
      title: 'Application Performance',
      icon: { icon: 'search', pack: 'font-awesome' },
      page_id: ['app_perf'],
      rootPath: '/pages',
      link: '/pages/app_perf',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    },
    {
      id: 5,
      title: 'Network Statistics',
      icon: { icon: 'clipboard', pack: 'font-awesome' },
      page_id: ['net_stats'],
      rootPath: '/pages',
      link: '/pages/net_stats',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    },
    {
      id: 6,
      title: 'Health',
      icon: { icon: 'compress', pack: 'font-awesome' },
      page_id: ['health'],
      rootPath: '/pages',
      link: '/pages/health',
      privilege: ['default-read', 'view-live-reports'],
      showOnSidebar: true
    }
  ];
}
