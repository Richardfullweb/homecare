import React from 'react';

interface ProfileModalProps {
  caregiver: {
    uid: string;
    name: string;
    email?: string;
    bio?: string;
    photoURL?: string;
    specialties?: string[];
    hourlyRate?: number;
    description?: string;
    availability?: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  };
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ caregiver, onClose }) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Segunda' },
    { key: 'tuesday', label: 'Terça' },
    { key: 'wednesday', label: 'Quarta' },
    { key: 'thursday', label: 'Quinta' },
    { key: 'friday', label: 'Sexta' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header com foto e nome */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {caregiver.photoURL ? (
                <img
                  src={caregiver.photoURL}
                  alt={caregiver.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {caregiver.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-4">
                <h2 className="text-2xl font-bold">{caregiver.name}</h2>
                {caregiver.hourlyRate > 0 && (
                  <p className="text-lg font-medium text-green-600">
                    R$ {caregiver.hourlyRate}/hora
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Especialidades */}
          {Array.isArray(caregiver.specialties) && caregiver.specialties.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {caregiver.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Biografia */}
          {(caregiver.bio || caregiver.description) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Sobre</h3>
              <p className="text-gray-600">
                {caregiver.description || caregiver.bio}
              </p>
            </div>
          )}

          {/* Disponibilidade */}
          {caregiver.availability && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Disponibilidade</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {daysOfWeek.map(({ key, label }) => (
                  <div
                    key={key}
                    className={`p-2 rounded ${
                      caregiver.availability?.[key as keyof typeof caregiver.availability]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="block text-sm">
                      {caregiver.availability?.[key as keyof typeof caregiver.availability]
                        ? 'Disponível'
                        : 'Indisponível'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de contato */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
