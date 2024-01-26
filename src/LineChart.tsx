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

  const beforeDataFetch = () => {
    setIsFetchingData(true);
    OPTIONS.forEach((_option, i) => {
      ApexCharts.exec(`zoom-chart-${i}`, 'updateOptions',
        {
          chart: {
            zoom: { enabled: false },
            toolbar: { show: false }
          }
        });
    });
  }

  const dataFetch = ({data, xMin, xMax, targetGranularity}: DataFetchProps) => {
    OPTIONS.forEach((_option, i) => {
      ApexCharts.exec(`zoom-chart-${i}`, 'updateSeries', [{ data }]);
      if (xMin !== 0 && xMax !== 0) {
        ApexCharts.exec(`zoom-chart-${i}`, 'zoomX', xMin, xMax);
      }
    });
    afterDataFetch(targetGranularity);
  }

  const afterDataFetch = (targetGranularity: Granularity) => {
    setIsFetchingData(false);
    OPTIONS.forEach((_option, i) => {
      ApexCharts.exec(`zoom-chart-${i}`, 'updateOptions',
        {
          chart: {
            zoom: { enabled: true },
            toolbar: { show: true }
          }
        });
    });
    granularity.current = targetGranularity;
  }

  const beforeZoom = (_chartContext: never, options: ApexOptions) => {
    beforeDataFetch();
    OPTIONS.forEach((_option, i) => {
      const xMin = options?.xaxis?.min || 0;
      const xMax = options?.xaxis?.max || 0;
      const zoomDiff = xMax - xMin;

      if (zoomLimits.current.min !== xMin && zoomLimits.current.max !== xMax) {
        zoomLimits.current = { min: xMin, max: xMax };

        if (zoomDiff < MS_IN_ONE_MONTH && granularity.current === "TWO_DAYS") {
          setTimeout(() => {
            console.log("increase granularity");
            dataFetch({data: getOneDayDataSeries({data: dataSeries[i]}), xMin, xMax, targetGranularity: "ONE_DAY"});
          }, 1500);
        } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "ONE_DAY") {
          setTimeout(() => {
            console.log("decrease granularity");
            dataFetch({data: getTwoDaysDataSeries({data: dataSeries[i]}), xMin, xMax, targetGranularity: "TWO_DAYS"});
          }, 1500);
        }
      } else {
        zoomLimits.current = { min: 0, max: 0 };
      }
    });
  }

  const beforeResetZoom = () => {
    beforeDataFetch();
    OPTIONS.forEach((_option, i) => {
      setTimeout(() => {
        console.log("reset granularity");
        dataFetch({data: getTwoDaysDataSeries({data: dataSeries[i]}), xMin: 0, xMax: 0, targetGranularity: "TWO_DAYS"});
      }, 1500);
    });
  }

  return (
    <Flex h="2xl" direction="row" gap="8">
      <Flex h="2xl" direction="column" gap="8" justify="end">
        {isFetchingData && <Progress size='xs' isIndeterminate w={800} />}
        <Chart
          options={{...OPTIONS[0], chart: { ...OPTIONS[0].chart, events: { beforeZoom, beforeResetZoom } }}}
          series={series[0] || []} type="area" width={800}
        />
      </Flex>
      <Flex h="2xl" direction="column" gap="8" justify="end">
        {isFetchingData && <Progress size='xs' isIndeterminate w={800} />}
        <Chart
          options={{...OPTIONS[1], chart: { ...OPTIONS[1].chart, events: { beforeZoom, beforeResetZoom } }}}
          series={series[1] || []} type="area" width={800}
        />
      </Flex>
    </Flex>
  );
}
