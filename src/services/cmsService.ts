import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface TrendingTopic {
  id?: string;
  title: string;
  content: string;
  isTrending: boolean;
  createdAt?: Timestamp | Date;
}

export interface UpcomingEvent {
  id?: string;
  title: string;
  date: string;
  description: string;
  createdAt?: Timestamp | Date;
}

export interface SpecialNote {
  id?: string;
  title: string;
  content: string;
  createdAt?: Timestamp | Date;
}

// Generic CRUD functions
const getCollectionData = async <T>(collectionName: string) => {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

const createDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const cmsService = {
  getTrendingTopics: () => getCollectionData<TrendingTopic>('trendingTopics'),
  createTrendingTopic: (data: Omit<TrendingTopic, 'id' | 'createdAt'>) => createDocument('trendingTopics', data),
  updateTrendingTopic: (id: string, data: Partial<TrendingTopic>) => updateDocument('trendingTopics', id, data),
  deleteTrendingTopic: (id: string) => deleteDocument('trendingTopics', id),

  getUpcomingEvents: () => getCollectionData<UpcomingEvent>('upcomingEvents'),
  createUpcomingEvent: (data: Omit<UpcomingEvent, 'id' | 'createdAt'>) => createDocument('upcomingEvents', data),
  updateUpcomingEvent: (id: string, data: Partial<UpcomingEvent>) => updateDocument('upcomingEvents', id, data),
  deleteUpcomingEvent: (id: string) => deleteDocument('upcomingEvents', id),

  getSpecialNotes: () => getCollectionData<SpecialNote>('specialNotes'),
  createSpecialNote: (data: Omit<SpecialNote, 'id' | 'createdAt'>) => createDocument('specialNotes', data),
  updateSpecialNote: (id: string, data: Partial<SpecialNote>) => updateDocument('specialNotes', id, data),
  deleteSpecialNote: (id: string) => deleteDocument('specialNotes', id),
};
