import { create } from "zustand";

interface State {
  selectedId: string;
}

interface Action extends State {
  actions: {
    setSelectedId: (id: string) => void;
  };
}

interface Store extends State {
  actions: Action["actions"];
}

export const useStore = create<Store>((set) => ({
  selectedId: "",
  // userInfo:{},
  actions: {
    setSelectedId: (id) => set({ selectedId: id }),
    // setUserInfo: (userInfo) => set({ userInfo })
  },
}));
