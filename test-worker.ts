import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', (msg) => {
    console.log('from worker:', msg);
    process.exit(0);
  });
} else {
  parentPort?.postMessage('hello');
}
