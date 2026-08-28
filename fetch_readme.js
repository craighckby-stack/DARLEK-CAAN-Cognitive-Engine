/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: fetch_readme.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

"use strict";

const { Buffer } = require('node:buffer');

/**
 * Immutable configuration constants for high-efficiency resource acquisition.
 */
const CONFIG = Object.freeze({
    TIMEOUT_MS: 15000,
    API_BASE: 'https://api.github.com/repos',
    HEADERS: Object.freeze({
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DARLEK-CANN-SOVEREIGN-SPLICER'
    }),
    REQUIRED_FIELDS: Object.freeze(['owner', 'repo', 'path'])
});

/**
 * @typedef {Object} IngestionParams
 * @property {string} owner - Repository owner or organization.
 * @property {string} repo - Target repository name.
 * @property {string} path - Target relative file path.
 */

/**
 * @typedef {Object} SovereignMetadata
 * @property {number} size - File size in bytes.
 * @property {string} path - Canonical repository file path.
 * @property {'utf-8'} encoding - Target string encoding.
 * @property {string} ingested_at - ISO 8601 ingestion timestamp.
 */

/**
 * @typedef {Object} SovereignResourcePayload
 * @property {string} content - Decoded UTF-8 content string.
 * @property {string} sha - Git object SHA identifier.
 * @property {SovereignMetadata} metadata - Ingestion metadata.
 */

/**
 * Validates request parameters against the sovereign ReadFileSchema.
 * @param {Record<string, unknown>} params - The ingestion parameters object.
 * @throws {Error} Throws VALIDATION_FAILURE if missing or invalid fields.
 */
const validateSchema = (params) => {
    if (!params || typeof params !== 'object') {
        throw new Error('VALIDATION_FAILURE: INVALID_PARAMS_OBJECT');
    }
    for (const field of CONFIG.REQUIRED_FIELDS) {
        const val = params[field];
        if (typeof val !== 'string' || val.trim().length === 0) {
            throw new Error(`VALIDATION_FAILURE: MISSING_FIELD_${field.toUpperCase()}`);
        }
    }
};

/**
 * Executes high-performance data ingestion from the GitHub REST API v3.
 * Incorporates 15s timeout protection and Base64 transformation.
 * 
 * @param {string} owner - Repository owner identifier.
 * @param {string} repo - Repository name.
 * @param {string} path - Path to file within the repository.
 * @returns {Promise<SovereignResourcePayload>} Ingested and transformed payload object.
 */
async function fetchSovereignResource(owner, repo, path) {
    const context = { owner, repo, path };
    validateSchema(context);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
        const safeOwner = encodeURIComponent(owner);
        const safeRepo = encodeURIComponent(repo);
        const safePath = path.split('/').map(encodeURIComponent).join('/');
        const endpoint = `${CONFIG.API_BASE}/${safeOwner}/${safeRepo}/contents/${safePath}`;

        const response = await fetch(endpoint, {
            signal: controller.signal,
            headers: CONFIG.HEADERS
        });

        if (!response.ok) {
            throw new Error(`EXECUTION_ERROR: HTTP_${response.status}`);
        }

        const payload = await response.json();

        if (!payload || typeof payload.content !== 'string') {
            throw new Error('EXECUTION_ERROR: INVALID_PAYLOAD_STRUCTURE');
        }

        // TRANSFORMATION: Base64 to UTF-8 direct buffer conversion
        const decodedContent = Buffer.from(payload.content, 'base64').toString('utf8');

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
        const message = (error && error.name === 'AbortError') 
            ? 'TIMEOUT: OPERATION_EXCEEDED_15000MS' 
            : (error && error.message ? error.message : String(error));
            
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