export class Information {
  static readonly information = {
    page_id: 'information',
    timeSelector: false,
    autoRefresh: true,
    components: [
      {
        single_box: [],
        graphs: [
          {
            type: 'overview',
            title: 'Gauge 1',
            // titleAddOn: 'Last 15 min',
            id: 'gauge_1'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'overview',
            title: 'Gauge 2',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_2'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'overview',
            title: 'Chat Box',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_3'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'overview',
            title: 'Table',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_4'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          }
        ]
      }
    ],
    filters: [],
    layout: [
      {
        id: 'gauge_1',
        cols: 3,
        rows: 15,
        y: 0.3,
        x: 0
      },
      {
        id: 'gauge_2',
        cols: 4.5,
        rows: 15,
        y: 0.3,
        x: 3
      },
      {
        id: 'gauge_3',
        cols: 4,
        rows: 7.5,
        y: 0.3,
        x: 7.5
      },
      {
        id: 'gauge_4',
        cols: 4,
        rows: 7.2,
        y: 8,
        x: 7.5
      }
    ]
  };
}
