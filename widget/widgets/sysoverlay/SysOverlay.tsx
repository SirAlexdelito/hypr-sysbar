import { createBinding, createComputed } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { Gio, GLib, Variable } from "/usr/share/astal/gjs/index";
import { createPoll } from "ags/time";
import app from "ags/gtk4/app";
import { SystemMonitorWidget } from "./Systemmonitor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const textDecoder = new TextDecoder();

const commandToString = (command: string): string =>
  textDecoder.decode(GLib.spawn_command_line_sync(command)[1]!).trim();

function formatUptime(sec: number): string {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const uptime = createPoll("", 60000, () =>
  formatUptime(
    parseFloat(
      textDecoder
        .decode(GLib.file_get_contents("/proc/uptime")[1])
        .split(" ")[0]!
    )
  )
);

// ─── Button trigger en la barra ───────────────────────────────────────────────

export const SysOverlayButton = (): JSX.Element => {
  return (
    <button
      class="sysmenu-widget start-widget icon-widget"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={() => {
        const win = app.get_window("sys-overlay");
        if (!win) return;
        win.visible = !win.visible;
      }}
    >
      <label label="󰣇" class="label" />
    </button>
  );
};

// ─── Header: avatar + info ────────────────────────────────────────────────────

const headerModule = (): JSX.Element => {
  const grid = new Gtk.Grid({
    rowSpacing: 8,
    columnSpacing: 24,
    halign: Gtk.Align.START,
    valign: Gtk.Align.CENTER,
    cssClasses: ["grid"],
  });

  const rows = [
    {
      icon: "",
      label: "User:",
      value: commandToString("whoami"),
    },
    {
      icon: "",
      label: "OS:",
      value:
        textDecoder
          .decode(GLib.file_get_contents("/etc/os-release")[1]!)
          .match(/PRETTY_NAME="(.+)"/)![1],
    },
    {
      icon: "",
      label: "Kernel:",
      value: textDecoder
        .decode(GLib.file_get_contents("/proc/sys/kernel/osrelease")[1])
        .trim(),
    },
    {
      icon: "",
      label: "WM:",
      value: GLib.getenv("XDG_CURRENT_DESKTOP") ?? "",
    },
    { icon: "", label: "Uptime:", value: uptime },
  ];

  rows.forEach((row, index) => {
    const labelIcon = new Gtk.Label({
      label: row.icon,
      halign: Gtk.Align.START,
      valign: Gtk.Align.CENTER,
      cssClasses: ["icon"],
    });

    const labelText = new Gtk.Label({
      label: row.label,
      halign: Gtk.Align.START,
      valign: Gtk.Align.CENTER,
      cssClasses: ["name"],
    });

    const labelValue = (
      <label
        label={row.value}
        halign={Gtk.Align.START}
        valign={Gtk.Align.CENTER}
      />
    ) as Gtk.Label;
    labelValue.add_css_class("value");

    grid.attach(labelIcon, 0, index, 1, 1);
    grid.attach(labelText, 1, index, 1, 1);
    grid.attach(labelValue, 2, index, 1, 1);
  });

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={20} class="header-box">
      <box cssClasses={["pfp-container"]} valign={Gtk.Align.CENTER} />
      <box class="grid-box">{grid}</box>
    </box>
  );
};

// ─── Botones de energía ───────────────────────────────────────────────────────

const powerModule = (): JSX.Element => (
  <box
    class="sysmenu-panel"
    spacing={16}
    orientation={Gtk.Orientation.HORIZONTAL}
    halign={Gtk.Align.CENTER}
    hexpand
    homogeneous
  >
    <button
      label="󰐥"
      class="button power"
      onClicked={() => GLib.spawn_command_line_async("systemctl poweroff")}
    />
    <button
      label="󰜉"
      class="button power"
      onClicked={() => GLib.spawn_command_line_async("systemctl reboot")}
    />
    <button
      label="󰤄"
      class="button power"
      onClicked={() => GLib.spawn_command_line_async("systemctl suspend")}
    />
    <button
      label="󱅞"
      class="button power"
      onClicked={() => GLib.spawn_command_line_async("systemctl --user exit")}
    />
  </box>
);

// ─── Wallpaper picker ─────────────────────────────────────────────────────────

const wallpaperModule = (): JSX.Element => {
  const wallpaperDir = "/home/alex/Imágenes/wallpapers";
  const dir = Gio.File.new_for_path(wallpaperDir);
  const enumerator = dir.enumerate_children(
    "standard::name,standard::content-type",
    Gio.FileQueryInfoFlags.NONE,
    null
  );

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
    providerPrev!.load_from_string(
      `.wallpaper-prev { background-image: url("file://${wallpapers[prev]}"); }`
    );
    providerCurrent!.load_from_string(
      `.wallpaper-current { background-image: url("file://${wallpapers[i]}"); }`
    );
    providerNext!.load_from_string(
      `.wallpaper-next { background-image: url("file://${wallpapers[next]}"); }`
    );
  };

  const applyWallpaper = (i: number) => {
    const w = wallpapers[i];
    GLib.spawn_command_line_async(`hyprctl hyprpaper wallpaper "DP-2,${w}"`);
    GLib.spawn_command_line_async(`hyprctl hyprpaper wallpaper "DP-3,${w}"`);
  };

  const setupProvider = (
    self: Gtk.Widget,
    provider: Gtk.CssProvider,
    cssClass: string,
    idx: number
  ) => {
    provider.load_from_string(
      `.${cssClass} { background-image: url("file://${wallpapers[idx]}"); }`
    );
    self.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER);
  };

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12} halign={Gtk.Align.CENTER} class="wallpaper-box">
      <button
        cssClasses={["wallpaper-preview", "wallpaper-side", "wallpaper-prev"]}
        $={(self) => {
          providerPrev = new Gtk.CssProvider();
          setupProvider(self, providerPrev, "wallpaper-prev", (wallpapers.length - 1) % wallpapers.length);
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
  );
};

// ─── Overlay window ───────────────────────────────────────────────────────────

export const SysOverlay = (): JSX.Element => (
  <window
    visible={false}
    name="sys-overlay"
    namespace="sys-overlay"
    class="sys-overlay"
    application={app}
    anchor={Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP}
    exclusivity={Astal.Exclusivity.NORMAL}
    layer={Astal.Layer.OVERLAY}
  >
    <box
      class="sys-overlay-panel lateral-panel"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={12}
    >
      {headerModule()}
      <Gtk.Separator />
      {SystemMonitorWidget()}
      <Gtk.Separator />
      {powerModule()}
    </box>
  </window>
);