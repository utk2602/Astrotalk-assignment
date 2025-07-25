import React, { createContext, useContext, useReducer, useEffect } from 'react';
import chatContext from './chatContext';

const CallContext = createContext();

// Call states
const CALL_STATES = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  RINGING: 'ringing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDING: 'ending',
  ENDED: 'ended',
  MISSED: 'missed',
  DECLINED: 'declined',
  ERROR: 'error'
};

// Initial state
const initialState = {
  currentCall: null,
  callState: CALL_STATES.IDLE,
  isIncomingCall: false,
  incomingCallData: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isAudioMuted: false,
  isVideoEnabled: true,
  isScreenSharing: false,
  callHistory: [],
  error: null,
  callStats: null,
  isCallModalOpen: false,
  callType: null, // 'voice' or 'video'
};

// Reducer
const callReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CALL_STATE':
      return { ...state, callState: action.payload };
    
    case 'SET_CURRENT_CALL':
      return { ...state, currentCall: action.payload };
    
    case 'SET_INCOMING_CALL':
      return { 
        ...state, 
        isIncomingCall: action.payload.isIncoming,
        incomingCallData: action.payload.data 
      };
    
    case 'SET_LOCAL_STREAM':
      return { ...state, localStream: action.payload };
    
    case 'SET_REMOTE_STREAM':
      return { ...state, remoteStream: action.payload };
    
    case 'SET_PEER_CONNECTION':
      return { ...state, peerConnection: action.payload };
    
    case 'TOGGLE_AUDIO':
      return { ...state, isAudioMuted: !state.isAudioMuted };
    
    case 'TOGGLE_VIDEO':
      return { ...state, isVideoEnabled: !state.isVideoEnabled };
    
    case 'TOGGLE_SCREEN_SHARE':
      return { ...state, isScreenSharing: !state.isScreenSharing };
    
    case 'SET_CALL_HISTORY':
      return { ...state, callHistory: action.payload };
    
    case 'SET_CALL_STATS':
      return { ...state, callStats: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CALL_MODAL_OPEN':
      return { ...state, isCallModalOpen: action.payload };
    
    case 'SET_CALL_TYPE':
      return { ...state, callType: action.payload };
    
    case 'RESET_CALL':
      return {
        ...initialState,
        callHistory: state.callHistory,
        callStats: state.callStats
      };
    
    default:
      return state;
  }
};

