import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import RatingStars from './RatingStars';
import { toast } from 'react-hot-toast';

interface RatingModalProps {
  appointmentId: string;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  appointmentId,
  onClose,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    const checkAppointment = async () => {
      try {
        const appointmentRef = doc(db, 'hireRequests', appointmentId);
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          setError("Agendamento não encontrado.");
          return;
        }

        const appointmentData = appointmentDoc.data();
        setAppointment(appointmentData);
        
        // Verificar se o serviço está pago
        if (appointmentData.status !== 'paid') {
          setError("O serviço precisa estar pago para ser avaliado.");
          return;
        }

        // Verificar se já existe uma avaliação
        const ratingRef = doc(db, 'ratings', appointmentId);
        const ratingDoc = await getDoc(ratingRef);

        if (ratingDoc.exists()) {
          setError("Este serviço já foi avaliado.");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar agendamento:", error);
        setError("Erro ao verificar agendamento.");
      }
    };

    checkAppointment();
  }, [appointmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Por favor, selecione uma avaliação.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Criar a avaliação
      await setDoc(doc(db, 'ratings', appointmentId), {
        appointmentId,
        caregiverId: appointment.caregiverId,
        clientId: appointment.clientId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });

      // Atualizar o status do agendamento para 'completed'
      const appointmentRef = doc(db, 'hireRequests', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        rating,
        ratingComment: comment.trim()
      });

      toast.success('Avaliação enviada com sucesso!');
      onClose();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      setError("Ocorreu um erro ao salvar a avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Avaliar Atendimento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como você avalia o atendimento?
              </label>
              <div className="flex justify-center">
                <RatingStars
                  rating={rating || 0}
                  onChange={setRating}
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Deixe seu comentário sobre o atendimento..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !rating}
                className={`w-full py-2 px-4 rounded-md text-white font-medium
                  ${isSubmitting || !rating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingModal;