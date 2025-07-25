import React, { useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
  HStack,
  VStack,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { useCall } from '../../context/CallContext';

// Bounce animation for incoming call
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
`;

// Ring animation
const ring = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
`;

const IncomingCallNotification = () => {
  const {
    isIncomingCall,
    incomingCallData,
    answerCall,
    declineCall,
    callType,
  } = useCall();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('md', 'dark-lg');

  // Auto-hide notification after 30 seconds
  useEffect(() => {
    if (isIncomingCall) {
      const timer = setTimeout(() => {
        declineCall();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isIncomingCall, declineCall]);

  if (!isIncomingCall || !incomingCallData) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={9999}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow={shadowColor}
      p={4}
      w="320px"
      animation={`${bounce} 2s infinite`}
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Text fontSize="sm" fontWeight="bold" color="purple.500">
            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
          </Text>
          <Box position="relative">
            <Box
              position="absolute"
              w="40px"
              h="40px"
              borderRadius="full"
              border="2px solid"
              borderColor="green.400"
              animation={`${ring} 1.5s infinite`}
            />
            <FaPhone color="green.400" size="16px" />
          </Box>
        </Flex>

        {/* Caller Info */}
        <Flex align="center" spacing={3}>
          <Avatar
            size="md"
            src={incomingCallData.caller?.profilePic}
            name={incomingCallData.caller?.name}
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
              {incomingCallData.caller?.name || 'Unknown'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {callType === 'video' ? 'wants to video chat' : 'is calling you'}
            </Text>
          </VStack>
        </Flex>

        {/* Action Buttons */}
        <HStack spacing={3} justify="center">
          <IconButton
            size="lg"
            borderRadius="full"
            bg="red.500"
            color="white"
            _hover={{ bg: 'red.600' }}
            icon={<FaPhoneSlash />}
            onClick={declineCall}
            aria-label="Decline call"
            flex={1}
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
            flex={1}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncomingCallNotification;