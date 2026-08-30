import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Make sure token is declared inside the component, we see it wasn't there
if "const token = searchParams.get('token');" not in content:
    content = content.replace("  const candidateId = searchParams.get('candidateId') || 'candidate-123';", "  const candidateId = searchParams.get('candidateId') || 'candidate-123';\n  const token = searchParams.get('token');")


with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
