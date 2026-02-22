import { createBinding, createComputed, For } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { Gio, GLib, Variable } from "/usr/share/astal/gjs/index";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { addLeftClickHandle } from "widget/shared/EventHandlingUtils";
import { createPoll } from "ags/time";
import app from "ags/gtk4/app";

let revealer: Gtk.Revealer | undefined;

export const SysmenuWidget = (): JSX.Element => {
  let buttonRef: Gtk.Button | undefined;
  return (
    <button
      class="sysmenu-widget start-widget icon-widget"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      
onClicked={() => {
  const win = app.get_window("sysmenu-panel")!;
  if (win.visible) {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
      win.visible = false;
      return GLib.SOURCE_REMOVE;
    });
  } else {
    const surface = buttonRef!.get_root()?.get_surface();
    const monitor = buttonRef!.get_display().get_monitor_at_surface(surface!);
    const model = monitor?.get_model() ?? "";
    if (model.includes("24GL600F")) {
      win.add_css_class("monitor-small");
    } else {
      win.remove_css_class("monitor-small");
    }
    win.visible = true;
  }
}}
      $={(p) => {
        buttonRef = p;
      }}
    >
      <label label={"󰣇"} class={"label"}/>
    </button>    
  );
};

const headerModule = (): JSX.Element => {
  const grid = new Gtk.Grid({
    rowSpacing: 10,
    columnSpacing: 30,
    halign: Gtk.Align.START,
    valign: Gtk.Align.CENTER,
    cssClasses:["grid"]
  });

  const rows = [
    { icon: "", label: "User:", value: commandToString("whoami") },
    { icon: "", label: "OS:", value: textDecoder.decode(GLib.file_get_contents("/etc/os-release")[1]!).match(/PRETTY_NAME=\"(.+)\"/)![1] },
    { icon: "", label: "Kernel:", value: textDecoder.decode(GLib.file_get_contents("/proc/sys/kernel/osrelease")[1]).trim() },
    { icon: "", label: "WM:", value: GLib.getenv("XDG_CURRENT_DESKTOP") ?? "" },
    { icon: "", label: "Uptime:", value: datetime },
  ];

  rows.forEach((row, index) => {
    // Icon
    const labelIcon = new Gtk.Label({ label: row.icon, halign: Gtk.Align.START, valign: Gtk.Align.CENTER });
    labelIcon.add_css_class("icon");

    // Label
    const labelText = new Gtk.Label({ label: row.label, halign: Gtk.Align.START, valign: Gtk.Align.CENTER });
    labelText.add_css_class("name");

    // Value
    const labelValue = (<label label={row.value} halign={Gtk.Align.START} valign={Gtk.Align.CENTER}/>) as (Gtk.Label);
    labelValue.add_css_class("value");

    // Añadir al grid
    grid.attach(labelIcon, 0, index, 1, 1);
    grid.attach(labelText, 1, index, 1, 1);
    grid.attach(labelValue, 2, index, 1, 1);
  });

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={15} class={"header-box"}>
      <box cssClasses={["pfp-container"]} valign={Gtk.Align.CENTER}/>
      <box class={"grid-box"}>
        {grid}
      </box>
    </box>
  );
};

/*
<label label={"Bienvenido, SirAlexito"} valign={Gtk.Align.START} />
        <Gtk.Separator valign={Gtk.Align.START} class={"separator"} />
        <box class={"sysmenu-panel"} spacing={32} orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.FILL} valign={Gtk.Align.END}>
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={32}>
            <button
              label={"󰐥"}
              class={"button power"}
              onClicked={() => {
                GLib.spawn_command_line_async("systemctl poweroff");
              }}
            />
            <button
              label={"󰜉"}
              class={"button power"}
              onClicked={() => {
                GLib.spawn_command_line_async("systemctl reboot");
              }}
            />
          </box>
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={32}>
            <button
              label={"󰤄"}
              class={"button power"}
              onClicked={() => {
                GLib.spawn_command_line_async("systemctl suspend");
              }}
            />
            <button
              label={"󱅞"}
              class={"button power"}
              onClicked={() => {
                GLib.spawn_command_line_async("systemctl --user exit");
              }}
            />
          </box>
        </box>
*/

const shortcutsaModule = (): JSX.Element => {
  return (
    <box class={"sysmenu-panel"} spacing={32} 
      orientation={Gtk.Orientation.HORIZONTAL} 
      valign={Gtk.Align.END}
      hexpand
      homogeneous
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={32} homogeneous>
        <button
          label={"󰐥"}
          class={"button power"}
          onClicked={() => {
            GLib.spawn_command_line_async("systemctl poweroff");
          }}
        />
        <button
          label={"󰜉"}
          class={"button power"}
          onClicked={() => {
            GLib.spawn_command_line_async("systemctl reboot");
          }}
        />
      </box>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={32} homogeneous>
        <button
          label={"󰤄"}
          class={"button power"}
          onClicked={() => {
            GLib.spawn_command_line_async("systemctl suspend");
          }}
        />
        <button
          label={"󱅞"}
          class={"button power"}
          onClicked={() => {
            GLib.spawn_command_line_async("systemctl --user exit");
          }}
        />
      </box>
    </box>
          
  );
};

const foldersModule = (): JSX.Element => {
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous spacing={50} class={"module-box panel"}>
      <box orientation={Gtk.Orientation.VERTICAL} homogeneous class={"module-box child"}>
        <label label={"Alex"} halign={Gtk.Align.START} />
        <label label={"Escritorio"} halign={Gtk.Align.START} />
        <label label={"Descargas"} halign={Gtk.Align.START} />
        <label label={"Imágenes"} halign={Gtk.Align.START} />
      </box>
      <box orientation={Gtk.Orientation.VERTICAL} homogeneous class={"module-box child"}>
        <label label={"Root"} halign={Gtk.Align.START} />
        <label label={"Documentos"} halign={Gtk.Align.START} />
        <label label={"Proyectos"} halign={Gtk.Align.START} />
        <label label={"Videos"} halign={Gtk.Align.START} />
      </box>
    </box>
  );
};


