import React, { useState } from 'react';
import { searchCaregivers } from '../../api/search-caregivers';
import ScheduleModal from './ScheduleModal';

const BookingForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [elderlyCount, setElderlyCount] = useState(1);
  const [careType, setCareType] = useState('');
  const [availability, setAvailability] = useState('');
  const [foundCaregivers, setFoundCaregivers] = useState<any[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      searchCaregivers({
        elderlyCount,
        careType,
        availability
      }).then(caregivers => {
        setFoundCaregivers(caregivers);
      });
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSchedule = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = (schedule: any) => {
    console.log('Agendamento confirmado:', schedule);
    setShowScheduleModal(false);
    // TODO: Implement actual scheduling logic
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Encontre o Cuidador Ideal</h1>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
              step === s ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Para quantos idosos será o atendimento?</h2>
            <p className="text-gray-600 mb-6 text-sm">Selecione o número de idosos que precisarão de cuidados simultâneos</p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => setElderlyCount(count)}
                  className={`p-6 rounded-lg text-lg flex flex-col items-center ${
                    elderlyCount === count
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">👴</span>
                  {count} {count === 1 ? 'idoso' : 'idosos'}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Que tipo de assistência o idoso precisa?</h2>
            <p className="text-gray-600 mb-6 text-sm">Selecione o tipo de cuidado principal necessário</p>
            <div className="space-y-4">
              {[
                { 
                  type: 'Acompanhamento diário',
                  icon: '🌞',
                  description: 'Para atividades do dia a dia e companhia'
                },
                { 
                  type: 'Cuidados especiais',
                  icon: '🩺', 
                  description: 'Para idosos com necessidades médicas específicas'
                },
                { 
                  type: 'Auxílio noturno',
                  icon: '🌙',
                  description: 'Para cuidados durante a noite'
                }
              ].map(({type, icon, description}) => (
                <button
                  key={type}
                  onClick={() => setCareType(type)}
                  className={`w-full p-4 rounded-lg text-left ${
                    careType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{icon}</span>
                    <div>
                      <p className="font-medium">{type}</p>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Como são as necessidades do(s) idoso(s)?</h2>
            <p className="text-gray-600 mb-6 text-sm">Selecione todas as opções que se aplicam</p>
            <div className="space-y-4">
              {[
                {
                  type: 'Companhia',
                  icon: '💬',
                  description: 'Para conversar e fazer companhia'
                },
                {
                  type: 'Mobilidade reduzida',
                  icon: '♿',
                  description: 'Precisa de ajuda para se locomover'
                },
                {
                  type: 'Doenças degenerativas',
                  icon: '🧠',
                  description: 'Condições como Alzheimer ou Parkinson'
                }
              ].map(({type, icon, description}) => (
                <button
                  key={type}
                  onClick={() => setCareType(type)}
                  className={`w-full p-4 rounded-lg text-left ${
                    careType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{icon}</span>
                    <div>
                      <p className="font-medium">{type}</p>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Qual a frequência de atendimento?</h2>
            <p className="text-gray-600 mb-6 text-sm">Selecione a frequência que melhor se adequa às suas necessidades</p>
            <div className="grid grid-cols-3 gap-4">
              {['Diária', 'Semanal', 'Mensal'].map((option) => (
                <button
                  key={option}
                  onClick={() => setAvailability(option)}
                  className={`p-6 rounded-lg text-center ${
                    availability === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirme suas escolhas</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><strong>Idosos:</strong> {elderlyCount}</p>
              <p><strong>Tipo de cuidado:</strong> {careType}</p>
              <p><strong>Frequência:</strong> {availability}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={handlePreviousStep}
              className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </button>
          )}
          <button
            onClick={handleNextStep}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 ml-auto"
          >
            {step === 4 ? 'Buscar Cuidadores' : 'Próximo'}
          </button>
        </div>
      </div>

      {/* Results */}
      {foundCaregivers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Cuidadores Encontrados</h2>
          <div className="space-y-4">
            {foundCaregivers.map((caregiver) => (
              <div key={caregiver.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <img
                    src={caregiver.imageUrl || 'https://via.placeholder.com/150'}
                    alt={caregiver.fullName}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{caregiver.fullName}</h3>
                    <p className="text-gray-600">{caregiver.city}, {caregiver.state}</p>
                    <p className="text-gray-700 mt-2">{caregiver.bio}</p>
                    <div className="mt-2">
                      <span className="font-bold text-lg">R$ {caregiver.hourlyRate}/hora</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Horários Disponíveis:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => (
                      <div key={day} className="bg-gray-100 p-2 rounded">
                        <p className="font-medium">{day}</p>
                        <p className="text-sm">8h - 18h</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => handleSchedule(caregiver)}
                  >
                    Agendar com {caregiver.fullName.split(' ')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScheduleModal && selectedCaregiver && (
        <ScheduleModal
          caregiver={selectedCaregiver}
          onClose={() => setShowScheduleModal(false)}
          onConfirm={handleConfirmSchedule}
        />
      )}
    </div>
  );
};

export default BookingForm;
