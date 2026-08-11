import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Cal, { getCalApi } from '@calcom/embed-react';

const { FiClock, FiVideo } = FiIcons;

const InterviewScheduling = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const candidateId = searchParams.get('candidateId') || '';

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#3b82f6" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Schedule Your Live Interview</h1>
            <p className="text-slate-500 font-medium mt-2">Congratulations! Please select a time that works best for you.</p>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Interview Details</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-100 p-2 rounded-xl text-blue-600">
                      <SafeIcon icon={FiVideo} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Format</p>
                      <p className="text-slate-600 text-sm">Live Video Call (WebRTC)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-purple-100 p-2 rounded-xl text-purple-600">
                      <SafeIcon icon={FiClock} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Duration</p>
                      <p className="text-slate-600 text-sm">45 Minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 min-h-[500px] flex flex-col justify-center text-center shadow-sm">
                <Cal
                  namespace="live-interview"
                  calLink="axim-onboard/live-interview"
                  style={{ width: "100%", height: "100%", overflow: "scroll" }}
                  config={{
                    name: name,
                    email: email,
                    metadata: {
                      candidateId: candidateId
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewScheduling;
