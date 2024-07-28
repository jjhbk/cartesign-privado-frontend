import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { GlobalSlice } from "./features/sigpadSlice";
import { configureStore } from "@reduxjs/toolkit";
export const store = configureStore({
  reducer: {
    global_state: GlobalSlice.reducer,
  },
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
