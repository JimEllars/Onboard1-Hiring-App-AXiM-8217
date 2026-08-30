import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Make sure trackVideoUploaded is imported and called
if "trackVideoUploaded" not in content:
    content = content.replace("import { useNavigate, useSearchParams } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { trackVideoUploaded } from '../lib/telemetry';")

    submit_pattern = r"setIsSubmitted\(true\);"
    content = re.sub(submit_pattern, "setIsSubmitted(true);\n      trackVideoUploaded(candidateId);", content)

with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
