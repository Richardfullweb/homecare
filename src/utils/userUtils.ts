import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types/user';

export const createOrUpdateUserProfile = async (
  userId: string,
  userData: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Criar novo perfil
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Atualizar perfil existente
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
