import { createBinding, For, createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import AstalWp from "gi://AstalWp?version=0.1";
import { icon, muted, toggleMute, addVol } from "./VolumeUtils";
import { addRightClickHandle, addScrollHandle } from "./../../shared/EventHandlingUtils";

const wp = AstalWp.get_default() as AstalWp.Wp;
const audioService = wp.audio;

const defaultSpeaker = createBinding(wp, "defaultSpeaker");

const volume = createComputed(() => {
  const speaker = defaultSpeaker();
  if (!speaker) return 0;
  return createBinding(speaker, "volume")();
});

const volumeLabel = createComputed(() => {
  const vol = Math.round(volume() * 100);
  return `${vol}%`;
});

const volumeIcon = createComputed(() => {
  return `${icon()}`;
});

export const VolumePanel = (): JSX.Element => {
  let popover: Gtk.Popover | undefined;

  return (
    <button 
      class="volume-widget inner-widget icon-widget"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={() => {
        if (popover) popover.visible = !popover.visible;
      }}
      $={(btn) => {
        addScrollHandle(btn, () => addVol(5), () => addVol(-5));
        addRightClickHandle(btn, () =>  toggleMute())
      }}
    >
      <box spacing={10}>
        <label 
          class="volume-icon" 
          label={volumeIcon} 
        />
        <label valign={Gtk.Align.BASELINE_CENTER}
          class="volume-text" 
          label={volumeLabel} 
        />
        <popover
            class="popover"
            $={(p) => (popover = p)}
            hasArrow={false}
            autohide={true}
            onMap={(p) => p.add_css_class("visible")}
            onUnmap={(p) => p.remove_css_class("visible")}
        >
          {VolumePanelBox()}
        </popover>
      </box>
    </button>
  );
};

const VolumePanelBox = (): JSX.Element => {
  // Reactivo: obtiene la lista de altavoces
  const speakers = createBinding(audioService, "speakers");

  return (
    <box orientation={Gtk.Orientation.VERTICAL} name="popover-panel" class="popover-panel" vexpand  halign={Gtk.Align.START}>

      <box 
        class="volume-slider-box" 
        orientation={Gtk.Orientation.VERTICAL} 
        halign={Gtk.Align.START}
      >

        <label 
          label="Volumen"
          class="title-label volume-title-label"
          halign={Gtk.Align.START}
        />

        <box>

          <button class={`volume-button-icon ${muted() ? "muted" : ""}`} onClicked={toggleMute} halign={Gtk.Align.START}>
            <label class="volume-icon" label={volumeIcon} />
          </button>

          <slider
            class="volume-slider"
            orientation={Gtk.Orientation.HORIZONTAL}
            halign={Gtk.Align.FILL}
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChangeValue={(_, __, val) => {
              const speaker = defaultSpeaker();
              if (!speaker) return false;
              speaker.volume = val;
              if (speaker.mute && val > 0) speaker.mute = false;
              return false;
            }}
          />
          <label class="volume-icon" label={volume.as(v=>Math.round(v * 100).toString()+"%")} />
        </box>
      </box>
      <box css={"min-height: 1rem;color: transparent;"}/>
      <box 
        orientation={Gtk.Orientation.VERTICAL} 
        class={"devices-box"}
        halign={Gtk.Align.FILL}
      >
        <label 
          label="Salida"
          halign={Gtk.Align.START}
          class="title-label volume-title-label"
        />
        {/* Lista todas las salidas de audio */}
        <For each={speakers}>
          {(device) => (
            <button 
              class="device-button" 
              halign={Gtk.Align.START}
              onClicked={(self) => {
                  (self.get_parent()?.get_parent()?.get_parent() as Gtk.Popover).visible=!(self.get_parent()?.get_parent()?.get_parent() as Gtk.Popover).visible;
                  device.set_is_default(true);
              }}
            >
              <label 
                label={device.description ?? device.name}
                class={"speaker-label-" + (device.get_is_default() ? "selected" : "no-selected")}
              />
            </button>
          )}
        </For>
      </box>
    </box>
  );
};
