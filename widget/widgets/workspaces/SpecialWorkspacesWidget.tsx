import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import { SpecialWorkspaceItem } from "./WorkspaceItem"
import { getClientIcon } from "./WorkspaceUtils"

const hyprland = AstalHyprland.get_default();

export const SpecialWorkspacesWidget = (): JSX.Element => {
  // Bindings reactivos
  const workspaces = createBinding(hyprland, "workspaces");
  const clients = createBinding(hyprland, "clients");
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
  const monitors = createBinding(hyprland, "monitors")

  // Computed para derivar info de cada workspace
  const workspacesComputed = createComputed<SpecialWorkspaceItem[]>(() => {
    const wsList = workspaces();
    const clientList = clients();
    const focusedWs = focusedWorkspace();
    monitors();

    
    if (!wsList) return [];

    return wsList
      .filter(ws => ws.name.startsWith("special") && !ws.name.endsWith("magic")) // solo specials pero sin el magic
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
          
        const normalize = (s?: string) =>
          s?.replace("special:", "").trim().toLowerCase()

        const isActive = monitors().some(
          m => normalize(m.specialWorkspace?.name) === normalize(ws.name)
        )

        return {
          id: ws.id,
          name: ws.name.replace("special:", ""),
          icons,
          hasClients: wsClients.length > 0,
          isFocused: focusedWs?.name === ws.name,
          isActive: isActive
        };
      }).sort((a, b) => a.id - b.id);
    });

  return (
    <box 
      orientation={Gtk.Orientation.HORIZONTAL} 
    >
      <For each={workspacesComputed}>
        {(item) => (
          <button
            class={`workspace-button special ${item.isActive ? "active" : "ianctive"}`}
            onClicked={() => hyprland.dispatch("togglespecialworkspace", item.name)}
          >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6} class="workspace-content">
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
