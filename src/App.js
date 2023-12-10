import logo from './logo.svg';
import './App.css';
import Home from './pages/Home.js'
import Registration from './pages/Registration';
import Login from './pages/Login';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </Router>
  );
}

export default App;
