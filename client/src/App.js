import "./App.css";
import { useColorMode } from "@chakra-ui/react";
import Navbar from "./components/Navbar/Navbar";
import { useContext } from "react";
import chatContext from "./context/chatContext";
import CallModal from "./components/Call/CallModal";
import IncomingCallNotification from "./components/Call/IncomingCallNotification";
// ← REMOVE: import { CallProvider } from "./context/CallContext";
// ← REMOVE: import ChatState from "./context/appState";

function App(props) {
  const { toggleColorMode } = useColorMode();
  const context = useContext(chatContext);

  return (
    <div className="App">
      {/* ← REMOVE CallProvider wrapper - it's now in index.js */}
      <Navbar toggleColorMode={toggleColorMode} context={context} />
      <CallModal />
      <IncomingCallNotification />
    </div>
  );
}

export default App;