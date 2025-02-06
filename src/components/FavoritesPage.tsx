import React, { useState } from 'react';
import useFavorites from '../hooks/useFavorites';
import ProfileModal from './Profile/ProfileModal';

const FavoritesPage: React.FC = () => {
  const { favorites, loading, error } = useFavorites();
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-10">
      <h2 className="text-2xl font-bold mb-10">Meus Cuidadores Favoritos</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Você ainda não tem cuidadores favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((caregiver) => (
            <div key={caregiver.uid} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center cursor-pointer" onClick={() => setSelectedCaregiver(caregiver)}>
                {caregiver.photoURL ? (
                  <img
                    src={caregiver.photoURL}
                    alt={caregiver.name}
                    className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mb-4 bg-gray-200 flex items-center justify-center text-gray-500">
                    {caregiver.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{caregiver.name}</h3>
                
                {caregiver.hourlyRate > 0 && (
                  <p className="text-lg font-medium text-green-600 mb-2">
                    R$ {caregiver.hourlyRate}/hora
                  </p>
                )}

                {Array.isArray(caregiver.specialties) && caregiver.specialties.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {caregiver.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                {caregiver.description ? (
                  <p className="text-gray-600 text-sm text-center line-clamp-3 mb-3">
                    {caregiver.description}
                  </p>
                ) : caregiver.bio ? (
                  <p className="text-gray-600 text-sm text-center line-clamp-3 mb-3">
                    {caregiver.bio}
                  </p>
                ) : null}

                <span className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                  Ver perfil completo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCaregiver && (
        <ProfileModal
          caregiver={selectedCaregiver}
          onClose={() => setSelectedCaregiver(null)}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
