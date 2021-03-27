import React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ApiPoolCoin } from 'src/types/PoolCoin.types';
import { fetchApi } from 'src/utils/fetchApi';
import { Card } from 'src/components/layout/Card';
import { ChartTitle } from 'src/components/Typo/ChartTitle';
import { useAsyncState } from 'src/hooks/useAsyncState';

type ChartData = {
  fee: number;
  timestamp: number;
  value: number;
}[];

const PaymentsChart: React.FC<{ address: string; coin?: ApiPoolCoin }> = ({
  coin,
  address,
}) => {
  const paymentsChartRef = React.useRef<HTMLDivElement>(null);
  const asyncState = useAsyncState<
    {
      fee: number;
      date: Date;
      value: number;
    }[]
  >();

  React.useEffect(() => {
    let paymentsChart: am4charts.XYChart | null = null;
    if (coin && asyncState.data) {
      paymentsChart = am4core.create('payments-chart', am4charts.XYChart);
      paymentsChart.colors.list = [
        am4core.color('#0069ff'),
        am4core.color('#edb431'),
      ];

      var paymentsAxis = paymentsChart.yAxes.push(new am4charts.ValueAxis());
      paymentsAxis.numberFormatter = new am4core.NumberFormatter();
      paymentsAxis.renderer.grid.template.disabled = true;
      let dateAxis = paymentsChart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.baseInterval = {
        timeUnit: 'day',
        count: 1,
      };

      let paymentSeries = paymentsChart.series.push(
        new am4charts.ColumnSeries()
      );

      paymentSeries.dataFields.dateX = 'date';
      paymentSeries.name = 'Value (' + coin.ticker.toUpperCase() + ')';
      paymentSeries.yAxis = paymentsAxis;
      paymentSeries.dataFields.valueY = 'value';
      paymentSeries.tooltipText = `{name}: {valueY.value.formatNumber("#.0000")}`;
      paymentSeries.strokeWidth = 3;
      paymentSeries.stacked = true;

      let feeSeries = paymentsChart.series.push(new am4charts.ColumnSeries());

      feeSeries.dataFields.dateX = 'date';
      feeSeries.name = 'Fee (' + coin.ticker.toUpperCase() + ')';
      feeSeries.yAxis = paymentsAxis;
      feeSeries.dataFields.valueY = 'fee';
      feeSeries.tooltipText = `{name}: {valueY.value.formatNumber("#.0000")}`;
      feeSeries.strokeWidth = 3;
      feeSeries.stacked = true;

      paymentsChart.cursor = new am4charts.XYCursor();
      paymentsChart.legend = new am4charts.Legend();
      paymentsChart.data = asyncState.data.reverse();
      // @ts-ignore
      paymentsChartRef.current = paymentsChart;
    }

    return () => {
      if (paymentsChart && paymentsChart.dispose) {
        paymentsChart.dispose();
      }
    };
  }, [coin, asyncState.data]);

  React.useEffect(() => {
    if (coin) {
      asyncState.start(
        fetchApi<ChartData>('/miner/paymentsChart', {
          query: {
            address: address,
            coin: coin.ticker,
          },
        }).then((resp) => {
          return resp.map((item) => ({
            date: new Date(item.timestamp * 1000),
            value: item.value / Math.pow(10, coin.decimalPlaces),
            fee: item.fee / Math.pow(10, coin.decimalPlaces),
          }));
        })
      );
    }
  }, [coin, address]);

  return (
    <>
      <Card padding>
        <ChartTitle>Payments This Year</ChartTitle>
        <div
          ref={paymentsChartRef}
          id="payments-chart"
          style={{ width: '100%', height: '250px' }}
        />
      </Card>
    </>
  );
};

export default PaymentsChart;