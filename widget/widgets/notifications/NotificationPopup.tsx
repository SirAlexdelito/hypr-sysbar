import { Gtk, Astal } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import app from "ags/gtk4/app";
import { NotificationCard } from "./NotificationCard";

export const NotificationPopup = (n: AstalNotifd.Notification): JSX.Element => {
    const card = NotificationCard(n);
    return (
        <window
            application={app}
            class="notification-popup"
            visible
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            margin={50}
            $={(win: Gtk.Window) => {
                setTimeout(() => {
                win.destroy();
                }, 8000);
            }}
        >
            {card}
        </window>
    );
};
