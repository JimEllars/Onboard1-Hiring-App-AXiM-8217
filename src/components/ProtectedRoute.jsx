import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    // Check for demo bypass session
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('axim_demo_session') === 'true';
    if (isDemo) {
      setSession({ user: { email: 'recruiter@axim.us.com', role: 'Recruiter' } });
      setLoading(false);
      return;
    }

    if (!supabase) {
      // In development / offline without Supabase keys, grant default demo session
      setSession({ user: { email: 'recruiter@axim.us.com', role: 'Recruiter' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (!error && session) {
        setSession(session);
      }
      setLoading(false);
    }).catch(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
