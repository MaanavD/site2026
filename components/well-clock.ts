// the stepwell keeps the visitor's clock and calendar
// scene: 0 night, 1 dawn, 2 day, 3 dusk · season: 0 winter, 1 spring, 2 summer, 3 autumn
export function sceneFromHour(hour: number) {
  if (hour >= 5 && hour < 10) return 1;
  if (hour >= 10 && hour < 17) return 2;
  if (hour >= 17 && hour < 21) return 3;
  return 0;
}

export function seasonFromMonth(month: number) {
  if (month >= 2 && month <= 4) return 1;
  if (month >= 5 && month <= 7) return 2;
  if (month >= 8 && month <= 10) return 3;
  return 0;
}

// the diyas only burn once the light goes
const SCENES = ["night, lamps lit", "dawn", "midday", "dusk, lamps lit"];
const SEASONS = [
  "kite season",
  "jasmine season",
  "monsoon",
  "marigold season",
];

export function describeWell(date: Date) {
  return `${SCENES[sceneFromHour(date.getHours())]} at the stepwell · ${
    SEASONS[seasonFromMonth(date.getMonth())]
  }`;
}
