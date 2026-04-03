import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import { WorkspaceItem } from "./WorkspaceItem"
import { getClientIcon } from "./WorkspaceUtils"

const hyprland = AstalHyprland.get_default();

export const WorkspacesWidget = (monitorName: string): JSX.Element => {
  // Bindings reactivos
  const workspaces = createBinding(hyprland, "workspaces");
  const clients = createBinding(hyprland, "clients");
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

  // Computed para derivar info de cada workspace
  const workspacesComputed = createComputed<WorkspaceItem[]>(() => {
    const wsList = workspaces();
    const clientList = clients();
    const focusedWs = focusedWorkspace();

    if (!wsList) return [];

    return wsList
      .filter(ws =>monitorName === ws.monitor?.name && !ws.name?.startsWith("special") && ws.clients.length>0) // excluimos magics y ws vacíos
      .map(ws => {
        const wsClients = clientList.filter(
          c => c.workspace?.name === ws.name
        );

        // sacamos iconos únicos
        const icons = Array.from(
          new Set(
            wsClients
              .map(getClientIcon)
            )
          ).slice(0, 4);

        return {
          id: ws.id,
          name: ws.name,
          icons,
          hasClients: wsClients.length > 0,
          isFocused: focusedWs?.name === ws.name,
        };
      }).sort((a, b) => b.id - a.id);
    });

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} class={"inner-widget"}>
      <For each={workspacesComputed}>
        {(item) => (
<button
  class={`workspace-button ${item.isFocused ? "focused" : ""}`}
  onClicked={() => hyprland.dispatch("workspace", item.name)}
  halign={Gtk.Align.CENTER}
  valign={Gtk.Align.CENTER}
>

</button>
        )}
      </For>
    </box>
  );

};
