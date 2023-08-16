import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { ChartOptions } from '@app/shared/config/chart-options';
import { ICXDefaultTheme } from '@app/themes/custom-themes/icx-default-theme';

@Injectable()
export class BarLineChartService extends ChartOptions {
  constants: any;
  icxDefaultTheme: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.icxDefaultTheme = new ICXDefaultTheme();
    this.constants = this.appConfig.getConstants();
  }

  getGraphColors() {
    const theme = this.icxDefaultTheme.theme;
    const graphColors = {
      series_bar: theme.color_series_bar,
      series_line: theme.color_series_line
    };
    return graphColors;
  }

  processBarLineChartData(chartData) {
    if (chartData && chartData.data) {
      const processedData: any = {};
      const dataItem = chartData.data;
      const value = dataItem.map(item =>
        Number.isInteger(Number(item.value)) ? item.value : Number(item.value).toFixed(2)
      );
      const metrics = dataItem.map(item => item.metric);
      const userCount = dataItem.map(item => item.user_count);
      processedData.metrics = metrics;
      processedData.value = value;
      processedData.userCount = userCount;
      return processedData;
    } else {
      return {};
    }
  }

  initChartOption(theme, graphData, chartConfig, graphType) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    const barLineChartConfig: any = {
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
        ...this.chartOptionConstants.tooltip,
        axisPointer: {
          type: 'none'
        },
        confine: true,
        backgroundColor: theme.color_tooltip_bg
      },
      legend: {
        show: !isDataSetEmpty,
        ...this.chartOptionConstants.legend,
        pageIconSize: 8,
        pageIconInactiveColor: theme.disable_color,
        pageIconColor: theme.enabled_color,
        pageTextStyle: {
          color: theme.color_graph_text
        },
        data: graphType === 'both' ? [...legends['line'], ...legends['bar']] : legends[graphType],
        textStyle: {
          color: theme.color_graph_text,
          fontSize: 12,
          fontFamily: 'Roboto'
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        ...this.chartOptionConstants.grid
      },
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
      yAxis: [
        {
          show: !isDataSetEmpty,
          type: 'value',
          min: 0,
          minInterval: graphType === 'line' ? 1 : null,
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
        {
          show: !isDataSetEmpty && graphType === 'both',
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
          splitLine: false
        }
      ],
      series: seriesData
    };
    return barLineChartConfig;
  }

  generateSeriesData(legendsConfig, graphData, theme) {
    const graphColors = this.getGraphColors();
    const legends = [...legendsConfig['bar'], ...legendsConfig['line']];
    const seriesData = [
      {
        type: 'bar',
        name: legends[0],
        data: graphData.value,
        barMaxWidth: 40,
        itemStyle: {
          color: graphColors['series_bar']
        }
      },
      {
        type: 'line',
        name: legends[1],
        data: graphData.userCount,
        yAxisIndex: 1,
        itemStyle: {
          color: graphColors['series_line']
        }
      }
    ];
    return seriesData;
  }

  changeChartTheme(barLineChartConfig, theme) {
    const graphColors = this.getGraphColors();
    barLineChartConfig.series.forEach((dataSeries, index) => {
      const dataType = dataSeries.id;
      if (dataType) {
        dataSeries.itemStyle.color = graphColors[dataType];
      }
    });
    barLineChartConfig.backgroundColor = theme.color_bg;
    barLineChartConfig.title.textStyle.color = theme.color_dial_text;
    barLineChartConfig.legend.textStyle.color = theme.color_graph_text;
    barLineChartConfig.legend.pageIconInactiveColor = theme.disable_color;
    barLineChartConfig.legend.pageIconColor = theme.enabled_color;
    barLineChartConfig.legend.pageTextStyle.color = theme.color_graph_text;
    barLineChartConfig.tooltip.backgroundColor = theme.color_tooltip_bg;
    barLineChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    barLineChartConfig.yAxis[0].axisLine.lineStyle.color = theme.color_grid_division;
    barLineChartConfig.yAxis[0].splitLine.lineStyle.color = theme.color_grid_division;
    barLineChartConfig.yAxis[1].axisLine.lineStyle.color = theme.color_grid_division;
    barLineChartConfig.yAxis[1].axisLabel.color = theme.color_graph_text;
    barLineChartConfig.yAxis[0].axisLabel.color = theme.color_graph_text;
    barLineChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    barLineChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    return barLineChartConfig;
  }

  updateChartData(
    barLineChartConfig,
    graphData,
    theme,
    legends,
    barLineChartConfigInstance,
    graphType
  ) {
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    let isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    barLineChartConfig.xAxis.show = !isDataSetEmpty;
    barLineChartConfig.xAxis.data = graphData.metrics;
    barLineChartConfig.yAxis[0].show = !isDataSetEmpty;
    barLineChartConfig.yAxis[1].show = !isDataSetEmpty && graphType === 'both';
    barLineChartConfig.tooltip.show = !isDataSetEmpty;
    barLineChartConfig.legend.show = !isDataSetEmpty;
    barLineChartConfig.legend.selected = barLineChartConfigInstance.legend[0].selected;
    barLineChartConfig.legend.data = legends[graphType];
    barLineChartConfig.series = seriesData;
    barLineChartConfig.title.show = isDataSetEmpty;
    return barLineChartConfig;
  }
}
