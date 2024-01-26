import React from "react";
import Chart from 'react-apexcharts';
import {DataSeries, dataSeries, dataSeries2} from "./dataSeries.ts";
import {
  MS_IN_ONE_MONTH,
  OPTIONS, OPTIONS2
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
  const [series, setSeries] = React.useState<Series[]>([]);
  const [series2, setSeries2] = React.useState<Series[]>([]);
  const [isFetchingData, setIsFetchingData] = React.useState<boolean>(false);
  const [isFetchingData2, setIsFetchingData2] = React.useState<boolean>(false);
  const granularity = React.useRef<"ONE_DAY" | "TWO_DAYS">("TWO_DAYS");
  const zoomLimits = React.useRef<{min: number, max: number}>({min: 0, max: 0});

  React.useEffect(() => {
    if (series.length > 0) {
      return;
    }

    const data = getTwoDaysDataSeries({data: dataSeries});
    setSeries([{ data, name: "NHOA" }]);
  }, [series]);

  React.useEffect(() => {
    if (series2.length > 0) {
      return;
    }

    const data = getTwoDaysDataSeries({data: dataSeries2});
    setSeries2([{ data, name: "NHOA 2" }]);
  }, [series2]);

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

  const beforeDataFetch2 = () => {
    setIsFetchingData2(true);
    ApexCharts.exec('zoom-chart-2', 'updateOptions',
      {
        chart: {
          zoom: { enabled: false },
          toolbar: { show: false }
        }
      });
  }

  const dataFetch2 = ({data, xMin, xMax, targetGranularity}: DataFetchProps) => {
    ApexCharts.exec('zoom-chart-2', 'updateSeries', [{ data }]);
    if (xMin !== 0 && xMax !== 0) {
      ApexCharts.exec('zoom-chart-2', 'zoomX', xMin, xMax);
    }
    afterDataFetch2(targetGranularity);
  }

  const afterDataFetch2 = (targetGranularity: Granularity) => {
    setIsFetchingData2(false);
    ApexCharts.exec('zoom-chart-2', 'updateOptions',
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
          dataFetch({data: getOneDayDataSeries({data: dataSeries}), xMin, xMax, targetGranularity: "ONE_DAY"});
        }, 1500);
      } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "ONE_DAY") {
        beforeDataFetch();
        setTimeout(() => {
          console.log("decrease granularity");
          dataFetch({data: getTwoDaysDataSeries({data: dataSeries}), xMin, xMax, targetGranularity: "TWO_DAYS"});
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
      dataFetch({data: getTwoDaysDataSeries({data: dataSeries}), xMin: 0, xMax: 0, targetGranularity: "TWO_DAYS"});
    }, 1500);
  }

  const beforeZoom2 = (_chartContext: never, options: ApexOptions) => {
    const xMin = options?.xaxis?.min || 0;
    const xMax = options?.xaxis?.max || 0;
    const zoomDiff = xMax - xMin;

    if (zoomLimits.current.min !== xMin && zoomLimits.current.max !== xMax) {
      zoomLimits.current = { min: xMin, max: xMax };

      if (zoomDiff < MS_IN_ONE_MONTH && granularity.current === "TWO_DAYS") {
        beforeDataFetch2()
        setTimeout(() => {
          console.log("increase granularity");
          dataFetch2({data: getOneDayDataSeries({data: dataSeries2}), xMin, xMax, targetGranularity: "ONE_DAY"});
        }, 1500);
      } else if (zoomDiff > MS_IN_ONE_MONTH && granularity.current === "ONE_DAY") {
        beforeDataFetch2();
        setTimeout(() => {
          console.log("decrease granularity");
          dataFetch2({data: getTwoDaysDataSeries({data: dataSeries2}), xMin, xMax, targetGranularity: "TWO_DAYS"});
        }, 1500);
      }
    } else {
      zoomLimits.current = { min: 0, max: 0 };
    }
  }

  const beforeResetZoom2 = () => {
    beforeDataFetch2();
    setTimeout(() => {
      console.log("reset granularity");
      dataFetch2({data: getTwoDaysDataSeries({data: dataSeries2}), xMin: 0, xMax: 0, targetGranularity: "TWO_DAYS"});
    }, 1500);
  }

  return (
    <Flex h="2xl" direction="row" gap="8">
      <Flex h="2xl" direction="column" gap="8" justify="end">
        {isFetchingData && <Progress size='xs' isIndeterminate w={800} />}
        <Chart
          options={{...OPTIONS, chart: { ...OPTIONS.chart, events: { beforeZoom, beforeResetZoom } }}}
          series={series} type="area" width={800}
        />
      </Flex>
      <Flex h="2xl" direction="column" gap="8" justify="end">
        {isFetchingData2 && <Progress size='xs' isIndeterminate w={800} />}
        <Chart
          options={{...OPTIONS2, chart: { ...OPTIONS2.chart, events: { beforeZoom: beforeZoom2, beforeResetZoom: beforeResetZoom2 } }}}
          series={series} type="area" width={800}
        />
      </Flex>
    </Flex>
  );
}
