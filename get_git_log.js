/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: get_git_log.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use strict';

const https = require('https');

/**
 * Fetches and displays recent commits for a specific file in a GitHub repository.
 * 
 * @param {string} repo - The repository name.
 * @returns {Promise<void>}
 */
function fetchCommits(repo) {
  return new Promise((resolve) => {
    if (typeof repo !== 'string' || repo.trim() === '') {
      console.error('Invalid repository name provided.');
      return resolve();
    }

    const url = `https://api.github.com/repos/craighckby-stack/${repo}/commits?path=src/app/page.tsx`;
    console.log(`Fetching commits for ${repo} src/app/page.tsx...`);

    const options = {
      headers: {
        'User-Agent': 'EMG-Core-v49-Optimizer',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.get(url, options, (res) => {
      // Ensure memory efficiency by setting encoding
      res.setEncoding('utf8');
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error(`Failed to fetch commits for ${repo}: HTTP Status ${res.statusCode} - ${data}`);
            return resolve();
          }

          const commits = JSON.parse(data);
          if (Array.isArray(commits)) {
            console.log(`Found ${commits.length} commits for ${repo}:`);
            commits.slice(0, 10).forEach((c) => {
              const sha = c?.sha || 'UNKNOWN_SHA';
              const message = c?.commit?.message || 'No message provided';
              const date = c?.commit?.author?.date || 'Unknown date';
              console.log(`- SHA: ${sha} | Message: ${message} | Date: ${date}`);
            });
          } else {
            console.log(`Unexpected response structure for ${repo}:`, data);
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          console.error(`Error parsing commits for ${repo}:`, errorMessage);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error requesting commits for ${repo}:`, errorMessage);
      resolve();
    });

    // Set request timeout for network resilience (10 seconds)
    req.setTimeout(10000, () => {
      req.destroy();
      console.error(`Request timeout while fetching commits for ${repo}.`);
      resolve();
    });
  });
}

/**
 * Executes the commit retrieval process across targeted repositories.
 * 
 * @returns {Promise<void>}
 */
async function run() {
  try {
    await fetchCommits('DARLEK_CAAN_ENGINE');
    await fetchCommits('Darlek-Caan-vs-Jesus-Chess');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Critical execution failure in run():', errorMessage);
  }
}

// Execute core runner
run();