import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { firestore } from '../../firebase';
import MultiHourAppointmentBooking from './MultiHourAppointmentBooking';

interface CaregiverProfileProps {
  // caregiverId: string; // Caso receba por props
}

const CaregiverProfile: React.FC<CaregiverProfileProps> = () => {
  const { caregiverId } = useParams<{ caregiverId: string }>(); // Obtém o ID da rota
  const [caregiver, setCaregiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMultiHourBooking, setShowMultiHourBooking] = useState(false);

  useEffect(() => {
    const fetchCaregiver = async () => {
      setLoading(true);
      setError(null);
      try {
        const doc = await firestore
          .collection('caregivers')
          .doc(caregiverId)
          .get();
        if (doc.exists) {
          setCaregiver(doc.data());
        } else {
          setError('Cuidador não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar cuidador:', err);
        setError('Erro ao carregar dados do cuidador.');
      } finally {
        setLoading(false);
      }
    };

    if (caregiverId) {
      fetchCaregiver();
    } else {
      setError("ID do cuidador inválido!");
    }
  }, [caregiverId]);

  if (loading) {
    return <div className="text-center">Carregando perfil do cuidador...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600">Erro: {error}</div>;
  }

  if (!caregiver) {
    return <div className="text-center">Cuidador não encontrado.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <img
              src={caregiver.imageUrl || '/default-avatar.png'}
              alt={caregiver.fullName}
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
          <div className="ml-6 flex-1">
            <h2 className="text-2xl font-semibold mb-2">{caregiver.fullName}</h2>
            <p className="text-gray-600 mb-4">{caregiver.bio}</p>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700">Specialties:</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {caregiver.specialties && Array.isArray(caregiver.specialties) ? (
                  caregiver.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Agendamento</h3>
          <button
            onClick={() => setShowMultiHourBooking(true)}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Agendar Horário
          </button>
        </div>
      </div>

      {showMultiHourBooking && (
        <MultiHourAppointmentBooking
          caregiverId={caregiverId}
          hourlyRate={caregiver.hourlyRate || 0}
          onClose={() => setShowMultiHourBooking(false)}
        />
      )}
    </div>
  );
};

export default CaregiverProfile;
