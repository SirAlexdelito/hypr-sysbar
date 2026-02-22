import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import { WorkspaceItem } from "./WorkspaceItem"
import { getClientIcon } from "./WorkspaceUtils"

const hyprland = AstalHyprland.get_default();

export const WorkspacesWidget = (): JSX.Element => {
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
      .filter(ws => !ws.name.startsWith("special") && ws.clients.length>0) // excluimos magics y ws vacíos
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
      }).sort((a, b) => a.id - b.id);
    });

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} class={"inner-widget"}>
      <For each={workspacesComputed}>
        {(item) => (
          <button
            class={`workspace-button ${item.isFocused ? "focused" : ""}`}
            onClicked={() => hyprland.dispatch("workspace", item.name)}
          >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6} class="workspace-content">
              <label class="workspace-name" label={item.name} />

              <box class="workspace-separator" />

              {item.icons.length > 0 && (
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} class="workspace-icons">
                  {item.icons.map((icon) => (
                    <label class="workspace-icon" label={icon} />
                  ))}
                </box>
              )}
            </box>
          </button>
        )}
      </For>
    </box>
  );

};
