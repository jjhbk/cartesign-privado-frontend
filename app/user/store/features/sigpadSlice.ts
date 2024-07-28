import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalState {
  sigpad: string;
  formdata: string;
}

const initialState: GlobalState = {
  sigpad: "",
  formdata: "",
};

export const GlobalSlice = createSlice({
  name: "global_state",
  initialState,
  reducers: {
    setSigpad: (state, action: PayloadAction<{ value: string }>) => {
      state.sigpad = action.payload.value;
    },
  },
});

export default GlobalSlice.reducer;
export const { setSigpad } = GlobalSlice.actions;
