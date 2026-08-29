import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

# I messed up the definition of handleVideoPlay it seems, I added it outside the component body.
content = content.replace("const handleVideoPlay = () => {\n    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_response_reviewed', candidateId: id });\n  };\n\n  const handleRating = (key, val) => {", "const handleRating = (key, val) => {")


# add inside component
content = content.replace("const handleRating = (key, val) => {", "const handleVideoPlay = () => {\n    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_response_reviewed', candidateId: id });\n  };\n\n  const handleRating = (key, val) => {")

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
