import AstalHyprland from "gi://AstalHyprland?version=0.1";
import iconMap from "../appIcons.json";

export function getClientIcon(client: AstalHyprland.Client): string {
  const name = client.class?.toLowerCase() || client.class?.toLowerCase() || "";
  return (iconMap as any)[name] || "󰣆"; // fallback si no hay icono
}