import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Questionnaire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verified = searchParams.get('verified');

  const [formData, setFormData] = useState({
    fit: '',
    challenge: '',
    goals: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Questionnaire payload submitted:", JSON.stringify(formData, null, 2));
    setIsSubmitted(true);
  };

  if (verified !== 'true') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl shadow-slate-200 border border-slate-100">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiAlertCircle} className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Unauthorized or Link Expired</h2>
          <p className="text-slate-500 font-medium mb-8">
            Your verification link is invalid, expired, or you do not have permission to access this page. Please try applying again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Back to Job Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="questionnaire-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-12 md:p-16"
              >
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Screening Questionnaire</h2>
                  <p className="text-slate-500 font-medium">Please answer a few questions to help us understand you better.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-900">1. Why do you believe you are a good fit for this role?</label>
                    <textarea
                      name="fit"
                      value={formData.fit}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Share your thoughts..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-900">2. Describe a recent technical challenge you faced and how you overcame it.</label>
                    <textarea
                      name="challenge"
                      value={formData.challenge}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Explain the challenge..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-900">3. What are your primary career goals over the next few years?</label>
                    <textarea
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Outline your goals..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-8">
                    Submit Answers
                    <SafeIcon icon={FiArrowRight} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="questionnaire-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 text-center"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-50">
                  <SafeIcon icon={FiCheckCircle} className="text-5xl" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Questionnaire Submitted!</h2>
                <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                  Thank you for taking the time to provide your answers. We will review your application and get back to you shortly.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Return to Job Board
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
