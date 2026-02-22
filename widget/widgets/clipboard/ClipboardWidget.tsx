import { GLib } from "/usr/share/astal/gjs/index";

export const ClipboardWidget = (): JSX.Element => {
    return (
            <button
                class={"inner-widget"}
                onClicked={() => {
                    GLib.spawn_command_line_async(`clipcat-menu --rofi-menu-length 10`);
                }}
            >
                <box>
                    <label 
                        label={"󰨸"}
                        class={"big-label"}
                    />
                </box>
            </button>
    );
}