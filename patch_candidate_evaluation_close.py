import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

# I removed `<div className="mb-12 bg-indigo-50 border border-indigo-100 rounded-3xl p-8 shadow-sm">` in the previous python script! Let's put it back!

content = content.replace(
    "<React.Fragment>\n            {/* AI Assist Panel */}\n\n          <div className=\"flex",
    "<React.Fragment>\n            {/* AI Assist Panel */}\n          <div className=\"mb-12 bg-indigo-50 border border-indigo-100 rounded-3xl p-8 shadow-sm\">\n          <div className=\"flex"
)

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
