import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { NotificationsPanel } from "./widget/widgets/notifications/NotificationsPanel"
import { SysmenuWidget2 } from "./widget/widgets/sysmenu/SysmenuWidget"

app.start({
  css: style,
  main() {
    // Destruir ventanas existentes al inicio
    app.get_windows().forEach(w => w.destroy());

    // Crear nuevas ventanas
    app.get_monitors().map(Bar)
    app.get_monitors().map(NotificationsPanel)
    app.get_monitors().map(SysmenuWidget2)
  },
})