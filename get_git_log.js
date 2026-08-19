/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: get_git_log.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

const https = require('https');

function fetchCommits(repo) {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/craighckby-stack/${repo}/commits?path=src/app/page.tsx`;
    console.log(`Fetching commits for ${repo} src/app/page.tsx...`);
    
    https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const commits = JSON.parse(data);
          if (Array.isArray(commits)) {
            console.log(`Found ${commits.length} commits for ${repo}:`);
            commits.slice(0, 10).forEach(c => {
              console.log(`- SHA: ${c.sha} | Message: ${c.commit.message} | Date: ${c.commit.author.date}`);
            });
          } else {
            console.log(`Failed to fetch commits for ${repo}:`, data);
          }
        } catch (e) {
          console.error(`Error parsing commits for ${repo}:`, e.message);
        }
        resolve();
      });
    }).on('error', err => {
      console.error(`Error requesting commits for ${repo}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  await fetchCommits('DARLEK_CAAN_ENGINE');
  await fetchCommits('Darlek-Caan-vs-Jesus-Chess');
}

run();
