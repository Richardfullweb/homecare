import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface ScheduleModalProps {
  caregiver: any;
  onClose: () => void;
  onConfirm: (schedule: any) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ caregiver, onClose, onConfirm }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [totalPrice, setTotalPrice] = useState(0);
  const [dayRate, setDayRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDayRate = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', caregiver.id));
        if (userDoc.exists()) {
          setDayRate(userDoc.data().DayRate || 0);
        }
      } catch (error) {
        console.error('Error fetching day rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDayRate();
  }, [caregiver.id]);

  const calculateTotalPrice = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return dayDiff * dayRate;
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(startDate, endDate));
  }, [startDate, endDate, dayRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hireRequest = {
        caregiverId: caregiver.id,
        clientId: '4A9kRfGaV3RtaU2YrPesTP8VRrt2', // TODO: substituir pelo ID do cliente logado
        clientName: 'Pamela Alvarenga', // TODO: substituir pelo nome do cliente logado
        createdAt: new Date(),
        date: new Date(startDate),
        endTime: endDate.split('T')[1]?.substring(0, 5) || '10:00',
        notes: '',
        startTime: startDate.split('T')[1]?.substring(0, 5) || '09:00',
        status: 'pending',
        period: 'daily',
        dayRate: dayRate,
        day: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1,
        totalAmount: totalPrice
      };

      await addDoc(collection(db, 'hireRequests'), hireRequest);
      
      onConfirm({
        startDate,
        endDate,
        timeOfDay,
        totalPrice,
        caregiver
      });
    } catch (error) {
      console.error('Error creating hire request:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agendar com {caregiver.fullName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Data de Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Data de Término</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Período do Dia</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="evening">Noite</option>
            </select>
          </div>

          {loading ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Valor Total</label>
              <div className="p-2 border rounded-lg bg-gray-100">
                Carregando...
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Valor Total</label>
              <div className="p-2 border rounded-lg bg-gray-100">
                R$ {totalPrice.toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Confirmar Diária
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
