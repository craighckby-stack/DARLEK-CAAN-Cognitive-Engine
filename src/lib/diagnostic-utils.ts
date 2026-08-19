export const logEvolution = (msg: string) => console.log(`[DARLEK-CANN-EVOLUTION]: ${msg}`);
export const sanitizeCode = (code: string) => code.replace(/\/\/.*\n/g, '');