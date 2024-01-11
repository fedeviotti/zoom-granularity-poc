import React from "react";
import Chart from 'react-apexcharts';
import {dataSeries} from "./dataSeries.ts";
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

const getOneDayDataSeries = () => {
  const data = dataSeries.reduce(
    (acc: number[][], series) => [...acc, [series.date, series.value]],
    []
  );

 return data;
}

const getTwoDaysDataSeries = () => {
  const data = dataSeries.reduce((acc: number[][], series, currentIndex) => {
    if (currentIndex % 2 === 0) {
      return [...acc, [series.date, series.value]];
    }
    return acc;
  }, []);

  return data;
}

export const LineChart = () => {
  const [series, setSeries] = React.useState<Series[]>([]);
  const [isFetchingData, setIsFetchingData] = React.useState<boolean>(false);
  const granularity = React.useRef<"ONE_DAY" | "TWO_DAYS">("TWO_DAYS");
  const zoomLimits = React.useRef<{min: number, max: number}>({min: 0, max: 0});

  React.useEffect(() => {
    if (series.length > 0) {
      return;
    }

    const data = getTwoDaysDataSeries();
    setSeries([{ data, name: "NHOA" }]);
  }, [series]);

  const beforeDataFetch = () => {
    setIsFetchingData(true);
    ApexCharts.exec('zoom-chart', 'updateOptions',
      {
        chart: {
          zoom: { enabled: false },
          toolbar: { show: false }
        }
      });
  }

  const dataFetch = ({data, xMin, xMax, targetGranularity}: DataFetchProps) => {
    ApexCharts.exec('zoom-chart', 'updateSeries', [{ data }]);
    if (xMin !== 0 && xMax !== 0) {
      ApexCharts.exec('zoom-chart', 'zoomX', xMin, xMax);
    }
    afterDataFetch(targetGranularity);
  }

  const afterDataFetch = (targetGranularity: Granularity) => {
    setIsFetchingData(false);
    ApexCharts.exec('zoom-chart', 'updateOptions',
      {
        chart: {
          zoom: { enabled: true },
          toolbar: { show: true }
        }
      });
    granularity.current = targetGranularity;
  }

  const beforeZoom = (_chartContext: never, options: ApexOptions) => {
    const xMin = options?.xaxis?.min || 0;
    const xMax = options?.xaxis?.max || 0;
    const zoomDiff = xMax - xMin;

    if (zoomLimits.current.min !== xMin && zoomLimits.current.max !== xMax) {
      zoomLimits.current = { min: xMin, max: xMax };

      if (zoomDiff < MS_IN_ONE_MONTH && granularity.current === "TWO_DAYS") {
        beforeDataFetch()
        setTimeout(() => {
          console.log("increase granularity");
          dataFetch({data: getOneDayDataSeries(), xMin, xMax, targetGranularity: "ONE_DAY"});
        }, 1500);
      } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "ONE_DAY") {
        beforeDataFetch();
        setTimeout(() => {
          console.log("decrease granularity");
          dataFetch({data: getTwoDaysDataSeries(), xMin, xMax, targetGranularity: "TWO_DAYS"});
        }, 1500);
      }
    } else {
      zoomLimits.current = { min: 0, max: 0 };
    }
  }

  const beforeResetZoom = () => {
    beforeDataFetch();
    setTimeout(() => {
      console.log("reset granularity");
      dataFetch({data: getTwoDaysDataSeries(), xMin: 0, xMax: 0, targetGranularity: "TWO_DAYS"});
    }, 1500);
  }

  return (
    <Flex h="2xl" direction="column" gap="8" justify="end">
      {isFetchingData && <Progress size='xs' isIndeterminate w={800} />}
      <Chart
        options={{...OPTIONS, chart: { ...OPTIONS.chart, events: { beforeZoom, beforeResetZoom } }}}
        series={series} type="area" width={800}
      />
    </Flex>
  );
}
