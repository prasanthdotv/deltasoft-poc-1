import { ChartOptions } from '@app/shared/config/chart-options';
import { Injectable } from '@angular/core';
import { ChartService } from '../chart/chart.service';
import { graphic } from 'echarts';
@Injectable()
export class VerticalStackedChartService extends ChartOptions {
  constructor(private chartService: ChartService) {
    super();
  }

  initVerticalStackedChartOption(theme, graphData, chartConfig) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const size = graphData.value.length;
    const verticalStackedChartConfig = {
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
        left: '4%',
        right: '4%',
        ...this.chartOptionConstants.grid
      },
      yAxis: {
        show: !isDataSetEmpty,
        type: 'value',
        data: graphData.value,
        axisLabel: {
          fontSize: 12,
          color: theme.color_graph_text
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
      tooltip: {
        backgroundColor: theme.color_tooltip_bg,
        ...this.chartOptionConstants.tooltip
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
        },
        axisLabel: {
          fontSize: 12,
          interval: 0,
          color: theme.color_graph_text,
          rotate: 50,
          formatter: function (value, index) {
            if (value.length > 10) {
              let labelText = value.slice(0, 10) + '...';
              return labelText;
            } else {
              return value;
            }
          }
        }
      },

      series: [
        {
          type: 'bar',
          name: legends,
          // stack: 'bar-graph',
          barMaxWidth: 50,
          data: graphData.value,
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#097976' },
              { offset: 0.5, color: '#2ab587' },
              { offset: 1, color: '#2ce69b' }
            ])
          }
        }
      ]
    };

    return verticalStackedChartConfig;
  }

  updateVerticalStackedChartOption(verticalStackedChartConfig, graphData) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const size = graphData.value.length;
    verticalStackedChartConfig.title.show = isDataSetEmpty;
    verticalStackedChartConfig.yAxis.show = !isDataSetEmpty;
    verticalStackedChartConfig.yAxis.data = graphData.value;
    verticalStackedChartConfig.dataZoom[0].show = size > 50;
    verticalStackedChartConfig.xAxis.show = !isDataSetEmpty;
    verticalStackedChartConfig.xAxis.data = graphData.metrics;
    const newData = graphData.value;
    verticalStackedChartConfig.series[0].data.forEach((dataItem, index) => {
      dataItem.value = newData[index];
    });
    return verticalStackedChartConfig;
  }

  changeverticalStackedChartTheme(verticalStackedChartConfig, theme) {
    verticalStackedChartConfig.backgroundColor = theme.color_bg;
    verticalStackedChartConfig.dataZoom[0].borderColor = theme.color_bg;
    verticalStackedChartConfig.legend.textStyle.color = theme.color_graph_text;
    verticalStackedChartConfig.legend.pageIconInactiveColor = theme.disable_color;
    verticalStackedChartConfig.legend.pageIconColor = theme.enabled_color;
    verticalStackedChartConfig.legend.pageTextStyle.color = theme.color_graph_text;
    verticalStackedChartConfig.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    verticalStackedChartConfig.yAxis.axisLine.lineStyle.color = theme.color_grid_division;
    verticalStackedChartConfig.yAxis.axisLabel.color = theme.color_graph_text;
    verticalStackedChartConfig.xAxis.axisLabel.color = theme.color_graph_text;
    verticalStackedChartConfig.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    verticalStackedChartConfig.yAxis.splitLine.lineStyle.color = theme.color_grid_division;
    return verticalStackedChartConfig;
  }

  processVerticalStackedChartData(chartData) {
    if (chartData) {
      const processedData: any = {};
      const value = chartData.data.map(item => (Number.isInteger(Number(item.value)) ? item.value : Number(item.value).toFixed(2)));
      const metrics = chartData.data.map(item => item.metric);
      processedData.value = value;
      processedData.metrics = metrics;
      return processedData;
    } else {
      return {
        value: [],
        metrics: []
      };
    }
  }
}
