import Tray from "gi://AstalTray"
import { Accessor, createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import { SpecialWorkspacesWidget } from "../workspaces/SpecialWorkspacesWidget";

const tray = Tray.get_default();

export const SysTrayWidget = (): JSX.Element => {
  const items = createBinding(tray, "items");

  return (
    <box
      orientation={Gtk.Orientation.HORIZONTAL}
      class="systray-widget inner-widget icon-widget"
      spacing={2}
    >
      {SpecialWorkspacesWidget()}
      <For each={items}>
        {(item) => {
          let popover: Gtk.Popover | undefined;
          
          return (
            <box class="systray-item">
              <button
                class="systray-item-button"
                onClicked={() => {
                  if (popover) {
                    popover.visible=!popover.visible;
                  }
                }}
              >
                <image
                  gicon={item.get_gicon()}
                  pixelSize={24}
                >
                  {(() => {
                      const menuModel = item.get_menu_model();
                      const actionGroup = item.get_action_group();

                      // Create a popover menu from the model
                      popover = Gtk.PopoverMenu.new_from_model(menuModel);
                      popover.insert_action_group("dbusmenu", actionGroup);
                      
                      return popover;
                    })()}
                </image>
              </button>
            </box>
          );
        }}
      </For>
    </box>
  );
};