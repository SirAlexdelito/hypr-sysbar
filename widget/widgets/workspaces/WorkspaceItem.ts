export interface WorkspaceItem {
  id: number;
  name: string;
  icons: string[];   // 👈 múltiples iconos
  hasClients: boolean;
  isFocused: boolean;
}

export interface SpecialWorkspaceItem extends WorkspaceItem {
    isActive: boolean;
}