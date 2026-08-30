import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Fix the useSearchParams import and addition
imports_pattern = r"import \{ useNavigate \} from 'react-router-dom';"
if "useSearchParams" not in content:
    content = content.replace(imports_pattern, "import { useNavigate, useSearchParams } from 'react-router-dom';")

candidate_pattern = r"  const navigate = useNavigate\(\);\n\n  // We need a dummy candidate ID for this sprint if we don't have one in context\n  const candidateId = 'candidate-123';"
new_candidate = """  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract candidateId and token from searchParams, fallback if omitted
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const token = searchParams.get('token');"""

content = re.sub(candidate_pattern, new_candidate, content)

with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
