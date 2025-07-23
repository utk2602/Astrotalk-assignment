import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  users: [],
  activeChat: null,
  typing: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add reducers here
  },
});

export default chatSlice.reducer; 