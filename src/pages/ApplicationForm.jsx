import React, { useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardData } from '../hooks/useOnboardData';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { logEvent } from '../lib/telemetry';

const {
  FiArrowLeft, FiCheck, FiUpload, FiUser, FiMail,
  FiPhone, FiLinkedin, FiGlobe, FiFileText, FiArrowRight,
  FiLoader, FiX, FiCheckCircle
} = FiIcons;

const ApplicationForm = () => {
  const { id } = useParams();
  const { jobs } = useOnboardData();
  const targetJob = jobs.find(j => String(j.id) === String(id)) || {
    title: 'Open Position',
    dept: 'General',
    location: 'Remote'
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Resume Upload State
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeMeta, setResumeMeta] = useState(null); // { resumeUrl, resumeName, fileSize }
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [magicLinkToken, setMagicLinkToken] = useState(null);
  const [submittedCandidateId, setSubmittedCandidateId] = useState(null);

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

  const uploadResume = async (file) => {
    if (!file) return null;
    setIsUploadingResume(true);
    setSubmitError(null);

    const body = new FormData();
    body.append("resume", file);

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload resume");
      }
      setResumeMeta(data.data);
      return data.data;
    } catch (err) {
      console.warn("Resume upload endpoint error, creating local fallback reference:", err);
      const fallbackMeta = {
        resumeUrl: URL.createObjectURL(file),
        resumeName: file.name,
        fileSize: file.size
      };
      setResumeMeta(fallbackMeta);
      return fallbackMeta;
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      await uploadResume(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResumeFile(file);
      await uploadResume(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeResume = (e) => {
    e.stopPropagation();
    setResumeFile(null);
    setResumeMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (step < 2) {
      logEvent('application_step_1_completed', { jobId: id });
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    logEvent('application_submitted', { jobId: id, emailDomain: formData.email.split('@')[1] });

    let finalResumeMeta = resumeMeta;
    if (resumeFile && !finalResumeMeta) {
      finalResumeMeta = await uploadResume(resumeFile);
    }

    const applicationPayload = {
      referralCode: referralCode || null,
      candidateEmail: formData.email,
      jobId: id,
      resumeUrl: finalResumeMeta?.resumeUrl || null,
      resumeName: finalResumeMeta?.resumeName || null,
      candidateData: {
        name: formData.name,
        phone: formData.phone,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        resume_url: finalResumeMeta?.resumeUrl || null,
        resume_name: finalResumeMeta?.resumeName || null,
        stage: 'Screening',
        applied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        referral_code: referralCode,
        referrer_id: referralCode
      }
    };

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationPayload)
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Failed to submit application');
      }

      if (resData.data?.token) {
        setMagicLinkToken(resData.data.token);
      }
      if (resData.data?.candidateId) {
        setSubmittedCandidateId(resData.data.candidateId);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmitError(error.message || "There was an issue submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-8">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate('/jobs')} 
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
                className="p-10 md:p-14"
              >
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        {targetJob.dept}
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                        Applying for {targetJob.title}
                      </h2>
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Step {step} of 2
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / 2) * 100}%` }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                      {submitError}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                        <div className="relative">
                          <SafeIcon icon={FiUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                          <input 
                            required 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            type="text" 
                            placeholder="Alex Morgan" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                        <div className="relative">
                          <SafeIcon icon={FiMail} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                          <input 
                            required 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            type="email" 
                            placeholder="alex.morgan@example.com" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <div className="relative">
                          <SafeIcon icon={FiPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                          <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            placeholder="+1 (555) 234-5678" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900" 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Resume / Curriculum Vitae
                        </label>

                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileSelect} 
                          accept=".pdf,.doc,.docx" 
                          className="hidden" 
                        />

                        {!resumeFile ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`border-4 border-dashed rounded-[32px] p-10 text-center transition-all group cursor-pointer ${
                              isDragging 
                                ? 'border-blue-600 bg-blue-50/50 scale-[1.01]' 
                                : 'border-slate-200 hover:border-blue-500 bg-slate-50/50'
                            }`}
                          >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <SafeIcon icon={FiUpload} className="text-2xl text-blue-600" />
                            </div>
                            <p className="font-black text-slate-900 mb-1">Click to select or drag & drop resume</p>
                            <p className="text-xs text-slate-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
                          </div>
                        ) : (
                          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                {isUploadingResume ? (
                                  <SafeIcon icon={FiLoader} className="text-xl animate-spin" />
                                ) : (
                                  <SafeIcon icon={FiFileText} className="text-xl" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{resumeFile.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • {isUploadingResume ? 'Uploading...' : 'Ready to submit'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeResume}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                              title="Remove file"
                            >
                              <SafeIcon icon={FiX} className="text-lg" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn Profile</label>
                          <div className="relative">
                            <SafeIcon icon={FiLinkedin} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input 
                              type="url" 
                              name="linkedin" 
                              value={formData.linkedin} 
                              onChange={handleInputChange} 
                              placeholder="linkedin.com/in/..." 
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 text-sm" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio / Website</label>
                          <div className="relative">
                            <SafeIcon icon={FiGlobe} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input 
                              type="url" 
                              name="portfolio" 
                              value={formData.portfolio} 
                              onChange={handleInputChange} 
                              placeholder="https://..." 
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting || isUploadingResume}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <SafeIcon icon={FiLoader} className="animate-spin text-xl" />
                        Submitting Application...
                      </>
                    ) : step === 1 ? (
                      <>
                        Continue to Step 2
                        <SafeIcon icon={FiArrowRight} />
                      </>
                    ) : (
                      <>
                        Submit Application
                        <SafeIcon icon={FiCheck} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 md:p-16 text-center"
              >
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-50">
                  <SafeIcon icon={FiCheckCircle} className="text-5xl" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Received!</h2>
                <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed max-w-lg mx-auto">
                  Thank you for applying, {formData.name.split(' ')[0] || 'there'}! A secure verification link has been issued.
                </p>

                {magicLinkToken && (
                  <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200 max-w-md mx-auto text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-2">
                      <SafeIcon icon={FiCheck} /> Direct Verification Ready
                    </p>
                    <p className="text-xs text-slate-600 mb-4 font-medium">
                      You can proceed immediately to the screening questionnaire:
                    </p>
                    <button
                      onClick={() => navigate(`/apply/questionnaire?verified=true&candidateId=${submittedCandidateId || ''}&token=${magicLinkToken}`)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Proceed to Questionnaire <SafeIcon icon={FiArrowRight} />
                    </button>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="px-8 py-3.5 bg-slate-100 text-slate-900 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    Return to Jobs
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
