import { Injectable } from '@angular/core';
import { ChartService } from '../chart/chart.service';

@Injectable()
export class PieChartService {
  constructor(private chartService: ChartService) {}

  processPieChartData(chartData) {
    const processedData: any = {};
    if (chartData) {
      const keys = Object.keys(chartData);
      let isAllDataEmpty = true;
      for (const dataType of keys) {
        const elementValue = chartData[dataType];
        isAllDataEmpty = isAllDataEmpty && elementValue === '0';
        processedData[dataType] = elementValue.toString();
      }
      const data = isAllDataEmpty ? {} : processedData;
      return data;
    } else {
      return processedData;
    }
  }

  initPieChartOption(theme, graphData) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = Object.keys(graphData);
    const chartOption = {
      backgroundColor: theme.color_bg,
      title: {
        text: isDataSetEmpty ? 'No data' : 'STB Count',
        left: isDataSetEmpty ? 'center' : '4%',
        top: isDataSetEmpty ? '35%' : '81%',
        textStyle: {
          fontSize: 12,
          color: isDataSetEmpty ? theme.color_dial_text : theme.color_pie_item,
          fontWeight: 'lighter',
          fontFamily: 'Roboto'
        }
      },
      legend: {
        data: legends,
        type: 'scroll',
        pageIconSize: 8,
        pageIconInactiveColor: theme.disable_color,
        pageIconColor: theme.enabled_color,
        pageTextStyle: {
          color: theme.color_graph_text
        },
        icon: 'roundRect',
        itemHeight: 4,
        left: '4%',
        itemWidth: 13,
        top: '90%',
        textStyle: {
          color: theme.color_graph_text,
          fontSize: 12,
          fontFamily: 'Roboto'
        },
        formatter: name => {
          return name + ' (' + graphData[name] + ')';
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: params => {
          return this.chartService.formatPieChartTooltip(params);
        },
        textStyle: {
          fontSize: 12,
          color: '#fff',
          fontWeight: 'lighter',
          fontFamily: 'Roboto'
        },

        backgroundColor: theme.color_tooltip_bg,
        padding: 5
      },

      series: [
        {
          type: 'pie',
          radius: '75%',
          center: ['50%', '43%'],
          left: 0,
          bottom: 0,
          data: this.getSeriesData(theme, legends, graphData),
          labelLine: {
            show: false
          },
          label: {
            show: false
          },
          itemStyle: {
            borderWidth: 0
          }
        }
      ]
    };
    return chartOption;
  }

  updatePieChartOption(chartOption, graphData, theme, chartOptionInstance) {
    const isDataSetEmpty = this.chartService.isDataSetEmpty(graphData);
    const legends = Object.keys(graphData);
    chartOption.title.text = isDataSetEmpty ? 'No data' : 'STB Count';
    chartOption.title.left = isDataSetEmpty ? 'center' : '4%';
    chartOption.title.top = isDataSetEmpty ? '35%' : '82%';
    chartOption.title.textStyle.color = isDataSetEmpty ? theme.color_dial_text : theme.color_pie_item;
    chartOption.legend.data = legends;
    chartOption.legend.selected = chartOptionInstance.legend[0].selected;
    chartOption.legend.formatter = name => {
      return name + ' (' + graphData[name] + ')';
    };
    chartOption.series[0].data = this.getSeriesData(theme, legends, graphData);
    return chartOption;
  }

  getSeriesData(theme, legends, graphData) {
    const seriesData = [];
    const graphColors = [theme.color_pie1, theme.color_pie2, theme.color_pie3, theme.color_pie4];
    for (let i = 0; i < legends.length; i++) {
      const data = {
        name: legends[i],
        value: graphData[legends[i]],
        itemStyle: {
          color: graphColors[i]
        }
      };
      seriesData.push(data);
    }
    return seriesData;
  }

  changePieChartTheme(chartOption, theme) {
    chartOption.backgroundColor = theme.color_bg;
    chartOption.title.textStyle.color = theme.color_dial_text;
    chartOption.legend.textStyle.color = theme.color_graph_text;
    chartOption.series[0].data.forEach((data, index) => {
      const color = 'color_pie' + (index + 1);
      data.itemStyle.color = theme[color];
    });
    return chartOption;
  }
}