export const SysmenuWidget2 = (): JSX.Element => {
  return (
    <window
      visible={false}
      name="sysmenu-panel"
      namespace="sysmenu-panel"
      class="sysmenu-dropdown"
      application={app}
      anchor={Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
    >
      <box class={"lateral-panel"} orientation={Gtk.Orientation.VERTICAL} spacing={15}>
        {headerModule()}
        <Gtk.Separator/>
        {shortcutsaModule()}
        <Gtk.Separator/>
        {wallpaperBox()}
        <Gtk.Separator/>
      </box>
    </window>
  );
};



const wallpaperBox = (): JSX.Element => {
  const wallpaperDir = "/home/alex/Imágenes/wallpapers";
  const dir = Gio.File.new_for_path(wallpaperDir);
  const enumerator = dir.enumerate_children("standard::name,standard::content-type", Gio.FileQueryInfoFlags.NONE, null);
  
  const wallpapers: string[] = [];
  let fileInfo: Gio.FileInfo | null;
  while ((fileInfo = enumerator.next_file(null)) !== null) {
    const name = fileInfo.get_name();
    if (name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      wallpapers.push(`${wallpaperDir}/${name}`);
    }
  }
  wallpapers.sort((a, b) => a.localeCompare(b));

  const current = new Variable(0);
  let providerPrev: Gtk.CssProvider | undefined;
  let providerCurrent: Gtk.CssProvider | undefined;
  let providerNext: Gtk.CssProvider | undefined;

  const updateImages = (i: number) => {
    const prev = (i - 1 + wallpapers.length) % wallpapers.length;
    const next = (i + 1) % wallpapers.length;
    providerPrev!.load_from_string(`.wallpaper-prev { background-image: url("file://${wallpapers[prev]}"); }`);
    providerCurrent!.load_from_string(`.wallpaper-current { background-image: url("file://${wallpapers[i]}"); }`);
    providerNext!.load_from_string(`.wallpaper-next { background-image: url("file://${wallpapers[next]}"); }`);
  };

  const applyWallpaper = (i: number) => {
    const wallpaper = wallpapers[i];
    GLib.spawn_command_line_async(`hyprctl hyprpaper wallpaper "DP-2,${wallpaper}"`);
    GLib.spawn_command_line_async(`hyprctl hyprpaper wallpaper "DP-3,${wallpaper}"`);
  };

  const setupProvider = (self: Gtk.Widget, provider: Gtk.CssProvider, cssClass: string, wallpaperIndex: number) => {
    provider.load_from_string(`.${cssClass} { background-image: url("file://${wallpapers[wallpaperIndex]}"); }`);
    self.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER);
  };

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={20} class={"wallpaper-box"}>
      <label label={"Hyprpaper"} class={"title"} halign={Gtk.Align.START}/>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
        <button
          cssClasses={["wallpaper-preview", "wallpaper-side", "wallpaper-prev"]}
          $={(self) => {
            providerPrev = new Gtk.CssProvider();
            const i = (0 - 1 + wallpapers.length) % wallpapers.length;
            setupProvider(self, providerPrev, "wallpaper-prev", i);
          }}
          onClicked={() => {
            const i = (current.get() - 1 + wallpapers.length) % wallpapers.length;
            current.set(i);
            updateImages(i);
            applyWallpaper(i);
          }}
        />
        <box
          cssClasses={["wallpaper-preview", "wallpaper-main", "wallpaper-current"]}
          $={(self) => {
            providerCurrent = new Gtk.CssProvider();
            setupProvider(self, providerCurrent, "wallpaper-current", 0);
          }}
        />
        <button
          cssClasses={["wallpaper-preview", "wallpaper-side", "wallpaper-next"]}
          $={(self) => {
            providerNext = new Gtk.CssProvider();
            setupProvider(self, providerNext, "wallpaper-next", 1 % wallpapers.length);
          }}
          onClicked={() => {
            const i = (current.get() + 1) % wallpapers.length;
            current.set(i);
            updateImages(i);
            applyWallpaper(i);
          }}
        />
      </box>
      <box hexpand homogeneous class={"styles-box"}>
        <button class={"circle-button dark"} halign={Gtk.Align.CENTER}/>
        <button class={"circle-button nigth-sky"} halign={Gtk.Align.CENTER}/>
        <button class={"circle-button pastel"} halign={Gtk.Align.CENTER}/>
        <button class={"circle-button light"} halign={Gtk.Align.CENTER}/>
      </box>
    </box>
  );
};





const textDecoder = new TextDecoder();
const commandToString = (command: string) => {
  return textDecoder.decode(GLib.spawn_command_line_sync(command)[1]!).trim();
} 

function formatUptime(sec:number) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)

  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const datetime = createPoll("", 60000, () => 
    formatUptime(parseFloat(textDecoder.decode(GLib.file_get_contents("/proc/uptime")[1])
      .toString()
      .split(" ")[0]!))
);