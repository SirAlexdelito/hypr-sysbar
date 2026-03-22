import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { skyIconMap, weatherService } from "../../services/WeatherService";
import { For } from "ags";

const weatherIcon = createPoll("󰖐", 5000, () => weatherService.icon);
const weatherTempMax = createPoll(0, 5000, () => weatherService.data?.tempMax ?? 0);
const weatherTempMin = createPoll(0, 5000, () => weatherService.data?.tempMin ?? 0);
const weatherDesc = createPoll("", 5000, () => weatherService.data?.stateSky ?? "");
const weatherHumidity = createPoll(0, 5000, () => weatherService.data?.humidity ?? 0);
const weatherUv = createPoll(0, 5000, () => weatherService.data?.uvMax ?? 0);
const weatherForecast = createPoll(
  [] as Array<{date: string, tempMax: number, tempMin: number, skyCode: string}>,
  5000,
  () => weatherService.data?.forecast ?? []
);

export const SysOverlay = (onRef: (p: Gtk.Popover) => void): Gtk.Popover => {
  return (
    <popover
      class="popover"
      hasArrow={false}
      autohide={true}
      $={(p) => onRef(p)}
      onMap={(p) => p.add_css_class("visible")}
      onUnmap={(p) => p.remove_css_class("visible")}
      halign={Gtk.Align.CENTER}
    >
      <box class="popover-panel" orientation={Gtk.Orientation.VERTICAL} spacing={20}>

        {/* Clima */}
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12} class="weather-box" halign={Gtk.Align.CENTER}>

          {/* Izquierda: icono + temps */}
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={18} valign={Gtk.Align.CENTER}>
                <label class="weather-icon" label={weatherIcon} valign={Gtk.Align.CENTER} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={2} valign={Gtk.Align.CENTER}>
                    <label class="weather-temp-main" label={weatherTempMax.as(v => `${v}°`)} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} />
                    <label class="weather-temp-min" label={weatherTempMin.as(v => `${v}°`)} valign={Gtk.Align.CENTER}  halign={Gtk.Align.CENTER} />
                </box>
            </box>

          {/* Separador vertical */}
          <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.FILL} marginTop={4} marginBottom={4} />

          {/* Centro: descripción + extras */}
          <box orientation={Gtk.Orientation.VERTICAL} spacing={8} valign={Gtk.Align.CENTER}>
            <label class="weather-desc" label={weatherDesc} halign={Gtk.Align.START} />
            <label class="weather-extra" label={weatherHumidity.as(v => `󰖎 ${v}%`)} halign={Gtk.Align.START} />
            <label class="weather-extra" label={weatherUv.as(v => `󰖝 UV ${v}`)} halign={Gtk.Align.START} />
          </box>

          {/* Separador vertical */}
          <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.FILL} marginTop={4} marginBottom={4} />

          {/* Derecha: forecast */}
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} homogeneous>
            <For each={weatherForecast}>
                {(day) => (
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12} halign={Gtk.Align.CENTER}>
                    <label class="forecast-day" label={new Date(day.date).toLocaleDateString("es", { weekday: "short" })} />
                    <label class="forecast-icon" label={skyIconMap[day.skyCode.replace("n", "")] ?? "󰖐"} />
                    <label class="forecast-temp" label={`${day.tempMax}° ${day.tempMin}°`} />
                </box>
                )}
            </For>
        </box>

        </box>

        {/* Calendario */}
        <box>
          <Gtk.Calendar widthRequest={500} heightRequest={250} />
        </box>

      </box>
    </popover>
  ) as Gtk.Popover;
};