import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

content = content.replace("const handleRating = (key, value) => {", "const handleVideoPlay = () => {\n    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_response_reviewed', candidateId: id });\n  };\n\n  const handleRating = (key, value) => {")

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
