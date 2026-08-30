const { execSync } = require('child_process');
try {
  const result = execSync("git --git-dir=.git push origin HEAD", { encoding: 'utf-8' });
  console.log("Success:", result);
} catch (e) {
  console.log("Error:", e.message);
}
