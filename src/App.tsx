import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, RequireAuth } from '@/components/AuthRoutes';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import ComingSoonPage from '@/pages/ComingSoonPage';
import InterviewPage from '@/pages/InterviewPage';
import LandingPage from '@/pages/LandingPage';
import PreparePage from '@/pages/PreparePage';
import ResultsPage from '@/pages/ResultsPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import HistoryPage from '@/pages/HistoryPage';

function App() { 
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/prepare" element={<PreparePage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/results/:sessionId" element={<ResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
