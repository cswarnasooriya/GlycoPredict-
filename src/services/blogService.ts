import { collection, addDoc, updateDoc, deleteDoc, doc, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';

export interface BlogPost {
  id?: string;
  title: string;
  imageUrl: string;
  category: string;
  content: string;
  createdAt?: Timestamp | Date;
}

export const getBlogs = async () => {
  try {
    const blogsRef = collection(db, 'blogs');
    const q = query(blogsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const blogs: BlogPost[] = [];
    querySnapshot.forEach((doc) => {
      blogs.push({ id: doc.id, ...doc.data() } as BlogPost);
    });

    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const createBlog = async (data: BlogPost) => {
  try {
    const blogsRef = collection(db, 'blogs');
    const docRef = await addDoc(blogsRef, {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export const updateBlog = async (id: string, data: Partial<BlogPost>) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await updateDoc(blogRef, data);
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

export const deleteBlog = async (id: string) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};
