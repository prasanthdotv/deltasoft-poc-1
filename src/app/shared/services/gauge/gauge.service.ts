import { Injectable } from '@angular/core';
import { ChartOptions } from '@app/shared/config/chart-options';

@Injectable({
  providedIn: 'root'
})
export class GaugeService extends ChartOptions {
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
    const chartOption = {
      // backgroundColor: theme.color_bg,
      // title: {
      //   text: isDataSetEmpty ? 'No data' : 'STB Count',
      //   left: isDataSetEmpty ? 'center' : '4%',
      //   top: isDataSetEmpty ? '35%' : '81%',
      //   textStyle: {
      //     fontSize: 12,
      //     color: isDataSetEmpty ? theme.color_dial_text : theme.color_pie_item,
      //     fontWeight: 'lighter',
      //     fontFamily: 'Roboto'
      //   }
      // },
      // legend: {
      //   data: [],
      //   type: 'scroll',
      //   pageIconSize: 8,
      //   pageIconInactiveColor: theme.disable_color,
      //   pageIconColor: theme.enabled_color,
      //   pageTextStyle: {
      //     color: theme.color_graph_text
      //   },
      //   icon: 'roundRect',
      //   itemHeight: 4,
      //   left: '4%',
      //   itemWidth: 13,
      //   top: '90%',
      //   textStyle: {
      //     color: theme.color_graph_text,
      //     fontSize: 12,
      //     fontFamily: 'Roboto'
      //   },
      //   formatter: name => {
      //     return name + ' (' + ')';
      //   }
      // },
      // tooltip: {
      //   trigger: 'item',
      //   formatter: params => {
      //     return 'this.chartService.formatPieChartTooltip(params);';
      //   },
      //   textStyle: {
      //     fontSize: 12,
      //     color: '#fff',
      //     fontWeight: 'lighter',
      //     fontFamily: 'Roboto'
      //   },

      //   backgroundColor: theme.color_tooltip_bg,
      //   padding: 5
      // },

      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: 449.9,
          center: ['50%', '50%'],
          radius: '95%',
          clockwise: false,
          min: 0,
          max: 360,
          splitNumber: 36,
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                // [0.25, '#FF6E76'],
                // [0.5, '#FDDD60'],
                // [0.75, '#58D9F9'],
                [1, '#373740']
              ]
            }
          },
          pointer: {
            length: '50%',
            width: 6,
            offsetCenter: ['50%', '50%'],
            itemStyle: {
              color: '#FDDD60'
            }
          },
          anchor: {
            show: true
          },
          axisTick: {
            length: 15,
            splitNumber: 10,
            distance: 1,
            lineStyle: {
              color: '#6F6F79',
              width: 2
            }
          },
          splitLine: {
            length: 30,
            distance: 10,
            lineStyle: {
              // color: 'auto',
              width: 2
            }
          },
          axisLabel: {
            color: '#B1B1B2',
            fontSize: 20,
            distance: 30,
            // rotate: 'tangential',
            formatter: function(value: number) {
              if (!value) {
                return '{hl|0}';
              }
              if (value === 360) {
                return null;
              }
              return value % 30 === 0 ? (value % 90 === 0 ? `{hl|${value}}` : value.toString()) : null;
            },
            rich: {
              hl: {
                fontSize: 30,
                color: '#B1B1B2'
              }
            }
          },
          title: {
            offsetCenter: [0, '30%'],
            fontSize: 20,
            color: '#B1B1B2'
          },
          detail: {
            fontSize: 50,
            offsetCenter: [0, '15%'],
            valueAnimation: true,
            color: '#E3E3E4'
          },
          data: [
            {
              value: 311,
              name: 'GTF'
            }
          ]
        }
      ]
    };
    return chartOption;
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
