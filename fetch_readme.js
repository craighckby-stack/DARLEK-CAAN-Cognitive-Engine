/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_readme.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

"use strict";

const { Buffer } = require('node:buffer');

/**
 * Validates request parameters against the sovereign ReadFileSchema.
 * @param {Object} params - The ingestion parameters.
 */
const validateSchema = (params) => {
    const required = ['owner', 'repo', 'path'];
    for (const field of required) {
        if (!params[field]) {
            throw new Error(`VALIDATION_FAILURE: MISSING_FIELD_${field.toUpperCase()}`);
        }
    }
};

/**
 * Executes high-performance data ingestion from the GitHub REST API v3.
 * Incorporates 15s timeout protection and Base64 transformation.
 */
async function fetchSovereignResource(owner, repo, path) {
    const context = { owner, repo, path };
    validateSchema(context);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const response = await fetch(endpoint, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DARLEK-CANN-SOVEREIGN-SPLICER'
            }
        });

        if (!response.ok) {
            throw new Error(`EXECUTION_ERROR: HTTP_${response.status}`);
        }

        const payload = await response.json();

        // TRANSFORMATION: Base64 to UTF-8 Logic
        const contentBuffer = Buffer.from(payload.content, 'base64');
        const decodedContent = contentBuffer.toString('utf8');

        // RESPONSE: JSON payload for sovereign-kernel consumption
        return {
            content: decodedContent,
            sha: payload.sha,
            metadata: {
                size: payload.size,
                path: payload.path,
                encoding: 'utf-8',
                ingested_at: new Date().toISOString()
            }
        };

    } catch (error) {
        const message = error.name === 'AbortError' 
            ? 'TIMEOUT: OPERATION_EXCEEDED_15000MS' 
            : error.message;
        console.error(`SPLICER_CRITICAL: ${message}`);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

// Initialization for target ecosystem
(async () => {
    try {
        const result = await fetchSovereignResource(
            'craighckby-stack', 
            'epistemic_debate_engine', 
            'README.md'
        );
        process.stdout.write(JSON.stringify(result, null, 2));
    } catch (termination) {
        process.exit(1);
    }
})();