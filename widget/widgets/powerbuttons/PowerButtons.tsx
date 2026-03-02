import { createBinding, createComputed } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { Gio, GLib, Variable } from "/usr/share/astal/gjs/index";
import { createPoll } from "ags/time";
import app from "ags/gtk4/app";

export const PowerButtonsButton = (): JSX.Element => {
    let b = b1() as Gtk.Revealer;
  return (
    <box>
        {b2(b)}
        {b}

    </box>
    
  );
};

const b1 = (): JSX.Element => {
    return (
        <revealer
              revealChild={false}
              transitionType={Gtk.RevealerTransitionType.SWING_RIGHT}
        >
            <box>
                <box spacing={8} 
                    orientation={Gtk.Orientation.HORIZONTAL} 
                    valign={Gtk.Align.CENTER}
                >
                    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} >
                        <Gtk.Separator class={"separator"}/>
                        <button
                            label={"󰐥"}
                            class={"button power"}
                            onClicked={() => {
                                GLib.spawn_command_line_async("systemctl poweroff");
                            }}
                        />
                        <Gtk.Separator class={"separator"}/>
                        <button
                            label={"󰤄"}
                            class={"button power"}
                            onClicked={() => {
                                GLib.spawn_command_line_async("systemctl suspend");
                            }}
                        />
                    </box>
                    <Gtk.Separator class={"separator"}/>
                    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} >
                        <button
                            label={"󰜉"}
                            class={"button power"}
                            onClicked={() => {
                                GLib.spawn_command_line_async("systemctl reboot");
                            }}
                        />
                        <Gtk.Separator class={"separator"}/>
                        <button
                            label={"󱅞"}
                            class={"button power"}
                            onClicked={() => {
                                GLib.spawn_command_line_async("systemctl --user exit");
                            }}
                        />
                    </box>
                </box>
            </box>
        </revealer>
        
    );
}


const b2 = (b1:  Gtk.Revealer): JSX.Element => {
    return (
        <button
      class="sysmenu-widget start-widget icon-widget"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={() => {
        b1.revealChild=!b1.revealChild
        
      }}
    >
      <label label="󰣇" class="label" />
    </button>
    );
}