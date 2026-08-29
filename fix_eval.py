import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

# Remove duplicate aiData declarations
content = re.sub(r'  const \[aiData, setAiData\] = useState\(null\);\n  const \[aiLoading, setAiLoading\] = useState\(true\);\n', '', content, count=1)

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
