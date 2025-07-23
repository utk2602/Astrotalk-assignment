import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  aiMessages: [],
  currentPrompt: '',
  loading: false,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Add reducers here
  },
});

export default aiSlice.reducer; 