import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartOptions } from '@app/shared/config/chart-options';
import { ChartService } from '../chart/chart.service';

@Injectable()
export class MultiAxisLineChartService extends ChartOptions {
  constants: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.constants = this.appConfig.getConstants();
  }
  getGraphColors(theme) {
    const graphColors = theme.parameter_colors;
    return graphColors;
  }

  initChartOption(theme, graphData, timeRange, chartConfig) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    const yAxisUnit = chartConfig.unit ? chartConfig.unit : '';
    const precision = this.constants.toolTipPrecision;
    const multiAxisLineChartConfig: any = {
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
          params.forEach((data, i) => {
            const seriesName = data.seriesName;
            const index = legends.indexOf(seriesName);
            let axisData = data.value[1];
            if (yAxisUnit[index]) {
              if (this.constants.processableUnits.includes(yAxisUnit[index])) {
                axisData = this.chartService.getToolTipValue(yAxisUnit[index], Number(axisData));
              } else {
                axisData = Number(data.value[1]).toFixed(precision) + yAxisUnit[index];
              }
            }
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
        data: legends,
        textStyle: {
          color: theme.color_graph_text,
          fontSize: 12,
          fontFamily: 'Roboto'
        },
        ...this.chartOptionConstants.legend
      },
      grid: {
        left: chartConfig.yAxisName[0] ? 0 : '4%',
        right: chartConfig.yAxisName[1] ? '2%' : '7%',
        ...this.chartOptionConstants.grid
      },
      xAxis: {
        show: !isDataSetEmpty,
        type: 'time',
        min: timeRange.minTime,
        max: timeRange.maxTime,
        splitNumber: 4,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: theme.color_graph_text,
          fontSize: 11,
          formatter: value => {
            return this.chartService.xAxisLabelFormatter(value, timeRange, multiAxisLineChartConfig.dataZoom[0]);
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
          minInterval: 1,
          axisLabel: {
            fontSize: 11,
            color: theme.color_graph_text,
            formatter: value => this.chartService.yAxisLabelFormatter(yAxisUnit[0], value),
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
          show: !isDataSetEmpty,
          type: 'value',
          minInterval: 1,
          axisLabel: {
            fontSize: 11,
            color: theme.color_graph_text,
            formatter: value => this.chartService.yAxisLabelFormatter(yAxisUnit[1], value),
            fontFamily: 'Roboto'
          },
          axisLine: {
            lineStyle: {
              color: theme.color_grid_division
            }
          },
          splitLine: {
            show: false
          }
        }
      ],
      dataZoom: [
        {
          show: !isDataSetEmpty,
          start: 0,
          end: 100,
          bottom: '0.5%',
          left: '13%',
          right: '15%',
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
    return multiAxisLineChartConfig;
  }
  generateSeriesData(legends, graphData, theme) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const dataTypes = Object.keys(graphData);
    const graphColors = this.getGraphColors(theme);
    const seriesData = [];
    if (!isDataSetEmpty) {
      for (let i = 0; i <= 1; i++) {
        const data = {
          show: !isDataSetEmpty,
          id: dataTypes[i],
          name: legends[i],
          data: graphData[dataTypes[i]],
          itemStyle: {
            color: graphColors[i]
          },
          type: 'line',
          smooth: false,
          symbol: 'circle',
          yAxisIndex: i
        };
        seriesData.push(data);
      }
    }
    return seriesData;
  }

  changeChartTheme(multiAxisLineChartConfig, theme) {
    const graphColors = this.getGraphColors(theme);
    multiAxisLineChartConfig.series.forEach((dataSeries, index) => {
      dataSeries.itemStyle.color = graphColors[index];
    });
    multiAxisLineChartConfig.backgroundColor = theme.color_bg;
    multiAxisLineChartConfig.title.textStyle.color = theme.color_dial_text;
    multiAxisLineChartConfig.legend.textStyle.color = theme.color_graph_text;
    multiAxisLineChartConfig.legend.pageIconInactiveColor = theme.disable_color;
    multiAxisLineChartConfig.legend.pageIconColor = theme.enabled_color;
    multiAxisLineChartConfig.legend.pageTextStyle.color = theme.color_graph_text;
    multiAxisLineChartConfig.tooltip.backgroundColor = theme.color_tooltip_bg;
    multiAxisLineChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    multiAxisLineChartConfig.yAxis[0].axisLine.lineStyle.color = theme.color_grid_division;
    multiAxisLineChartConfig.yAxis[0].splitLine.lineStyle.color = theme.color_grid_division;
    multiAxisLineChartConfig.yAxis[1].axisLine.lineStyle.color = theme.color_grid_division;
    multiAxisLineChartConfig.yAxis[1].axisLabel.color = theme.color_graph_text;
    multiAxisLineChartConfig.yAxis[0].axisLabel.color = theme.color_graph_text;
    multiAxisLineChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    multiAxisLineChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    multiAxisLineChartConfig.dataZoom[0].textStyle.color = theme.color_graph_text;
    return multiAxisLineChartConfig;
  }

  updateChartData(multiAxisLineChartConfig, graphData, timeRange, theme, legends, multiAxisLineChartConfigInstance, zoomOption) {
    const seriesData = this.generateSeriesData(legends, graphData, theme);
    // isDataSetEmpty will be set true only if there is no data for the entire timeSlot selected (not only Zoom interval)
    const isDataSetEmpty = zoomOption.start === 0 && zoomOption.end === 100 ? this.chartService.isDataSetEmpty(graphData) : false;
    multiAxisLineChartConfig.xAxis.min = timeRange.minTime;
    multiAxisLineChartConfig.xAxis.max = timeRange.maxTime;
    multiAxisLineChartConfig.xAxis.show = !isDataSetEmpty;
    multiAxisLineChartConfig.yAxis[0].show = !isDataSetEmpty;
    multiAxisLineChartConfig.yAxis[1].show = !isDataSetEmpty;
    multiAxisLineChartConfig.tooltip.show = !isDataSetEmpty;
    multiAxisLineChartConfig.legend.show = !isDataSetEmpty;
    multiAxisLineChartConfig.legend.selected = multiAxisLineChartConfigInstance.legend[0].selected;
    multiAxisLineChartConfig.series = seriesData;
    multiAxisLineChartConfig.title.show = isDataSetEmpty;
    multiAxisLineChartConfig.dataZoom[0].start = zoomOption.start;
    multiAxisLineChartConfig.dataZoom[0].end = zoomOption.end;
    multiAxisLineChartConfig.dataZoom[0].show = !isDataSetEmpty;
    return multiAxisLineChartConfig;
  }
}
