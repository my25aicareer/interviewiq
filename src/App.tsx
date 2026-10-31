import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import ComingSoonPage from '@/pages/ComingSoonPage';
import InterviewPage from '@/pages/InterviewPage';
import LandingPage from '@/pages/LandingPage';
import PreparePage from '@/pages/PreparePage';
import ResultsPage from '@/pages/ResultsPage';

function App() { 
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prepare" element={<PreparePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/history" element={<ComingSoonPage title="Session History" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
