import React, { useState } from 'react';
import { Appointment } from '../../types';

interface CheckoutModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirmPayment: (appointmentId: string) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  appointment,
  onClose,
  onConfirmPayment,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await onConfirmPayment(appointment.id);
      onClose();
    } catch (error) {
      setError('Falha ao processar pagamento. Por favor, tente novamente.');
      console.error('Erro de pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Confirmar Pagamento</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Detalhes do Agendamento</h3>
            <p>Data: {new Date(appointment.date).toLocaleDateString()}</p>
            <p>Horário: {appointment.startTime} às {appointment.endTime}</p>
            <p>Cuidador: {appointment.caregiverName || 'Não especificado'}</p>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Resumo do Pagamento</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Valor por Hora</span>
                <span>R$ {appointment.hourlyRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Horas</span>
                <span>{appointment.hours}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>R$ {appointment.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa da Plataforma (20%)</span>
                <span>R$ {(appointment.totalAmount * 0.2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t font-bold">
                <span>Total</span>
                <span>R$ {appointment.totalAmount}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg text-white font-medium
                ${isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isProcessing ? 'Processando...' : `Pagar R$ ${appointment.totalAmount}`}
            </button>
            
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
