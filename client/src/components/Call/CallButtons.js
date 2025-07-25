import React from 'react';
import {
  IconButton,
  HStack,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaPhone, FaVideo } from 'react-icons/fa';
import { useCall } from '../../context/CallContext';

const CallButtons = ({ receiverId, conversationId, size = 'sm' }) => {
  const { initiateCall, callState, CALL_STATES } = useCall();
  
  const isCallActive = callState !== CALL_STATES.IDLE;
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleVoiceCall = () => {
    if (!isCallActive && receiverId && conversationId) {
      initiateCall(receiverId, conversationId, 'voice');
    }
  };

  const handleVideoCall = () => {
    if (!isCallActive && receiverId && conversationId) {
      initiateCall(receiverId, conversationId, 'video');
    }
  };

  return (
    <HStack spacing={2}>
      <Tooltip label="Voice call" placement="top">
        <IconButton
          size={size}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: hoverBg }}
          icon={<FaPhone />}
          onClick={handleVoiceCall}
          isDisabled={isCallActive}
          aria-label="Start voice call"
        />
      </Tooltip>
      
      <Tooltip label="Video call" placement="top">
        <IconButton
          size={size}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: hoverBg }}
          icon={<FaVideo />}
          onClick={handleVideoCall}
          isDisabled={isCallActive}
          aria-label="Start video call"
        />
      </Tooltip>
    </HStack>
  );
};

export default CallButtons;