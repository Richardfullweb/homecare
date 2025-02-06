import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc as firestoreDoc,
  serverTimestamp,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificationService } from '../../services/NotificationService';

interface Appointment {
  id: string;
  clientId: string;
  caregiverId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: 'accept' | 'reject' | 'complete' | 'pending' | 'accepted' | 'rejected' | 'paid' | 'completed';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  clientName?: string;
  clientImageUrl?: string;
  totalAmount?: number;
  caregiverAmount?: number;
}

interface AppointmentGroup {
  pending: Appointment[];
  upcoming: Appointment[];
  completed: Appointment[];
  cancelled: Appointment[];
}

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

const StatsCard = ({ title, value, subtitle }: StatsCardProps) => {
  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      if (title === 'Ganhos Totais') {
        return `R$ ${value.toFixed(2)}`;
      }
      return value.toString();
    }
    return value;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${
        typeof value === 'number' && title === 'Ganhos Totais' 
          ? 'text-green-600' 
          : 'text-blue-600'
      }`}>
        {formatValue(value)}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

const CaregiverDashboard: React.FC = () => {
  const [user, authLoading, authError] = useAuthState(auth);
  const [appointments, setAppointments] = useState<AppointmentGroup>({
    pending: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<keyof AppointmentGroup>('pending');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedAppointments: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadAppointments();
    loadStats();
    checkProfileCompletion();
  }, [user]);

  const checkProfileCompletion = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(firestoreDoc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const requiredFields = ['fullName', 'phoneNumber', 'address', 'bio', 'hourlyRate'];
        const isComplete = requiredFields.every(field => userData[field]);
        setProfileComplete(isComplete);
      }
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
    }
  };

  const calculateTotalAmount = (startTime: string, endTime: string, hourlyRate: number) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDate = new Date(2000, 0, 1, startHour, startMinute);
    const endDate = new Date(2000, 0, 1, endHour, endMinute);
    
    const diffInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return hourlyRate * diffInHours;
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      console.log('Carregando estatísticas para:', user.uid);
      
      const appointmentsRef = collection(db, 'hireRequests');
      const earningsQuery = query(
        appointmentsRef,
        where('caregiverId', '==', user.uid),
        where('status', 'in', ['completed', 'paid'])
      );

      const earningsSnap = await getDocs(earningsQuery);
      console.log('Atendimentos para cálculo de ganhos:', earningsSnap.size);
      
      let totalBruto = 0;
      let completedCount = 0;

      for (const doc of earningsSnap.docs) {
        const data = doc.data();
        console.log('Dados do atendimento:', data);
        
        if (data.caregiverAmount) {
          console.log('Adicionando ao total bruto:', data.caregiverAmount);
          totalBruto += Number(data.caregiverAmount);
        }
        completedCount++;
      }

      console.log('Total bruto calculado:', totalBruto);
      
      // Aplicar desconto de 20% para a plataforma
      const totalEarnings = totalBruto * 0.8;
      console.log('Total líquido após desconto de 20%:', totalEarnings);

      console.log('Estatísticas calculadas:', {
        totalEarnings,
        completedCount
      });

      setStats({
        totalEarnings,
        completedAppointments: completedCount,
        averageRating: 0,
        totalReviews: 0
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      console.log('Carregando agendamentos para:', user.uid);
      
      const appointmentsRef = collection(db, 'hireRequests');
      const q = query(
        appointmentsRef,
        where('caregiverId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('Agendamentos encontrados:', querySnapshot.size);
      
      const appointmentsList: Appointment[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        console.log('Dados do agendamento:', data);
        
        // Buscar informações do cliente
        const clientRef = firestoreDoc(db, 'users', data.clientId);
        const clientSnap = await getDoc(clientRef);
        const clientData = clientSnap.data();

        const appointment: Appointment = {
          id: doc.id,
          clientId: data.clientId,
          caregiverId: data.caregiverId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          notes: data.notes || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
          clientName: clientData?.fullName || 'Cliente',
          clientImageUrl: clientData?.imageUrl,
          totalAmount: data.totalAmount,
          caregiverAmount: data.caregiverAmount
        };

        appointmentsList.push(appointment);
      }

      console.log('Lista de agendamentos:', appointmentsList);

      const now = new Date();
      const appointmentGroups: AppointmentGroup = {
        pending: appointmentsList.filter(a => a.status === 'pending'),
        upcoming: appointmentsList.filter(a => 
          a.status === 'accepted' && 
          a.date.toDate() > now
        ),
        completed: appointmentsList.filter(a => a.status === 'completed'),
        cancelled: appointmentsList.filter(a => a.status === 'rejected')
      };

      console.log('Grupos de agendamentos:', appointmentGroups);
      setAppointments(appointmentGroups);

    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setError('Falha ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject' | 'complete') => {
    if (!user) return;
    
    try {
      console.log('Atualizando agendamento:', appointmentId, action);
      
      const appointmentRef = firestoreDoc(db, 'hireRequests', appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error('Agendamento não encontrado');
      }

      const appointmentData = appointmentDoc.data();
      const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'completed';
      
      // Atualizar status do agendamento
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Buscar informações do cuidador
      const caregiverRef = firestoreDoc(db, 'users', user.uid);
      const caregiverSnap = await getDoc(caregiverRef);
      const caregiverData = caregiverSnap.data();
      const caregiverName = caregiverData?.fullName || user.displayName || 'Cuidador';

      // Enviar notificação para o cliente
      if (action === 'accept') {
        await NotificationService.notifyAppointmentAccepted({
          userId: appointmentData.clientId,
          appointmentId,
          message: `Seu agendamento foi aceito por ${caregiverName}`
        });
      } else if (action === 'reject') {
        await NotificationService.notifyAppointmentRejected({
          userId: appointmentData.clientId,
          appointmentId,
          message: `Seu agendamento foi rejeitado por ${caregiverName}`
        });
      } else if (action === 'complete') {
        await NotificationService.notifyAppointmentCompleted({
          userId: appointmentData.clientId,
          appointmentId,
          message: `Seu serviço com ${caregiverName} foi concluído`
        });
      }

      // Atualizar stats e lista de agendamentos
      await loadStats();
      await loadAppointments();
      
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Falha ao atualizar o agendamento');
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const formattedDate = format(appointment.date.toDate(), "dd/MM/yyyy", { locale: ptBR });

    return (
      <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {appointment.clientName || 'Cliente'}
            </h3>
            <p className="text-gray-600">
              {formattedDate} - {appointment.startTime} às {appointment.endTime}
            </p>
            {appointment.caregiverAmount && (
              <p className="text-green-600 mt-2">
                Valor a receber: R$ {appointment.caregiverAmount.toFixed(2)}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        
        {appointment.notes && (
          <p className="text-gray-700 mb-4">{appointment.notes}</p>
        )}
        
        <div className="flex justify-end space-x-2">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Aceitar
              </button>
              <button
                onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
            </>
          )}
          {appointment.status === 'accepted' && (
            <button
              onClick={() => handleAppointmentAction(appointment.id, 'complete')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Marcar como Concluído
            </button>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar o painel. Por favor, faça login novamente.</p>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!profileComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Seu perfil está incompleto. Por favor,{' '}
                <Link to="/profile/caregiver" className="font-medium text-yellow-700 underline hover:text-yellow-600">
                  complete seu perfil
                </Link>{' '}
                para aumentar suas chances de ser contratado.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Ganhos Totais"
          value={stats.totalEarnings}
        />
        <StatsCard
          title="Atendimentos Concluídos"
          value={stats.completedAppointments}
        />
        <StatsCard
          title="Avaliação Média"
          value={stats.averageRating || 'N/A'}
          subtitle={`${stats.totalReviews} avaliações`}
        />
        <Link
          to="/apply"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-lg font-medium text-gray-900">Inscrição</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </p>
          <p className="mt-1 text-sm text-gray-500">Candidatar-se a novas vagas</p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {Object.keys(appointments).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as keyof AppointmentGroup)}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {appointments[tab as keyof AppointmentGroup].length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {appointments[activeTab].length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum agendamento {getStatusText(activeTab).toLowerCase()}
            </p>
          ) : (
            appointments[activeTab].map(appointment => renderAppointmentCard(appointment))
          )}
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
