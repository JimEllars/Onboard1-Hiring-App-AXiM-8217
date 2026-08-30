import os

filepath = 'src/pages/Login.jsx'
with open(filepath, 'r') as f:
    content = f.read()

new_content = """import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to SSO on mount
    const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `https://passport.axim.us.com?redirect=${redirectUrl}`;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Redirecting to SSO...</h2>
      </div>
    </div>
  );
};

export default Login;
"""

with open(filepath, 'w') as f:
    f.write(new_content)
