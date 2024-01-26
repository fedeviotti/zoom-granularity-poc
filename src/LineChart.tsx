import React from "react";
import Chart from 'react-apexcharts';
import {DataSeries, dataSeries} from "./dataSeries.ts";
import {
  MS_IN_ONE_MONTH,
  OPTIONS
} from "./constants.ts";
import {ApexOptions} from "apexcharts";
import {Flex, Progress} from "@chakra-ui/react";


type Series = {
  name: string;
  data: number[][];
}

type Granularity = "ONE_DAY" | "TWO_DAYS";

type DataFetchProps = {
  data: number[][];
  xMin: number;
  xMax: number;
  targetGranularity: Granularity;
  index: number;
}

type GetSeriesProps = {
  data: DataSeries[];
}

const getOneDayDataSeries = ({ data }: GetSeriesProps) => {
  const result = data.reduce(
    (acc: number[][], series) => [...acc, [series.date, series.value]],
    []
  );

 return result;
}

const getTwoDaysDataSeries = ({ data }: GetSeriesProps) => {
  const result = data.reduce((acc: number[][], series, currentIndex) => {
    if (currentIndex % 2 === 0) {
      return [...acc, [series.date, series.value]];
    }
    return acc;
  }, []);

  return result;
}

export const LineChart = () => {
  const [series, setSeries] = React.useState<Series[][]>([]);
  const [isFetchingData, setIsFetchingData] = React.useState<boolean>(false);
  const granularity = React.useRef<"ONE_DAY" | "TWO_DAYS">("TWO_DAYS");
  const zoomLimits = React.useRef<{min: number, max: number}>({min: 0, max: 0});

  React.useEffect(() => {
    if (series.length > 0) {
      return;
    }
    const tmpSeries: Series[][] = [];
    dataSeries.forEach((series, i) => {
      const data = getTwoDaysDataSeries({data: series});
      tmpSeries.push([{ data, name: `NHOA ${i}` }]);
    });
    setSeries(tmpSeries);
  }, [series]);

  const beforeDataFetch = (i: number) => {
    ApexCharts.exec(`zoom-chart-${i}`, 'updateOptions',
      {
        chart: {
          zoom: { enabled: false },
          toolbar: { show: false }
        }
      });
  }

  const dataFetch = async ({data, xMin, xMax, targetGranularity, index}: DataFetchProps) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        ApexCharts.exec(`zoom-chart-${index}`, 'updateSeries', [{data}]);
        if (xMin !== 0 && xMax !== 0) {
          ApexCharts.exec(`zoom-chart-${index}`, 'zoomX', xMin, xMax);
        }
        ApexCharts.exec(`zoom-chart-${index}`, 'updateOptions',
          {
            chart: {
              zoom: { enabled: true },
              toolbar: { show: true }
            }
          });
        granularity.current = targetGranularity;
        resolve();
      }, 1500);
    });
  }

  const beforeZoom = (_chartContext: never, options: ApexOptions) => {
    const xMin = options?.xaxis?.min || 0;
    const xMax = options?.xaxis?.max || 0;
    const zoomDiff = xMax - xMin;

    if (zoomLimits.current.min !== xMin && zoomLimits.current.max !== xMax) {
      zoomLimits.current = { min: xMin, max: xMax };

        if (zoomDiff < MS_IN_ONE_MONTH && granularity.current === "TWO_DAYS") {
          setIsFetchingData(true);

          OPTIONS.forEach(async (_option, index) => {
            beforeDataFetch(index);
            console.log("increase granularity");
            await dataFetch({
              data: getOneDayDataSeries({data: dataSeries[index]}),
              xMin,
              xMax,
              targetGranularity: "ONE_DAY",
              index
            });
            if (OPTIONS.length - 1 === index) {
              setIsFetchingData(false);
            }
          });
        } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "ONE_DAY") {
          setIsFetchingData(true);
          OPTIONS.forEach(async (_option, index) => {
            beforeDataFetch(index);
            console.log("decrease granularity");
            await dataFetch({
              data: getTwoDaysDataSeries({data: dataSeries[index]}),
              xMin,
              xMax,
              targetGranularity: "TWO_DAYS",
              index
            });
            if (OPTIONS.length - 1 === index) {
              setIsFetchingData(false);
            }
          });
        }

    } else {
      zoomLimits.current = { min: 0, max: 0 };
    }
  }

  const beforeResetZoom = () => {
    setIsFetchingData(true);
    OPTIONS.forEach(async (_option, index) => {
      beforeDataFetch(index);
      console.log("reset granularity");
      await dataFetch({
        data: getTwoDaysDataSeries({data: dataSeries[index]}),
        xMin: 0,
        xMax: 0,
        targetGranularity: "TWO_DAYS",
        index
      });
      if (OPTIONS.length - 1 === index) {
        setIsFetchingData(false);
      }
    });
  }

  return (
    <Flex h="2xl" direction="row" gap="8">
      {
        OPTIONS.map((options, index) => (
          <Flex key={options.chart?.id} h="2xl" direction="column" gap="8" justify="end">
            {isFetchingData && <Progress size='xs' isIndeterminate w={800} />}
            <Chart
              options={{...options, chart: { ...options.chart, events: { beforeZoom, beforeResetZoom } }}}
              series={series[index] || []} type="area" width={800}
            />
          </Flex>
        ))
      }
    </Flex>
  );
}
