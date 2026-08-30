import os

filepath = 'src/App.jsx'
with open(filepath, 'r') as f:
    content = f.read()

new_content = content.replace("import Login from './pages/Login';", "import Login from './pages/Login';\nimport AuthCallback from './pages/AuthCallback';")
new_content = new_content.replace('<Route path="/login" element={<Login />} />', '<Route path="/login" element={<Login />} />\n        <Route path="/auth/callback" element={<AuthCallback />} />')

with open(filepath, 'w') as f:
    f.write(new_content)
