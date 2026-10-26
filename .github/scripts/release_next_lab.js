/**
 * Daily Virtual Lab Release Script for GitHub Actions Cloud Cron
 * Pulls up to BATCH_SIZE (4) scheduled laboratories from the staging branch,
 * integrates them into main, updates README.md curriculum docs, and prepares commit metadata.
 * Zero external dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const QUEUE_FILE = path.join(REPO_ROOT, '.github', 'daily_queue.json');
const README_FILE = path.join(REPO_ROOT, 'README.md');

const BATCH_SIZE = 4;
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
  const nextLabs = queue.filter(item => !item.released).slice(0, BATCH_SIZE);

  const sourceBranch = process.env.SOURCE_BRANCH || 'unreleased';

  if (nextLabs.length === 0) {
    console.log('🎉 All scheduled virtual laboratories have already been released to staging!');
    setGithubOutput('released', 'false');
    process.exit(0);
  }

  console.log(`🚀 Preparing daily release batch of ${nextLabs.length} laboratory(s):`);
  nextLabs.forEach(lab => console.log(`   - ${lab.title} (Folder: ${lab.folder})`));

  if (isDryRun) {
    nextLabs.forEach(lab => {
      console.log(`[DRY-RUN] Would checkout '${lab.folder}' from ${sourceBranch} branch.`);
      console.log(`[DRY-RUN] Commit message: ${lab.commitMsg}`);
    });
    console.log(`[DRY-RUN] Would update README.md and mark ${nextLabs.length} lab(s) as released.`);
    process.exit(0);
  }

  // 1. Checkout each simulation directory from the source branch into current working tree
  for (const lab of nextLabs) {
    try {
      execSync(`git checkout ${sourceBranch} -- "${lab.folder}"`, { cwd: REPO_ROOT, stdio: 'inherit' });
      console.log(`✅ Checked out ${lab.folder} from ${sourceBranch}`);
    } catch (err) {
      console.error(`Failed to checkout ${lab.folder} from ${sourceBranch}:`, err);
      process.exit(1);
    }
  }

  // 2. Update README.md
  if (fs.existsSync(README_FILE)) {
    let readme = fs.readFileSync(README_FILE, 'utf8');

    const combinedReadmeSections = nextLabs.map(l => l.readmeSection).join('\n\n');
    const combinedRunSections = nextLabs.map(l => l.runSection).join('\n\n');

    // Insert lab section before Tech Stack divider
    const techStackMarker = '\n---\n\n## 💻 Tech Stack';
    if (readme.includes(techStackMarker)) {
      readme = readme.replace(techStackMarker, `\n\n${combinedReadmeSections}${techStackMarker}`);
    } else {
      readme += `\n\n${combinedReadmeSections}\n`;
    }

    // Insert run command into Running Locally code block
    const runMarker = '```bash\n';
    if (readme.includes(runMarker)) {
      readme = readme.replace(runMarker, `\`\`\`bash\n${combinedRunSections}\n\n`);
    }

    fs.writeFileSync(README_FILE, readme, 'utf8');
    console.log(`✅ Updated README.md with ${nextLabs.length} new laboratories`);
  }

  // 3. Mark labs as released in queue manifest
  for (const lab of nextLabs) {
    lab.released = true;
    lab.releasedAt = new Date().toISOString();
  }
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  console.log(`✅ Marked ${nextLabs.length} lab(s) as released in .github/daily_queue.json`);

  // 4. Output variables for GitHub Actions runner
  const commitMsg = nextLabs.length === 1
    ? nextLabs[0].commitMsg
    : `feat(labs): release daily batch of ${nextLabs.length} virtual laboratories (${nextLabs.map(l => l.title).join(', ')})`;

  setGithubOutput('released', 'true');
  setGithubOutput('batch_count', nextLabs.length.toString());
  setGithubOutput('commit_msg', commitMsg);
}

run();
