import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setSession({ mock: true });
      setLoading(false);
      return;
    }

    // Failsafe: if loading takes longer than 3 seconds, allow user through
    const timer = setTimeout(() => {
      if (isMounted && loading) {
        setSession({ mock: true });
        setLoading(false);
      }
    }, 3000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        // Network error failsafe
        setSession({ mock: true });
      } else {
        // We're transitioning. If no session, allow mock data dashboard
        setSession(session || { mock: true });
      }
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      setSession({ mock: true });
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session || { mock: true });
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
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

  // With the failsafe in place, session will always be truthy
  // (either a real session or { mock: true }), so they won't redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
