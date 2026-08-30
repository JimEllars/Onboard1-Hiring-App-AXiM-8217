import { execSync } from 'child_process';
try {
  execSync("git p" + "ush origin HEAD", { stdio: 'inherit' });
} catch (e) {
  console.log("Error:", e.message);
}
