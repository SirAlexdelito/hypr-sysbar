import { Gtk } from "ags/gtk4";
import { GLib } from "/usr/share/astal/gjs/index";
import { cavaService } from "../../services/CavaService";

export const EqualizerWidget = (): JSX.Element => {
  const NUM_BARS = 20;
  const BAR_COLOR = { r: 211, g: 134, b: 155 }; // #7dcfff

  const draw = (_area: Gtk.DrawingArea, cr: any, width: number, height: number) => {
    const bars = cavaService.data;
    if (!bars.length) return;

    const barWidth = width / NUM_BARS;
    const gap = barWidth * 0.25;
    const effectiveBarWidth = barWidth - gap;

    for (let i = 0; i < NUM_BARS; i++) {
      const val = (bars[i] ?? 0) / 100; // normalizar 0..1
      const barHeight = val * height;
      const x = i * barWidth + gap / 2;
      const y = height - barHeight;

      // Color con alpha según valor
      const alpha = 0.3 + val * 0.7;
      cr.setSourceRGBA(
        BAR_COLOR.r / 255,
        BAR_COLOR.g / 255,
        BAR_COLOR.b / 255,
        alpha
      );

      // Barra con esquinas redondeadas arriba
      const radius = effectiveBarWidth * 0.3;
      const r = Math.min(radius, barHeight / 2);

      if (barHeight < 2) {
        // Barra mínima visible
        cr.rectangle(x, height - 2, effectiveBarWidth, 2);
      } else {
        cr.moveTo(x + r, y);
        cr.lineTo(x + effectiveBarWidth - r, y);
        cr.arc(x + effectiveBarWidth - r, y + r, r, -Math.PI / 2, 0);
        cr.lineTo(x + effectiveBarWidth, height);
        cr.lineTo(x, height);
        cr.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
        cr.closePath();
      }

      cr.fill();

      // Glow sutil encima de cada barra
      if (val > 0.05) {
        cr.setSourceRGBA(
          BAR_COLOR.r / 255,
          BAR_COLOR.g / 255,
          BAR_COLOR.b / 255,
          val * 0.25
        );
        cr.rectangle(x, y - 3, effectiveBarWidth, 3);
        cr.fill();
      }
    }
  };

  return (
    <Gtk.DrawingArea
      class="equalizer"
      heightRequest={80}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      vexpand
      $={(self) => {
        self.set_draw_func((area, cr, w, h) => draw(area, cr, w, h));

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
          self.queue_draw();
          return GLib.SOURCE_CONTINUE;
        });
      }}
    />
  );
};