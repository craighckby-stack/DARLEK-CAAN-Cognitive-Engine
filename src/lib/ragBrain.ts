import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// Text <-> Binary converters (no gaps, continuous stream of 8-bit binary digits)
export function textToBinary(text: string): string {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const binStr = text.charCodeAt(i).toString(2).padStart(8, '0');
    binary += binStr;
  }
  return binary;
}

export function binaryToText(binary: string): string {
  let text = '';
  // Avoid infinite loops or high CPU if string length is not multiple of 8
  const length = binary.length - (binary.length % 8);
  for (let i = 0; i < length; i += 8) {
    const byte = binary.slice(i, i + 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
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

// Storing RAG data in Firestore collection: "dalek_rag_brain"
export async function saveBrainChunk(
  sourceName: string,
  fileName: string,
  codeText: string,
  generation: number
): Promise<string> {
  try {
    const binaryCode = textToBinary(codeText);
    const colRef = collection(db, 'dalek_rag_brain');
    
    const docRef = await addDoc(colRef, {
      sourceName,
      fileName,
      binaryCode, // Store compressed binary with no gaps
      generation,
      timestamp: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to save brain chunk to Firestore:', error);
    throw error;
  }
}

export async function getBrainChunks(): Promise<BrainChunk[]> {
  try {
    const colRef = collection(db, 'dalek_rag_brain');
    const snapshot = await getDocs(colRef);
    
    const chunks: BrainChunk[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const binaryCode = data.binaryCode || '';
      // Decode binary back to text for Dalek to use
      const codeText = binaryToText(binaryCode);
      
      chunks.push({
        id: doc.id,
        sourceName: data.sourceName || 'Unknown Siphon',
        fileName: data.fileName || 'App.tsx',
        binaryCode,
        codeText,
        generation: data.generation || 0,
        timestamp: data.timestamp || new Date().toISOString()
      });
    });
    
    // Sort by timestamp
    return chunks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Failed to get brain chunks from Firestore:', error);
    return [];
  }
}

export async function clearBrainChunks(): Promise<void> {
  try {
    const colRef = collection(db, 'dalek_rag_brain');
    const snapshot = await getDocs(colRef);
    
    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Failed to clear brain chunks from Firestore:', error);
    throw error;
  }
}
