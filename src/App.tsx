import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Professor from './pages/Professor';
import Record from './pages/Record';
import Download from './pages/Download';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/record" element={<Record />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </Layout>
    </Router>
  );
}
