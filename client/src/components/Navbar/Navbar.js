import React, { useContext, useState } from "react";
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  Link, 
  useDisclosure,
  IconButton,
  Tooltip 
} from "@chakra-ui/react";
import { FaGithub, FaMoon, FaSun, FaHistory } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import chatContext from "../../context/chatContext";
import CallHistoryModal from "../Call/CallHistoryModal";

const Navbar = (props) => {
  const context = useContext(chatContext);
  const { isAuthenticated } = context;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isCallHistoryOpen, 
    onOpen: onCallHistoryOpen, 
    onClose: onCallHistoryClose 
  } = useDisclosure();
  
  const colormode = localStorage.getItem("chakra-ui-color-mode");
  const [icon, seticon] = useState(
    colormode === "dark" ? <FaSun /> : <FaMoon />
  );

  const path = window.location.pathname;

  const handleToggle = () => {
    if (colormode === "dark") {
      seticon(<FaMoon />);
      props.toggleColorMode();
    } else {
      seticon(<FaSun />);
      props.toggleColorMode();
    }
  };

  return (
    <>
      {!path.includes("dashboard") && (
        <Box
          position={"absolute"}
          top={5}
          left={5}
          display={{
            md: "none",
            base: "flex",
          }}
        >
          <Button
            p={3}
            borderRadius={"full"}
            borderWidth={1}
            fontSize={"small"}
            backgroundColor={"transparent"}
            onClick={handleToggle}
            mx={1}
          >
            {icon}
          </Button>
          <Link
            p={3}
            borderRadius={"full"}
            borderWidth={1}
            fontSize={"small"}
            backgroundColor={"transparent"}
            href="https://github.com/pankil-soni"
            mx={1}
          >
            <FaGithub />
          </Link>
        </Box>
      )}
      <Box
        p={3}
        w={{ base: "94vw", md: "99vw" }}
        m={2}
        borderRadius="10px"
        borderWidth="2px"
        display={{
          base: "none",
          md: "block",
        }}
      >
        <Flex justify={"space-between"}>
          <Text fontSize="2xl">Conversa</Text>

          <Box
            display={{ base: "none", md: "block" }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              onClick={handleToggle}
              mr={2}
              borderRadius={"full"}
              borderWidth={1}
              fontSize={"small"}
              backgroundColor={"transparent"}
              p={3}
            >
              {icon}
            </Button>
            <Button
              borderRadius={"full"}
              borderWidth={1}
              fontSize={"small"}
              backgroundColor={"transparent"}
              p={3}
              mr={2}
              onClick={() => {
                window.open("https://github.com/utk2602");
              }}
            >
              <FaGithub />
            </Button>
            
            {/* Call History Button */}
            {isAuthenticated && (
              <Tooltip label="Call History" placement="bottom">
                <IconButton
                  borderRadius={"full"}
                  borderWidth={1}
                  fontSize={"small"}
                  backgroundColor={"transparent"}
                  p={3}
                  mr={2}
                  icon={<FaHistory />}
                  onClick={onCallHistoryOpen}
                  aria-label="Call History"
                />
              </Tooltip>
            )}
            
            {isAuthenticated && (
              <ProfileMenu isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
            )}
          </Box>
        </Flex>
      </Box>

      {/* Call History Modal */}
      <CallHistoryModal 
        isOpen={isCallHistoryOpen} 
        onClose={onCallHistoryClose} 
      />
    </>
  );
};

export default Navbar;