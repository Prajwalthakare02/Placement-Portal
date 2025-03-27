import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import UpdateProfile from './components/UpdateProfile';
import { useSelector } from 'react-redux';
import ResumeUploadForm from './components/ResumeUploadForm';

function App() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    console.log('App component mounted - debugging blank screen');
    console.log('Authentication state:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div className="App">
      {/* Debugging indicator - remove in production */}
      {process.env.NODE_ENV !== 'production' && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: 10, 
            right: 10, 
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '5px 10px', 
            borderRadius: '5px',
            fontSize: '12px'
          }}
        >
          App rendering ✓
        </div>
      )}

      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" />} />
            <Route path="/upload-resume" element={isAuthenticated ? <ResumeUploadForm /> : <Navigate to="/login" />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/update-profile" element={isAuthenticated ? <UpdateProfile /> : <Navigate to="/login" />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
