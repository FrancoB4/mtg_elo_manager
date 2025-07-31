import React, { JSX, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { PlayersList } from './pages/Players/PlayersList';
import { TournamentsPage } from './pages/Tournaments';
import { TournamentDetailPage } from './pages/Tournaments/TournamentDetailPage';
import { AuthProvider } from './hooks/authHook';
import authMiddleware from './middlewares/authMiddleware';
import { ToastContainer } from './components/ui/ToastContainer';

function App(): JSX.Element {
  useEffect(() => {
    // Setup auth middleware on app start
    authMiddleware.setupInterceptor();
    
    return () => {
      // Cleanup on unmount
      authMiddleware.removeInterceptor();
    };
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/players" element={<PlayersList />} />
              <Route path="/rankings" element={<PlayersList />} />
              <Route path="/rankings/global" element={<PlayersList />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
              <Route path="/tournaments/:id/rankings" element={<PlayersList />} />
              <Route path="/leagues/:id/rankings" element={<PlayersList />} />
            </Routes>
          </main>
          {/* Toast Container para notificaciones globales */}
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;