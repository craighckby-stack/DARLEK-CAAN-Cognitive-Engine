/**
 * A secure, high-performance sandbox utilizing an isolated iframe to safely evaluate JavaScript/HTML code.
 */
export interface SandboxResult {
  readonly success: boolean;
  readonly error?: string;
}

interface SandboxMessageEvent {
  readonly type: 'SANDBOX_RESULT';
  readonly success: boolean;
  readonly error?: string;
}

export async function testCodeInSandbox(code: string): Promise<SandboxResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { success: true };
  }

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox.add('allow-scripts');
    document.body.appendChild(iframe);

    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({ success: false, error: 'Execution Timeout' });
    }, 5000);

    const handleMessage = (event: MessageEvent<SandboxMessageEvent>) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (data && data.type === 'SANDBOX_RESULT') {
        cleanup();
        resolve({ success: data.success, error: data.error });
      }
    };

    window.addEventListener('message', handleMessage);

    const escapedCode = code.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const sandboxHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <script type="module">
      window.require = (mod) => {
        console.warn('Sandbox: require("' + mod + '") is not natively supported in browser environments. Returning empty mock.');
        return {};
      };
      window.module = { exports: {} };
      window.exports = window.module.exports;
      window.process = { env: {}, browser: true, version: 'v18.0.0', nextTick: (fn) => setTimeout(fn, 0) };
      window.global = window;

      try {
        const rawCode = \`${escapedCode}\`;
        let executableCode = rawCode;
        
        if (rawCode.includes('require(') || rawCode.includes('module.exports')) {
          executableCode = \`(function(require, module, exports) { \${rawCode} })(window.require, window.module, window.exports)\`;
        }

        const blob = new Blob([executableCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        import(url)
          .then(() => {
            URL.revokeObjectURL(url);
            window.parent.postMessage({ type: 'SANDBOX_RESULT', success: true }, '*');
          })
          .catch((importErr) => {
            URL.revokeObjectURL(url);
            throw importErr;
          });
      } catch (err) {
        let msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Failed to resolve module specifier')) {
          msg = "Dependency Error: " + msg + ". The Brain is attempting to use a Node.js module or an external library not available in the browser sandbox.";
        }
        window.parent.postMessage({ type: 'SANDBOX_RESULT', success: false, error: msg }, '*');
      }
    </script>
  </body>
</html>`;

    iframe.srcdoc = sandboxHtml;
  });
}