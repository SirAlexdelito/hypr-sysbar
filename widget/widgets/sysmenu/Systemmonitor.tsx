import { Gtk } from "ags/gtk4";
import { GLib } from "/usr/share/astal/gjs/index";
import { createPoll } from "ags/time";

const decoder = new TextDecoder();

const readFile = (path: string): string => {
  try {
    const [ok, bytes] = GLib.file_get_contents(path);
    if (!ok) return "0";
    return decoder.decode(bytes).trim();
  } catch {
    return "0";
  }
};

// ─── Readers ──────────────────────────────────────────────────────────────────

// CPU uso: diff entre dos lecturas de /proc/stat
let prevIdle = 0, prevTotal = 0;
const getCpuUsage = (): number => {
  const line = readFile("/proc/stat").split("\n")[0];
  const parts = line.split(/\s+/).slice(1).map(Number);
  const idle = parts[3] + parts[4]; // idle + iowait
  const total = parts.reduce((a, b) => a + b, 0);
  const diffIdle = idle - prevIdle;
  const diffTotal = total - prevTotal;
  prevIdle = idle;
  prevTotal = total;
  if (diffTotal === 0) return 0;
  return Math.max(0, Math.min(1, (diffTotal - diffIdle) / diffTotal));
};

const getCpuTemp = (): number => {
  const raw = parseInt(readFile("/sys/class/hwmon/hwmon4/temp1_input"));
  return isNaN(raw) ? 0 : raw / 1000; // milligrados → grados
};

const getGpuUsage = (): number => {
  const raw = parseInt(readFile("/sys/class/drm/card1/device/gpu_busy_percent"));
  return isNaN(raw) ? 0 : raw / 100;
};

const getGpuTemp = (): number => {
  const raw = parseInt(readFile("/sys/class/hwmon/hwmon3/temp1_input"));
  return isNaN(raw) ? 0 : raw / 1000;
};

