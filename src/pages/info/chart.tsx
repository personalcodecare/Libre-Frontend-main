import React, { useMemo, memo } from 'react';
import { Chart as ChartComp, AxisOptions } from 'react-charts';

import { IChartData } from '../../types';
import { formatNumber } from '../../utils';

type IChartProps = {
  data?: IChartData;
};

const Chart: React.FC<IChartProps> = ({ data }) => {
  const liquidityData = useMemo(() => {
    return data
      ? [
          {
            label: 'Liquidity',
            data: data.libreDayDatas.map((d) => ({
              date: new Date(d.date * 1000),
              totalLiquidityUSD: parseInt(d.totalLiquidityUSD),
            })),
          },
        ]
      : null;
  }, [data]);

  const volumeData = useMemo(() => {
    return data
      ? [
          {
            label: 'Volume',
            data: data.libreDayDatas.map((d) => ({
              date: new Date(d.date * 1000),
              dailyVolumeUSD: parseInt(d.dailyVolumeUSD),
            })),
          },
        ]
      : null;
  }, [data]);

  const primaryAxisLiquidity = useMemo(
    (): AxisOptions<{
      date: Date;
      totalLiquidityUSD: number;
    }> => ({
      getValue: (liquidity) => liquidity.date,
    }),
    []
  );

  const secondaryAxesLiquidity = useMemo(
    (): AxisOptions<{
      date: Date;
      totalLiquidityUSD: number;
    }>[] => [
      {
        getValue: (liquidity) => liquidity.totalLiquidityUSD,
      },
    ],
    []
  );

  const primaryAxisVolume = useMemo(
    (): AxisOptions<{
      date: Date;
      dailyVolumeUSD: number;
    }> => ({
      getValue: (volume) => volume.date,
    }),
    []
  );

  const secondaryAxesVolume = useMemo(
    (): AxisOptions<{
      date: Date;
      dailyVolumeUSD: number;
    }>[] => [
      {
        getValue: (volume) => volume.dailyVolumeUSD,
      },
    ],
    []
  );

  return (
    <div className="flex justify-between mt-16">
      {liquidityData ? (
        <div
          style={{ height: '380px', width: '50%' }}
          className="text-white bg-white dark:bg-third p-5 rounded-xl"
        >
          <p className="mb-2">
            {' '}
            Liquidity{' '}
            <span className="text-primary font-bold text-xl">
              $
              {formatNumber(
                data.libreDayDatas[data.libreDayDatas.length - 1]
                  .totalLiquidityUSD,
                2
              )}{' '}
            </span>
          </p>
          <div
            style={{
              height: '300px',
            }}
          >
            <ChartComp
              options={{
                data: liquidityData,
                primaryAxis: primaryAxisLiquidity,
                secondaryAxes: secondaryAxesLiquidity,
              }}
            />
          </div>
        </div>
      ) : null}
      {liquidityData ? (
        <div
          style={{ height: '380px', width: 'calc(50% - 60px)' }}
          className="text-white bg-white dark:bg-third p-5 rounded-xl"
        >
          <p className="mb-2">
            {' '}
            Volume 24H{' '}
            <span className="text-primary font-bold text-xl">
              $
              {formatNumber(
                data.libreDayDatas[data.libreDayDatas.length - 1]
                  .dailyVolumeUSD,
                2
              )}{' '}
            </span>
          </p>
          <div
            style={{
              height: '300px',
            }}
          >
            <ChartComp
              options={{
                data: volumeData,
                primaryAxis: primaryAxisVolume,
                secondaryAxes: secondaryAxesVolume,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default memo(Chart);
