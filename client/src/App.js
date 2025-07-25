import "./App.css";
import { useColorMode } from "@chakra-ui/react";
import Navbar from "./components/Navbar/Navbar";
import ChatState from "./context/appState";
import { CallProvider } from "./context/CallContext";
import { useContext } from "react";
import chatContext from "./context/chatContext";
import CallModal from "./components/Call/CallModal";
import IncomingCallNotification from "./components/Call/IncomingCallNotification";

function App(props) {
  const { toggleColorMode } = useColorMode();
  const context = useContext(chatContext);

  return (
    <div className="App">
      <CallProvider>
        <Navbar toggleColorMode={toggleColorMode} context={context} />
        <CallModal />
        <IncomingCallNotification />
      </CallProvider>
    </div>
  );
}

export default App;