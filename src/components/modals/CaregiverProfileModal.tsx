import React from 'react';

interface CaregiverProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    bio: string;
    category: string;
    specialty: string;
    experienceYears: number;
    experienceDescription: string;
    hourlyRate: number;
  } | null;
}

const CaregiverProfileModal: React.FC<CaregiverProfileModalProps> = ({ isOpen, onClose, caregiver }) => {
  if (!isOpen || !caregiver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header com botão de fechar */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{caregiver.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Especialidade */}
          <div className="mb-4">
            <p className="text-base text-blue-600">{caregiver.category} - {caregiver.specialty}</p>
          </div>

          {/* Informações de Contato */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contato</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm">
                <span className="text-gray-500">Email: </span>
                <span className="text-gray-900">{caregiver.email}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Telefone: </span>
                <span className="text-gray-900">{caregiver.phone}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {caregiver.address && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Endereço</h3>
              <p className="text-sm text-gray-900">
                {caregiver.address.street && `${caregiver.address.street}`}
                {caregiver.address.number && `, ${caregiver.address.number}`}
                {caregiver.address.complement && ` - ${caregiver.address.complement}`}
                {caregiver.address.neighborhood && <><br />{caregiver.address.neighborhood}</>}
                {(caregiver.address.city || caregiver.address.state) && (
                  <><br />{caregiver.address.city} - {caregiver.address.state}</>
                )}
                {caregiver.address.zipCode && <><br />CEP: {caregiver.address.zipCode}</>}
              </p>
            </div>
          )}

          {/* Experiência */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Experiência</h3>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              {caregiver.experienceYears && (
                <p className="mb-2">
                  <span className="font-medium">Anos de Experiência:</span> {caregiver.experienceYears} anos
                </p>
              )}
              {caregiver.experienceDescription && (
                <p className="text-gray-700">{caregiver.experienceDescription}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {caregiver.bio && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Sobre</h3>
              <p className="text-sm text-gray-700">{caregiver.bio}</p>
            </div>
          )}

          {/* Valor por Hora */}
          {caregiver.hourlyRate && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Valor por Hora</h3>
              <p className="text-lg font-semibold text-green-600">
                R$ {caregiver.hourlyRate.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          <button
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {
              onClose();
            }}
          >
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaregiverProfileModal;