const getRamUsage = (): number => {
  const content = readFile("/proc/meminfo");
  const get = (key: string) => {
    const match = content.match(new RegExp(`${key}:\\s+(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  };
  const total = get("MemTotal");
  const available = get("MemAvailable");
  if (total === 0) return 0;
  return Math.max(0, Math.min(1, (total - available) / total));
};

const getVramUsage = (): number => {
  const used = parseInt(readFile("/sys/class/drm/card1/device/mem_info_vram_used"));
  const total = parseInt(readFile("/sys/class/drm/card1/device/mem_info_vram_total"));
  if (isNaN(used) || isNaN(total) || total === 0) return 0;
  return Math.max(0, Math.min(1, used / total));
};

const getVramGB = (): string => {
  const used = parseInt(readFile("/sys/class/drm/card1/device/mem_info_vram_used"));
  const total = parseInt(readFile("/sys/class/drm/card1/device/mem_info_vram_total"));
  if (isNaN(used) || isNaN(total)) return "0/0G";
  return `${(used / 1073741824).toFixed(1)}/${(total / 1073741824).toFixed(0)}G`;
};

const getRamGB = (): string => {
  const content = readFile("/proc/meminfo");
  const get = (key: string) => {
    const match = content.match(new RegExp(`${key}:\\s+(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  };
  const total = get("MemTotal");
  const available = get("MemAvailable");
  const used = (total - available) / 1048576; // KB → GB
  const totalGB = total / 1048576;
  return `${used.toFixed(1)}/${totalGB.toFixed(0)}G`;
};

// ─── Orbe config ──────────────────────────────────────────────────────────────

interface OrbConfig {
  key: string;
  subLabel: () => string;
  value: () => number;
  color: string; // hex
}

const orbs: OrbConfig[] = [
  {
    key: "CPU",
    subLabel: () => `${Math.round(getCpuTemp())}°C`,
    value: getCpuUsage,
    color: "#7dcfff",
  },
  {
    key: "GPU",
    subLabel: () => `${Math.round(getGpuTemp())}°C`,
    value: getGpuUsage,
    color: "#9ece6a",
  },
  {
    key: "RAM",
    subLabel: getRamGB,
    value: getRamUsage,
    color: "#e0af68",
  },
  {
    key: "VRAM",
    subLabel: getVramGB,
    value: getVramUsage,
    color: "#bb9af7",
  },
];

// ─── Estado animación ─────────────────────────────────────────────────────────

// Valores suavizados (lerp)
const smoothValues = [0, 0, 0, 0];
const targetValues = [0, 0, 0, 0];

// Datos cacheados cada segundo
let cachedData = {
  cpuUsage: 0,
  cpuTemp: 0,
  gpuUsage: 0,
  gpuTemp: 0,
  ramUsage: 0,
  ramGB: "0/0G",
  vramUsage: 0,
  vramGB: "0/0G",
};

const refreshData = () => {
  cachedData = {
    cpuUsage: getCpuUsage(),
    cpuTemp: getCpuTemp(),
    gpuUsage: getGpuUsage(),
    gpuTemp: getGpuTemp(),
    ramUsage: getRamUsage(),
    ramGB: getRamGB(),
    vramUsage: getVramUsage(),
    vramGB: getVramGB(),
  };
  targetValues[0] = cachedData.cpuUsage;
  targetValues[1] = cachedData.gpuUsage;
  targetValues[2] = cachedData.ramUsage;
  targetValues[3] = cachedData.vramUsage;
};

const getSubLabel = (i: number): string => {
  switch (i) {
    case 0: return `${Math.round(cachedData.cpuTemp)}°C`;
    case 1: return `${Math.round(cachedData.gpuTemp)}°C`;
    case 2: return cachedData.ramGB;
    case 3: return cachedData.vramGB;
    default: return "";
  }
};

// hex → rgb
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

// ─── DrawingArea ──────────────────────────────────────────────────────────────

export const SystemMonitorWidget = (): JSX.Element => {
  let frameId: number | undefined;
  let lastTs = 0;
  let pulseTime = 0;

  // Heartbeat: periodo 2.5s, curva rápida subida lenta bajada
  const heartbeat = (t: number): number => {
    const period = 2.5;
    const p = (t % period) / period;
    return p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
  };

  const draw = (area: Gtk.DrawingArea, cr: any, width: number, height: number) => {
    const now = GLib.get_monotonic_time() / 1_000_000; // segundos
    const dt = lastTs === 0 ? 0.016 : now - lastTs;
    lastTs = now;
    pulseTime += dt;

    // Lerp suavizado
    for (let i = 0; i < 4; i++) {
      smoothValues[i] += (targetValues[i] - smoothValues[i]) * Math.min(1, dt * 3);
    }

    const pulse = heartbeat(pulseTime);

    const cols = 2, rows = 2;
    const cellW = width / cols;
    const cellH = height / rows;

    for (let i = 0; i < 4; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = cellW * col + cellW / 2;
      const cy = cellH * row + cellH / 2;
      const val = smoothValues[i];
      const maxR = Math.min(cellW, cellH) * 0.40;
      const { r, g, b } = hexToRgb(orbs[i].color);

      // Fondo radial sutil
      cr.save();
      cr.arc(cx, cy, maxR, 0, 2 * Math.PI);
      cr.clip();
      // radial sin gradiente nativo — círculo semitransparente simple
      cr.setSourceRGBA(r/255, g/255, b/255, 0.07);
      cr.arc(cx, cy, maxR, 0, 2 * Math.PI);
      cr.fill();
      cr.restore();

      // Anillo de pulso sincronizado
      const ringR = maxR * 0.22 + maxR * 0.72 * pulse;
      const ringAlpha = (1 - pulse) * 0.55 * (0.4 + val * 0.6);
      cr.setSourceRGBA(r/255, g/255, b/255, ringAlpha);
      cr.setLineWidth(1.5);
      cr.arc(cx, cy, ringR, 0, 2 * Math.PI);
      cr.stroke();

      // Núcleo que respira con el pulso — círculos concéntricos para simular gradiente
      const breathe = 1 + pulse * 0.10;
      const coreR = (maxR * 0.13 + maxR * 0.18 * val) * breathe;

      // Glow exterior
      cr.setSourceRGBA(r/255, g/255, b/255, 0.15);
      cr.arc(cx, cy, coreR, 0, 2 * Math.PI);
      cr.fill();

      // Capa media
      cr.setSourceRGBA(r/255, g/255, b/255, 0.45);
      cr.arc(cx, cy, coreR * 0.70, 0, 2 * Math.PI);
      cr.fill();

      // Punto central duro
      cr.setSourceRGBA(r/255, g/255, b/255, 0.95);
      cr.arc(cx, cy, coreR * 0.42, 0, 2 * Math.PI);
      cr.fill();

      // Label key (CPU, GPU...)
      cr.setSourceRGBA(r/255, g/255, b/255, 0.85);
      cr.selectFontFace("monospace", 0, 1); // 0=NORMAL slant, 1=BOLD weight
      cr.setFontSize(11);
      const keyText = `${orbs[i].key}  ${Math.round(val * 100)}%`;
      const keyExt = cr.textExtents(keyText);
      cr.moveTo(cx - keyExt.width / 2, cy + maxR * 0.60);
      cr.showText(keyText);

      // Sub label (temp o memoria)
      const sub = getSubLabel(i);
      cr.setSourceRGBA(1, 1, 1, 0.35);
      cr.selectFontFace("monospace", 0, 0); // 0=NORMAL weight
      cr.setFontSize(9);
      const subExt = cr.textExtents(sub);
      cr.moveTo(cx - subExt.width / 2, cy + maxR * 0.60 + 15);
      cr.showText(sub);
    }

    // Solicitar siguiente frame
    area.queue_draw();
  };

  // Refrescar datos cada segundo
  const poll = createPoll(null, 1000, () => {
    refreshData();
    return null;
  });

  // Init datos
  refreshData();

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class="system-monitor-box"
    >
      <Gtk.DrawingArea
        hexpand
        vexpand
        $={(self) => {
            self.set_draw_func((area, cr, w, h) => draw(area, cr, w, h));
            
            // Ticker a 60fps
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
                self.queue_draw();
                return GLib.SOURCE_CONTINUE;
            });

            // Refrescar datos cada segundo
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                refreshData();
                return GLib.SOURCE_CONTINUE;
            });
            }}
      />
    </box>
  );
};