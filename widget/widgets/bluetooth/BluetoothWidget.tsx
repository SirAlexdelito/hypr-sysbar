import { createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { addLeftClickHandle } from "./../../shared/EventHandlingUtils";

const bt = AstalBluetooth.get_default() as AstalBluetooth.Bluetooth;

const on = createBinding(bt, "isPowered");
const connected = createBinding(bt, "isConnected");
const devices = createBinding(bt, "devices");

const icon = createComputed(() => {
    return on() ? 
        connected() ? 
            "󰂱" : 
            "" : 
        "󰂲"
});

export const BluetoothWidget = (): JSX.Element => {
    let popover: Gtk.Popover | undefined;

    return (
        <button
            class="bluetooth-widget inner-widget icon-widget"
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            onClicked={() => {
                if (popover) popover.visible = !popover.visible;
            }}
        >
            <box>
                <label 
                    label={icon()}
                    class={"big-label"}
                />
                <popover
                    class="popover"
                    $={(p) => {(popover = p)}}
                    hasArrow={false}
                    autohide={true}
                    onMap={(p) => p.add_css_class("visible")}
                    onUnmap={(p) => p.remove_css_class("visible")}
                >
                {BluetoothPanelBox()}
                </popover>
            </box>
        </button>
    );
}

const BluetoothPanelBox = (): JSX.Element => {
    return (
        <box 
            orientation={Gtk.Orientation.VERTICAL} 
            class="popover-panel"
            spacing={15}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                halign={Gtk.Align.FILL}  
                spacing={200}
            >
                <label 
                    label="Bluetooth"
                    class="title-label"
                    valign={Gtk.Align.CENTER}  
                    halign={Gtk.Align.START}
                    css={"padding-top: 5px;"}
                />
                <switch 
                    active={on}
                    valign={Gtk.Align.CENTER} 
                    halign={Gtk.Align.END}
                    onNotifyActive={(sw) => {
                        bt.adapter.set_powered(sw.active);
                    }}
                />
            </box>

            <box
                orientation={Gtk.Orientation.VERTICAL}
            >
                <For each={devices}>
                    {(device) => BluetoothDevice(device)}
                </For>
            </box>
        </box>
    );
}


export const BluetoothDevice = (device: AstalBluetooth.Device): JSX.Element => {

    const connected = createBinding(device, "connected");
    const paired = createBinding(device, "paired");
    const battery = createBinding(device, "batteryPercentage");

    let status = createComputed(() => {
        if (connected()) return "Conectado";
        if (paired()) return "Emparejado";
        return "Desconectado";
    });

    let batteryLevel = createComputed(() => {
        const b = battery() * 100;
        if (b >= 90) return b + " 󰥈";
        if (b >= 70) return b + " 󰥄";
        if (b >= 50) return b + " 󰥂";
        if (b >= 20) return b + " 󰥀";
        if (b >= 0) return b + " 󰤾";
        return "󰂑";
    });

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            vexpand
            spacing={20}
        >
            <label label={getIcon(device)}
                class={"device-icon"}/>
                <box 
                    class="device-box"
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.CENTER}
                    vexpand
                >
                    <box 
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                        $={(btn) => {
                            addLeftClickHandle(btn, () =>  device.connected ? 
                                device.disconnect_device(null) : 
                                device.connect_device(null))
                        }}
                    >
                        <label 
                            class={"blueetooth-name-label"}
                            label={device.name}
                            halign={Gtk.Align.START}    
                        />
                        <label 
                            class={"blueetooth-name-label"}
                            label={batteryLevel}/>
                    </box>
                    
                    <label 
                        class={"sub-label"}
                        label={status}
                        halign={Gtk.Align.START}   
                    />
                </box>
        </box>
    );
}

const getIcon = (device: AstalBluetooth.Device) : string => {
    switch (device.get_icon()) {
        case "audio-headset": return "󰋎";
        case "phone": return "";
        default : return ""
    }
}



