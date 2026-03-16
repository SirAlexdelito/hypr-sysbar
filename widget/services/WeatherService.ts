import { GLib } from "/usr/share/astal/gjs/index";
import Soup from "gi://Soup?version=3.0";
import GObject from "gi://GObject";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeatherData {
  tempMax: number;
  tempMin: number;
  stateSky: string;  // descripción del estado del cielo
  stateSkyCode: string; // código numérico del estado
  rainProbability: number;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
// Códigos AEMET: https://www.aemet.es/es/eltiempo/prediccion/municipios/ayudas/simbolos

const skyIconMap: Record<string, string> = {
  "11": "󰖙",  // Despejado
  "12": "󰖕",  // Poco nuboso
  "13": "󰖕",  // Intervalos nubosos
  "14": "󰖔",  // Nuboso
  "15": "󰖐",  // Muy nuboso
  "16": "󰖐",  // Cubierto
  "17": "󰖐",  // Nubes altas
  "23": "󰖗",  // Intervalos nubosos con lluvia
  "24": "󰖗",  // Nuboso con lluvia
  "25": "󰖗",  // Muy nuboso con lluvia
  "26": "󰖗",  // Cubierto con lluvia
  "33": "󰖘",  // Intervalos nubosos con nieve
  "34": "󰖘",  // Nuboso con nieve
  "43": "⛈",  // Intervalos nubosos con tormenta
  "44": "⛈",  // Nuboso con tormenta
  "45": "⛈",  // Muy nuboso con tormenta
  "46": "⛈",  // Cubierto con tormenta
  "51": "󰖑",  // Niebla
  "52": "󰖑",  // Bruma
};

const getWeatherIcon = (code: string): string => {
  // Los códigos nocturnos tienen 'n' al final en AEMET (ej: "11n")
  const clean = code.replace("n", "");
  return skyIconMap[clean] ?? "󰖐";
};

// ─── HTTP helper usando Soup 3 ────────────────────────────────────────────────

const httpGet = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const session = new Soup.Session();
    const message = Soup.Message.new("GET", url);
    if (!message) {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }
    session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          const bytes = session.send_and_read_finish(result);
          const text = new TextDecoder().decode(bytes.get_data()!);
          resolve(text);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};

// ─── AemetService ─────────────────────────────────────────────────────────────

export class AemetService {
  private apiKey: string;
  private municipioId: string;
  private _data: WeatherData | null = null;
  private _error: string | null = null;
  private _loading = false;

  // Callbacks para notificar cambios
  private listeners: Array<(data: WeatherData | null, error: string | null) => void> = [];

  constructor(apiKey: string, municipioId: string) {
    this.apiKey = apiKey;
    this.municipioId = municipioId;
  }

  get data(): WeatherData | null { return this._data; }
  get error(): string | null { return this._error; }
  get loading(): boolean { return this._loading; }

  onUpdate(cb: (data: WeatherData | null, error: string | null) => void) {
    this.listeners.push(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this._data, this._error));
  }

  async fetch(): Promise<void> {
    this._loading = true;
    this._error = null;

    try {
      // Paso 1: obtener URL de datos
      const metaUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${this.municipioId}?api_key=${this.apiKey}`;
      const metaText = await httpGet(metaUrl);
      const meta = JSON.parse(metaText);

      if (meta.estado !== 200) {
        throw new Error(`AEMET error: ${meta.descripcion}`);
      }

      // Paso 2: obtener datos reales
      const dataText = await httpGet(meta.datos);
      const json = JSON.parse(dataText);

      // Parsear respuesta
      const prediccion = json[0]?.prediccion?.dia?.[0];
      if (!prediccion) throw new Error("No prediction data");
console.log("CIELO RAW:", JSON.stringify(prediccion.estadoCielo));
      const tempMax = prediccion.temperatura?.maxima ?? 0;
      const tempMin = prediccion.temperatura?.minima ?? 0;

      // Estado del cielo — coger el periodo diurno (de 0 a 24 o el primer valor)
      const cielo = prediccion.estadoCielo;
      const cieloVal = Array.isArray(cielo)
        ? (cielo.find((c: any) => c.value !== "") ?? cielo[0])
        : cielo;

      const stateSkyCode = cieloVal?.value ?? "11";
      const stateSky = cieloVal?.descripcion ?? "Despejado";

      // Probabilidad de precipitación máxima del día
      const probPrec = prediccion.probPrecipitacion ?? [];
      const rainProbability = Array.isArray(probPrec)
        ? Math.max(...probPrec.map((p: any) => parseInt(p.value) || 0))
        : 0;

      this._data = { tempMax, tempMin, stateSky, stateSkyCode, rainProbability };
      this._error = null;
    } catch (e: any) {
      this._error = e?.message ?? "Unknown error";
      this._data = null;
    } finally {
      this._loading = false;
      this.notify();
    }
  }

  // Arranca el polling automático cada N minutos
  startPolling(intervalMinutes = 30) {
    this.fetch(); // fetch inmediato
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, intervalMinutes * 60 * 1000, () => {
      this.fetch();
      return GLib.SOURCE_CONTINUE;
    });
  }

  // Devuelve el icono del estado actual
  get icon(): string {
    if (!this._data) return "󰖐";
    return getWeatherIcon(this._data.stateSkyCode);
  }
}

// ─── Instancia singleton ──────────────────────────────────────────────────────

export const weatherService = new AemetService(
GLib.getenv("AEMET_API_KEY") ?? "",
GLib.getenv("AEMET_PCCODE") ?? ""
);