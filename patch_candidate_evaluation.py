import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

# Add active tab state
content = content.replace(
    "const [ratings, setRatings] = useState({",
    "const [activeTab, setActiveTab] = useState('evaluation');\n  const [ratings, setRatings] = useState({"
)

# Imports
content = content.replace(
    "const { FiStar, FiMessageSquare, FiCheck, FiX, FiArrowLeft, FiAlertCircle, FiClock, FiShield } = FiIcons;",
    "const { FiStar, FiMessageSquare, FiCheck, FiX, FiArrowLeft, FiAlertCircle, FiClock, FiShield, FiVideo, FiPlay } = FiIcons;"
)

# Video review tracking function
content = content.replace(
    "const handleRating = (key, val) => {",
    "const handleVideoPlay = () => {\n    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_response_reviewed', candidateId: id });\n  };\n\n  const handleRating = (key, val) => {"
)


tabs_ui = """
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'evaluation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            Evaluation Rubric
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <SafeIcon icon={FiVideo} /> Video Assessment
          </button>
        </div>

        {activeTab === 'video' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative aspect-video flex flex-col justify-end">
               <video
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
                  onPlay={handleVideoPlay}
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
               >
               </video>
               {/* Custom overlay/controls mock */}
               <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                 Response 1 of 5
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <SafeIcon icon={FiMessageSquare} className="text-blue-600" /> Prompt
              </h3>
              <p className="text-slate-700 text-sm">Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team. You have up to 3 minutes.</p>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
               {[1, 2, 3, 4, 5].map(q => (
                 <button key={q} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${q === 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                   Question {q}
                 </button>
               ))}
            </div>
          </div>
        ) : (
          <>
            {/* AI Assist Panel */}
"""

# Replace the start of AI Assist panel to include tabs
ai_assist_pattern = r"(<div className=\"mb-12 bg-indigo-50 border border-indigo-100 rounded-3xl p-8 shadow-sm\">)"
content = re.sub(ai_assist_pattern, tabs_ui.replace("\\", "\\\\"), content, count=1)

# And wrap the bottom UI with the fragment end for evaluation tab
closing_ui_pattern = r"(<div className=\"mt-12 space-y-4\">)"
content = content.replace('<div className="mt-12 space-y-4">', '</>\n        )} \n\n        <div className="mt-12 space-y-4">')

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
