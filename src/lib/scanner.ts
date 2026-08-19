// Safe Luhn Check algorithm for credit cards
export function luhnCheck(numStr: string): boolean {
  const sanitized = numStr.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isSkippableFile(filePath: string): boolean {
  const p = filePath.toLowerCase();
  const excludedDirs = ['node_modules/', '.next/', 'dist/', 'build/', '.git/', '__pycache__/', '.turbo/', 'coverage/'];
  if (excludedDirs.some(dir => p.includes(dir))) return true;

  const excludedExtensions = [
    '.min.js', '.min.css', '.bundle.js', '.map', '.wasm',
    '.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg', '.webp', '.avif',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.ogg', '.mp3', '.wav',
    '.pdf', '.zip', '.tar', '.gz', '.tgz', '.rar', '.7z',
    '.exe', '.bin', '.dll', '.so', '.dylib', '.sqlite', '.db'
  ];
  if (excludedExtensions.some(ext => p.endsWith(ext))) return true;

  const excludedFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.ds_store'];
  const fileName = p.split('/').pop() || '';
  if (excludedFiles.includes(fileName)) return true;

  return false;
}

export const SENSITIVE_PATTERNS = [
  // AI Providers
  { name: 'OpenAI API Key', regex: /(?:sk-[a-zA-Z0-9]{20,48}|sk-proj-[a-zA-Z0-9]{20,48})/g, confidence: 'high' },
  { name: 'Anthropic API Key', regex: /sk-ant-api03-[a-zA-Z0-9\-_]{93}AA/g, confidence: 'high' },
  { name: 'Google Gemini API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g, confidence: 'high' },
  { name: 'Cohere API Key', regex: /cohere\s*[:=]\s*['"][a-zA-Z0-9]{40}['"]/gi, confidence: 'medium' },
  { name: 'Mistral API Key', regex: /mistral\s*[:=]\s*['"][a-zA-Z0-9]{32}['"]/gi, confidence: 'medium' },
  
  // Cloud & Infra
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, confidence: 'high' },
  { name: 'AWS Secret Access Key', regex: /(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*['"]?([a-zA-Z0-9/+=]{40})['"]?/gi, confidence: 'medium' },
  { name: 'GCP Service Account', regex: /"type":\s*"service_account"/g, confidence: 'high' },
  { name: 'Azure Storage Key', regex: /DefaultEndpointsProtocol=[^;]+;AccountName=[^;]+;AccountKey=[a-zA-Z0-9+/=]{86}==/g, confidence: 'high' },
  
  // Version Control
  { name: 'GitHub PAT', regex: /gh[pusr]_[a-zA-Z0-9]{36}/g, confidence: 'high' },
  { name: 'GitHub Fine-Grained Token', regex: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/g, confidence: 'high' },
  { name: 'GitLab Token', regex: /glpat-[a-zA-Z0-9\-]{20}/g, confidence: 'high' },
  
  // Databases
  { name: 'MongoDB URI', regex: /mongodb(?:\+srv)?:\/\/[^\s"'<>]+/g, confidence: 'high' },
  { name: 'PostgreSQL URI', regex: /postgres(?:ql)?:\/\/[^\s"'<>]+/g, confidence: 'high' },
  { name: 'Redis URI', regex: /redis(?:\+sentinel)?:\/\/[^\s"'<>]+/g, confidence: 'high' },
  { name: 'Firebase Web API Key', regex: /AIza[a-zA-Z0-9_\-]{35}/g, confidence: 'high' },

  // Services
  { name: 'Stripe Secret Key', regex: /(?:sk|rk)_(?:test|live)_[a-zA-Z0-9]{24,99}/g, confidence: 'high' },
  { name: 'PayPal API Token', regex: /access_token\$production\$[a-zA-Z0-9]+/g, confidence: 'high' },
  { name: 'Twilio API Key', regex: /SK[a-z0-9]{32}/g, confidence: 'high' },
  { name: 'Slack Token', regex: /xox[baprs]-[a-zA-Z0-9]{10,48}/g, confidence: 'high' },
  { name: 'Discord Token', regex: /[a-zA-Z0-9_-]{24}\.[a-zA-Z0-9_-]{6}\.[a-zA-Z0-9_-]{27}/g, confidence: 'high' },
  { name: 'Notion API Key', regex: /secret_[a-zA-Z0-9]{43}/g, confidence: 'high' },
  { name: 'Shopify Access Token', regex: /shpat_[a-fA-F0-9]{32}/g, confidence: 'high' },
  { name: 'SendGrid API Key', regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, confidence: 'high' },
  { name: 'Mailgun API Key', regex: /key-[0-9a-zA-Z]{32}/g, confidence: 'high' },
  
  // Crypto & Auth
  { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, confidence: 'low' },
  { name: 'RSA Private Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, confidence: 'high' },
  { name: 'OAuth/Bearer Token', regex: /Bearer\s+([a-zA-Z0-9\-._~+/]+=*)/gi, confidence: 'low' },
  
  // PII
  { name: 'Credit Card', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, confidence: 'medium', validate: luhnCheck },
  { name: 'Email Address', regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, confidence: 'low' },
  { name: 'IP Address', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, confidence: 'low' },
  { name: 'MAC Address', regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g, confidence: 'low' },
  { name: 'IBAN', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g, confidence: 'low' },
];

export interface Finding {
  type: string;
  confidence: 'high' | 'medium' | 'low';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  lineNum: number;
  snippet: string;
  match: string;
}

// Shannon entropy calculation
export function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function getSeverity(confidence: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (confidence === 'high') return 'Critical';
  if (confidence === 'medium') return 'High';
  return 'Low';
}

export function sanitizeContent(content: string): { sanitized: string; findings: Finding[] } {
  if (!content) return { sanitized: '', findings: [] };

  const findings: Finding[] = [];
  const lines = content.split('\n');
  const sanitizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Safety safeguard: if a line is abnormally long (> 3000 chars, e.g. minified line),
    // only scan bounded chunks to prevent CPU freezing/catastrophic backtracking
    const scanLine = line.length > 3000 ? line.substring(0, 3000) : line;

    // Pattern matches
    for (const pattern of SENSITIVE_PATTERNS) {
      pattern.regex.lastIndex = 0; // Reset state for global regex
      let match: RegExpExecArray | null;
      
      while ((match = pattern.regex.exec(scanLine)) !== null) {
        const matchedValue = match[0];
        if (!matchedValue) break;

        // Optional custom validator (e.g. Luhn check for Credit Cards)
        if (pattern.validate && !pattern.validate(matchedValue)) {
          continue;
        }

        // Avoid duplicate findings on same line
        const exists = findings.some(f => f.lineNum === i + 1 && f.match === matchedValue);
        if (!exists) {
          const matchIdx = match.index;
          const snippetStart = Math.max(0, matchIdx - 20);
          const snippetEnd = Math.min(line.length, matchIdx + matchedValue.length + 20);
          
          findings.push({
            type: pattern.name,
            confidence: pattern.confidence as 'high' | 'medium' | 'low',
            severity: getSeverity(pattern.confidence),
            lineNum: i + 1,
            snippet: line.substring(snippetStart, snippetEnd).trim(),
            match: matchedValue
          });
        }

        const placeholder = `<${pattern.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_REDACTED>`;
        line = line.replace(matchedValue, placeholder);
      }
    }
    
    // High Entropy detector for variable assignments
    const varRegex = /(?:key|token|secret|password|credential|auth)\s*[:=]\s*(['"])([^'"]+)\1/gi;
    let varMatch: RegExpExecArray | null;
    while ((varMatch = varRegex.exec(scanLine)) !== null) {
      const val = varMatch[2];
      if (val && val.length > 18 && calculateEntropy(val) > 4.2) {
        const alreadyFound = findings.some(f => f.lineNum === i + 1 && f.match === val);
        if (!alreadyFound) {
          findings.push({
            type: 'High Entropy Secret',
            confidence: 'medium',
            severity: 'High',
            lineNum: i + 1,
            snippet: line.substring(0, Math.min(line.length, 70)).trim(),
            match: val
          });
          line = line.replace(val, '<ENTROPY_SECRET_REDACTED>');
        }
      }
    }

    sanitizedLines.push(line);
  }

  return { sanitized: sanitizedLines.join('\n'), findings };
}
