/**
 * Daily Virtual Lab Release Script for GitHub Actions Cloud Cron
 * Pulls the next scheduled laboratory from the staging branch, integrates it into main,
 * updates README.md curriculum docs, and prepares commit metadata.
 * Zero external dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const QUEUE_FILE = path.join(REPO_ROOT, '.github', 'daily_queue.json');
const README_FILE = path.join(REPO_ROOT, 'README.md');

const isDryRun = process.argv.includes('--dry-run');

function setGithubOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `${key}=${value}\n`);
  }
}

function run() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error(`Queue file not found at ${QUEUE_FILE}`);
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  const nextLab = queue.find(item => !item.released);

  if (!nextLab) {
    console.log('🎉 All scheduled virtual laboratories have already been released to main!');
    setGithubOutput('released', 'false');
    process.exit(0);
  }

  console.log(`🚀 Preparing release for: ${nextLab.title} (Folder: ${nextLab.folder})`);

  if (isDryRun) {
    console.log(`[DRY-RUN] Would checkout '${nextLab.folder}' from staging branch.`);
    console.log(`[DRY-RUN] Commit message: ${nextLab.commitMsg}`);
    console.log(`[DRY-RUN] Would update README.md and mark as released.`);
    process.exit(0);
  }

  // 1. Checkout the simulation directory from the staging branch into main working tree
  try {
    execSync(`git checkout staging -- "${nextLab.folder}"`, { cwd: REPO_ROOT, stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to checkout ${nextLab.folder} from staging:`, err);
    process.exit(1);
  }

  // 2. Update README.md
  if (fs.existsSync(README_FILE)) {
    let readme = fs.readFileSync(README_FILE, 'utf8');

    // Insert lab section before Tech Stack divider
    const techStackMarker = '\n---\n\n## 💻 Tech Stack';
    if (readme.includes(techStackMarker)) {
      readme = readme.replace(techStackMarker, `\n\n${nextLab.readmeSection}${techStackMarker}`);
    } else {
      readme += `\n\n${nextLab.readmeSection}\n`;
    }

    // Insert run command into Running Locally code block
    const runMarker = '```bash\n';
    if (readme.includes(runMarker)) {
      readme = readme.replace(runMarker, `\`\`\`bash\n${nextLab.runSection}\n\n`);
    }

    fs.writeFileSync(README_FILE, readme, 'utf8');
    console.log(`✅ Updated README.md with ${nextLab.title}`);
  }

  // 3. Mark lab as released in queue manifest
  nextLab.released = true;
  nextLab.releasedAt = new Date().toISOString();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  console.log(`✅ Marked ${nextLab.folder} as released in .github/daily_queue.json`);

  // 4. Output variables for GitHub Actions runner
  setGithubOutput('released', 'true');
  setGithubOutput('lab_id', nextLab.id);
  setGithubOutput('commit_msg', nextLab.commitMsg);
}

run();
