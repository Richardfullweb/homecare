import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types/user';

export const useUserProfile = () => {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setError('Perfil de usuário não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar perfil de usuário');
        console.error('Erro ao buscar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { userProfile, loading, error };
};
