import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { NotificationsPanel } from "./widget/widgets/notifications/NotificationsPanel"
import { SysmenuWidget2 } from "./widget/widgets/sysmenu/SysmenuWidget"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import GLib from "gi://GLib?version=2.0"

const hyprland = AstalHyprland.get_default();

app.start({
  css: style,
  main() {
    const createWindows = () => {
      app.get_windows().forEach(w => w.destroy());
      app.get_monitors().map(Bar);
      app.get_monitors().map(NotificationsPanel);
    };

    createWindows();
hyprland.connect("monitor-added", () => {
    GLib.spawn_command_line_async("ags run /home/alex/Proyectos/ags/my-bar/app.ts");
    app.quit();
});

hyprland.connect("monitor-removed", () => {
    GLib.spawn_command_line_async("ags run /home/alex/Proyectos/ags/my-bar/app.ts");
    app.quit();
});
  },
});