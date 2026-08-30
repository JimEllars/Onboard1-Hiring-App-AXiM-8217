import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Add trackVideoUploaded import
imports_pattern = r"import \{ useNavigate, useSearchParams \} from 'react-router-dom';"
new_imports = "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { trackVideoUploaded } from '../lib/telemetry';"
content = content.replace(imports_pattern, new_imports)

# Add trackVideoUploaded call
submit_pattern = r"setIsSubmitted\(true\);"
new_submit = "setIsSubmitted(true);\n      trackVideoUploaded(candidateId);"
content = content.replace(submit_pattern, new_submit)

with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
