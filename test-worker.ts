import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import process from 'node:process';

interface WorkerMessageMap {
  readonly greeting: string;
}

if (isMainThread) {
  let worker: Worker | null = null;
  try {
    worker = new Worker(__filename);
    
    worker.on('message', (msg: unknown) => {
      process.stdout.write(`from worker: ${String(msg)}\n`);
      void worker?.terminate().then(() => {
        process.exit(0);
      });
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
  } catch (err) {
    const error = err as Error;
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
  } catch (err) {
    const error = err as Error;
    process.stderr.write(`failed to post message from worker: ${error.message}\n`);
    process.exit(1);
  }
}