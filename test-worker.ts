import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import process from 'node:process';

/**
 * Type map defining strict payload structures for worker thread communication channels.
 */
interface WorkerMessageMap {
  readonly greeting: string;
}

if (isMainThread) {
  let worker: Worker | null = null;
  
  try {
    // Instantiate the worker thread pointing to the current execution module
    worker = new Worker(__filename);
    
    worker.on('message', (msg: unknown) => {
      process.stdout.write(`from worker: ${String(msg)}\n`);
      const activeWorker = worker;
      if (activeWorker) {
        void activeWorker.terminate().then(() => {
          process.exit(0);
        }).catch((terminateErr: unknown) => {
          const termError = terminateErr instanceof Error ? terminateErr : new Error(String(terminateErr));
          process.stderr.write(`failed to terminate worker cleanly: ${termError.message}\n`);
          process.exit(1);
        });
      } else {
        process.exit(0);
      }
    });

    worker.on('error', (err: Error) => {
      process.stderr.write(`worker error: ${err.message}\n`);
      process.exit(1);
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        process.stderr.write(`worker stopped with exit code ${code}\n`);
        process.exit(code);
      }
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    process.stderr.write(`failed to initialize worker: ${error.message}\n`);
    process.exit(1);
  }
} else {
  if (!parentPort) {
    process.stderr.write('parentPort is missing in worker thread context\n');
    process.exit(1);
  }

  try {
    const responseMessage: WorkerMessageMap['greeting'] = 'hello';
    parentPort.postMessage(responseMessage);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    process.stderr.write(`failed to post message from worker: ${error.message}\n`);
    process.exit(1);
  }
}