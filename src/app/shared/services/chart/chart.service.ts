import { ChartOptions } from '@app/shared/config/chart-options';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import * as moment from 'moment';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { NbThemeService } from '@nebular/theme';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { FilterService } from '@app/shared/services/filter/filter.service';

@Injectable()
export class ChartService extends ChartOptions {
  constants: any;
  constructor(
    private appConfig: AppConfigService,
    private dataUpdateService: DataUpdateService,
    private themeService: NbThemeService,
    private customTheme: CustomThemeService,
    private dashboardService: DashBoardService,
    private filterService: FilterService,
    private spinner: NgxSpinnerService
  ) {
    super();
    this.constants = this.appConfig.getConstants();
  }

  initThemeOptions() {
    let chartTheme;
    let theme = this.themeService.currentTheme;
    if (theme) {
      chartTheme = theme === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
    } else {
      chartTheme =
        this.constants.defaultTheme === this.constants.darkTheme
          ? this.customTheme.ICXDarkThemeValues
          : this.customTheme.ICXLightThemeValues;
    }
    return chartTheme;
  }

  getGraphColors(theme) {
    const graphColors = {
      good_box_data: theme.color_normal_box,
      bad_box_data: theme.color_anomaly_box,
      goodBoxCount: theme.color_normal_box,
      badBoxCount: theme.color_anomaly_box,
      warning_box_data: theme.color_warning_box,
      data: theme.color_normal_box,
      attempts: theme.color_normal_box,
      failure: theme.color_anomaly_box,
      paramColors: theme.parameter_colors
    };
    return graphColors;
  }

  storeTestData(inputId, last15MinData) {
    const inputField = document.getElementById(inputId);
    if (inputField) {
      inputField.setAttribute('value', JSON.stringify(last15MinData) || null);
    }
  }

  formatPieChartTooltip(params) {
    let toolTipData = '';
    const { color, percent, name, value } = params;
    toolTipData = this.createHTMLBullet(color) + name + ': ' + value + ' (' + percent + '%)';
    return toolTipData;
  }

  processChartData(chartData, deviceTimeZone?) {
    if (chartData && chartData.length > 0) {
      let keys = Object.keys(chartData[0]);
      keys = keys.filter(item => item !== 'date_time');
      const processedData: any = {};
      for (const dataType of keys) {
        const dataContent = [];
        chartData.forEach(boxData => {
          if (boxData[dataType] != null) {
            const dataSlot = [];
            if (!deviceTimeZone) {
              dataSlot.push(
                moment
                  .utc(boxData['date_time'])
                  .local()
                  .format('YYYY-MM-DD HH:mm')
              );
            } else {
              dataSlot.push(moment.utc(boxData['date_time']).format('YYYY-MM-DD HH:mm'));
            }
            dataSlot.push(boxData[dataType]);
            dataContent.push(dataSlot);
          }
        });
        processedData[dataType] = dataContent;
      }
      return processedData;
    } else {
      return {};
    }
  }

  processMetricChartData(chartData) {
    if (chartData) {
      const keys = Object.keys(chartData);
      const processedData: any = {};
      if (keys && keys.length) {
        for (const dataType of keys) {
          const dataContent = [];
          chartData[dataType].forEach(boxData => {
            if (boxData.date_time) {
              const dataSlot = [];
              dataSlot.push(
                moment
                  .utc(boxData['date_time'])
                  .local()
                  .format('YYYY-MM-DD HH:mm')
              );
              boxData.value ? dataSlot.push(Number(boxData.value).toFixed(2)) : dataSlot.push(0);
              dataContent.push(dataSlot);
            }
          });
          processedData[dataType] = dataContent;
        }
      }
      return processedData;
    } else {
      return {};
    }
  }

  isDataSetEmpty(graphData) {
    let isDataSetEmpty = true;
    for (const dataType in graphData) {
      if (graphData[dataType].length > 0) {
        isDataSetEmpty = false;
      }
    }
    return isDataSetEmpty;
  }

