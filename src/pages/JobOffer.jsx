import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const JobOffer = () => {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const [signingUrl, setSigningUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if redirected back from DocuSign with completion event
    const event = searchParams.get('event');
    if (event === 'signing_complete') {
      handleFinalizeHire(candidateId);
      return;
    }


    const fetchSigningUrl = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${baseUrl}/api/generate-offer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ candidateId, templateId: localStorage.getItem("docusign_template_id_w2") }),
        });

        const data = await response.json();

        if (response.status === 503 || data.error?.code === 'SERVICE_UNAVAILABLE') {
          setError('Service Unavailable. Please contact support.');
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to generate offer');
        }

        setSigningUrl(data.data.signingUrl);
      } catch (err) {
        console.error('Error fetching signing url:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSigningUrl();
  }, [candidateId, searchParams]);

  const handleFinalizeHire = async (id) => {
    try {
      setIsLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || '';
      await fetch(`${baseUrl}/api/finalize-hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: id })
      });
    } catch (err) {
      console.error('Error finalizing hire:', err);
    } finally {
      setIsComplete(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Listener for messages from iframe if using postMessage
    const handleMessage = (event) => {
      // In embedded signing without redirects, DocuSign can send postMessage
      // But standard returnUrl redirects the iframe. We'll handle both.
      if (event.data && event.data.type === 'docusign_signing_complete') {
        handleFinalizeHire(candidateId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4"
      >
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AXiM!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your offer has been successfully signed. We are thrilled to have you join the team!
          </p>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 text-sm text-left">
            <p className="font-semibold mb-2">Next Steps:</p>
            <p>Your candidate profile has been finalized and successfully pushed to AgentView and the Training System.</p>
            <p className="mt-2">Check your email for your temporary portal access instructions.</p>
          </div>
          <button
            onClick={() => window.location.href = 'https://agentview.axim.com'}
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full mb-3"
          >
            Access AgentView Portal
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full"
          >
            Go to Homepage
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-xl font-semibold text-gray-800">Review & Sign Your Offer</h1>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 flex flex-col">
        {signingUrl && (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden relative">
            <iframe
              src={signingUrl}
              title="DocuSign Embedded Signing"
              className="absolute inset-0 w-full h-full border-0"
              allow="camera; microphone; geolocation" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default JobOffer;
