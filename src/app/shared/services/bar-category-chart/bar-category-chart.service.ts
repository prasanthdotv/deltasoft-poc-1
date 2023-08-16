import { Injectable } from '@angular/core';
import { ChartOptions } from '@app/shared/config/chart-options';

@Injectable()
export class BarChartService extends ChartOptions {

  constructor() {
    super();
  }

  processChartData(data) {
    return {
      xAxisData: Object.keys(data),
      seriesData: Object.values(data)
    }
  }

  isDataSetEmpty(data) {
    return !(data.xAxisData.length && data.seriesData.length);
  }

  initChartOption(theme, data, chartConfig) {
    const isDataSetEmpty = this.isDataSetEmpty(data);
    const isYAxisNameNeeded = chartConfig.yAxisName ? true : false;
    let chartOption: any = {
      backgroundColor: theme.color_bg,
      title: {
        show: isDataSetEmpty,
        textStyle: {
          fontSize: 12,
          color: theme.color_dial_text,
          fontWeight: 'lighter',
          fontFamily: 'Roboto'
        },
        ...this.chartOptionConstants.title
      },
      tooltip: {
        show: !isDataSetEmpty,
        backgroundColor: theme.color_tooltip_bg,
        ...this.chartOptionConstants.tooltip,
        axisPointer: {
          type: 'none'
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: isYAxisNameNeeded ? 0 : '4%',
        right: '7%',
        ...this.chartOptionConstants.grid,
        bottom: '10%'
      },
      xAxis: {
        show: !isDataSetEmpty,
        type: 'category',
        data: [...data.xAxisData],
        axisLabel: {
          color: theme.color_graph_text,
          fontSize: 11,
          fontFamily: 'Roboto'
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          onZero: false,
          lineStyle: {
            color: theme.color_grid_division
          }
        },
        splitLine: {
          lineStyle: {
            color: theme.color_grid_division
          }
        }
      },
      yAxis: {
        show: !isDataSetEmpty,
        type: 'value',
        minInterval: 1,
        axisLabel: {
          fontSize: 11,
          color: theme.color_graph_text,
          fontFamily: 'Roboto'
        },
        axisLine: {
          lineStyle: {
            color: theme.color_grid_division
          }
        },
        splitLine: {
          lineStyle: {
            color: theme.color_grid_division
          }
        }
      },
      dataZoom: [
        {
          show: false
        }
      ],
      series: [{
        data: [...data.seriesData],
        type: 'bar',
        barMaxWidth: 40,
        itemStyle: {
          color: theme.color_normal_bar
        }
      }]
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
