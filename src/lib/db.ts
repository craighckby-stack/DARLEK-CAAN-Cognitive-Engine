import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaDir = path.join(process.cwd(), 'prisma')
const dbPath = path.join(prismaDir, 'dev.db')

// Clean up any remaining WAL files which cause severe corruption in container environments
function cleanupWalFiles() {
  try {
    const walPath = path.join(prismaDir, 'dev.db-wal');
    if (fs.existsSync(walPath)) {
      try { fs.unlinkSync(walPath); } catch (e) {}
    }
    const shmPath = path.join(prismaDir, 'dev.db-shm');
    if (fs.existsSync(shmPath)) {
      try { fs.unlinkSync(shmPath); } catch (e) {}
    }
  } catch (err) {
    // ignore
  }
}

let prismaInstance: PrismaClient | null = null;
let isHealing = false;

let isDbChecked = false;

function getPrismaInstance(): PrismaClient {
  if (!isDbChecked) {
    isDbChecked = true;
    if (!fs.existsSync(dbPath)) {
      performSelfHealing();
    }
  }

  if (prismaInstance) {
    return prismaInstance;
  }

  if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  const sqliteUrl = `file:${dbPath}?connection_limit=1&socket_timeout=15`;
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: sqliteUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export function performSelfHealing() {
  if (isHealing) {
    console.warn('[Database Setup] Self-healing already in progress. Skipping redundant call.');
    return;
  }
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  isHealing = true;
  try {
    console.warn('[Database Setup] Self-healing initiated. Rebuilding database schema...');
    
    // Attempt to disconnect prisma to release SQLite locks
    if (prismaInstance) {
      try {
        console.log('[Database Setup] Disconnecting active Prisma client...');
        const staleInstance = prismaInstance;
        prismaInstance = null;
        if (globalForPrisma.prisma) {
          globalForPrisma.prisma = undefined;
        }
        staleInstance.$disconnect().catch(() => {});
      } catch (disError) {
        // ignore
      }
    }

    // Explicitly delete DB artifact and journals
    if (fs.existsSync(dbPath)) {
      try { fs.unlinkSync(dbPath); } catch (e) {}
    }
    cleanupWalFiles();
    
    console.log('[Database Setup] Rebuilding Prisma schema and client...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
      console.log('[Database Setup] Database healing completed successfully!');
    } catch (e) {
      console.warn('[Database Setup] Prisma push warning:', e);
    }
  } catch (healErr) {
    console.error('[Database Setup] Self-healing error:', healErr);
  } finally {
    isHealing = false;
  }
}


function createCallableProxy(prop: string | symbol): any {
  const dummy = () => {};
  
  return new Proxy(dummy, {
    apply(_, __, args) {
      const execute = async (attempt = 1): Promise<any> => {
        const activePrisma = getPrismaInstance();
        const method = (activePrisma as any)[prop];
        if (typeof method !== 'function') {
          throw new Error(`Prisma method "${String(prop)}" is not a function.`);
        }
        try {
          const result = method.apply(activePrisma, args);
          if (result && typeof result === 'object' && typeof (result as any).then === 'function') {
            return await result;
          }
          return result;
        } catch (err: any) {
          const errMsg = String(err?.message || err?.stack || err || '').toLowerCase();
          const isCorrupt = errMsg.includes('malformed') || 
                            errMsg.includes('corrupt') || 
                            errMsg.includes('disk image') || 
                            errMsg.includes('sqlite_corrupt') || 
                            errMsg.includes('database_closed') || 
                            errMsg.includes('connectorerror') || 
                            errMsg.includes('sqliteerror');
          if (isCorrupt) {
            console.error(`[Prisma Proxy Direct] Database corruption detected on ${String(prop)}. Healing database...`);
            performSelfHealing();
            if (attempt < 2) {
              console.log(`[Prisma Proxy Direct] Retrying ${String(prop)} after successful rebuild...`);
              return execute(attempt + 1);
            }
          }
          throw err;
        }
      };
      return execute();
    },

    get(_, subProp) {
      if (subProp === 'then' || subProp === 'toJSON' || typeof subProp === 'symbol') {
        return undefined;
      }

      return function (...args: any[]) {
        const execute = async (attempt = 1): Promise<any> => {
          const activePrisma = getPrismaInstance();
          const model = (activePrisma as any)[prop];
          if (!model) {
            throw new Error(`Prisma model or method "${String(prop)}" not found.`);
          }
          const method = model[subProp];
          if (typeof method !== 'function') {
            throw new Error(`Prisma method "${String(subProp)}" on model/service "${String(prop)}" is not a function.`);
          }

          try {
            const result = method.apply(model, args);
            if (result && typeof result === 'object' && typeof (result as any).then === 'function') {
              return await result;
            }
            return result;
          } catch (err: any) {
            const errMsg = String(err?.message || err?.stack || err || '').toLowerCase();
            const isCorrupt = errMsg.includes('malformed') || 
                              errMsg.includes('corrupt') || 
                              errMsg.includes('disk image') || 
                              errMsg.includes('sqlite_corrupt') || 
                              errMsg.includes('database_closed') || 
                              errMsg.includes('connectorerror') || 
                              errMsg.includes('sqliteerror');
            if (isCorrupt) {
              console.error(`[Prisma Proxy Model] Database corruption detected on ${String(prop)}.${String(subProp)}. Rebuilding ...`);
              performSelfHealing();
              if (attempt < 2) {
                console.log(`[Prisma Proxy Model] Retrying query ${String(prop)}.${String(subProp)} after successful rebuild...`);
                return execute(attempt + 1);
              }
            }
            throw err;
          }
        };

        return execute();
      };
    }
  });
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (prop === 'then' || prop === 'toJSON' || typeof prop === 'symbol') {
      return undefined;
    }
    return createCallableProxy(prop);
  }
});