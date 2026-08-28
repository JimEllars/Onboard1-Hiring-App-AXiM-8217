with open('src/pages/ApplicationForm.jsx', 'r') as f:
    content = f.read()

content = content.replace("  const { id } = useParams();\n  const navigate = useNavigate();", "  const navigate = useNavigate();")

with open('src/pages/ApplicationForm.jsx', 'w') as f:
    f.write(content)
