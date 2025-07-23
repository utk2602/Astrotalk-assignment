import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ChatPage from '../features/chat/ChatPage';
import AIChatPage from '../features/ai-chat/AIChatPage';
import ProfileView from '../features/profile/ProfileView';
import ProfileEdit from '../features/profile/ProfileEdit';
import AstrologerList from '../features/astrologers/AstrologerList';
import CallUI from '../features/calls/CallUI';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/ai-chat" element={<AIChatPage />} />
      <Route path="/profile/:id" element={<ProfileView />} />
      <Route path="/edit-profile" element={<ProfileEdit />} />
      <Route path="/astrologers" element={<AstrologerList />} />
      <Route path="/call" element={<CallUI />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 