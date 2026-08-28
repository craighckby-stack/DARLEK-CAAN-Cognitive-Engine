import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Converts a text string into a continuous stream of 8-bit binary digits.
 * Optimized via array mapping and joining to minimize string concatenation overhead.
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
 * Optimized with batch chunk extraction and String.fromCharCode application.
 */
export function binaryToText(binary: string): string {
  if (!binary) return '';
  const validLength = binary.length - (binary.length % 8);
  if (validLength <= 0) return '';

  const charCodes: number[] = [];
  for (let i = 0; i < validLength; i += 8) {
    const byte = binary.slice(i, i + 8);
    charCodes.push(parseInt(byte, 2));
  }
  return String.fromCharCode(...charCodes);
}

export interface BrainChunk {
  id: string;
  sourceName: string;
  fileName: string;
  codeText: string;
  binaryCode: string;
  generation: number;
  timestamp: string;
}

const COLLECTION_NAME = 'dalek_rag_brain';

/**
 * Stores a code chunk in Firestore within the RAG brain collection after binary encoding.
 */
export async function saveBrainChunk(
  sourceName: string,
  fileName: string,
  codeText: string,
  generation: number
): Promise<string> {
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
    console.error('[EMG Core] Failed to save brain chunk to Firestore:', error);
    throw error;
  }
}

/**
 * Retrieves all stored brain chunks from Firestore, decoding binary payloads back to text
 * and sorting them chronologically by timestamp.
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
    console.error('[EMG Core] Failed to get brain chunks from Firestore:', error);
    return [];
  }
}

/**
 * Clears all brain chunks from the Firestore collection utilizing batched write operations.
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
    console.error('[EMG Core] Failed to clear brain chunks from Firestore:', error);
    throw error;
  }
}