  hideTooltip(point, params, dom: HTMLElement) {
    const hideDom = () => {
      dom.style.display = 'none';
      dom.removeEventListener('mouseleave', hideDom);
    };
    dom.addEventListener('mouseleave', hideDom);
  }

  formatCategoryXAxis(value, index) {
    if (value.length > 10) {
      let labelText = value.slice(0, 10) + '...';
      return labelText;
    } else {
      return value;
    }
  }

  initChartOption(theme, graphData, timeRange, chartType, chartConfig) {
    const isDataSetEmpty = this.isDataSetEmpty(graphData);
    const legends = chartConfig.legends ? chartConfig.legends : Object.keys(graphData);
    const yAxisUnit = chartConfig.unit ? chartConfig.unit : '';
    const seriesData = this.generateSeriesData(chartType, legends, graphData, theme);
    const isYAxisNameNeeded = Boolean(chartConfig.yAxisName);
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
        formatter: params => this.toolTipFormatter(params, yAxisUnit),
        position: (point, params, dom: HTMLElement) => {
          this.hideTooltip(point, params, dom);
        },
        ...this.chartOptionConstants.tooltip
      },
      legend: {
        show: !isDataSetEmpty,
        type: chartConfig.isMetricWiseChart ? 'scroll' : 'plain',
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
        splitNumber: 4,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: theme.color_graph_text,
          fontSize: 11,
          formatter: value => {
            return this.xAxisLabelFormatter(value, timeRange, chartOption.dataZoom[0]);
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
        minInterval: 1,
        max: yAxisUnit === '%' ? 100 : null,
        axisLabel: {
          fontSize: 11,
          color: theme.color_graph_text,
          formatter: value => this.yAxisLabelFormatter(yAxisUnit, value),
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
          start: 0,
          end: 100,
          bottom: '0.5%',
          left: '14.5%',
          right: '16.5%',
          textStyle: {
            color: theme.color_graph_text,
            fontSize: 12,
            fontFamily: 'Roboto'
          },
          labelFormatter: (value) => {
            let formattedLabel = this.formatZoomRange(value)
            return formattedLabel;
          },
        }
      ],
      series: seriesData
    };
    if (chartConfig.type === 'stacked' && chartConfig.barType !== 'multi-bar') {
      chartOption.yAxis.max = 100;
    }
    return chartOption;
  }

  formatZoomRange(value) {
    let formattedLabel;
    const zoomTime = new Date(value);
    let mins = zoomTime.getMinutes();
    let zoomMins = mins < 10 ? `0${mins}` : mins;
    let hrs = zoomTime.getHours();
    let zoomHrs = hrs < 10 ? `0${hrs}` : hrs;
    let months = zoomTime.getMonth() + 1;
    let zoomedMonths = months < 10 ? `0${months}` : months;
    let date = zoomTime.getDate();
    let zoomedDate = date < 10 ? `0${date}` : date;
    formattedLabel = `${zoomHrs}:${zoomMins}\n${zoomedMonths}-${zoomedDate}`;
    return formattedLabel;
  }

  createHTMLBullet(color) {
    return '<span class="bullet" style="background-color:' + color + '"></span>';
  }
  yAxisLabelFormatter(yAxisUnit, value) {
    if (yAxisUnit) {
      if (this.constants.processableUnits.includes(yAxisUnit)) {
        const axisValue = this.getYAxisValue(yAxisUnit, value);
        return axisValue;
      } else {
        return value + yAxisUnit;
      }
    } else {
      return value;
    }
  }
  toolTipFormatter(params, yAxisUnit) {
    const precision = this.constants.toolTipPrecision;
    const seriesNames = [];
    const plottedDatas = [];
    const legendColors = [];
    let toolTipData = '';
    const timeSlot = params[0].data[0];
    params.forEach(data => {
      let axisData = data.value[1];
      if (yAxisUnit) {
        if (this.constants.processableUnits.includes(yAxisUnit)) {
          axisData = this.getToolTipValue(yAxisUnit, Number(axisData));
        } else {
          axisData = Number(data.value[1]).toFixed(precision) + yAxisUnit;
        }
      }
      seriesNames.push(data.seriesName);
      plottedDatas.push(axisData);
      legendColors.push(data.color);
    });
    for (let i = 0; i < seriesNames.length; i++) {
      toolTipData = toolTipData + '<br>' + this.createHTMLBullet(legendColors[i]) + seriesNames[i] + ': ' + plottedDatas[i];
    }

    return timeSlot + toolTipData;
  }

  getYAxisValue(unit, value) {
    const precision = this.constants.yAxisPrecision;
    const yAxisValue = this.getValueWithUnit(unit, value, precision);
    return yAxisValue;
  }

  getToolTipValue(unit, value) {
    const precision = unit == 'count' ? '0' : this.constants.toolTipPrecision;
    const toolTipValue = this.getValueWithUnit(unit, value.toFixed(precision), precision);
    return toolTipValue;
  }

  getValueWithUnit(unit, value, precision) {
    let valueWithUnit: string;
    switch (unit) {
      case 'count':
        valueWithUnit = value;
        break;
      case 'ms':
        valueWithUnit = this.convertMilliSeconds(value, precision);
        break;
      case 'seconds':
        valueWithUnit = this.convertSeconds(value, precision);
        break;
      case 'min':
        valueWithUnit = this.convertMinutes(value, precision);
        break;
      case 'short':
        if (value >= 1000) {
          const count = Number.isInteger(value / 1000) ? value / 1000 : (value / 1000).toFixed(precision);
          valueWithUnit = count + ' K';
        } else {
          valueWithUnit = value;
        }
        break;
      case 'default':
        break;
    }
    return valueWithUnit;
  }

  convertMilliSeconds(valueInms, precision) {
    if (valueInms === 0) {
      return valueInms + ' ms';
    } else if (valueInms >= 1000) {
      return this.convertSeconds((valueInms / 1000).toFixed(precision), precision);
    } else {
      return valueInms + ' ms';
    }
  }

  convertSeconds(valueInSeconds, precision) {
    if (valueInSeconds === 0) {
      return valueInSeconds + ' s';
    } else if (Math.abs(valueInSeconds) >= 60) {
      return this.convertMinutes((valueInSeconds / 60).toFixed(precision), precision);
    } else {
      return valueInSeconds + ' s';
    }
  }

  convertMinutes(valueInMinutes, precision) {
    if (valueInMinutes === 0) {
      return valueInMinutes + ' min';
    } else if (Math.abs(valueInMinutes) >= 1440) {
      const timeInDay = (valueInMinutes / 1440).toFixed(precision);
      return timeInDay + ' day';
    } else if (Math.abs(valueInMinutes) >= 60) {
      const timeInHr = (valueInMinutes / 60).toFixed(precision);
      return timeInHr + ' hr';
    } else {
      return valueInMinutes + ' min';
    }
  }

  xAxisLabelFormatter(value, timeRange, dataZoom) {
    const axisMinDate = new Date(timeRange.minTime);
    const axisMaxDate = new Date(timeRange.maxTime);
    const totalTimeInSeconds = axisMaxDate.getTime() - axisMinDate.getTime();
    const selectedRangeInPercentage = dataZoom.end - dataZoom.start;
    const selectedTimeInSeconds = (totalTimeInSeconds * selectedRangeInPercentage) / 100;
    const selectedVal = new Date(value);
    const time = [('0' + selectedVal.getHours()).slice(-2), ('0' + selectedVal.getMinutes()).slice(-2)];
    let dates;
    if (axisMinDate.getFullYear() === axisMaxDate.getFullYear()) {
      dates = [selectedVal.getMonth() + 1, selectedVal.getDate()];
    } else {
      dates = [selectedVal.getFullYear(), selectedVal.getMonth() + 1, selectedVal.getDate()];
    }

    if (totalTimeInSeconds / 1000 <= 24 * 60 * 60) {
      return time.join(':');
    } else {
      if (selectedTimeInSeconds / 1000 <= 2 * 24 * 60 * 60) {
        const fullDate = dates.join('/') + ' ' + time.join(':');
        return fullDate.replace(' ', '\n');
      } else if (selectedTimeInSeconds / 1000 > 2 * 24 * 60 * 60) {
        return dates.join('/');
      }
    }
  }

  generateSeriesData(chartType, legends, graphData, theme) {
    const dataTypes = Object.keys(graphData);
    const graphColors = this.getGraphColors(theme);
    const seriesData = [];
    let type;
    let stack;
    let barMaxWidth;
    let symbol;
    let smooth = true;
    switch (chartType) {
      case 'stacked-bar':
        type = 'bar';
        stack = 'bar-graph';
        barMaxWidth = '20%';
        break;
      case 'multi-bar':
        type = 'bar';
        barMaxWidth = '15%';
        break;
      case 'multi-line':
        type = 'line';
        smooth = false;
        symbol = 'circle';
        break;
      default:
        break;
    }

    for (let i = 0; i < legends.length; i++) {
      const data = {
        id: dataTypes[i],
        name: legends[i],
        data: graphData[dataTypes[i]],
        itemStyle: {
          color: graphColors[dataTypes[i]] ? graphColors[dataTypes[i]] : graphColors.paramColors[i]
        },
        type
      };
      if (stack) {
        data['stack'] = stack;
      }
      if (barMaxWidth) {
        data['barMaxWidth'] = barMaxWidth;
      }
      if (smooth) {
        data['smooth'] = smooth;
      }
      if (symbol) {
        data['symbol'] = symbol;
      }
      seriesData.push(data);
    }
    return seriesData;
  }

  changeChartTheme(chartOption, theme) {
    const graphColors = this.getGraphColors(theme);
    chartOption.series.forEach((dataSeries, index) => {
      const dataType = dataSeries.id;
      if (dataType) {
        dataSeries.itemStyle.color = graphColors[dataType] ? graphColors[dataType] : graphColors.paramColors[index];
      }
    });
    chartOption.backgroundColor = theme.color_bg;
    chartOption.title.textStyle.color = theme.color_dial_text;
    chartOption.legend.textStyle.color = theme.color_graph_text;
    chartOption.legend.pageIconInactiveColor = theme.disable_color;
    chartOption.legend.pageIconColor = theme.enabled_color;
    chartOption.legend.pageTextStyle.color = theme.color_graph_text;
    chartOption.tooltip.backgroundColor = theme.color_tooltip_bg;
    chartOption.xAxis.axisLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.axisLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.axisLabel.color = theme.color_graph_text;
    chartOption.xAxis.axisLabel.color = theme.color_graph_text;
    chartOption.xAxis.splitLine.lineStyle.color = theme.color_grid_division;
    chartOption.yAxis.splitLine.lineStyle.color = theme.color_grid_division;
    chartOption.dataZoom[0].textStyle.color = theme.color_graph_text;
    return chartOption;
  }

  updateChartData(chartOption, graphData, timeRange, chartOptionInstance, legends, theme, chartType, zoomOption?) {
    // isDataSetEmpty will be set true only if there is no data for the entire timeSlot selected (not only Zoom interval)
    const isDataSetEmpty = zoomOption.start === 0 && zoomOption.end === 100 ? this.isDataSetEmpty(graphData) : false;
    chartOption.xAxis.min = timeRange.minTime;
    chartOption.xAxis.max = timeRange.maxTime;
    chartOption.xAxis.show = !isDataSetEmpty;
    chartOption.yAxis.show = !isDataSetEmpty;
    chartOption.tooltip.show = !isDataSetEmpty;
    chartOption.legend.show = !isDataSetEmpty;
    chartOption.legend.selected = chartOptionInstance.legend[0].selected;
    chartOption.legend.data = legends;
    chartOption.dataZoom[0].show = !isDataSetEmpty;
    if (zoomOption) {
      chartOption.dataZoom[0].start = zoomOption.start;
      chartOption.dataZoom[0].end = zoomOption.end;
    }
    chartOption.series = this.generateSeriesData(chartType, legends, graphData, theme);

    chartOption.title.show = isDataSetEmpty;
    return chartOption;
  }

  /**
   * Method to round the date to previous/next quarter
   * @param date Date to be rounded
   * @param nextQuarterFlag Previous quarter/ next quarter flag
   * @return Date in UTC(Date format: YYYY-MM-DD HH:MM:SS) rounded to quarter
   */
  roundToQuarter(date, nextQuarterFlag) {
    if (nextQuarterFlag) {
      date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15);
    } else {
      date.setMinutes(Math.floor(date.getMinutes() / 15) * 15);
    }
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.toISOString();
  }

  /**
   * Method to round the date to previous/next hour
   * @param date Date to be rounded
   * @param nextHourFlag Previous hour/ next hour flag
   * @return Date in UTC(Date format: YYYY-MM-DD HH:MM:SS) rounded to hour
   */
  roundToHour(date, nextHourFlag) {
    if (nextHourFlag) {
      date.setMinutes(60);
    } else {
      date.setMinutes(0);
    }
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.toISOString();
  }

  getZoomDataOptions(event, echartsInstance, timeSlot, highestZoomLevel, isGraphIntervalNeeded?) {
    const dataZoomOption =
      !echartsInstance || this.constants.zoomInvalidEvents.includes(event)
        ? this.constants.defaultZoomOption
        : echartsInstance.getModel().option.dataZoom[0];
    let startDate;
    let endDate;
    let zoomStartTime;
    let requiredTimeRange = timeSlot;
    if (dataZoomOption.start || dataZoomOption.end !== 100) {
      const { startValue, endValue } = dataZoomOption;
      const timeRangeInHours = (endValue - startValue) / 3600000;
      const currentZoomLevel = this.getZoomRangeLevel(startValue, timeRangeInHours);
      const zoomData = this.getZoomTimeRange(currentZoomLevel, highestZoomLevel, startValue, endValue, timeSlot);
      endDate = zoomData.zoomIntervalEndTime;
      requiredTimeRange = zoomData.requiredTimeSlot;
      startDate = zoomData.zoomIntervalStartTime;
    } else if (this.dataUpdateService.selectedDateRange) {
      const dates = this.dataUpdateService.selectedDates;
      startDate = dates[0];
      endDate = dates[1];
    }
    return {
      dataZoomOption,
      requiredTimeRange,
      startDate,
      endDate,
      zoomStartTime
    };
  }

  /**
   * Method to get zoom level based on time interval
   * @param interval Time interval in hours
   */
  getZoomLevel(interval) {
    let startDate;
    if (this.dataUpdateService.selectedDates) {
      let customStartDate = this.dataUpdateService.selectedDates[0];
      startDate = new Date(customStartDate).getTime();
    } else {
      startDate = new Date();
      startDate.setHours(startDate.getHours() - interval);
      startDate = startDate.getTime();
    }
    const zoomLevel = this.getZoomRangeLevel(startDate, interval);
    return zoomLevel;
  }

  /**
   * Method to get zoom level based on zoom start time
   * and time interval
   * @param startValue The zoom start value
   * @param interval Time interval in hours
   */
  getZoomRangeLevel(startValue, interval) {
    let currentZoomLevel;
    const lastTwoDaysStartTime = this.dataUpdateService.lastTwoDaysStartTime;
    let isWithInLastTwoDays = startValue >= lastTwoDaysStartTime.getTime();
    const { aggregationLevels } = this.constants;
    if (isWithInLastTwoDays) {
      if (interval <= aggregationLevels[0]) {
        currentZoomLevel = 0;
      } else {
        currentZoomLevel = 1;
      }
    } else {
      currentZoomLevel = 2;
    }
    return currentZoomLevel;
  }

  /**
   * Get the zoom interval start time, end time and time slot
   * @param currentZoomLevel Current zoom level
   * @param highestZoomLevel Highest zoom level available in the given chart
   * @param startValue Start value in ms
   * @param endValue End value in ms
   * @param timeSlot Selected time slot
   */
  getZoomTimeRange(currentZoomLevel, highestZoomLevel, startValue, endValue, requiredTimeSlot) {
    let zoomIntervalStartTime;
    let zoomIntervalEndTime;
    const { zoomLevel } = this.constants;
    if (currentZoomLevel === highestZoomLevel && this.dataUpdateService.selectedDateRange) {
      const dates = this.dataUpdateService.selectedDates;
      zoomIntervalStartTime = dates[0];
      zoomIntervalEndTime = dates[1];
    } else if (currentZoomLevel === highestZoomLevel) {
      zoomIntervalStartTime = null;
      zoomIntervalEndTime = null;
    } else if (currentZoomLevel === 0) {
      requiredTimeSlot = zoomLevel['0'].maxInterval;
      zoomIntervalStartTime = new Date(startValue).toISOString();
      zoomIntervalEndTime = new Date(endValue).toISOString();
    } else if (currentZoomLevel === 1) {
      requiredTimeSlot = zoomLevel['1'].maxInterval;
    }
    return { zoomIntervalStartTime, zoomIntervalEndTime, requiredTimeSlot };
  }

  /**
   * Listen to the zoom events and update the data based on zoom level
   * @param component Component to be updated
   */
  listenZoomEvent(component) {
    const { echartsInstance } = component;
    let that = this;
    let dataRenderFinishFlag = true;
    let previousZoomLevel;
    let previousTimeRange;
    let previousTimeRangeInMs;
    let isPrevRangeInLastTwoDays;
    let isScrollEvent = false;
    const zoomStartInterval = this.constants.zoomLevel['0'].maxInterval;
    let fetchZoomedData = null;
    echartsInstance.on('datazoom', async function () {
      const lastTwoDaysStartTime = that.dataUpdateService.lastTwoDaysStartTime;
      const { timeSlot, highestZoomLevel } = component;
      if (timeSlot > zoomStartInterval && dataRenderFinishFlag) {
        const dataZoomOption = echartsInstance.getModel().option.dataZoom[0];
        const { startValue, endValue, start, end } = dataZoomOption;
        // 1hour = 3600000 ms
        const timeRangeInHours = (endValue - startValue) / 3600000;
        let isWithInLastTwoDays = startValue >= lastTwoDaysStartTime.getTime();
        let currentZoomLevel = that.getZoomRangeLevel(startValue, timeRangeInHours);
        previousZoomLevel = previousZoomLevel !== undefined ? previousZoomLevel : currentZoomLevel;
        isPrevRangeInLastTwoDays = isPrevRangeInLastTwoDays !== undefined ? isPrevRangeInLastTwoDays : isWithInLastTwoDays;
        const zoomInFlag = previousTimeRange > timeRangeInHours;
        let { zoomDelayTime } = that.constants;
        // Checking for scroll event
        let timeRangeInMs = endValue - startValue;
        isScrollEvent = previousTimeRangeInMs ? previousTimeRangeInMs === timeRangeInMs : false;
        previousTimeRange = timeRangeInHours;
        previousTimeRangeInMs = timeRangeInMs;
        if (
          // Checking for zoom in event within last 2 days and the zoom level is changed
          (zoomInFlag && previousZoomLevel !== currentZoomLevel && isWithInLastTwoDays) ||
          // Checking for zoom out event within last 2 days and the zoom level is changed
          (!zoomInFlag &&
            ((isWithInLastTwoDays && previousZoomLevel !== currentZoomLevel && !isScrollEvent) ||
              // Checking for zoom out of last 2 days and the zoom level is changed
              (!zoomInFlag &&
                !isWithInLastTwoDays &&
                previousZoomLevel !== currentZoomLevel &&
                isPrevRangeInLastTwoDays &&
                !isScrollEvent))) ||
          /*Checking for zoom out event within last 2 days,
          current zool level is in 15 mins range and the highest time range
          selected in graph is either in hour or day range */
          (!zoomInFlag && isWithInLastTwoDays && currentZoomLevel === 0 && highestZoomLevel > currentZoomLevel && !isScrollEvent) ||
          // Checking forscroll event and is scrolled out to a higher range
          (isScrollEvent && highestZoomLevel > currentZoomLevel && !zoomInFlag) ||
          (isScrollEvent && highestZoomLevel > currentZoomLevel && !zoomInFlag) ||
          /*Checking for scroll event, the time range selected is in day range,
          zoom level is just scrolled out of last 2 days */
          (isScrollEvent &&
            currentZoomLevel === 2 &&
            currentZoomLevel === highestZoomLevel &&
            !isWithInLastTwoDays &&
            isPrevRangeInLastTwoDays &&
            !zoomInFlag)
        ) {
          if (fetchZoomedData) {
            clearTimeout(fetchZoomedData);
            fetchZoomedData = null;
          }
          fetchZoomedData = setTimeout(async () => {
            const { zoomIntervalStartTime, zoomIntervalEndTime, requiredTimeSlot } = that.getZoomTimeRange(
              currentZoomLevel,
              highestZoomLevel,
              startValue,
              endValue,
              timeSlot
            );
            dataRenderFinishFlag = false;
            await that.updateZoomData(component, requiredTimeSlot, zoomIntervalStartTime, zoomIntervalEndTime, start, end);
            previousZoomLevel = currentZoomLevel;
            isPrevRangeInLastTwoDays = isWithInLastTwoDays;
            dataRenderFinishFlag = true;
          }, zoomDelayTime);
        }
      }
    });
  }

  /**
   * Update the data based on zoom level
   * @param component Component on which data to be updated
   * @param timeSlot Time slot
   * @param dateStartTime Zoom interval start time
   * @param dateEndTime Zoom interval end time
   * @param dataZoomStart Zoom start in percentage
   * @param dataZoomEnd Zoom end in percentage
   */
  async updateZoomData(component, timeSlot, dateStartTime, dateEndTime, dataZoomStart, dataZoomEnd) {
    const { seriesData, chartOption, legends } = await component.getZoomData(component, timeSlot, dateStartTime, dateEndTime);
    chartOption.dataZoom[0].start = dataZoomStart;
    chartOption.dataZoom[0].end = dataZoomEnd;
    if (chartOption.dataset) {
      chartOption.dataset.source = seriesData;
    } else {
      chartOption.series = seriesData;
    }
    if (legends) {
      chartOption.legend.data = legends;
    }
    component.echartsInstance.clear();
    component.echartsInstance.setOption(chartOption);
  }

  /**
   * Downloads chart data in csv format
   * @param csvEndpoint url endpoint to download the chart data
   * @param parameter chart parameter data
   */
  async downloadCsv(csvEndpoint, parameter?) {
    this.spinner.show();
    try {
      if (!csvEndpoint) {
        return null;
      } else {
        const filterParams: any = this.filterService.getAppliedFilters();
        const fileName = filterParams.date ? `csvData-${filterParams.date}.csv` : 'csvData.csv';
        const params = parameter ? { ...filterParams, parameter } : { ...filterParams };
        const csvResponse: any = await this.dashboardService.downloadCsvData(params, csvEndpoint);
        const blob = new Blob([csvResponse.data], { type: 'text/csv' });
        FileSaver.saveAs(blob, fileName);
      }
    } catch (error) {
      this.dashboardService.logError(error);
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Downloads image when clicked on chart
   * @param instance instance of the chart
   */
  downloadChart(instance) {
    const img = new Image();
    img.src = instance.getDataURL({
      pixelRatio: 1
    });
    FileSaver.saveAs(img.src, 'image.png');
  }
}
