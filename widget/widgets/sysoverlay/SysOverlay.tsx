import { Gtk } from "ags/gtk4";
import { WeatherPanel } from "./WeatherPanel";
import { MediaPlayer } from "./MediaPlayer";

export const SysOverlay = (onRef: (p: Gtk.Popover) => void): Gtk.Popover => {
  const stack = new Gtk.Stack();
  const switcher = new Gtk.StackSwitcher({ stack });

  // Páginas del stack
  const timePage = (<box name="time">
    {WeatherPanel()}
  </box>) as Gtk.Widget;

  const mediaPage = (<box name="media">
    {MediaPlayer()}
  </box>) as Gtk.Widget;

  stack.add_titled(timePage, "time", "Tiempo");
  stack.add_titled(mediaPage, "media", "Media");

  return (
    <popover
      class="popover"
      hasArrow={false}
      autohide={true}
      $={(p) => onRef(p)}
      onMap={(p) => p.add_css_class("visible")}
      onUnmap={(p) => p.remove_css_class("visible")}
      halign={Gtk.Align.CENTER}
    >
      <box class="popover-panel" 
        orientation={Gtk.Orientation.VERTICAL} 
        spacing={12} 
        hexpand
      >
        {switcher}
        {stack}
      </box>
    </popover>
  ) as Gtk.Popover;
};

