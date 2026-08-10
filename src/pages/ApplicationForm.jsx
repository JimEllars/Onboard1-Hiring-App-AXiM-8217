import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { supabase } from '../lib/supabaseClient';

const { FiArrowLeft, FiCheck, FiUpload, FiUser, FiMail, FiPhone, FiLinkedin, FiGlobe, FiFileText, FiArrowRight } = FiIcons;

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (step < 2) {
      setStep(step + 1);
    } else {
      if (supabase) {
        try {
          const { error } = await supabase.from('onboard1_candidates').insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            linkedin: formData.linkedin,
            portfolio: formData.portfolio,
            job_id: id,
            stage: 'Screening',
            applied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }]);

          if (error) {
            throw error;
          }

          setIsSubmitted(true);
          setTimeout(() => navigate('/jobs'), 3000);
        } catch (error) {
          console.error("Error inserting candidate:", error);
          setSubmitError("Failed to submit application. Please try again later.");
        }
      } else {
         // Fallback if supabase is not configured
         setIsSubmitted(true);
         setTimeout(() => navigate('/jobs'), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-8">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group"
        >
          <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Jobs
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-12 md:p-16"
              >
                <div className="mb-12">
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Applying for Senior Frontend Engineer</h2>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step {step} of 2</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / 2) * 100}%` }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                      {submitError}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                          <div className="relative">
                            <SafeIcon icon={FiUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                          <div className="relative">
                            <SafeIcon icon={FiMail} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <div className="relative">
                          <SafeIcon icon={FiPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resume / CV</label>
                        <div className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 text-center hover:border-blue-500 transition-all group cursor-pointer bg-slate-50/50">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <SafeIcon icon={FiUpload} className="text-2xl text-blue-600" />
                          </div>
                          <p className="font-bold text-slate-900 mb-1">Click to upload or drag & drop</p>
                          <p className="text-xs text-slate-500 font-medium">PDF, DOCX up to 10MB</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn Profile</label>
                          <div className="relative">
                            <SafeIcon icon={FiLinkedin} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio / Website</label>
                          <div className="relative">
                            <SafeIcon icon={FiGlobe} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="portfolio.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                    {step === 1 ? 'Continue' : 'Submit Application'}
                    <SafeIcon icon={FiArrowRight} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 text-center"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                  <SafeIcon icon={FiCheck} className="text-5xl" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Sent!</h2>
                <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                  Thanks for applying, {formData.name.split(' ')[0] || 'there'}! We've received your application and our team will be in touch within 48 hours.
                </p>
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4 text-left max-w-sm mx-auto">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                    <SafeIcon icon={FiFileText} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Step</p>
                    <p className="text-sm font-bold text-slate-900">Email Confirmation & Task</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
