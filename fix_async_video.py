import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# First replace the bad token duplications
content = content.replace("          token,", "")

# The patch for token variable added it inside the component, but we should make sure it is actually there
candidate_pattern = r"  const candidateId = searchParams\.get\('candidateId'\) \|\| 'candidate-123';\n  const token = searchParams\.get\('token'\);"

if "const token = searchParams.get('token');" not in content:
    content = content.replace("  const candidateId = searchParams.get('candidateId') || 'candidate-123';", "  const candidateId = searchParams.get('candidateId') || 'candidate-123';\n  const token = searchParams.get('token');")


with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
