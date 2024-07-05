import './App.css';
import Container from './common/Container';
import { Routes, Route } from "react-router-dom";
import { ChatHome } from './pages/ChatHome';
import { Login } from './pages/Login';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Register } from './pages/Register';
function App() {
  return (
    <Provider store={store}>
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="" element={<ChatHome />} />
        </Routes>
      </Container>
    </Provider>
  );
}

export default App;