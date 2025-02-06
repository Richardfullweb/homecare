import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types/user';

interface CaregiverDetails {
  uid: string;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  specialties?: string[];
  bio?: string;
  photoURL?: string;
  hourlyRate?: number;
  description?: string;
  experience?: string;
  education?: string;
  languages?: string[];
  certifications?: string[];
  availability?: {
    [key: string]: boolean;
  };
}

const useFavorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState<CaregiverDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as UserProfile;
          const favoriteIds = userData.favorites || [];
          
          // Buscar detalhes de cada cuidador favorito
          const caregiverDetails = await Promise.all(
            favoriteIds.map(async (id) => {
              const caregiverDoc = await getDoc(doc(db, 'users', id));
              if (caregiverDoc.exists()) {
                const data = caregiverDoc.data();
                return {
                  uid: caregiverDoc.id,
                  name: data.fullName || data.name || 'Nome não disponível',
                  email: data.email,
                  role: data.role,
                  specialty: data.specialty || '',
                  bio: data.bio || '',
                  photoURL: data.photoURL || '',
                  hourlyRate: data.hourlyRate || 0,
                  description: data.description || ''
                } as CaregiverDetails;
              }
              return null;
            })
          );

          // Filtrar quaisquer resultados nulos e definir os favoritos
          setFavorites(caregiverDetails.filter((caregiver): caregiver is CaregiverDetails => caregiver !== null));
        } else {
          // Criar documento do usuário se não existir
          await setDoc(docRef, {
            uid: user.uid,
            email: user.email,
            favorites: [],
            createdAt: serverTimestamp()
          });
          setFavorites([]);
        }
      } catch (err) {
        setError('Falha ao carregar favoritos');
        console.error('Erro ao buscar favoritos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (caregiverId: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        favorites: arrayUnion(caregiverId)
      });
      
      // Buscar e adicionar os detalhes do novo cuidador favorito
      const caregiverDoc = await getDoc(doc(db, 'users', caregiverId));
      if (caregiverDoc.exists()) {
        const data = caregiverDoc.data();
        const newCaregiverDetails: CaregiverDetails = {
          uid: caregiverDoc.id,
          name: data.fullName || data.name || 'Nome não disponível',
          email: data.email,
          role: data.role,
          specialty: data.specialty || '',
          bio: data.bio || '',
          photoURL: data.photoURL || '',
          hourlyRate: data.hourlyRate || 0,
          description: data.description || ''
        };
        setFavorites(prev => [...prev, newCaregiverDetails]);
      }
    } catch (err) {
      setError('Falha ao adicionar favorito');
      console.error('Erro ao adicionar favorito:', err);
    }
  };

  const removeFavorite = async (caregiverId: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        favorites: arrayRemove(caregiverId)
      });
      setFavorites(prev => prev.filter(caregiver => caregiver.uid !== caregiverId));
    } catch (err) {
      setError('Falha ao remover favorito');
      console.error('Erro ao remover favorito:', err);
    }
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite
  };
};

export default useFavorites;
