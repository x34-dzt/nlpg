import { create } from "zustand"
import { createSelectors } from "@/lib/create-selectors"

interface SidebarState {
  isOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const store = create<SidebarState>((set) => ({
  isOpen: false,
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
}))

export const useSidebarStore = createSelectors(store)
export const openSidebar = store.getState().openSidebar
export const closeSidebar = store.getState().closeSidebar
