import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trackVideoUploaded } from '../lib/telemetry';
import SafeIcon from '../common/SafeIcon';

const { FiVideo, FiMic, FiSettings, FiCheckCircle, FiPlay, FiSquare, FiAlertCircle } = FiIcons;

const AsyncVideoInterview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const recordedChunksRef = useRef([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const PROMPTS = [
    { title: "Introduction", text: "Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team. You have up to 3 minutes." },
    { title: "Technical Background", text: "Describe a challenging technical problem you've solved recently. What was your approach and what did you learn?" },
    { title: "Problem Solving", text: "Tell us about a time you had to learn a new technology or tool quickly to complete a project." },
    { title: "Collaboration", text: "Describe a situation where you had a disagreement with a team member. How did you resolve it?" },
    { title: "Career Goals", text: "Where do you see yourself in 3-5 years, and how does this role align with your goals?" }
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState({});


  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract candidateId and token from searchParams, fallback if omitted
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const token = searchParams.get('token');

  useEffect(() => {
    let active = true;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!active) return;

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermissions(true);
      } catch (err) {
        console.error('Error accessing media devices.', err);
        if (active) {
          setHasPermissions(false);
          setErrorMsg('Camera and microphone permissions were denied or are unavailable. Please allow access to proceed.');
        }
      }
    };

    initMedia();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleDataAvailable = async (event) => {
    if (event.data && event.data.size > 0) {
      const currentChunkIndex = chunkIndexRef.current++;
      const blob = event.data;
      recordedChunksRef.current.push(blob);

      try {
        // 1. Fetch Presigned URL
        const res = await fetch('/api/get-video-upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId,

            chunkIndex: currentChunkIndex,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch presigned URL');
        }

        const { uploadUrl, key } = await res.json();

        // 2. Upload Chunk to S3
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/webm',
          },
          body: blob,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload chunk to S3');
        }

        console.log(`Successfully uploaded chunk ${currentChunkIndex} to ${key}`);
      } catch (error) {
        console.error('Chunk upload error:', error);
        stopRecording();
        alert('A network error occurred while uploading your video chunk. Recording has been paused.');
        // Note: For a real app we might want to alert the user or retry here
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunkIndexRef.current = 0;
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);

    // We try multiple mime types since support varies by browser
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    let options = null;
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        options = { mimeType };
        break;
      }
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, options || undefined);

    mediaRecorder.ondataavailable = handleDataAvailable;

    mediaRecorder.start(5000); // 5-second chunks
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setHasRecorded(false);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);
      // Create local video URL for preview
      setTimeout(() => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(fullBlob);
        setRecordedVideoUrl(videoUrl);
      }, 500);

    }
  };

  const handleSubmit = async () => {
    // If not the last question, go to the next one
    if (currentPromptIndex < PROMPTS.length - 1) {
      setRecordedAnswers(prev => ({ ...prev, [currentPromptIndex]: recordedVideoUrl }));
      setCurrentPromptIndex(prev => prev + 1);

      // Reset state for next question
      setHasRecorded(false);
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      return;
    }

    // It is the last question, submit everything
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,

          token
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit video');
      }

      setIsSubmitted(true);
      trackVideoUploaded(candidateId);

      // Dispatch event for Dashboard sync
      window.dispatchEvent(new CustomEvent('candidate-stage-updated', {
        detail: { candidateId,
 newStage: 'Interview Review' }
      }));

      // Wait for a few seconds to show the success message, then navigate to next step
      setTimeout(() => {
        navigate('/apply/schedule');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      // Optional: Handle error UI
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Video Assessment</h1>
                <p className="text-slate-500 font-medium mt-2">Question {currentPromptIndex + 1} of {PROMPTS.length}: {PROMPTS[currentPromptIndex].title}</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button className="p-3 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all">
                  <SafeIcon icon={FiSettings} className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-8 md:p-12 bg-slate-50/50">
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-8 flex gap-4">
                <SafeIcon icon={FiAlertCircle} className="text-blue-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Prompt:</h3>
                  <p className="text-slate-700 mt-1">Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team. You have up to 3 minutes.</p>
                </div>
              </div>

              <div className="relative aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-100 flex items-center justify-center">
                {/* Actual video feed */}
                {hasRecorded && recordedVideoUrl ? (
                  <video
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}
                {hasPermissions === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-slate-900 z-10 px-6 text-center">
                    <SafeIcon icon={FiAlertCircle} className="text-6xl mb-4 opacity-80" />
                    <p className="font-medium text-sm">{errorMsg}</p>
                  </div>
                )}

                {/* Recording Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-6 left-6 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-50 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black tracking-widest uppercase">Recording</span>
                  </div>
                )}

                <div className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-black tracking-widest">
                  00:00 / 03:00
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                {!isRecording && !hasRecorded ? (
                  <button
                    onClick={startRecording} disabled={!hasPermissions}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                  >
                    <SafeIcon icon={FiPlay} /> Start Recording
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                  >
                    <SafeIcon icon={FiSquare} /> Stop Recording
                  </button>
                ) : (
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => { setHasRecorded(false); setRecordedVideoUrl(null); recordedChunksRef.current = []; if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                    >
                      <SafeIcon icon={FiCheckCircle} /> {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-center items-center gap-8 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiVideo} className={hasPermissions ? "text-emerald-500" : "text-slate-400"} />
                Camera Access: <span className="text-slate-900 font-bold">{hasPermissions === true ? 'Granted' : hasPermissions === false ? 'Denied' : 'Checking...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiMic} className={hasPermissions ? "text-emerald-500" : "text-slate-400"} />
                Mic Access: <span className="text-slate-900 font-bold">{hasPermissions === true ? 'Granted' : hasPermissions === false ? 'Denied' : 'Checking...'}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden p-12 text-center flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <SafeIcon icon={FiCheckCircle} className="text-emerald-600 text-5xl" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Video Submitted!</h2>
            <p className="text-slate-600 text-lg mb-8">
              Your video assessment has been successfully uploaded and is now under review.
            </p>
            <div className="flex items-center gap-3 text-slate-500 font-medium">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              Preparing next step...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AsyncVideoInterview;
