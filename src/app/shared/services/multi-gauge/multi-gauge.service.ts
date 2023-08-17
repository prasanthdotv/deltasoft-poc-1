import { Injectable } from '@angular/core';
import { ChartOptions } from '@app/shared/config/chart-options';

@Injectable({
  providedIn: 'root'
})
export class MultiGaugeService extends ChartOptions {
  constructor() {
    super();
  }

  processChartData(data) {
    return {
      xAxisData: Object.keys(data),
      seriesData: Object.values(data)
    };
  }

  isDataSetEmpty(data) {
    return !(data.xAxisData.length && data.seriesData.length);
  }

  initChartOption(theme, data, chartConfig) {
    const isDataSetEmpty = false;
    const isYAxisNameNeeded = false;
    const chartOption1 = {
      series: [
        {
          type: 'gauge',
          startAngle: -45,
          endAngle: 225,
          center: ['50%', '50%'],
          radius: '95%',
          clockwise: false,
          min: 0,
          max: 100,
          splitNumber: 4,
          axisLine: {
            show: true,
            lineStyle: {
              width: 5,
              color: [
                [0.1, '#FF6E76'],
                [0.25, '#FDDD60'],
                // [0.75, '#58D9F9'],
                [1, '#7CFFB2']
              ]
            }
          },
          pointer: {
            length: '60%',
            width: 4,
            offsetCenter: ['50%', '50%'],
            itemStyle: {
              color: '#FF6E76'
            }
          },
          axisTick: {
            show: true,
            length: 15,
            splitNumber: 25,
            lineStyle: {
              color: '#6F6F79',
              width: 1
            }
          },
          splitLine: {
            show: false,
            length: 30,
            distance: -20,
            lineStyle: {
              // color: 'auto',
              width: 2
            }
          },
          axisLabel: {
            color: '#B1B1B2',
            fontSize: 15,
            distance: -8
            // rotate: 'tangential',
            // formatter: function(value: number) {
            //   return value % 25 === 0 ? value.toString() : null;
            // }
          },
          title: {
            offsetCenter: [0, '60%'],
            fontSize: 15,
            color: '#B1B1B2'
          },
          detail: {
            fontSize: 30,
            offsetCenter: [0, '30%'],
            valueAnimation: true,
            color: '#E3E3E4'

            // borderWidth: 10,
            // borderColor: '#FFFFFF'
          },
          data: [
            {
              value: 29,
              name: 'WOB'
            }
          ]
        }
      ]
    };
    const chartOption2 = {
      series: [
        {
          type: 'gauge',
          startAngle: -45,
          endAngle: 225,
          center: ['50%', '50%'],
          radius: '95%',
          clockwise: false,
          min: 5000,
          max: 15000,
          splitNumber: 4,
          axisLine: {
            show: true,
            lineStyle: {
              width: 5,
              color: [
                [0.1, '#FF6E76'],
                [0.25, '#FDDD60'],
                // [0.75, '#58D9F9'],
                [1, '#7CFFB2']
              ]
            }
          },
          pointer: {
            showAbove: false,
            length: '60%',
            width: 4,
            offsetCenter: ['50%', '50%'],
            itemStyle: {
              color: '#FF6E76'
            }
          },
          axisTick: {
            show: true,
            length: 15,
            splitNumber: 25,
            lineStyle: {
              color: '#6F6F79',
              width: 1
            }
          },
          splitLine: {
            show: false,
            length: 30,
            distance: -20,
            lineStyle: {
              // color: 'auto',
              width: 2
            }
          },
          axisLabel: {
            color: '#B1B1B2',
            fontSize: 15,
            distance: -8,
            // rotate: 'tangential',
            formatter: function formatNumberWithK(number) {
              if (number >= 1000) {
                if (number % 1000 === 0) {
                  const formattedNumber = (number / 1000).toFixed(0);
                  return `${formattedNumber}k`;
                } else {
                  const formattedNumber = (number / 1000).toFixed(1);
                  return `${formattedNumber}k`;
                }
              } else {
                return number.toString();
              }
            }
          },
          title: {
            offsetCenter: [0, '60%'],
            fontSize: 15,
            color: '#B1B1B2'
          },
          detail: {
            fontSize: 30,
            offsetCenter: [0, '30%'],
            valueAnimation: true,
            color: '#E3E3E4'

            // borderWidth: 10,
            // borderColor: '#FFFFFF'
          },
          data: [
            {
              value: 13513,
              name: 'RPM'
            }
          ]
        }
      ]
    };
    const chartOption3 = {
      series: [
        {
          type: 'gauge',
          startAngle: -45,
          endAngle: 225,
          center: ['50%', '50%'],
          radius: '95%',
          clockwise: false,
          min: 0,
          max: 1000,
          splitNumber: 4,
          axisLine: {
            show: true,
            lineStyle: {
              width: 5,
              color: [[1, '#373740']]
            }
          },
          pointer: {
            showAbove: false,
            length: '60%',
            width: 4,
            offsetCenter: ['50%', '50%'],
            itemStyle: {
              color: '#FF6E76'
            }
          },
          axisTick: {
            show: true,
            length: 15,
            splitNumber: 25,
            lineStyle: {
              color: '#6F6F79',
              width: 1
            }
          },
          splitLine: {
            show: false,
            length: 30,
            distance: -20,
            lineStyle: {
              // color: 'auto',
              width: 2
            }
          },
          axisLabel: {
            color: '#B1B1B2',
            fontSize: 15,
            distance: -8,
            // rotate: 'tangential',
            formatter: function formatNumberWithK(number) {
              if (number >= 1000) {
                if (number % 1000 === 0) {
                  const formattedNumber = (number / 1000).toFixed(0);
                  return `${formattedNumber}k`;
                } else {
                  const formattedNumber = (number / 1000).toFixed(1);
                  return `${formattedNumber}k`;
                }
              } else {
                return number.toString();
              }
            }
          },
          title: {
            offsetCenter: [0, '60%'],
            fontSize: 15,
            color: '#B1B1B2'
          },
          detail: {
            fontSize: 30,
            offsetCenter: [0, '30%'],
            valueAnimation: true,
            color: '#E3E3E4'

            // borderWidth: 10,
            // borderColor: '#FFFFFF'
          },
          data: [
            {
              value: 658,
              name: 'FLR'
            }
          ]
        }
      ]
    };
    const chartOption4 = {
      series: [
        {
          type: 'gauge',
          startAngle: -45,
          endAngle: 225,
          center: ['50%', '50%'],
          radius: '95%',
          clockwise: false,
          min: -5000,
          max: 5000,
          splitNumber: 4,
          axisLine: {
            show: true,
            lineStyle: {
              width: 5,
              color: [
                [0.1, '#FF6E76'],
                [0.2, '#FDDD60'],
                [0.8, '#7CFFB2'],
                [0.9, '#FDDD60'],
                [1, '#FF6E76']
              ]
            }
          },
          pointer: {
            showAbove: false,
            length: '60%',
            width: 4,
            offsetCenter: ['50%', '50%'],
            itemStyle: {
              color: '#FF6E76'
            }
          },
          axisTick: {
            show: true,
            length: 15,
            splitNumber: 25,
            lineStyle: {
              color: '#6F6F79',
              width: 1
            }
          },
          splitLine: {
            show: false,
            length: 30,
            distance: -20,
            lineStyle: {
              // color: 'auto',
              width: 2
            }
          },
          axisLabel: {
            color: '#B1B1B2',
            fontSize: 15,
            distance: -8,
            // rotate: 'tangential',
            formatter: function formatNumberWithK(number) {
              if (number === 0) {
                return 0;
              } else if (number % 1000 === 0) {
                const formattedNumber = (number / 1000).toFixed(0);
                return `${formattedNumber}k`;
              } else {
                const formattedNumber = (number / 1000).toFixed(1);
                return `${formattedNumber}k`;
              }
            }
          },
          title: {
            offsetCenter: [0, '60%'],
            fontSize: 15,
            color: '#B1B1B2'
          },
          detail: {
            fontSize: 30,
            offsetCenter: [0, '30%'],
            valueAnimation: true,
            color: '#E3E3E4'
          },
          data: [
            {
              value: -4750,
              name: 'DIFFP'
            }
          ]
        }
      ]
    };
    return [chartOption1, chartOption2, chartOption3, chartOption4];
  }

  updateChartData(chartOption, data) {
    const isDataSetEmpty = this.isDataSetEmpty(data);
    chartOption.title.show = isDataSetEmpty;
    chartOption.xAxis.show = !isDataSetEmpty;
    chartOption.xAxis.data = [...data.xAxisData];
    chartOption.yAxis.show = !isDataSetEmpty;
    chartOption.series[0].data = [...data.seriesData];
    return chartOption;
  }

  changeChartTheme(chartOption, theme) {
    chartOption.backgroundColor = theme.color_bg;
    chartOption.title.textStyle.color = theme.color_dial_text;
    chartOption.tooltip.backgroundColor = theme.color_tooltip_bg;
    chartOption.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.axisLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.axisLabel.color = theme.color_graph_text;
    chartOption.xAxis.axisLabel.color = theme.color_graph_text;
    chartOption.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.splitLine.lineStyle.color = theme.color_grid_division;
    chartOption.series[0].itemStyle.color = theme.color_normal_bar;
    return chartOption;
  }
}
