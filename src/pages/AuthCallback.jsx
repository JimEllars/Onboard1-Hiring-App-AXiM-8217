import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token && supabase) {
        // Hydrate session from token (simplified mapping, usually would exchange token or use directly)
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token // This would typically be a separate refresh token
        });

        if (error) {
           console.error("Auth hydration failed:", error);
        }
      }

      // Clean the URL and redirect to dashboard
      window.history.replaceState({}, document.title, '/portal/dashboard');
      navigate('/portal/dashboard', { replace: true });
    };

    handleAuth();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-900">Completing login...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
