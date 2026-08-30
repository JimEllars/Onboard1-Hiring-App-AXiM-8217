import os

filepath = 'src/components/ProtectedRoute.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace the failsafe logic with correct redirection
new_content = """import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (!error && session) {
        setSession(session);
      }
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `https://passport.axim.us.com?redirect=${redirectUrl}`;
    return null;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
"""

with open(filepath, 'w') as f:
    f.write(new_content)
