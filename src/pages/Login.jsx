import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLock, FiMail, FiArrowRight, FiShield, FiCheckCircle, FiLoader } = FiIcons;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/portal/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePassportSso = () => {
    logEvent(TELEMETRY_EVENTS.AUTH_EVENT, { method: 'passport_sso' });
    const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `https://passport.axim.us.com?redirect=${redirectUrl}`;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (!supabase) {
      // In offline / mock mode
      localStorage.setItem('axim_demo_session', 'true');
      navigate(redirectTarget, { replace: true });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      logEvent(TELEMETRY_EVENTS.AUTH_EVENT, { method: 'password', emailDomain: email.split('@')[1] });
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.warn("Direct login error:", err);
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem('axim_demo_session', 'true');
    logEvent(TELEMETRY_EVENTS.AUTH_EVENT, { method: 'demo_bypass' });
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-500/50">
          <SafeIcon icon={FiShield} className="text-3xl" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">AXiM Onboard1</h2>
        <p className="mt-2 text-sm text-slate-400 font-medium">Recruiter & Human Capital Management Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-10 px-8 sm:px-10 rounded-[36px] shadow-2xl border border-slate-100 space-y-6">

          {/* Primary SSO Button */}
          <button
            onClick={handlePassportSso}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-900/20 group"
          >
            <SafeIcon icon={FiShield} className="text-lg text-blue-400 group-hover:scale-110 transition-transform" />
            Continue with AXiM Passport (SSO)
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Or email & password
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@axim.us.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <SafeIcon icon={FiLoader} className="animate-spin text-lg" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <SafeIcon icon={FiArrowRight} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Option */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors py-2"
            >
              Enter Preview / Demo Recruiter Portal →
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to Public Job Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
