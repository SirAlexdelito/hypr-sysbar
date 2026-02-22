import { createBinding, For, } from "ags";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Variable } from "/usr/share/astal/gjs/index";
import app from "ags/gtk4/app";
import { NotificationPopup } from "./NotificationPopup";
import Gtk from "gi://Gtk";
import { addRightClickHandle } from "./../../shared/EventHandlingUtils";

const notifd = AstalNotifd.get_default();
export const removingNotifications = Variable(false);

export const NotificationsWidget = (): JSX.Element => {
  const notifications = createBinding(notifd, "notifications");
  const dnd = createBinding(notifd, "dont_disturb");

  notifd.connect("notified", (_, id) => {
    const n = notifd.get_notification(id);
    if (!n) return;
    if (!dnd) NotificationPopup(n);
  });

  return (
    <button class="notification-indicator end-widget"
      onClicked={() => app.toggle_window("notifications-panel")}
      $={(self)=>addRightClickHandle(self, ()=> notifd.set_dont_disturb(!notifd.get_dont_disturb()))}
    >
      <box spacing={6}>
        <label
          label={dnd.as(active => active ? "󰂛" : "󰂚")}
          css="font-family: 'Symbols Nerd Font'; font-size: 18px;"
        />
        <label
          class="notification-count"
          label={notifications.as(list => String(list.length))}
          visible={notifications.as(list => list.length > 0)}
        />
      </box>
    </button>
  );
};
