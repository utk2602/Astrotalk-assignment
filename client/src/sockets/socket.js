import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

// Listeners
socket.on('receive-message', (msg) => {
  // Handle received message
});
socket.on('typing', () => {});
socket.on('call', () => {});
socket.on('online-status', () => {});
socket.on('read-receipt', () => {});

// Emitters (example)
export const sendMessage = (msg) => socket.emit('send-message', msg);
export const startCall = (data) => socket.emit('start-call', data);
export const userOnline = (userId) => socket.emit('user-online', userId);
export const markRead = (msgId) => socket.emit('mark-read', msgId);

export default socket; 