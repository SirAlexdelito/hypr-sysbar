import { createBinding, createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import { GLib } from "/usr/share/astal/gjs/index";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { EqualizerWidget } from "./EqualizerWidget";
import GdkPixbuf from "gi://GdkPixbuf";
const mpris = AstalMpris.get_default();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const players = createBinding(mpris, "players");

// Único punto de verdad — trackea playbackStatus de todos los players
const activePlayer = createComputed(() => {
  const list = players();
  return list.toSorted((a, b) =>
    createBinding(a, "playbackStatus")() - createBinding(b, "playbackStatus")()
  )[0] ?? null;
});

const title = createComputed(() => {
  const player = activePlayer();
  if (!player) return "Sin reproducción";
  return createBinding(player, "title")();
});

const artist = createComputed(() => {
  const player = activePlayer();
  if (!player) return "";
  return createBinding(player, "artist")();
});

const coverArt = createComputed(() => {
  const player = activePlayer();
  if (!player) return "";
  return createBinding(player, "coverArt")();
});

const playIcon = createComputed(() => {
  const player = activePlayer();
  if (!player) return "󰐊";
  return createBinding(player, "playbackStatus")() === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊";
});


// ─── Portada del álbum ────────────────────────────────────────────────────────

const AlbumArt = (): JSX.Element => {
  return (
    <Gtk.Image
  class="album-art"
  pixelSize={150}
  widthRequest={150}
  heightRequest={150}
  $={(self) => {
    const updateArt = () => {
      const art = coverArt();
if (art) {
  try {
    const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(art, 100, 100, false);
    self.set_from_pixbuf(pixbuf);
  } catch (e) {
    self.set_from_icon_name("audio-x-generic");
  }
} else {
  self.set_from_icon_name("audio-x-generic");
}
    };

    // Escuchar cambios de coverArt vía polling ligero
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
updateArt();
  return GLib.SOURCE_CONTINUE;
});

    updateArt();
  }}
/>

  );
};

// ─── Controles ────────────────────────────────────────────────────────────────

const Controls = (): JSX.Element => (
  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16} halign={Gtk.Align.CENTER} class="media-controls">
    <button
      class="media-btn"
      onClicked={() => activePlayer()?.previous()}
    >
      <label label="󰒮" class="media-btn-icon" />
    </button>
    <button
      class="media-btn media-btn-play"
      onClicked={() => activePlayer()?.play_pause()}
    >
      <label label={playIcon} class="media-btn-icon" />
    </button>
    <button
      class="media-btn"
      onClicked={() => activePlayer()?.next()}
    >
      <label label="󰒭" class="media-btn-icon" />
    </button>
  </box>
);

// ─── Barra de progreso ────────────────────────────────────────────────────────

const ProgressBar = (): JSX.Element => {
  const progress = createComputed(() => {
    const player = activePlayer();
    if (!player || !player.length || player.length <= 0) return 0;
    return Math.min(1, Math.max(0, player.position / player.length));
  });

  return (
    <slider
      class="media-progress"
      orientation={Gtk.Orientation.HORIZONTAL}
      min={0}
      max={1}
      value={progress}
      onChangeValue={(_, __, val) => {
        const player = activePlayer();
        if (!player || !player.length) return false;
        player.position = val * player.length;
        return false;
      }}
    />
  );
};

// ─── Control de volumen ───────────────────────────────────────────────────────

const VolumeControl = (): JSX.Element => {
  const volume = createComputed(() => activePlayer()?.volume ?? 1);

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8} class="media-volume">
      <label label="󰕾" class="media-volume-icon" />
      <slider
        class="media-volume-slider"
        orientation={Gtk.Orientation.VERTICAL}
        min={0}
        max={1}
        value={volume}
        onChangeValue={(_, __, val) => {
          const player = activePlayer();
          if (!player) return false;
          player.volume = val;
          return false;
        }}
      />
    </box>
  );
};

// ─── Media Player completo ────────────────────────────────────────────────────

export const MediaPlayer = (): JSX.Element => (
  <box orientation={Gtk.Orientation.VERTICAL} spacing={12} class="media-player" hexpand>

    {/* Fila superior: portada + info */}
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16}>
      {AlbumArt()}
      <box orientation={Gtk.Orientation.VERTICAL} spacing={6} valign={Gtk.Align.CENTER}>
        <label
          class="media-title"
          label={title}
          halign={Gtk.Align.START}
          ellipsize={3} // PANGO_ELLIPSIZE_END
          maxWidthChars={50}
        />
        <label
          class="media-artist"
          label={artist}
          halign={Gtk.Align.START}
          ellipsize={3}
          maxWidthChars={50}
        />
        {Controls()}
        {/* Progreso */}
        {ProgressBar()}
      </box>
      {/* Volumen */}
      {/*VolumeControl()*/}
    </box>
    {/* Ecualizador */}
    {EqualizerWidget()}

  </box>
);