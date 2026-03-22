// MockWeatherService.ts
export class MockWeatherService {
  readonly data = {
    tempMax: 24,
    tempMin: 8,
    stateSky: "Despejado",
    stateSkyCode: "11",
    rainProbability: 0,
    humidity: 65,
    windSpeed: 12,
    uvMax: 6,
    forecast: [
  { date: "2026-03-23", tempMax: 20, tempMin: 7, skyCode: "11" },
  { date: "2026-03-24", tempMax: 17, skyCode: "23", tempMin: 9 },
  { date: "2026-03-25", tempMax: 15, tempMin: 8, skyCode: "26" },
],
  };

  readonly icon = "󰖙";
  readonly error = null;
  readonly loading = false;

  onUpdate(cb: (data: typeof this.data, error: null) => void) {
    // Llama inmediatamente con los datos mock
    cb(this.data, null);
  }

  startPolling(_intervalMinutes = 30) {
    // no-op
  }

  async fetch() {
    // no-op
  }
}

export const weatherService = new MockWeatherService();