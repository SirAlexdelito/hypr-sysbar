import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Variable } from "/usr/share/astal/gjs/index";
import Gio from "gi://Gio";
import app from "ags/gtk4/app";

const removingNotifications = Variable(false);

export const clearNotifications = async (
        notifications: AstalNotifd.Notification[],
        delay: number,
    ): Promise<void> => {
    removingNotifications.set(true);
    for (const notification of notifications) {
        notification.dismiss();
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    removingNotifications.set(false);
    let panel = app.get_window("notifications-panel");
    panel?.set_visible(false)
    panel?.set_visible(true)
};

export const getNotificationIcon = (n: AstalNotifd.Notification): Gio.Icon => {
    if(n.body.includes("whatsapp")){
        return Gio.Icon.new_for_string("/home/alex/.icons/whatsapp.svg");
    }else{
        return Gio.Icon.new_for_string(n.appIcon ? n.appIcon : n.appName.toLowerCase());
    }
};

export const getTrashButton = (): Gio.Icon => Gio.Icon.new_for_string("user-trash-symbolic");

export const formatTime = (ts: number) => {
    const date = new Date(ts * 1000);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
};

export const dismiss = (n: AstalNotifd.Notification) => {
    n.dismiss();
    let panel = app.get_window("notifications-panel");
    panel!.set_visible(false)
    panel!.set_visible(true)

};

export const invoke = (n: AstalNotifd.Notification, id: string) => {
    n.invoke(id);
    let panel = app.get_window("notifications-panel");
    panel!.set_visible(false)
    panel!.set_visible(true)

};