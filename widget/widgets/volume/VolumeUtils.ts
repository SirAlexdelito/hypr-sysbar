import { createBinding, createComputed } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";

export const wp = AstalWp.get_default();

// Nodo de salida por defecto (speaker)
export const defaultSpeaker = createBinding(wp, "defaultSpeaker");

// bindings dinámicos al speaker actual
export const volume = createComputed(() => {
    const speaker = defaultSpeaker();
    if (!speaker) return 0;

    return createBinding(speaker, "volume")();
});

export const muted = createComputed(() => {
    const speaker = defaultSpeaker();
    if (!speaker) return false;

    return createBinding(speaker, "mute")();
});

export const getVolumeIcon = (volume: number, muted: boolean): string => {
    if (muted) return "";
    if (volume === 0) return "";
    if (volume < 0.5) return "";
    return "";
};

export const toggleMute = () => {
    const speaker = defaultSpeaker();
    if (!speaker) return;

    speaker.mute = !speaker.mute;
};

export const icon = createComputed(() =>
    getVolumeIcon(volume(), muted())
);

export const addVol = (v: number) => {
    const speaker = defaultSpeaker();
    if (!speaker) return;

    // v se interpreta como porcentaje, convertir a decimal
    const step = v / 100;  // por ejemplo 5% = 0.05
    speaker.volume = Math.min(1, Math.max(0, speaker.volume + step));
};

