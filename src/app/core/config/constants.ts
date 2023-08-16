export class Constants {
  static readonly constants = {
    timeRange: [2, 6, 12, 24, 48, 72, 120, 168, 240, 480, 720, 'custom'],
    refreshTimeInterval: [0, 120, 300, 900],
    normalSTB: '% of normal STBs',
    STBWithAnomaly: '% of STBs with anomaly',
    defaultTheme: 'icx-light-theme',
    darkTheme: 'dark-theme',
    themeVariable: 'currentThemeDish',
    defaultTimeRange: 2,
    selectedTimeRange: 2,
    defaultRefreshTime: 120,
    chartResizeTimeout: 400,
    tableRowCount: 10,
    yAxisPrecision: 1,
    toolTipPrecision: 2,
    maxDaysInFilter: 7,
    tableHeight: '6vh',
    backgroundRefreshTime: 300,
    backgroundRefreshPages: [],
    biPages: [],
    aggregationLevels: [2, 48],
    aggregationLabels: {
      '15 minutes': '/15 minutes',
      hour: '/hour',
      day: '/day'
    },
    daysInHrs: {
      oneDay: 24,
      twoDays: 48
    },
    days: {
      oneDay: 1
    },
    zoomLevel: {
      // Zoom interval is provided in hours
      0: {
        // Data in 15 minutes interval
        minInterval: 0,
        maxInterval: 2
      },
      1: {
        // Data in 1 hour interval
        minInterval: 2,
        maxInterval: 48
      },
      2: {
        // Data in 1 day interval
        minInterval: 48,
        maxInterval: 720
      }
    },
    zoomInvalidEvents: ['TimeEvent', 'FilterEvent', 'newDeviceEvent'],
    refreshEvents: ['AutoRefreshEvent', 'ManualRefreshEvent'],
    defaultZoomOption: { start: 0, end: 100 },
    processableUnits: ['ms', 'seconds', 'min', 'short', 'count'],
    memoryParams: ['Memory Free', 'Memory Total', 'Storage Free', 'Total Storage'],
    webSocketEvents: {
      thresholdSettingsChange: 'tenant_thresholds_applied'
    },
    deviceidPattern: /^([0-9a-fA-F]{2}[:.-]){5}[0-9a-fA-F]{2}$/,
    deviceDetailsColumnCount: 10,
    editThresholdPrivilege: 'edit-thresholds',
    zoomDelayTime: 400,
    appsDurationRange: [
      { label: 'Last day', value: '1day' },
      { label: 'Last month', value: '30days' },
      { label: 'Last 3 months', value: '3months' },
      { label: 'Last 6 months', value: '6months' },
      { label: 'Last year', value: '1year' }
    ],
    filterTimeout: 10000,
    copyrightStartYear: 2021,
    fixedScreenPages: ['device_statistics', 'basic']
  };
}
