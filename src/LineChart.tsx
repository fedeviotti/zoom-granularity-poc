import React from "react";
import Chart from 'react-apexcharts';
import {DataSeries, dataSeries} from "./dataSeries.ts";
import {
  GranularityKeys,
  MAP_GRANULARITIES,
  MS_IN_ONE_MONTH,
  OPTIONS
} from "./constants.ts";
import {ApexOptions} from "apexcharts";
import {Box, Flex, Progress} from "@chakra-ui/react";


type Series = {
  name: string;
  data: number[][];
}

type DataFetchProps = {
  data: number[][];
  xMin: number;
  xMax: number;
  targetGranularity: GranularityKeys;
  index: number;
}

type GetSeriesProps = {
  data: DataSeries[];
}

type ZoomLimits = {
  min: number;
  max: number;
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
  const granularity = React.useRef<GranularityKeys>("twoDays");
  const zoomLimits = React.useRef<ZoomLimits>({min: 0, max: 0});

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

        if (zoomDiff < MS_IN_ONE_MONTH && granularity.current === "twoDays") {
          setIsFetchingData(true);

          OPTIONS.forEach(async (_option, index) => {
            beforeDataFetch(index);
            console.log("increase granularity");
            await dataFetch({
              data: getOneDayDataSeries({data: dataSeries[index]}),
              xMin,
              xMax,
              targetGranularity: "oneDay",
              index
            });
            if (OPTIONS.length - 1 === index) {
              setIsFetchingData(false);
            }
          });
        } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "oneDay") {
          setIsFetchingData(true);
          OPTIONS.forEach(async (_option, index) => {
            beforeDataFetch(index);
            console.log("decrease granularity");
            await dataFetch({
              data: getTwoDaysDataSeries({data: dataSeries[index]}),
              xMin,
              xMax,
              targetGranularity: "twoDays",
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

  const beforeResetZoom = async (index: number) => {
    setIsFetchingData(true);
    beforeDataFetch(index);
    console.log("reset granularity");
    await dataFetch({
      data: getTwoDaysDataSeries({data: dataSeries[index]}),
      xMin: 0,
      xMax: 0,
      targetGranularity: "twoDays",
      index
    });
    if (OPTIONS.length - 1 === index) {
      zoomLimits.current = { min: 0, max: 0 };
      setIsFetchingData(false);
    }
  }

  return (
    <Flex h="2xl" direction="row" gap="8">
      {
        OPTIONS.map((options, index) => (
          <Flex key={options.chart?.id} h="2xl" direction="column" gap="8" justify="end">
            {isFetchingData ?
              <Progress size='xs' isIndeterminate w={800} /> :
              <Box>Current Granularity: {Object.entries(MAP_GRANULARITIES).find(([key]) => key === granularity.current)?.[1]}</Box>
            }
            <Chart
              options={{...options, chart: { ...options.chart, events: { beforeZoom, beforeResetZoom: () => beforeResetZoom(index) } }}}
              series={series[index] || []} type="area" width={800}
            />
          </Flex>
        ))
      }
    </Flex>
  );
}
