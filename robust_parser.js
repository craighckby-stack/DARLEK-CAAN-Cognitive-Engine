const fs = require('fs');
const file = 'src/app/api/evolution/propose/route.ts';
let code = fs.readFileSync(file, 'utf8');

const regexToReplace = /\/\/ 1\. Try direct clean JSON parse[\s\S]*?analysis = rawText\.slice\(0, 300\) \|\| 'Analyzed file structure\.';\n      \}\n    \}/;

const newParser = `    // 1. Robust Extraction
    let proposedCode = '';
    let analysis = 'Analysis complete.';
    
    // Find all code blocks
    const codeBlocks = [...rawText.matchAll(/\`\`\`(?:\\w+)?\\n([\\s\\S]*?)\`\`\`/g)];
    
    // Try to find the JSON metadata block and the code block
    for (const block of codeBlocks) {
      const content = block[1].trim();
      try {
        const json = JSON.parse(content);
        if (json.analysis || json.riskScore !== undefined || json.newFiles) {
          parsed = json;
          continue;
        }
      } catch (e) {}
      
      // If it's not the metadata JSON, it's probably the proposed code
      if (!proposedCode && content.length > 10) {
        proposedCode = content;
      }
    }
    
    // If no code blocks found, maybe it used raw text
    if (!parsed) {
      try {
        const jsonMatch = rawText.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0].replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, ' '));
      } catch (e) {}
    }
    
    if (parsed) {
      analysis = parsed.analysis || analysis;
      // In case the model still put it in the JSON
      if (parsed.proposedCode && !proposedCode) {
        proposedCode = parsed.proposedCode;
      }
    }
    
    // Fallback if STILL no proposed code
    if (!proposedCode) {
       console.log('[Propose] Fallback matched no code fences. Using fileContent.');
       proposedCode = fileContent;
    }`;

code = code.replace(regexToReplace, newParser);
fs.writeFileSync(file, code);
