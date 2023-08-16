import { Injectable } from '@angular/core';

@Injectable()
export class DialChartService {
  constructor() {}

  processDialChartData(chartData) {
    return chartData && chartData.data ? chartData.data : 0;
  }

  initDialChartOption(theme, graphData, unit?: string) {
    const timeViewed = this.getTimeViewed(unit, graphData);
    const fillPercentage = this.getFillPercentage(timeViewed);
    const chartOption = {
      backgroundColor: theme.color_bg,
      series: [
        {
          type: 'gauge',
          radius: '100%',
          axisLine: {
            lineStyle: {
              color: [
                [fillPercentage, theme.color_dial_success],
                [1, theme.color_dial_empty]
              ],
              width: 10
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            color: theme.color_dial_text,
            fontSize: 11,
            padding: [4, -50, -30, -40]
          },
          pointer: {
            show: true
          },
          detail: {
            formatter: (value, index) => {
              if (value > 0) {
                return value + ' ' + unit;
              } else {
                return 'N/A ' + unit;
              }
            },
            color: timeViewed > 0 ? theme.color_normal_box : theme.color_dial_text,
            fontSize: 18,
            offsetCenter: ['9%', '90%']
          },
          data: [{ value: timeViewed }],
          min: 0,
          max: 900,
          splitNumber: 1
        }
      ]
    };
    return chartOption;
  }

  getTimeViewed(unit, graphData) {
    let timeViewed: any;
    if (unit === 'ms') {
      timeViewed = (graphData / 1000).toFixed(2);
    } else {
      timeViewed = Number(graphData).toFixed(0);
    }
    return timeViewed;
  }

  getFillPercentage(timeViewed) {
    return Number(timeViewed) / 900;
  }

  updateDialChartOption(chartOption, theme, updatedData, unit) {
    const timeViewed = this.getTimeViewed(unit, updatedData);
    const fillPercentage = this.getFillPercentage(timeViewed);
    chartOption.series[0].axisLine.lineStyle.color[0][0] = fillPercentage;
    chartOption.series[0].data[0].value = timeViewed;
    chartOption.series[0].detail.color = timeViewed > 0 ? theme.color_normal_box : theme.color_dial_text;
    return chartOption;
  }

  changeDialChartTheme(chartOption, theme) {
    chartOption.backgroundColor = theme.color_bg;
    chartOption.series[0].axisLine.lineStyle.color[0][1] = theme.color_dial_success;
    chartOption.series[0].axisLine.lineStyle.color[1][1] = theme.color_dial_empty;
    chartOption.series[0].axisLabel.color = theme.color_dial_text;
    chartOption.series[0].detail.color = theme.color_dial_text;
    return chartOption;
  }
}
