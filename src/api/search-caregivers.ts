import { getApp, initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, Firestore } from 'firebase/firestore';

let db: Firestore;

try {
  // Tenta obter app existente
  const app = getApp();
  db = getFirestore(app);
} catch (error) {
  // Se não existir, inicializa novo app
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

interface SearchParams {
  elderlyCount: number;
  careType: string;
  availability: string;
}

export async function searchCaregivers(params: SearchParams) {
    try {
      console.log('Iniciando busca no Firestore...');
      const { careType, availability } = params;

      // Verifica conexão com Firestore
      if (!db) {
        throw new Error('Firestore não inicializado');
      }

      // Cria a query base
      const caregiversRef = collection(db, 'users');
      let q = query(caregiversRef, where('role', '==', 'caregiver'));

      // Map Portuguese care types to English field names
      const careTypeMap: Record<string, string> = {
        'Companhia': 'needCompany',
        'Mobilidade reduzida': 'reducedMobility', 
        'Doenças degenerativas': 'degenerativeDiseases'
      };

      const englishCareType = careTypeMap[careType] || careType;
      
      // Filtra por características do idoso
      q = query(q, where(`elderlyCharacteristics.${englishCareType}`, '==', true));
      console.log('Filtro por tipo de cuidado aplicado:', englishCareType);

      // Map Portuguese availability to English values
      const availabilityMap: Record<string, string> = {
        'Diária': 'diary',
        'Semanal': 'weekly', 
        'Mensal': 'monthly'
      };

      const englishAvailability = availabilityMap[availability] || availability.toLowerCase();
      
      // Filtra por frequência de trabalho
      q = query(q, where('workFrequency', '==', englishAvailability));
      console.log('Filtro por disponibilidade aplicado:', englishAvailability);

      // Executa a consulta
      console.log('Executando query...');
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Nenhum cuidador encontrado com os critérios especificados');
        return [];
      }

      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Cuidadores encontrados:', results);
      return results;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro detalhado ao buscar cuidadores:', {
          message: error.message,
          stack: error.stack
        });
        throw new Error('Erro ao buscar cuidadores: ' + error.message);
      } else {
        console.error('Erro desconhecido ao buscar cuidadores:', error);
        throw new Error('Erro desconhecido ao buscar cuidadores');
      }
    }
}
