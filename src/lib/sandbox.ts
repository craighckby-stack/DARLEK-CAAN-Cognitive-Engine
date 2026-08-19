/**
 * A simple sandbox using an Iframe to test JS/HTML code.
 */
export async function testCodeInSandbox(code: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ success: false, error: 'Execution Timeout' });
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
      document.body.removeChild(iframe);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (event.data.type === 'SANDBOX_RESULT') {
        cleanup();
        resolve({ success: event.data.success, error: event.data.error });
      }
    };

    window.addEventListener('message', handleMessage);

    const sandboxHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <script type="module">
            // Mock Node.js environment
            window.require = (mod) => {
              console.warn('Sandbox: require("' + mod + '") is not supported. Mocking...');
              return {};
            };
            window.module = { exports: {} };
            window.exports = window.module.exports;
            window.process = { env: {}, browser: true, version: 'v18.0.0', nextTick: (fn) => setTimeout(fn, 0) };
            window.global = window;

            // Mock common Node modules
            const mocks = {
              'fs': {}, 'path': {}, 'os': {}, 'crypto': window.crypto, 'events': { EventEmitter: class {} },
              'util': {}, 'http': {}, 'https': {}, 'url': {}, 'zod': { z: {} }
            };

            try {
              const code = \`${code.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
              
              // Check for common non-browser patterns
              if (code.includes('require(') || code.includes('module.exports')) {
                // Try to wrap in a function to support some CJS-like patterns
                const wrapped = \`(function(require, module, exports) { \${code} })(window.require, window.module, window.exports)\`;
                const blob = new Blob([wrapped], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                await import(url);
                URL.revokeObjectURL(url);
              } else {
                const blob = new Blob([code], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                await import(url);
                URL.revokeObjectURL(url);
              }
              
              window.parent.postMessage({ type: 'SANDBOX_RESULT', success: true }, '*');
            } catch (err) {
              let msg = err.message;
              if (msg.includes('Failed to resolve module specifier')) {
                msg = "Dependency Error: " + msg + ". The Brain is attempting to use a Node.js module or an external library not available in the browser sandbox.";
              }
              window.parent.postMessage({ type: 'SANDBOX_RESULT', success: false, error: msg }, '*');
            }
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = sandboxHtml;
  });
}
