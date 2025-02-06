import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  clientName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: string;
  address: string;
  clientId: string;
}

const AppointmentsPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'hireRequests'),
        where('caregiverId', '==', user?.uid),
        where('status', '==', 'accepted'),
        where('date', '>=', today),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupAppointmentsByDate = () => {
    const grouped: { [key: string]: Appointment[] } = {};
    appointments.forEach(appointment => {
      const dateStr = format(appointment.date.toDate(), 'yyyy-MM-dd');
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(appointment);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Próximos Atendimentos</h1>

      {Object.keys(groupedAppointments).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">Nenhum atendimento agendado para os próximos dias.</p>
          <p className="text-sm text-gray-500 mt-2">
            Os atendimentos aceitos aparecerão aqui.
          </p>
        </div>
      ) : (
        Object.entries(groupedAppointments).map(([dateStr, dayAppointments]) => (
          <div key={dateStr} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              {format(new Date(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            <div className="space-y-4">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">
                        {appointment.clientName}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {appointment.startTime} às {appointment.endTime}
                      </p>
                      {appointment.address && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Endereço:</p>
                          <p className="text-gray-700">{appointment.address}</p>
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AppointmentsPage;