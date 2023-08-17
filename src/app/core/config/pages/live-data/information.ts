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
            type: 'multi-gauge',
            title: 'Gauge 1',
            // titleAddOn: 'Last 15 min',
            id: 'gauge_1'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'gauge',
            title: 'Gauge 2',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_2'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'chat-box',
            title: 'Chat Box',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_3'
            // isPostReq: true,
            // dataEndPoint: '/live-data/device-connection-type',
            // durationRequired: false
          },
          {
            type: 'normal-table',
            title: 'Table',

            // titleAddOn: 'Last 15 min',
            id: 'gauge_4',
            // isPostReq: true,
            dataEndPoint: '/live-data/device-connection-type'
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
        rows: 18,
        y: 0.3,
        x: 0
      },
      {
        id: 'gauge_2',
        cols: 4.5,
        rows: 18,
        y: 0.3,
        x: 3
      },
      {
        id: 'gauge_3',
        cols: 4,
        rows: 9,
        y: 0.3,
        x: 7.5
      },
      {
        id: 'gauge_4',
        cols: 4,
        rows: 9,
        y: 9.3,
        x: 7.5
      }
    ]
  };
}
