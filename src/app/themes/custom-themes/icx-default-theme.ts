import { graphic } from 'echarts';

export class ICXDefaultTheme {
  constructor() {}
  theme = {
    color_series_bar: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#097976' },
      { offset: 0.5, color: '#2ab587' },
      { offset: 1, color: '#2ce69b' }
    ]),
    color_series_line: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#db2c66' },
      { offset: 0.5, color: '#f15589' },
      { offset: 1, color: '#fb9db6' }
    ])
  };
}
