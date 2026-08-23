import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const JobOffer = () => {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const [docType, setDocType] = useState('W-2');
  const [token, setToken] = useState('');

  const [signature, setSignature] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // When generated from standard flow, token and type should be in URL params
    const tokenParam = searchParams.get('token');
    const typeParam = searchParams.get('type');

    if (tokenParam) setToken(tokenParam);
    if (typeParam) setDocType(typeParam);

    // Check if we already got redirected from a completion event (legacy support)
    const event = searchParams.get('event');
    if (event === 'signing_complete') {
      handleFinalizeHire(candidateId);
      return;
    }
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

  const handleSignDocument = async (e) => {
    e.preventDefault();
    if (!signature.trim()) {
      setError('Please type your full name to sign the document.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = import.meta.env.VITE_API_URL || '';

      // Call sign-offer API
      const signResponse = await fetch(`${baseUrl}/api/sign-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          token,
          signature
        }),
      });

      const signData = await signResponse.json();

      if (!signResponse.ok || !signData.success) {
        throw new Error(signData.error?.message || 'Failed to submit signature');
      }

      // After successful signing, finalize hire
      await handleFinalizeHire(candidateId);

    } catch (err) {
      console.error('Error signing document:', err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            {docType === 'W-2' ? 'W-2 Employment Agreement' : '1099 Independent Contractor Agreement'}
          </h1>
        </div>

        <div className="p-8 prose prose-indigo max-w-none text-gray-700 h-96 overflow-y-auto border-b border-gray-200">
          <p className="text-right text-sm text-gray-500 mb-4">Date: {new Date().toLocaleDateString()}</p>

          <p>This Agreement is entered into between AXiM Corporation ("Company") and the individual electronically signing below ("Candidate").</p>

          {docType === 'W-2' ? (
            <>
              <h3>1. Employment Status</h3>
              <p>Candidate is hired as a W-2 Employee of the Company. Candidate will be subject to all standard employment policies, withholdings, and benefits applicable to full-time employees.</p>

              <h3>2. Compensation</h3>
              <p>Compensation will be provided in accordance with the official offer letter provided to Candidate. Appropriate federal, state, and local taxes will be withheld.</p>

              <h3>3. At-Will Employment</h3>
              <p>Employment with the Company is "at-will," meaning that either Candidate or Company may terminate the employment relationship at any time, with or without cause or advance notice.</p>
            </>
          ) : (
            <>
              <h3>1. Independent Contractor Status</h3>
              <p>Candidate is engaged as an Independent Contractor (1099). Candidate is not an employee, agent, or partner of the Company. Candidate is solely responsible for all taxes, withholdings, and insurance.</p>

              <h3>2. Services & Compensation</h3>
              <p>Candidate shall provide services as described in the applicable Statement of Work. Payment will be made upon completion of milestones or on a schedule as agreed upon, without any tax deductions.</p>

              <h3>3. Term and Termination</h3>
              <p>This agreement shall commence on the date signed and continue until terminated by either party with appropriate notice as specified in the underlying contract documents.</p>
            </>
          )}

          <h3>4. Confidentiality</h3>
          <p>Candidate agrees to maintain the confidentiality of all proprietary business information, trade secrets, and client data belonging to the Company during and after the term of this agreement.</p>

          <p className="font-semibold mt-6">By signing below, you acknowledge that you have read, understood, and agree to the terms set forth above.</p>
        </div>

        <div className="bg-gray-50 px-8 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Electronic Signature Ceremony</h3>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignDocument} className="space-y-4">
            <div>
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                Type your full legal name to sign
              </label>
              <input
                type="text"
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-lg border-gray-300 rounded-md px-4 py-3 font-serif italic"
                placeholder="John Doe"
              />
            </div>

            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>I understand that this constitutes a legally binding electronic signature, capturing timestamp and IP address.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !signature.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              Sign & Accept Offer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobOffer;
