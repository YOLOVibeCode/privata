import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivataProvider } from './contexts/PrivataContext';
import { ConsentBanner } from '@privata/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { PatientProfile } from './pages/PatientProfile';
import { MedicalHistory } from './pages/MedicalHistory';
import { PrivacyDashboard } from './pages/PrivacyDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivataProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />
              
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/patient/:id" element={
                    <ProtectedRoute>
                      <PatientProfile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/patient/:id/medical" element={
                    <ProtectedRoute>
                      <MedicalHistory />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/privacy" element={
                    <ProtectedRoute>
                      <PrivacyDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              
              <Footer />
              
              {/* Global consent banner */}
              <ConsentBanner 
                privata={window.privata}
                position="bottom"
                theme="light"
                onConsentChange={(consent) => {
                  console.log('Consent updated:', consent);
                }}
              />
              
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </PrivataProvider>
    </QueryClientProvider>
  );
}

export default App;

