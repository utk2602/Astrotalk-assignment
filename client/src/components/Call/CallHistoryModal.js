import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Badge,
  Flex,
  Button,
  Select,
  Divider,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { 
  FaPhone, 
  FaVideo, 
  FaPhoneSlash, 
  FaArrowUp, 
  FaArrowDown,
  FaHistory 
} from 'react-icons/fa';
import { useCall } from '../../context/CallContext';

const CallHistoryModal = ({ isOpen, onClose }) => {
  const { 
    callHistory, 
    fetchCallHistory, 
    callStats, 
    fetchCallStats 
  } = useCall();
  
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('week');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCallHistory(),
        fetchCallStats(period)
      ]);
    } catch (error) {
      console.error('Error loading call data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getCallIcon = (call) => {
    const iconProps = { size: '14px' };
    
    if (call.callType === 'video') {
      return <FaVideo {...iconProps} />;
    }
    return <FaPhone {...iconProps} />;
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'answered':
        return 'green';
      case 'missed':
        return 'red';
      case 'declined':
        return 'orange';
      case 'ended':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getDirectionIcon = (direction) => {
    return direction === 'outgoing' ? (
      <FaArrowUp color="green" size="12px" />
    ) : (
      <FaArrowDown color="blue" size="12px" />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FaHistory />
            <Text>Call History</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {/* Call Statistics */}
          {callStats && (
            <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="lg" fontWeight="bold">Statistics</Text>
                <Select 
                  size="sm" 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)}
                  w="120px"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Select>
              </HStack>
              
              <VStack spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.500">Total Calls</Text>
                  <Text fontWeight="bold">{callStats.totalCalls}</Text>
                </HStack>
                
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.500">Voice Calls</Text>
                  <Text fontWeight="bold">{callStats.voiceCalls}</Text>
                </HStack>
                
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.500">Video Calls</Text>
                  <Text fontWeight="bold">{callStats.videoCalls}</Text>
                </HStack>
                
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.500">Total Duration</Text>
                  <Text fontWeight="bold">{formatDuration(callStats.totalDuration)}</Text>
                </HStack>
                
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.500">Answer Rate</Text>
                  <Text fontWeight="bold">{callStats.answerRate}%</Text>
                </HStack>
              </VStack>
            </Box>
          )}

          <Divider mb={4} />

          {/* Call History List */}
          {loading ? (
            <Center py={8}>
              <Spinner size="lg" />
            </Center>
          ) : callHistory.length === 0 ? (
            <Center py={8}>
              <VStack spacing={3}>
                <FaHistory size="48px" color="gray" />
                <Text color="gray.500">No call history</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={3} align="stretch">
              {callHistory.map((call, index) => {
                const isOutgoing = call.direction === 'outgoing';
                const contact = isOutgoing ? call.receiver : call.caller;
                
                return (
                  <Box key={call._id || index}>
                    <HStack spacing={3} p={3} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                      {/* Contact Avatar */}
                      <Avatar
                        size="sm"
                        src={contact?.profilePic}
                        name={contact?.name}
                      />
                      
                      {/* Call Info */}
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="bold" fontSize="sm">
                            {contact?.name || 'Unknown'}
                          </Text>
                          {getDirectionIcon(call.direction)}
                          {getCallIcon(call)}
                        </HStack>
                        
                        <HStack spacing={2}>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(call.createdAt)}
                          </Text>
                          {call.duration > 0 && (
                            <>
                              <Text fontSize="xs" color="gray.400">•</Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatDuration(call.duration)}
                              </Text>
                            </>
                          )}
                        </HStack>
                      </VStack>
                      
                      {/* Call Status */}
                      <Badge
                        size="sm"
                        colorScheme={getCallStatusColor(call.status)}
                        textTransform="capitalize"
                      >
                        {call.status}
                      </Badge>
                    </HStack>
                    
                    {index < callHistory.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CallHistoryModal;