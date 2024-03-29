import {ApexOptions} from "apexcharts";

export const MS_IN_ONE_MONTH = 2592000000;

export type GranularityLabels = "One day" | "Two days";
export type GranularityKeys = "oneDay" | "twoDays";
export const MAP_GRANULARITIES: Record<GranularityKeys, GranularityLabels> = {
  oneDay: "One day",
  twoDays: "Two days",
}

export const OPTIONS: ApexOptions[] = [{
  chart: {
    id: "zoom-chart-0",
    group: "nhoa-chart-group",
    animations: {
      enabled: false
    },
    type: "area",
    stacked: false,
    zoom: {
      type: "x",
      enabled: true,
      autoScaleYaxis: true,
    },
    toolbar: {
      autoSelected: "zoom"
    },
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 0
  },
  title: {
    text: "Stock Price Movement",
    align: "left"
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0,
      stops: [0, 90, 100]
    }
  },
  yaxis: {
    labels: {
      minWidth: 40,
      formatter: function (val: number) {
        return (val / 1000000).toFixed(0);
      }
    },
    title: {
      text: "Price"
    }
  },
  xaxis: {
    type: "datetime"
  },
  tooltip: {
    shared: false,
    y: {
      formatter: function (val: number) {
        return (val / 1000000).toFixed(0);
      }
    }
  },
},
  {
    chart: {
      id: "zoom-chart-1",
      group: "nhoa-chart-group",
      animations: {
        enabled: false
      },
      type: "area",
      stacked: false,
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: "zoom"
      },
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0
    },
    title: {
      text: "Stock Price Movement",
      align: "left"
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    yaxis: {
      labels: {
        minWidth: 40,
        formatter: function (val: number) {
          return (val / 1000000).toFixed(0);
        }
      },
      title: {
        text: "Price"
      }
    },
    xaxis: {
      type: "datetime"
    },
    tooltip: {
      shared: false,
      y: {
        formatter: function (val: number) {
          return (val / 1000000).toFixed(0);
        }
      }
    },
  }];
