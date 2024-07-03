import './App.css';
import { ChatHome } from './pages/ChatHome';
import Container from './common/Container';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<ChatHome />} />
      </Routes>
    </Container>
  );
}

export default App;