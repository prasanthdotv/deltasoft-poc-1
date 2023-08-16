export class ChartOptions {
  chartOptionConstants = {
    title: {
      text: 'No data',
      left: 'center',
      top: '35%'
    },
    legend: {
      icon: 'roundRect',
      itemHeight: 4,
      top: '76%',
      padding: 1,
      left: 'left',
      orient: 'horizontal',
      align: 'auto',
      itemWidth: 13,
      itemGap: 11
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      enterable: true,
      confine: true,
      textStyle: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'lighter',
        fontFamily: 'Roboto'
      },
      padding: 5,
      extraCssText: 'max-width: 300px;max-height:150px;overflow-x:scroll;overflow-y:scroll;scrollbar-width: thin'
    },
    grid: {
      top: '2%',
      containLabel: true,
      bottom: '25%'
    },
    categroyAxisLabel: {
      fontSize: 11,
      interval: 0,
      position: 'bottom',
      align: 'right',
      verticalAlign: 'middle',
      rotate: 50,
      fontFamily: 'Roboto'
    }
  };
}
