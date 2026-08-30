import re

with open('src/pages/CandidateProgress.jsx', 'r') as f:
    content = f.read()

# Make sure candidate_portal_viewed telemetry event is being logged in CandidateProgress.jsx
telemetry_pattern = r"logEvent\(TELEMETRY_EVENTS\.CANDIDATE_STEPPER_VIEWED \|\| 'candidate_stepper_viewed'"
content = re.sub(telemetry_pattern, "logEvent('candidate_portal_viewed'", content)

with open('src/pages/CandidateProgress.jsx', 'w') as f:
    f.write(content)
