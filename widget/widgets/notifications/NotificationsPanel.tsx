import { createBinding, For, Accessor } from "ags";
import { Gtk, Astal, Gdk, } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Gio, Variable } from "/usr/share/astal/gjs/index";
import app from "ags/gtk4/app";
import { clearNotifications, } from "./NotificationsUtils";
import { NotificationCard } from "./NotificationCard";

const notifd = AstalNotifd.get_default();
export const removingNotifications = Variable(false);

export const NotificationsPanel = (): JSX.Element => {
  
  const notifications = createBinding(notifd, "notifications");
  const activeWin = app.get_active_window();
  const dnd = createBinding(notifd, "dont_disturb");

  return (
    <window
      visible={false}
      name={"notifications-panel"}
      class="notification-dropdown"
      transient_for={activeWin!} 
      application={app}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}      
    >

      <revealer
        revealChild={false}
        $={(self)=>{
          app.connect('window-toggled', (_, window) => {
              self.set_reveal_child(window.visible);
          });
        }}
      >
        {NotificationsPanelBox(notifications, dnd)}
      </revealer>
      
    </window>
  );
};

const NotificationsPanelBox = (notifications: Accessor<AstalNotifd.Notification[]>, dnd: Accessor<boolean>): JSX.Element => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8} 
      name={"notification-panel"}
      class="notification-panel" 
      vexpand
    >
      {/* Toggle DND */}
      <box 
        class="dnd-toggle" 
        orientation={Gtk.Orientation.HORIZONTAL} 
        spacing={16} hexpand
        halign={Gtk.Align.END}
        valign={Gtk.Align.CENTER}
      >
        <label label="Do Not Disturb" />
        <switch 
          active={dnd}
          class={`dnd-switch ${dnd() ? "checked" : ""}`}
          $={(self) => {
            self.connect("state-set", (_sw, newState) => {
              notifd.set_dont_disturb(newState)
              self.cssClasses=["dnd-switch", dnd() ? "checked" : ""]
              return false // 👈 CLAVE: deja que GTK haga el toggle
            })
          }}
        />
        <button class="notif-close" css={"padding: 0px;"} 
            $={(btn) => {
                btn.connect("clicked", () => clearNotifications(notifications(), 40));
            }}
        >
          <image gicon={Gio.Icon.new_for_string("user-trash-symbolic")} pixelSize={24} />
        </button>
      </box>

      <box orientation={Gtk.Orientation.VERTICAL} spacing={6} hexpand 
        visible = {notifications.as(list => list.length > 0)}>
        <For each={notifications}>
          {(n) => (NotificationCard(n))}
        </For>
      </box>

    </box>
    
  )
};

const NotificationsPanelSwitch = (dnd: Accessor<boolean>): JSX.Element => {
  let swtch = (<switch class={`dnd-switch ${dnd() ? "checked" : ""}`}
          active={dnd}
          onStateSet={(self) => {
            notifd.set_dont_disturb(!notifd.get_dont_disturb())
            self.cssClasses=["dnd-switch", dnd() ? "checked" : ""]
            return true; // indica que manejamos el evento, evita el toggle duplicado
          }}
        />) as Gtk.Switch;

  const gesture = Gtk.GestureClick.new();
  gesture.set_button(3); // 3 = clic derecho
  gesture.connect("pressed", (g, n_press, x, y) => {
    const btn = g.get_current_button();
    if (btn === 3) {
      notifd.set_dont_disturb(!notifd.get_dont_disturb())
      swtch.cssClasses=["dnd-switch", dnd() ? "checked" : ""]
    }
  });

  (swtch as Gtk.Widget).add_controller(gesture);
  
  return swtch;
}