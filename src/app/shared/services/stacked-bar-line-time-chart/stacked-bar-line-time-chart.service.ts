import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { ChartOptions } from '@app/shared/config/chart-options';

@Injectable()
export class StackedBarLineChartService extends ChartOptions {
  constants: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.constants = this.appConfig.getConstants();
  }
  getGraphColors(theme) {
    const graphColors = {
      good_box_data: theme.color_normal_box,
      warning_box_data: theme.color_warning_box,
      bad_box_data: theme.color_anomaly_box,
      good_box_count: theme.color_normal_lineChart,
      warning_box_count: theme.color_warning_lineChart,
      bad_box_count: theme.color_anomaly_lineChart,
      data: theme.color_normal_box,
      attempts: theme.color_normal_box,
      failure: theme.color_anomaly_box
    };
    return graphColors;
  }

  initChartOption(theme, graphData, timeRange, chartConfig, graphType) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const seriesData = this.generateSeriesData(legends, graphData, theme, graphType);
    const stackedBarLineChartConfig: any = {
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
        formatter: params => {
          const seriesNames = [];
          const plottedDatas = [];
          const legendColors = [];
          let toolTipData = '';
          const timeSlot = params[0].data[0];
          params.forEach(data => {
            let axisData = data.value[1];
            seriesNames.push(data.seriesName);
            plottedDatas.push(axisData);
            legendColors.push(data.color);
          });
          for (let i = 0; i < seriesNames.length; i++) {
            toolTipData =
              toolTipData + '<br>' + this.chartService.createHTMLBullet(legendColors[i]) + seriesNames[i] + ': ' + plottedDatas[i];
          }

          return timeSlot + toolTipData;
        },
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
        data: graphType === 'both' ? [...legends['line'], ...legends['bar']] : legends[graphType],
        textStyle: {
          color: theme.color_graph_text,
          fontSize: 12,
          fontFamily: 'Roboto'
        },
        ...this.chartOptionConstants.legend
      },
      grid: {
        left: '4%',
        right: '4%',
        ...this.chartOptionConstants.grid
      },
      xAxis: {
        show: !isDataSetEmpty,
        type: 'time',
        min: timeRange.minTime,
        max: timeRange.maxTime,
        scale: true,
        splitNumber: 4,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: theme.color_graph_text,
          fontSize: 11,
          formatter: value => {
            return this.chartService.xAxisLabelFormatter(value, timeRange, stackedBarLineChartConfig.dataZoom[0]);
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
      yAxis: [
        {
          show: !isDataSetEmpty,
          type: 'value',
          min: 0,
          max: graphType === 'line' ? null : 100,
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
      dataZoom: [
        {
          show: !isDataSetEmpty,
          start: 0,
          end: 100,
          bottom: '1%',
          left: '14.5%',
          right: '16.5%',
          textStyle: {
            color: theme.color_graph_text,
            fontSize: 12,
            fontFamily: 'Roboto'
          },
          labelFormatter: (value) => {
            let formattedLabel = this.chartService.formatZoomRange(value)
            return formattedLabel;
          },
        }
      ],
      series: seriesData
    };
    return stackedBarLineChartConfig;
  }

  generateSeriesData(legendsConfig, graphData, theme, type) {
    const dataTypes = Object.keys(graphData);
    const graphColors = this.getGraphColors(theme);
    const seriesData = [];
    const legends = [...legendsConfig['line'], ...legendsConfig['bar']];
    let configData;

    const barChartConfig = {
      type: 'bar',
      stack: 'percentage',
      barMaxWidth: '30%'
    };
    const lineChartConfig = {
      type: 'line',
      smooth: false,
      symbol: 'circle'
    };
    let start;
    let end;
    if (type === 'line') {
      start = 0;
      end = 2;
    } else if (type === 'bar') {
      start = 3;
      end = 5;
    } else {
      start = 0;
      end = 5;
    }
    for (let i = start; i <= end; i++) {
      const data = {
        id: dataTypes[i],
        name: legends[i],
        data: graphData[dataTypes[i]],
        itemStyle: {
          color: graphColors[dataTypes[i]]
        }
      };
      if (type === 'both') {
        if (i > 2) {
          configData = {
            ...data,
            ...barChartConfig
          };
          configData['yAxisIndex'] = 0;
        } else {
          configData = {
            ...data,
            ...lineChartConfig
          };
          configData['yAxisIndex'] = 1;
        }
      } else {
        if (type === 'bar') {
          configData = {
            ...data,
            ...barChartConfig
          };
        } else {
          configData = {
            ...data,
            ...lineChartConfig
          };
        }
      }
      seriesData.push(configData);
    }
    return seriesData;
  }

  changeChartTheme(stackedBarLineChartConfig, theme) {
    const graphColors = this.getGraphColors(theme);
    stackedBarLineChartConfig.series.forEach((dataSeries, index) => {
      const dataType = dataSeries.id;
      if (dataType) {
        dataSeries.itemStyle.color = graphColors[dataType];
      }
    });
    stackedBarLineChartConfig.backgroundColor = theme.color_bg;
    stackedBarLineChartConfig.title.textStyle.color = theme.color_dial_text;
    stackedBarLineChartConfig.legend.textStyle.color = theme.color_graph_text;
    stackedBarLineChartConfig.legend.pageIconInactiveColor = theme.disable_color;
    stackedBarLineChartConfig.legend.pageIconColor = theme.enabled_color;
    stackedBarLineChartConfig.legend.pageTextStyle.color = theme.color_graph_text;
    stackedBarLineChartConfig.tooltip.backgroundColor = theme.color_tooltip_bg;
    stackedBarLineChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    stackedBarLineChartConfig.yAxis[0].axisLine.lineStyle.color = theme.color_grid_division;
    stackedBarLineChartConfig.yAxis[0].splitLine.lineStyle.color = theme.color_grid_division;
    stackedBarLineChartConfig.yAxis[1].axisLine.lineStyle.color = theme.color_grid_division;
    stackedBarLineChartConfig.yAxis[1].axisLabel.color = theme.color_graph_text;
    stackedBarLineChartConfig.yAxis[0].axisLabel.color = theme.color_graph_text;
    stackedBarLineChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    stackedBarLineChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    stackedBarLineChartConfig.dataZoom[0].textStyle.color = theme.color_graph_text;
    return stackedBarLineChartConfig;
  }

  updateChartData(stackedBarLineChartConfig, graphData, timeRange, theme, legends, stackedBarLineChartConfigInstance, zoomOption, chartType) {
    const seriesData = this.generateSeriesData(legends, graphData, theme, chartType);
    // isDataSetEmpty will be set true only if there is no data for the entire timeSlot selected (not only Zoom interval)
    let isDataSetEmpty =
      stackedBarLineChartConfig.dataZoom[0].start === 0 && stackedBarLineChartConfig.dataZoom[0].end === 100
        ? this.chartService.isDataSetEmpty(graphData)
        : false;
    stackedBarLineChartConfig.xAxis.min = timeRange.minTime;
    stackedBarLineChartConfig.xAxis.max = timeRange.maxTime;
    stackedBarLineChartConfig.xAxis.show = !isDataSetEmpty;
    stackedBarLineChartConfig.xAxis.axisLabel.showMinLabel = chartType === 'line';
    stackedBarLineChartConfig.yAxis[0].show = !isDataSetEmpty;
    stackedBarLineChartConfig.yAxis[1].show = !isDataSetEmpty && chartType === 'both';
    stackedBarLineChartConfig.yAxis[0].max = chartType === 'bar' ? 100 : null;
    stackedBarLineChartConfig.yAxis[0].minInterval = chartType === 'line' ? 1 : null;
    stackedBarLineChartConfig.tooltip.show = !isDataSetEmpty;
    stackedBarLineChartConfig.legend.show = !isDataSetEmpty;
    stackedBarLineChartConfig.legend.selected = stackedBarLineChartConfigInstance.legend[0].selected;
    stackedBarLineChartConfig.legend.data = legends[chartType];
    stackedBarLineChartConfig.series = seriesData;
    stackedBarLineChartConfig.title.show = isDataSetEmpty;
    stackedBarLineChartConfig.dataZoom[0].start = zoomOption.start;
    stackedBarLineChartConfig.dataZoom[0].end = zoomOption.end;
    stackedBarLineChartConfig.dataZoom[0].show = !isDataSetEmpty;
    return stackedBarLineChartConfig;
  }
}
