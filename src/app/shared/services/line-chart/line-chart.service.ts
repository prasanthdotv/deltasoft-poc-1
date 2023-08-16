import { ChartOptions } from '@app/shared/config/chart-options';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartService } from '../chart/chart.service';

@Injectable()
export class LineChartService extends ChartOptions {
  constants: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.constants = this.appConfig.getConstants();
  }

  initLineChartOption(theme, graphData, timeRange, chartConfig) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const yAxisUnit = chartConfig.unit ? chartConfig.unit : '';
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    const isYAxisNameNeeded = Boolean(chartConfig.yAxisName);
    const lineChartConfig: any = {
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
        formatter: params => this.chartService.toolTipFormatter(params, yAxisUnit),
        position: (point, params, dom: HTMLElement) => {
          this.chartService.hideTooltip(point, params, dom);
        },
        ...this.chartOptionConstants.tooltip
      },
      legend: {
        show: !isDataSetEmpty,
        pageIconSize: 8,
        pageIconInactiveColor: theme.disable_color,
        pageIconColor: theme.enabled_color,
        pageTextStyle: {
          color: theme.color_graph_text
        },
        data: legends,
        textStyle: {
          color: theme.color_graph_text,
          fontSize: 12,
          fontFamily: 'Roboto'
        },
        ...this.chartOptionConstants.legend
      },
      grid: {
        left: isYAxisNameNeeded ? 0 : '4%',
        right: '7%',
        ...this.chartOptionConstants.grid
      },
      xAxis: {
        show: !isDataSetEmpty,
        type: 'time',
        min: timeRange.minTime,
        max: timeRange.maxTime,
        scale: true,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: theme.color_graph_text,
          fontSize: 11,
          formatter: value => {
            return this.chartService.xAxisLabelFormatter(value, timeRange, lineChartConfig.dataZoom[0]);
          },
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
        inverse: yAxisUnit === ' dBm',
        axisLabel: {
          fontSize: 11,
          color: theme.color_graph_text,
          formatter: value => this.chartService.yAxisLabelFormatter(yAxisUnit, value),
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
          show: !isDataSetEmpty,
          start: 100,
          end: 100,
          top: '86%',
          textStyle: {
            color: theme.color_graph_text,
            fontSize: 12,
            fontFamily: 'Roboto'
          }
        }
      ],
      series: seriesData
    };
    return lineChartConfig;
  }

  generateSeriesData(legends, graphData, theme) {
    const dataTypes = Object.keys(graphData);
    const graphColors = this.chartService.getGraphColors(theme);
    const seriesData = [];
    const data = {
      id: dataTypes[0],
      name: legends[0],
      data: graphData[dataTypes[0]],
      itemStyle: {
        color: graphColors[dataTypes[0]]
      },
      type: 'line',
      smooth: false,
      symbol: 'circle'
    };
    seriesData.push(data);
    return seriesData;
  }

  updateChartData(lineChartConfig, graphData, timeRange, theme, chartConfig) {
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    lineChartConfig.xAxis.min = timeRange.minTime;
    lineChartConfig.xAxis.max = timeRange.maxTime;
    lineChartConfig.xAxis.show = !isDataSetEmpty;
    lineChartConfig.yAxis.show = !isDataSetEmpty;
    lineChartConfig.tooltip.show = !isDataSetEmpty;
    lineChartConfig.legend.show = !isDataSetEmpty;
    lineChartConfig.series = seriesData;
    lineChartConfig.title.show = isDataSetEmpty;
    lineChartConfig.dataZoom[0].show = !isDataSetEmpty;
    return lineChartConfig;
  }
}
