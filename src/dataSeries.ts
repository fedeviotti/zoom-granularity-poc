export type DataSeries = {
  date: number;
  value: number;
}

const INITIAL_DATE = 1672531200000;
const INTERVAL = 86400000;
const INITIAL_VALUE = 160379978;

const dataSeries1: DataSeries[] = [];
const dataSeries2: DataSeries[] = [];

for (let i = 0; i < 130; i++) {
  dataSeries1.push({
    date: INITIAL_DATE + i * INTERVAL,
    value: INITIAL_VALUE + Math.round(Math.random() * 10000000)
  });
  dataSeries2.push({
    date: INITIAL_DATE + i * INTERVAL,
    value: INITIAL_VALUE + Math.round(Math.random() * 10000000)
  });
}
export const dataSeries: DataSeries[][] = [
  [...dataSeries1],
  [...dataSeries2]
];
