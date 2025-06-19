import { createSlice } from "@reduxjs/toolkit";

interface IState {
  activeHeaderId: number;
  activeTabId: number;
}

const initialState: IState = {
  activeHeaderId: 1,
  activeTabId: 1,
};
const appSlice = createSlice({
  name: "appSlice",
  initialState,
  reducers: {
    setActiveHeader(state, action) {
      return { ...state, activeHeaderId: action.payload };
    },
    setActiveTab(state, action) {
      return { ...state, activeTabId: action.payload };
    },
  },
});

export const { setActiveHeader, setActiveTab } = appSlice.actions;
export default appSlice.reducer;
