import os

filepath = 'functions/api/finalize-hire.js'
with open(filepath, 'r') as f:
    content = f.read()

new_content = content.replace("import { syncPayload } from '../utils/sync.js';", "import { syncPayload } from '../utils/sync.js';\nimport { sendHiringEmail } from '../utils/email.js';")

with open(filepath, 'w') as f:
    f.write(new_content)
