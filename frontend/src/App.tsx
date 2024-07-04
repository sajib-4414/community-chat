import './App.css';
import Container from './common/Container';
import { Routes, Route } from "react-router-dom";
import { ChatHome } from './pages/ChatHome';
import { Login } from './pages/Login';

function App() {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<ChatHome />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Container>
  );
}

export default App;