import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { WorkspacesWidget } from "./widgets/workspaces/WorkspacesWidget";
import { SpecialWorkspacesWidget } from "./widgets/workspaces/SpecialWorkspacesWidget";
import { NotificationsWidget } from "./widgets/notifications/NotificationsWidget";
import { createPoll } from "ags/time";
import { VolumePanel } from "./widgets/volume/VolumeWidget";
import { BluetoothWidget } from "./widgets/bluetooth/BluetoothWidget";
import { ClipboardWidget } from "./widgets/clipboard/ClipboardWidget";
import { SysTrayWidget } from "./widgets/systray/SystrayWidget";
import { SysmenuWidget, SysmenuWidget2 } from "./widgets/sysmenu/SysmenuWidget";
import { DatetimeWidget } from "./widgets/datetime/DatetimeWidget";
import { SysOverlayButton } from "./widgets/sysoverlay/SysOverlay";
import { PowerButtonsButton } from "./widgets/powerbuttons/PowerButtons";

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date");
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  const monitorIndex = gdkmonitor.get_model();

  return (
    <window
      visible
      name={`bar-${monitorIndex}`}
      class="bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      {/* Barra principal */}
      <centerbox $type="start" class="centerbox">

        {/* Workspaces normales */}
        <box $type="start">
          <PowerButtonsButton/>
          <WorkspacesWidget />
        </box>

        {/* Workspaces especiales */}
        <box $type="center">
          <DatetimeWidget/>
        </box>

        {/* Botón de notificaciones */}
        <box $type="end">
          <ClipboardWidget/>
          <VolumePanel />
          <BluetoothWidget/>
          <SysTrayWidget/>
          <NotificationsWidget />
        </box>

      </centerbox>
    </window>
  );
}
