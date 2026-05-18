import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

interface UiState {
  sidebarOpen: boolean;
  theme: ThemeMode;
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: (localStorage.getItem('theme') as ThemeMode) || 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
  },
});

export const { toggleSidebar, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
