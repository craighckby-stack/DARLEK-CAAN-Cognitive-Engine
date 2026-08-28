import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Converts a text string into a continuous stream of 8-bit binary digits.
 * Optimized via pre-allocated arrays and charCodeAt bitwise mapping to eliminate string concatenation overhead.
 */
export function textToBinary(text: string): string {
  if (!text) return '';
  const length = text.length;
  const binaryArray = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    binaryArray[i] = text.charCodeAt(i).toString(2).padStart(8, '0');
  }
  return binaryArray.join('');
}

/**
 * Decodes a continuous stream of 8-bit binary digits back into a text string.
 * Optimized with batch chunk extraction and String.fromCharCode application using safe typed constraints.
 */
export function binaryToText(binary: string): string {
  if (!binary) return '';
  const validLength = binary.length - (binary.length % 8);
  if (validLength <= 0) return '';

  const charCodes = new Uint16Array(validLength / 8);
  for (let i = 0, j = 0; i < validLength; i += 8, j++) {
    charCodes[j] = parseInt(binary.slice(i, i + 8), 2);
  }
  return String.fromCharCode(...charCodes);
}

export interface BrainChunk {
  readonly id: string;
  readonly sourceName: string;
  readonly fileName: string;
  readonly codeText: string;
  readonly binaryCode: string;
  readonly generation: number;
  readonly timestamp: string;
}

const COLLECTION_NAME = 'dalek_rag_brain';

/**
 * Stores a code chunk in Firestore within the RAG brain collection after binary encoding with robust error management.
 */
export async function saveBrainChunk(
  sourceName: string,
  fileName: string,
  codeText: string,
  generation: number
): Promise<string> {
  if (!sourceName || !fileName || codeText === undefined || generation < 0) {
    throw new Error('[EMG Core] Invalid arguments supplied to saveBrainChunk.');
  }

  try {
    const binaryCode = textToBinary(codeText);
    const colRef = collection(db, COLLECTION_NAME);
    
    const docRef = await addDoc(colRef, {
      sourceName,
      fileName,
      binaryCode,
      generation,
      timestamp: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('[EMG Core] Critical failure during saveBrainChunk persistence:', error);
    throw error;
  }
}

/**
 * Retrieves all stored brain chunks from Firestore, decoding binary payloads back to text
 * and sorting them chronologically by timestamp with strict type assertions.
 */
export async function getBrainChunks(): Promise<BrainChunk[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    
    const chunks: BrainChunk[] = [];
    snapshot.forEach((documentSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = documentSnap.data();
      const binaryCode = typeof data.binaryCode === 'string' ? data.binaryCode : '';
      const codeText = binaryToText(binaryCode);
      
      chunks.push({
        id: documentSnap.id,
        sourceName: typeof data.sourceName === 'string' ? data.sourceName : 'Unknown Siphon',
        fileName: typeof data.fileName === 'string' ? data.fileName : 'App.tsx',
        binaryCode,
        codeText,
        generation: typeof data.generation === 'number' ? data.generation : 0,
        timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString()
      });
    });
    
    return chunks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('[EMG Core] Critical failure during getBrainChunks retrieval:', error);
    return [];
  }
}

/**
 * Clears all brain chunks from the Firestore collection utilizing batched write operations for maximum efficiency.
 */
export async function clearBrainChunks(): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    snapshot.forEach((documentSnap: QueryDocumentSnapshot<DocumentData>) => {
      batch.delete(documentSnap.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('[EMG Core] Critical failure during clearBrainChunks batch execution:', error);
    throw error;
  }
}