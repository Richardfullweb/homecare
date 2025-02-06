import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { Appointment } from '../../types/appointment';
import CheckoutModal from './CheckoutModal';

interface CompletedPayment extends Appointment {
  paymentDate: Date;
}

const PaymentPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadAppointments();
      loadCompletedPayments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      console.log('Fetching appointments for user:', user?.uid);
      const q = query(
        collection(db, 'hireRequests'),
        where('clientId', '==', user?.uid),
        where('status', '==', 'accepted')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];
      console.log('Found appointments:', querySnapshot.size);
      
      // Buscar dados dos cuidadores em paralelo
      const appointmentPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        console.log('Appointment data:', data);
        
        try {
          // Buscar dados do cuidador para obter o preço por hora
          const caregiverRef = doc(db, 'users', data.caregiverId);
          const caregiverDoc = await getDoc(caregiverRef);
          const caregiverData = caregiverDoc.data();
          
          if (!caregiverData) {
            console.error('Caregiver data not found for ID:', data.caregiverId);
            return null;
          }

          // Calcular o preço total baseado nas horas
          const startTime = parseInt(data.startTime.split(':')[0]);
          const endTime = parseInt(data.endTime.split(':')[0]);
          const hours = endTime - startTime;
          const hourlyRate = parseFloat(caregiverData.hourlyRate || '0');
          const totalAmount = hours * hourlyRate;

          console.log('Calculated appointment details:', {
            hours,
            hourlyRate,
            totalAmount,
            caregiverName: caregiverData.fullName
          });

          return {
            id: docSnapshot.id,
            ...data,
            caregiverName: caregiverData.fullName || 'Não especificado',
            hourlyRate: hourlyRate,
            hours: hours,
            totalAmount: totalAmount
          } as Appointment;
        } catch (err) {
          console.error('Error processing appointment:', err);
          return null;
        }
      });

      // Aguardar todas as promessas e filtrar os nulos
      const resolvedAppointments = (await Promise.all(appointmentPromises))
        .filter((appointment): appointment is Appointment => appointment !== null);
      
      console.log('Final appointments array:', resolvedAppointments);
      setAppointments(resolvedAppointments);
    } catch (err) {
      console.error('Error details:', err);
      setError('Falha ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedPayments = async () => {
    try {
      console.log('Carregando histórico de pagamentos...');
      const q = query(
        collection(db, 'hireRequests'),
        where('clientId', '==', user?.uid),
        where('status', '==', 'paid'),
        orderBy('paymentDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const paymentsData: CompletedPayment[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        console.log('Dados do pagamento:', data);

        try {
          const caregiverRef = doc(db, 'users', data.caregiverId);
          const caregiverDoc = await getDoc(caregiverRef);
          const caregiverData = caregiverDoc.data();

          if (!caregiverData) {
            console.warn('Dados do cuidador não encontrados:', data.caregiverId);
            continue;
          }

          const payment: CompletedPayment = {
            id: docSnapshot.id,
            ...data,
            caregiverName: caregiverData.fullName || 'Não especificado',
            paymentDate: data.paymentDate?.toDate() || new Date(),
            totalAmount: data.totalAmount || 0,
            hourlyRate: data.hourlyRate || 0,
            hours: data.hours || 0
          } as CompletedPayment;

          console.log('Pagamento processado:', payment);
          paymentsData.push(payment);
        } catch (err) {
          console.error('Erro ao processar pagamento:', err);
          continue;
        }
      }

      console.log('Total de pagamentos carregados:', paymentsData.length);
      setCompletedPayments(paymentsData);
    } catch (err) {
      console.error('Erro ao carregar histórico de pagamentos:', err);
    }
  };

  const handlePay = async (appointmentId: string) => {
    try {
      setLoading(true);
      console.log('Processando pagamento para agendamento:', appointmentId);
      
      // Encontrar o appointment atual
      const appointment = appointments.find(app => app.id === appointmentId);
      if (!appointment) {
        throw new Error('Agendamento não encontrado');
      }

      // Usar o valor total já calculado
      const totalAmount = appointment.totalAmount;
      const paymentDate = new Date();
      
      const appointmentRef = doc(db, 'hireRequests', appointmentId);
      
      // Dados do pagamento
      const paymentData = {
        status: 'paid',
        updatedAt: serverTimestamp(),
        paymentDate: serverTimestamp(),
        totalAmount: totalAmount,
        hourlyRate: appointment.hourlyRate,
        hours: appointment.hours,
        caregiverAmount: totalAmount * 0.8, // 80% para o cuidador
        platformFee: totalAmount * 0.2 // 20% taxa da plataforma
      };

      // Atualizar no Firestore
      await updateDoc(appointmentRef, paymentData);

      console.log('Pagamento processado com sucesso');

      // Atualizar estados locais
      setAppointments(prevAppointments => 
        prevAppointments.filter(app => app.id !== appointmentId)
      );

      // Adicionar ao histórico de pagamentos
      const newPayment: CompletedPayment = {
        ...appointment,
        ...paymentData,
        paymentDate: paymentDate
      };

      setCompletedPayments(prev => [newPayment, ...prev]);
      
      // Recarregar os dados para garantir sincronização
      await Promise.all([
        loadAppointments(),
        loadCompletedPayments()
      ]);

      setSelectedAppointment(null);
      setError('');
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setError('Falha ao processar pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Pagamentos Pendentes</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">Nenhum pagamento pendente no momento</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Agendamento para {new Date(appointment.date).toLocaleDateString()}
                      </h3>
                      <p className="text-gray-600">
                        Horário: {appointment.startTime} às {appointment.endTime}
                      </p>
                      <p className="text-gray-600">
                        Cuidador: {appointment.caregiverName || 'Não especificado'}
                      </p>
                      <p className="text-green-600 font-medium mt-2">
                        Status: Aprovado pelo cuidador - Aguardando pagamento
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Valor: R$ {appointment.totalAmount}
                      </p>
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="mt-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Pagar Agora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Histórico de Pagamentos</h2>
        <div className="space-y-4">
          {completedPayments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">Nenhum pagamento realizado ainda</p>
            </div>
          ) : (
            completedPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Agendamento do dia {new Date(payment.date).toLocaleDateString()}
                    </h3>
                    <p className="text-gray-600">
                      Horário: {payment.startTime} às {payment.endTime}
                    </p>
                    <p className="text-gray-600">
                      Cuidador: {payment.caregiverName}
                    </p>
                    <p className="text-gray-600">
                      Data do Pagamento: {payment.paymentDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Pago: R$ {payment.totalAmount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Taxa da plataforma: R$ {(payment.totalAmount * 0.2).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedAppointment && (
        <CheckoutModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirmPayment={handlePay}
        />
      )}
    </div>
  );
};

export default PaymentPage;
