import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inCall: false,
  incomingCall: null,
  callData: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    // Add reducers here
  },
});

export default callSlice.reducer; 