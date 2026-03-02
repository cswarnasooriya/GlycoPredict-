import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export interface PatientRecord {
  gender: string;
  age: number | string;
  urea: number | string;
  cr: number | string;
  hba1c: number | string;
  chol: number | string;
  tg: number | string;
  hdl: number | string;
  ldl: number | string;
  vldl: number | string;
  bmi: number | string;
  riskLevel: string;
  insights: string;
  createdAt?: Timestamp | Date;
  validation?: {
    status: string;
    notes: string;
    doctorName: string;
    registrationNumber: string;
    validatedAt: Timestamp | Date;
  };
}

export const savePatientRecord = async (userId: string, data: PatientRecord) => {
  try {
    const recordsRef = collection(db, 'records');
    const docRef = await addDoc(recordsRef, {
      userId,
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving patient record:', error);
    throw error;
  }
};

export const getAllPatientRecords = async () => {
  try {
    const recordsRef = collection(db, 'records');
    const q = query(recordsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const records: (PatientRecord & { id: string, userId: string })[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as PatientRecord & { id: string, userId: string });
    });

    // Fetch user details for each record
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const usersMap: Record<string, { name: string, email: string }> = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data() as { name: string, email: string };
    });

    return records.map(record => ({
      ...record,
      userName: usersMap[record.userId]?.name || 'Unknown Patient',
      userEmail: usersMap[record.userId]?.email || 'Unknown Email'
    }));
  } catch (error) {
    console.error('Error fetching all patient records:', error);
    throw error;
  }
};

export const updatePatientRecord = async (recordId: string, data: Partial<PatientRecord>) => {
  try {
    const recordRef = doc(db, 'records', recordId);
    await updateDoc(recordRef, data);
  } catch (error) {
    console.error('Error updating patient record:', error);
    throw error;
  }
};

export const getPatientHistory = async (userId: string) => {
  try {
    const recordsRef = collection(db, 'records');
    const q = query(
      recordsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const records: (PatientRecord & { id: string })[] = [];

    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as PatientRecord & { id: string });
    });

    return records;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    throw error;
  }
};
