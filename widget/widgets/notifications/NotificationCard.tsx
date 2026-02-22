import Gio from "gi://Gio";
import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { dismiss, formatTime, getNotificationIcon, invoke } from "./NotificationsUtils";
import { addLeftClickHandle } from "./../../shared/EventHandlingUtils";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

const hyprland = AstalHyprland.get_default();

export const NotificationCard = (n: AstalNotifd.Notification): JSX.Element => {
    const time = formatTime(n.time || Date.now() / 1000);
    let isWhatsapp = n.appName == "Brave" && n.body.includes("whatsapp");
    let isMail = !isWhatsapp && n.app_name.includes("ThunderBird");
    return (
        <box 
            class={`notification-card urgency-${n.urgency}`} 
            spacing={8}
            $={(self)=>addLeftClickHandle(self, () => handleClickOnNotif(isWhatsapp, isMail))}
        >
            {/* Icono */}
            <image gicon={getNotificationIcon(n)} class="notif-icon" pixelSize={64}/>

            {/* Contenido central */}
            <box class="notif-content" orientation={Gtk.Orientation.VERTICAL} hexpand spacing={4}>
                <label class="notif-title" label={n.summary} xalign={0} />
                {n.body && !isWhatsapp && <label class="notif-body" label={n.body} xalign={0} wrap />}
                {n.body && isWhatsapp && <label class="notif-body" label={n.body.split("</a>")[1].trim()} xalign={0} wrap />}
                {n.actions.length > 0 && (
                    actionsBox(n, isWhatsapp)
                )}
            </box>

            {/* Columna derecha: time arriba, cerrar abajo */}
            <box class="notif-right" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                <label class="notif-time" label={time} />
                <button class="notif-close" 
                    $={(btn) => {
                        btn.connect("clicked", () => dismiss(n));
                    }}
                >
                    <image gicon={Gio.Icon.new_for_string("user-trash-symbolic")} pixelSize={32} />
                </button>
            </box>
        </box>
    );
};

const actionsBox = (n: AstalNotifd.Notification, isWhatsapp: boolean) => {
    return ( 
        <box class="notif-actions" spacing={4}>
            {n.actions.map((a) =>
                !(a.label=="Configuración" && isWhatsapp) && (
                    <button
                        class="notif-action"
                        hexpand
                        $={(btn) => {
                            btn.connect("clicked", () => {
                                invoke(n, a.id);
                            });
                        }}
                    >
                        <label label={a.label} />
                    </button>
                )
            )}

        </box>
    )
}

const handleClickOnNotif = (isWhatsapp: boolean, isMail: boolean) => {
    if(isWhatsapp){
        hyprland.dispatch("togglespecialworkspace", "whatsApp")
    }else if(isMail){
        hyprland.dispatch("togglespecialworkspace", "mail")
    }else{

    }
}