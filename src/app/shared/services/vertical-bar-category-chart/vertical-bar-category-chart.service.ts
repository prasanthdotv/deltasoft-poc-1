import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { ChartOptions } from '@app/shared/config/chart-options';
import * as _ from 'lodash';

@Injectable()
export class VerticalBarChartService extends ChartOptions {
  constants: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.constants = this.appConfig.getConstants();
  }

  sin_to_hex(i, phase) {
    const sin = Math.sin((Math.PI / 120) * 2 * i + phase);
    const int = Math.floor(sin * 127) + 128;
    const hex = int.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  generateRainbowColors(size) {
    const rainbowColors = new Array(size);
    for (let i = -50, j = 0; j < 100; i++ , j++) {
      const red = this.sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
      const blue = this.sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
      const green = this.sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg

      rainbowColors[j] = '#' + red + green + blue;
    }
    return rainbowColors;
  }

  initVerticalBarChartOption(theme, graphData) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const size = graphData.value.length;
    const seriesData = this.generateSeriesData(size, graphData);
    const verticalBarChartConfig = {
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
      grid: {
        left: '4%',
        right: '4%',
        ...this.chartOptionConstants.grid
      },
      tooltip: {
        show: !isDataSetEmpty,
        ...this.chartOptionConstants.tooltip,
        axisPointer: {
          type: 'none'
        },
        confine: true,
        formatter: params => {
          return this.processTooltip(params, graphData);
        },
        backgroundColor: theme.color_tooltip_bg
      },
      dataZoom: [
        {
          show: size > 50,
          startValue: 0,
          endValue: 50,
          filterMode: 'empty',
          width: '90%',
          height: '2.5%',
          showDataShadow: false,
          realtime: false,
          cursor: 'pointer',
          borderColor: theme.color_bg,
          showDetail: false,
          handleSize: '0%'
        }
      ],
      xAxis: {
        show: !isDataSetEmpty,
        data: graphData.metrics,
        axisLabel: {
          color: theme.color_graph_text,
          ...this.chartOptionConstants.categroyAxisLabel,
          formatter: (value, index) => {
            return this.chartService.formatCategoryXAxis(value, index);
          }
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
        data: graphData.value,
        minInterval:1,
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
      series: seriesData
    };
    return verticalBarChartConfig;
  }

  generateSeriesData(size, graphData) {
    const seriesData = [];
    const rainbowColors = this.generateRainbowColors(size);
    graphData.value.forEach((item, index) => {
      seriesData.push({
        value: item,
        itemStyle: { color: rainbowColors[index] }
      });
    });
    const series = [
      {
        type: 'bar',
        barMaxWidth: 50,
        data: seriesData
      }
    ];
    return series;
  }

  processTooltip(params, graphData) {
    let toolTipData = '';
    const { name, value, color } = params[0];
    const versionInfo = graphData.versionInfo[name];
    let version = '';
    if (versionInfo && versionInfo.length) {
      versionInfo.forEach(info => {
        version = version + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + info.version + '  (' + info.count + ')' + '<br>';
      });
    }
    toolTipData = this.chartService.createHTMLBullet(color) + name + '  (' + value + ')' + '<br>' + version;
    return toolTipData;
  }

  changeChartTheme(verticalBarChartConfig, theme) {
    verticalBarChartConfig.backgroundColor = theme.color_bg;
    verticalBarChartConfig.dataZoom[0].borderColor = theme.color_bg;
    verticalBarChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    verticalBarChartConfig.yAxis.axisLine.lineStyle.color = theme.color_grid_division;
    verticalBarChartConfig.yAxis.axisLabel.color = theme.color_graph_text;
    verticalBarChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    verticalBarChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    verticalBarChartConfig.yAxis.splitLine.lineStyle.color = theme.color_grid_division;
    return verticalBarChartConfig;
  }

  updateVerticalBarChartOption(verticalBarChartConfig, graphData) {
    const size = graphData.value.length;
    const seriesData = this.generateSeriesData(size, graphData);
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    verticalBarChartConfig.title.show = isDataSetEmpty;
    verticalBarChartConfig.yAxis.show = !isDataSetEmpty;
    verticalBarChartConfig.yAxis.data = graphData.value;
    verticalBarChartConfig.dataZoom[0].show = size > 50;
    verticalBarChartConfig.xAxis.show = !isDataSetEmpty;
    verticalBarChartConfig.xAxis.data = graphData.metrics;
    verticalBarChartConfig.tooltip.formatter = params => {
      return this.processTooltip(params, graphData);
    };
    verticalBarChartConfig.series = seriesData;
    return verticalBarChartConfig;
  }

  processVerticalBarChartData(chartData) {
    if (chartData && chartData.data) {
      const processedData: any = {};
      const appData = chartData.data;
      const value = appData.map(item => (Number.isInteger(Number(item.value)) ? item.value : Number(item.value).toFixed(2)));
      const metrics = appData.map(item => item.metric);
      const versionInfo = {};
      appData.forEach(data => {
        const { metric, versionCount } = data;
        versionInfo[metric] = versionCount;
      });
      processedData.value = value;
      processedData.metrics = metrics;
      processedData.versionInfo = versionInfo;
      return processedData;
    } else {
      return {};
    }
  }
}
