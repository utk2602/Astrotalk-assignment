import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  Flex,
  Button,
  Text,
  Avatar,
  Circle,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  PhoneIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhone,
  FaPhoneSlash,
} from 'react-icons/fa';
import { useCall } from '../../context/CallContext';

const CallModal = () => {
  const {
    isCallModalOpen,
    callState,
    currentCall,
    incomingCallData,
    isIncomingCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoEnabled,
    callType,
    CALL_STATES,
    answerCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getCallStateText = () => {
    switch (callState) {
      case CALL_STATES.INITIATING:
        return 'Initiating call...';
      case CALL_STATES.RINGING:
        return 'Ringing...';
      case CALL_STATES.CONNECTING:
        return 'Connecting...';
      case CALL_STATES.CONNECTED:
        return 'Connected';
      case CALL_STATES.ENDING:
        return 'Ending call...';
      case CALL_STATES.DECLINED:
        return 'Call declined';
      case CALL_STATES.MISSED:
        return 'Call missed';
      case CALL_STATES.ERROR:
        return 'Call failed';
      default:
        return '';
    }
  };

  const getCallData = () => {
    return isIncomingCall ? incomingCallData : currentCall;
  };

  const callData = getCallData();

  if (!isCallModalOpen || !callData) {
    return null;
  }

  const isVideoCall = callType === 'video';
  const showVideo = isVideoCall && callState === CALL_STATES.CONNECTED;

  return (
    <Modal
      isOpen={isCallModalOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent
        bg={showVideo ? 'black' : bgColor}
        color={showVideo ? 'white' : 'inherit'}
        m={0}
        borderRadius={0}
      >
        <ModalBody p={0} h="100vh" position="relative">
          {/* Video Call Interface */}
          {showVideo && (
            <>
              {/* Remote Video (Main) */}
              <Box position="absolute" top={0} left={0} w="100%" h="100%">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: 'black',
                  }}
                />
              </Box>

              {/* Local Video (Picture in Picture) */}
              <Box
                position="absolute"
                top={4}
                right={4}
                w="200px"
                h="150px"
                borderRadius="lg"
                overflow="hidden"
                border="2px solid white"
                bg="black"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror effect
                  }}
                />
              </Box>
            </>
          )}

          {/* Voice Call / Pre-connection Interface */}
          {!showVideo && (
            <VStack
              justify="center"
              align="center"
              h="100%"
              spacing={8}
              p={8}
              bg={bgColor}
            >
              <VStack spacing={4}>
                <Avatar
                  size="2xl"
                  src={callData.caller?.profilePic || callData.profilePic}
                  name={callData.caller?.name || callData.name}
                />
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {callData.caller?.name || callData.name}
                  </Text>
                  <Text fontSize="lg" color="gray.500">
                    {getCallStateText()}
                  </Text>
                  <Text fontSize="md" color="gray.400">
                    {isVideoCall ? 'Video Call' : 'Voice Call'}
                  </Text>
                </VStack>
              </VStack>

              {/* Call Duration Timer (when connected) */}
              {callState === CALL_STATES.CONNECTED && (
                <CallTimer />
              )}
            </VStack>
          )}

          {/* Call Controls */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={6}
            bg={showVideo ? 'blackAlpha.700' : 'transparent'}
            backdropFilter={showVideo ? 'blur(10px)' : 'none'}
          >
            {/* Incoming Call Controls */}
            {isIncomingCall && callState !== CALL_STATES.CONNECTED && (
              <HStack justify="center" spacing={12}>
                <IconButton
                  size="lg"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  _hover={{ bg: 'red.600' }}
                  icon={<FaPhoneSlash />}
                  onClick={declineCall}
                  aria-label="Decline call"
                />
                <IconButton
                  size="lg"
                  borderRadius="full"
                  bg="green.500"
                  color="white"
                  _hover={{ bg: 'green.600' }}
                  icon={<FaPhone />}
                  onClick={answerCall}
                  aria-label="Answer call"
                />
              </HStack>
            )}

            {/* Active Call Controls */}
            {!isIncomingCall && callState === CALL_STATES.CONNECTED && (
              <HStack justify="center" spacing={6}>
                <IconButton
                  size="lg"
                  borderRadius="full"
                  bg={isAudioMuted ? 'red.500' : 'gray.600'}
                  color="white"
                  _hover={{ bg: isAudioMuted ? 'red.600' : 'gray.700' }}
                  icon={isAudioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  onClick={toggleAudio}
                  aria-label={isAudioMuted ? 'Unmute' : 'Mute'}
                />
                
                {isVideoCall && (
                  <IconButton
                    size="lg"
                    borderRadius="full"
                    bg={!isVideoEnabled ? 'red.500' : 'gray.600'}
                    color="white"
                    _hover={{ bg: !isVideoEnabled ? 'red.600' : 'gray.700' }}
                    icon={!isVideoEnabled ? <FaVideoSlash /> : <FaVideo />}
                    onClick={toggleVideo}
                    aria-label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                  />
                )}

                <IconButton
                  size="lg"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  _hover={{ bg: 'red.600' }}
                  icon={<FaPhoneSlash />}
                  onClick={endCall}
                  aria-label="End call"
                />
              </HStack>
            )}

            {/* Outgoing Call Controls */}
            {!isIncomingCall && callState !== CALL_STATES.CONNECTED && (
              <HStack justify="center" spacing={6}>
                <IconButton
                  size="lg"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  _hover={{ bg: 'red.600' }}
                  icon={<FaPhoneSlash />}
                  onClick={endCall}
                  aria-label="End call"
                />
              </HStack>
            )}
          </Box>

          {/* Call State Overlay */}
          {callState === CALL_STATES.CONNECTING && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.800"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={4}>
                <Circle size="60px" bg="purple.500">
                  <PhoneIcon boxSize={6} color="white" />
                </Circle>
                <Text color="white" fontSize="lg">
                  Connecting...
                </Text>
              </VStack>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Call Timer Component
const CallTimer = () => {
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Text fontSize="xl" fontWeight="bold" color="purple.500">
      {formatDuration(duration)}
    </Text>
  );
};

export default CallModal;