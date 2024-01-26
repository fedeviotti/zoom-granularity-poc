import {ApexOptions} from "apexcharts";

export const MS_IN_ONE_MONTH = 2592000000;

export const OPTIONS: ApexOptions = {
  chart: {
    id: "zoom-chart",
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
};

export const OPTIONS2: ApexOptions = {
  chart: {
    id: "zoom-chart-2",
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
};
