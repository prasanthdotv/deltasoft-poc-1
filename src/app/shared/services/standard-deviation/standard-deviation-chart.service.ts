import { ChartOptions } from '@app/shared/config/chart-options';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import * as moment from 'moment';
import { ChartService } from '../chart/chart.service';

@Injectable({
  providedIn: 'root'
})
export class StandardDeviationChartService extends ChartOptions {
  constants: any;
  constructor(private appConfig: AppConfigService, private chartService: ChartService) {
    super();
    this.constants = this.appConfig.getConstants();
  }
  getGraphColors(theme) {
    const graphColors = {
      Average: theme.color_warning_box,
      Deviation: theme.color_anomaly_box
    };
    return graphColors;
  }
  processDeviationChartData(chartData) {
    let processedData = [];
    if (chartData) {
      chartData.forEach(item => {
        item['date_time'] = moment
          .utc(item['date_time'])
          .local()
          .format('YYYY-MM-DD HH:mm');
        item['mean_val'] = item['mean_val'] ? Number(item['mean_val']).toFixed(2) : '0';
        item['min_val'] = item['min_val'] ? Number(item['min_val']).toFixed(2) : '0';
        item['max_val'] = item['max_val'] ? Number(item['max_val']).toFixed(2) : '0';
      });
      processedData = chartData.map((row, i) => [row.date_time, row.mean_val, row.min_val, row.max_val]);
      processedData.unshift(['date_time', 'mean_val', 'min_val', 'max_val']);
    }
    return processedData;
  }
  renderItem(params, api) {
    let xValue = api.value(0);
    let highPoint = api.coord([xValue, api.value(2)]);
    let lowPoint = api.coord([xValue, api.value(3)]);
    let style = api.style({
      stroke: api.visual('color'),
      fill: api.visual('color')
    });
    return {
      type: 'group',
      children: [
        {
          type: 'circle',
          shape: {
            cx: highPoint[0],
            cy: highPoint[1],
            r: 4
          },
          style: style
        },
        {
          type: 'line',
          shape: {
            x1: highPoint[0],
            y1: highPoint[1],
            x2: lowPoint[0],
            y2: lowPoint[1]
          },
          style: style
        },
        {
          type: 'circle',
          shape: {
            cx: lowPoint[0],
            cy: lowPoint[1],
            r: 4
          },
          style: style
        }
      ]
    };
  }
  initChartOption(theme, graphData, timeRange, chartConfig) {
    let isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends;
    let isYAxisNameNeeded = Boolean(chartConfig.yAxisName);
    const yAxisUnit = chartConfig.unit;
    const deviationChartConfig: any = {
      backgroundColor: theme.color_bg,
      dataset: {
        source: graphData
      },
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
          const seriesNames = ['Average', 'Minimum Deviation', 'Maximum Deviation'];
          const legendColors = [theme.color_warning_box, theme.color_anomaly_box, theme.color_anomaly_box];
          let toolTipData = '';
          const timeSlot = params[0].data[0];
          for (let i = 0; i < seriesNames.length; i++) {
            toolTipData =
              toolTipData +
              '<br>' +
              this.chartService.createHTMLBullet(legendColors[i]) +
              seriesNames[i] +
              ': ' +
              this.chartService.getYAxisValue(yAxisUnit, params[0].value[i + 1]);
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
      dataZoom: [
        {
          show: !isDataSetEmpty,
          start: 0,
          end: 100,
          bottom: '1%',
          left: '13%',
          right: '15%',
          textStyle: {
            color: theme.color_graph_text,
            fontSize: 12,
            fontFamily: 'Roboto'
          }
        }
      ],
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
        splitNumber: 4,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: theme.color_graph_text,
          fontSize: 11,
          formatter: value => {
            return this.chartService.xAxisLabelFormatter(value, timeRange, deviationChartConfig.dataZoom[0]);
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
        axisLabel: {
          fontSize: 11,
          color: theme.color_graph_text,
          fontFamily: 'Roboto',
          formatter: value => this.chartService.yAxisLabelFormatter(yAxisUnit[0], value)
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
      series: [
        {
          type: 'line',
          name: 'Average',
          encode: {
            x: 'date_time',
            y: 'mean_val'
          },
          itemStyle: {
            color: theme.color_warning_box
          }
        },
        {
          type: 'custom',
          name: 'Deviation',
          itemStyle: {
            normal: {
              borderWidth: 1.5
            },
            color: theme.color_anomaly_box
          },
          renderItem: this.renderItem,
          encode: {
            x: 'date_time',
            y: ['min_val', 'max_val']
          },
          z: 100
        }
      ]
    };
    return deviationChartConfig;
  }

  changeChartTheme(deviationChartConfig, theme) {
    const graphColors = this.getGraphColors(theme);
    deviationChartConfig.series.forEach((dataSeries, index) => {
      const dataType = dataSeries.name;
      if (dataType) {
        dataSeries.itemStyle.color = graphColors[dataType];
      }
    });
    deviationChartConfig.backgroundColor = theme.color_bg;
    deviationChartConfig.title.textStyle.color = theme.color_dial_text;
    deviationChartConfig.legend.textStyle.color = theme.color_graph_text;
    deviationChartConfig.legend.pageIconInactiveColor = theme.disable_color;
    deviationChartConfig.legend.pageIconColor = theme.enabled_color;
    deviationChartConfig.legend.pageTextStyle.color = theme.color_graph_text;
    deviationChartConfig.tooltip.backgroundColor = theme.color_tooltip_bg;
    deviationChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    deviationChartConfig.yAxis.axisLine.lineStyle.color = theme.color_grid_division;
    deviationChartConfig.yAxis.splitLine.lineStyle.color = theme.color_grid_division;
    deviationChartConfig.yAxis.axisLabel.color = theme.color_graph_text;
    deviationChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    deviationChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    deviationChartConfig.dataZoom[0].textStyle.color = theme.color_graph_text;
    return deviationChartConfig;
  }

  updateChartData(deviationChartConfig, graphData, timeRange, deviationChartConfigInstance, zoomOption) {
    // isDataSetEmpty will be set true only if there is no data for the entire timeSlot selected (not only Zoom interval)
    let isDataSetEmpty =
      deviationChartConfig.dataZoom[0].start === 0 && deviationChartConfig.dataZoom[0].end === 100
        ? this.chartService.isDataSetEmpty(graphData)
        : false;
    deviationChartConfig.xAxis.min = timeRange.minTime;
    deviationChartConfig.xAxis.max = timeRange.maxTime;
    deviationChartConfig.xAxis.show = !isDataSetEmpty;
    deviationChartConfig.yAxis.show = !isDataSetEmpty;
    deviationChartConfig.tooltip.show = !isDataSetEmpty;
    deviationChartConfig.legend.show = !isDataSetEmpty;
    deviationChartConfig.legend.selected = deviationChartConfigInstance.legend[0].selected;
    deviationChartConfig.dataset.source = graphData;
    deviationChartConfig.title.show = isDataSetEmpty;
    deviationChartConfig.dataZoom[0].start = zoomOption.start;
    deviationChartConfig.dataZoom[0].end = zoomOption.end;
    deviationChartConfig.dataZoom[0].show = !isDataSetEmpty;
    return deviationChartConfig;
  }
}