// WebRTC configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const CallProvider = ({ children }) => {
  const [state, dispatch] = useReducer(callReducer, initialState);
  const { socket, user, hostName } = useContext(chatContext);

  // Initialize WebRTC
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfiguration);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && state.currentCall) {
        socket.emit('ice-candidate', {
          callId: state.currentCall.callId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      dispatch({ type: 'SET_REMOTE_STREAM', payload: event.streams[0] });
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.CONNECTED });
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    dispatch({ type: 'SET_PEER_CONNECTION', payload: pc });
    return pc;
  };

  // Get user media
  const getUserMedia = async (video = true, audio = true) => {
    try {
      const constraints = { video, audio };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to access camera/microphone' });
      throw error;
    }
  };

  // Initiate a call
  const initiateCall = async (receiverId, conversationId, callType = 'video') => {
    try {
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.INITIATING });
      dispatch({ type: 'SET_CALL_TYPE', payload: callType });
      dispatch({ type: 'SET_CALL_MODAL_OPEN', payload: true });

      // Get user media
      const stream = await getUserMedia(callType === 'video', true);
      
      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit call initiation
      socket.emit('initiate-call', {
        conversationId,
        receiverId,
        callType,
        offer,
      });

      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.RINGING });
    } catch (error) {
      console.error('Error initiating call:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate call' });
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.ERROR });
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    try {
      if (!state.incomingCallData) return;

      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.CONNECTING });
      dispatch({ type: 'SET_CALL_MODAL_OPEN', payload: true });

      const { callId, offer, callType } = state.incomingCallData;

      // Get user media
      const stream = await getUserMedia(callType === 'video', true);
      
      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      socket.emit('answer-call', {
        callId,
        answer,
      });

      dispatch({ type: 'SET_CURRENT_CALL', payload: state.incomingCallData });
      dispatch({ type: 'SET_INCOMING_CALL', payload: { isIncoming: false, data: null } });
    } catch (error) {
      console.error('Error answering call:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to answer call' });
    }
  };

  // Decline incoming call
  const declineCall = () => {
    if (state.incomingCallData) {
      socket.emit('decline-call', {
        callId: state.incomingCallData.callId,
        reason: 'declined',
      });
    }
    dispatch({ type: 'SET_INCOMING_CALL', payload: { isIncoming: false, data: null } });
    dispatch({ type: 'RESET_CALL' });
  };

  // End call
  const endCall = () => {
    if (state.currentCall) {
      socket.emit('end-call', {
        callId: state.currentCall.callId,
        connectionStats: {
          // Add connection stats if needed
        },
      });
    }

    // Clean up streams
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (state.peerConnection) {
      state.peerConnection.close();
    }

    dispatch({ type: 'RESET_CALL' });
    dispatch({ type: 'SET_CALL_MODAL_OPEN', payload: false });
  };

  // Toggle audio
  const toggleAudio = () => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = state.isAudioMuted;
        dispatch({ type: 'TOGGLE_AUDIO' });
        
        if (state.currentCall) {
          socket.emit('toggle-audio', {
            callId: state.currentCall.callId,
            muted: !state.isAudioMuted,
          });
        }
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !state.isVideoEnabled;
        dispatch({ type: 'TOGGLE_VIDEO' });
        
        if (state.currentCall) {
          socket.emit('toggle-video', {
            callId: state.currentCall.callId,
            enabled: !state.isVideoEnabled,
          });
        }
      }
    }
  };

  // Fetch call history
  const fetchCallHistory = async () => {
    try {
      const response = await fetch(`${hostName}/call/history`, {
        headers: {
          'auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      dispatch({ type: 'SET_CALL_HISTORY', payload: data.calls || [] });
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  // Fetch call stats
  const fetchCallStats = async (period = 'week') => {
    try {
      const response = await fetch(`${hostName}/call/stats?period=${period}`, {
        headers: {
          'auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      dispatch({ type: 'SET_CALL_STATS', payload: data.stats });
    } catch (error) {
      console.error('Error fetching call stats:', error);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Setup call handling
    socket.emit('setup-call', user._id);

    // Incoming call
    socket.on('incoming-call', (data) => {
      dispatch({ type: 'SET_INCOMING_CALL', payload: { isIncoming: true, data } });
      dispatch({ type: 'SET_CALL_TYPE', payload: data.callType });
    });

    // Call answered
    socket.on('call-answered', async (data) => {
      if (state.peerConnection) {
        await state.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Call connected
    socket.on('call-connected', () => {
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.CONNECTED });
    });

    // Call declined
    socket.on('call-declined', () => {
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.DECLINED });
      setTimeout(() => {
        dispatch({ type: 'RESET_CALL' });
        dispatch({ type: 'SET_CALL_MODAL_OPEN', payload: false });
      }, 2000);
    });

    // Call ended
    socket.on('call-ended', () => {
      endCall();
    });

    // Call timeout
    socket.on('call-timeout', () => {
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.MISSED });
      setTimeout(() => {
        dispatch({ type: 'RESET_CALL' });
        dispatch({ type: 'SET_CALL_MODAL_OPEN', payload: false });
      }, 2000);
    });

    // ICE candidate
    socket.on('ice-candidate', async (data) => {
      if (state.peerConnection && data.candidate) {
        try {
          await state.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Call error
    socket.on('call-error', (data) => {
      dispatch({ type: 'SET_ERROR', payload: data.error });
      dispatch({ type: 'SET_CALL_STATE', payload: CALL_STATES.ERROR });
    });

    // Peer audio toggle
    socket.on('peer-audio-toggle', (data) => {
      console.log('Peer audio toggled:', data.muted);
    });

    // Peer video toggle
    socket.on('peer-video-toggle', (data) => {
      console.log('Peer video toggled:', data.enabled);
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('call-connected');
      socket.off('call-declined');
      socket.off('call-ended');
      socket.off('call-timeout');
      socket.off('ice-candidate');
      socket.off('call-error');
      socket.off('peer-audio-toggle');
      socket.off('peer-video-toggle');
    };
  }, [socket, user, state.peerConnection]);

  const value = {
    ...state,
    CALL_STATES,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    fetchCallHistory,
    fetchCallStats,
    dispatch,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export default CallContext;