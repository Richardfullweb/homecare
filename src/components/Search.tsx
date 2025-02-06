import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CaregiverSearchFilters, SearchResult } from '../types/caregiver';
import { Link } from 'react-router-dom';
import HireRequestForm from './Scheduling/HireRequestForm';
import useFavorites from '../hooks/useFavorites';
import { ReviewStats } from '../types/review';
import CaregiverProfileModal from './modals/CaregiverProfileModal';
import MultiHourAppointmentBooking from './Scheduling/MultiHourAppointmentBooking';

const Search: React.FC = () => {
  const [filters, setFilters] = useState<CaregiverSearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMultiHourBooking, setShowMultiHourBooking] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState<string | null>(null);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [availableSpecialties, setAvailableSpecialties] = useState<Array<{ label: string; value: string }>>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  const fetchReviewStats = async (caregiverId: string) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('caregiverId', '==', caregiverId)
      );
      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let totalReviews = 0;
      const ratingCounts: { [key: number]: number } = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      querySnapshot.forEach((doc) => {
        const review = doc.data() as any;
        totalRating += review.rating;
        ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
        totalReviews++;
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      setReviewStats(prev => ({
        ...prev,
        [caregiverId]: {
          averageRating,
          totalReviews,
          ratingCounts
        }
      }));
    } catch (err) {
      console.error('Error fetching review stats:', err);
    }
  };

  const validateFilters = () => {
    if (filters.minRate && filters.maxRate && filters.minRate > filters.maxRate) {
      setError('O valor mínimo não pode ser maior que o valor máximo');
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validateFilters()) return;

    setLoading(true);
    setError('');

    try {
      // Criar a query base
      let caregiverQuery = query(
        collection(db, 'users'),
        where('role', '==', 'caregiver')
      );

      // Adicionar loading state visual
      setResults([]);

      // Adicionar filtro de especialidade
      if (filters.specialty) {
        caregiverQuery = query(
          caregiverQuery,
          where('specialty', '==', filters.specialty)
        );
      }

      // Adicionar filtro de região
      if (filters.city || filters.state) {
        const locationFilters = [];
        if (filters.city) {
          locationFilters.push(where('city', '==', filters.city));
        }
        if (filters.state) {
          locationFilters.push(where('state', '==', filters.state));
        }
        caregiverQuery = query(caregiverQuery, ...locationFilters);
      }

      const querySnapshot = await getDocs(caregiverQuery);
      
      if (querySnapshot.empty) {
        setResults([]);
        setError('Nenhum cuidador encontrado com os filtros especificados.');
        return;
      }

      const caregivers: SearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as SearchResult;
        
        // Aplicar filtros do lado do cliente
        if (
          (!filters.minRate || (data.payment?.rate || 0) >= filters.minRate) &&
          (!filters.maxRate || (data.payment?.rate || 0) <= filters.maxRate)
        ) {
          caregivers.push({
            id: doc.id,
            ...data
          });
          fetchReviewStats(doc.id);
        }
      });

      if (caregivers.length === 0) {
        setError('Nenhum cuidador encontrado com os critérios especificados.');
      }

      setResults(caregivers);
    } catch (err) {
      console.error('Error searching caregivers:', err);
      setError('Erro ao buscar cuidadores. Por favor, tente novamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  const handleScheduleClick = (caregiverId: string) => {
    setSelectedCaregiverId(caregiverId);
  };

  const handleCloseModal = () => {
    setSelectedCaregiverId(null);
  };

  const handleFavoriteClick = async (caregiverId: string) => {
    const isFavorite = favorites.some(favorite => favorite.uid === caregiverId);
    if (isFavorite) {
      await removeFavorite(caregiverId);
    } else {
      await addFavorite(caregiverId);
    }
  };

  const handleViewProfile = (caregiver) => {
    const caregiverData = {
      id: caregiver.id,
      name: caregiver.fullName,
      email: caregiver.email,
      phone: caregiver.phone,
      address: caregiver.address,
      bio: caregiver.bio,
      category: caregiver.category,
      specialty: caregiver.specialty,
      experienceYears: caregiver.experienceYears,
      experienceDescription: caregiver.experienceDescription,
      hourlyRate: caregiver.hourlyRate
    };
    setSelectedCaregiver(caregiverData);
    setIsModalOpen(true);
  };

  const handleMultiHourBooking = (caregiverId: string) => {
    setSelectedCaregiverId(caregiverId);
    setShowMultiHourBooking(true);
  };

  const fetchRatings = async () => {
    try {
      const ratingsCollection = collection(db, 'ratings');
      const ratingsSnapshot = await getDocs(ratingsCollection);
      
      if (ratingsSnapshot.empty) {
        setErrorRatings("Nenhuma avaliação encontrada.");
        return;
      }

      const ratingsList = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(ratingsList);
    } catch (error) {
      console.error("Erro ao buscar ratings:", error);
      setErrorRatings("Ocorreu um erro ao buscar as avaliações.");
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchAvailableLocations = async () => {
    try {
      setLoadingLocations(true);
      const caregiverQuery = query(collection(db, 'users'), where('role', '==', 'caregiver'));
      const querySnapshot = await getDocs(caregiverQuery);
      
      const states = new Set<string>();
      const cities = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.state) states.add(data.state);
        if (data.city) cities.add(data.city);
      });

      setAvailableStates(Array.from(states).sort());
      setAvailableCities(Array.from(cities).sort());
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchAvailableLocations();
  }, []);

  useEffect(() => {
    const updateCitiesForState = async () => {
      if (!filters.state) {
        const querySnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'caregiver'))
        );
        const allCities = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.city) allCities.add(data.city);
        });
        setAvailableCities(Array.from(allCities).sort());
      } else {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'users'),
            where('role', '==', 'caregiver'),
            where('state', '==', filters.state)
          )
        );
        const stateCities = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.city) stateCities.add(data.city);
        });
        setAvailableCities(Array.from(stateCities).sort());
      }
    };

    updateCitiesForState();
  }, [filters.state]);

  const fetchAvailableSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const caregiverQuery = query(collection(db, 'users'), where('role', '==', 'caregiver'));
      const querySnapshot = await getDocs(caregiverQuery);
      
      const specialtiesSet = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.specialty) specialtiesSet.add(data.specialty);
      });

      const formattedSpecialties = Array.from(specialtiesSet).sort().map(specialty => ({
        value: specialty,
        label: specialty.charAt(0).toUpperCase() + specialty.slice(1)
      }));

      setAvailableSpecialties(formattedSpecialties);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  useEffect(() => {
    fetchAvailableSpecialties();
  }, []);

  if (loadingRatings) {
    return <div>Carregando...</div>;
  }

  if (errorRatings) {
    return <div>{errorRatings}</div>; 
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Filtros</h2>
            
            {/* Especialidade */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade
              </label>
              <select
                value={filters.specialty || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingSpecialties}
              >
                <option value="">Todas</option>
                {availableSpecialties.map(specialty => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Faixa de Preço */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa de Preço (R$/hora)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minRate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRate: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxRate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxRate: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Região */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.state || ''}
                onChange={(e) => {
                  const newState = e.target.value;
                  setFilters(prev => ({ 
                    ...prev, 
                    state: newState,
                    city: '' // Reset city when state changes
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingLocations}
              >
                <option value="">Todos os estados</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <select
                value={filters.city || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingLocations}
              >
                <option value="">Todas as cidades</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Limpar Filtros */}
            <button
              onClick={() => setFilters({})}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Cuidadores */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum cuidador encontrado com as informações fornecidas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((caregiver) => (
                <div key={caregiver.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Informações do cuidador */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {caregiver.fullName}
                        </h3>
                        
                        {/* Especialidade e Localização */}
                        <div className="mb-4">
                          <p className="text-gray-700 mb-2">
                            <span className="font-medium">Especialidade:</span>{' '}
                            {caregiver.specialty}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Localização:</span>{' '}
                            {caregiver.city}, {caregiver.state}
                          </p>
                        </div>

                        {/* Bio do profissional */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-lg">
                            {caregiver.bio}
                          </p>
                        </div>

                        {/* Preço e Avaliações */}
                        <div className="flex items-center gap-6">
                          <div className="flex items-center">
                            <span className="text-green-600 font-semibold text-xl">
                              R$ {caregiver.payment?.rate || 0}
                            </span>
                            <span className="text-gray-500 ml-1">/hora</span>
                          </div>
                          {reviewStats[caregiver.id] && (
                            <div className="flex items-center">
                              <span className="text-yellow-400 text-xl">★</span>
                              <span className="ml-1 text-gray-600">
                                {reviewStats[caregiver.id].averageRating.toFixed(1)}
                              </span>
                              <span className="text-gray-500 ml-1">
                                ({reviewStats[caregiver.id].totalReviews} avaliações)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                          onClick={() => handleMultiHourBooking(caregiver.id)}
                          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          Agende agora
                        </button>
                        <button
                          onClick={() => handleFavoriteClick(caregiver.id)}
                          className={`w-full px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                            favorites.some(favorite => favorite.uid === caregiver.id)
                              ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {favorites.some(favorite => favorite.uid === caregiver.id) ? (
                            <>
                              <span>Remover dos Favoritos</span>
                              <span>❤️</span>
                            </>
                          ) : (
                            <>
                              <span>Adicionar aos Favoritos</span>
                              <span>🤍</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showMultiHourBooking && selectedCaregiverId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Agendamento de Múltiplas Horas</h2>
              <button
                onClick={() => setShowMultiHourBooking(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MultiHourAppointmentBooking 
              caregiverId={selectedCaregiverId} 
              onClose={() => setShowMultiHourBooking(false)}
              hourlyRate={results.find(c => c.id === selectedCaregiverId)?.payment?.rate || 0}
            />
          </div>
        </div>
      )}
      <CaregiverProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caregiver={selectedCaregiver}
      />
    </div>
  );
};

export default Search;
