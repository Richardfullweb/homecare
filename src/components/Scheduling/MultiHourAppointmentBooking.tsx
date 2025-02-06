import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc, 
    Timestamp,
    runTransaction
} from 'firebase/firestore';
// import { createNewAppointmentRequestNotification } from '../../services/NotificationService'; // Desativando notificações
import { format, isSameDay, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
    id: string;
    caregiverId: string;
    clientId: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: string;
    createdAt: Timestamp;
}

interface MultiHourAppointmentBookingProps {
    caregiverId: string;
    onClose: () => void;
    hourlyRate: number;
}

interface TimeSlot {
    time: string;
    isAvailable: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; 

const MultiHourAppointmentBooking: React.FC<MultiHourAppointmentBookingProps> = ({ caregiverId, onClose, hourlyRate = 0 }) => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    const dayMapping: { [key: string]: string } = {
        'domingo': 'sunday',
        'segunda-feira': 'monday',
        'terça-feira': 'tuesday',
        'quarta-feira': 'wednesday',
        'quinta-feira': 'thursday',
        'sexta-feira': 'friday',
        'sábado': 'saturday'
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const retryOperation = async <T,>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
        try {
            return await operation();
        } catch (error) {
            if (retries > 0) {
                await delay(RETRY_DELAY);
                return retryOperation(operation, retries - 1);
            }
            throw error;
        }
    };

    useEffect(() => {
        if (selectedDate) {
            checkAvailability();
        }
    }, [selectedDate]);

    const getCaregiverAvailability = async () => {
        const caregiverRef = doc(db, 'users', caregiverId);
        const caregiverSnap = await getDoc(caregiverRef);
        if (!caregiverSnap.exists()) {
            throw new Error('Cuidador não encontrado');
        }
        return caregiverSnap.data().availability || {};
    };

    const checkAvailability = async () => {
        if (!selectedDate) return;

        try {
            setLoading(true);
            
            const caregiverAvailability = await retryOperation(getCaregiverAvailability);
            
            console.log('Disponibilidade do cuidador:', caregiverAvailability);
            console.log('Data selecionada:', selectedDate);
            console.log('Dia da semana:', new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase());
            
            const appointments = await retryOperation(async () => {
                const appointmentsRef = collection(db, 'hireRequests');
                const [year, month, day] = selectedDate.split('-').map(Number);
                const startOfDay = new Date(year, month - 1, day);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(year, month - 1, day);
                endOfDay.setHours(23, 59, 59, 999);

                const q = query(
                    appointmentsRef,
                    where('caregiverId', '==', caregiverId),
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay))
                );

                const querySnapshot = await getDocs(q);
                const appointments = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    caregiverId: doc.data().caregiverId,
                    clientId: doc.data().clientId,
                    date: doc.data().date,
                    startTime: doc.data().startTime,
                    endTime: doc.data().endTime,
                    totalAmount: doc.data().totalAmount,
                    status: doc.data().status,
                    createdAt: doc.data().createdAt
                } as Appointment));
                
                console.log('Agendamentos existentes:', appointments);
                return appointments;
            });

            setExistingAppointments(appointments);

            const ptDay = new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
            const selectedDay = dayMapping[ptDay] || ptDay;
            console.log('Dia mapeado:', selectedDay);
            const dayAvailability = caregiverAvailability[selectedDay] || {};
            
            console.log('Disponibilidade do dia:', dayAvailability);

            const slots = timeSlots.map(time => {
                const [hour] = time.split(':').map(Number);
                
                let isAvailable = false;
                
                if (hour >= 6 && hour < 12) {
                    isAvailable = dayAvailability.morning === true;
                } else if (hour >= 12 && hour < 18) {
                    isAvailable = dayAvailability.afternoon === true;
                } else if (hour >= 18 && hour < 24) {
                    isAvailable = dayAvailability.evening === true;
                }

                if (isAvailable) {
                    const isReserved = appointments.some(appointment => {
                        const appt = appointment as Appointment;
                        return appt.startTime <= time && time < appt.endTime;
                    });
                    isAvailable = !isReserved;
                }

                console.log('Verificação de horário:', {
                    time,
                    hour,
                    isAvailable,
                    dayAvailability
                });

                return {
                    time,
                    isAvailable
                };
            });

            console.log('Horários disponíveis:', slots);

            setAvailableTimeSlots(slots);
            setStartTime('');
            setEndTime('');
            setError('');
        } catch (err) {
            console.error('Erro ao verificar disponibilidade:', err);
            setError('Erro ao verificar disponibilidade. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTimeChange = (time: string) => {
        setStartTime(time);
        setEndTime('');
        setError('');
    };

    const handleEndTimeChange = (time: string) => {
        if (!startTime) {
            setError('Por favor, selecione primeiro o horário inicial');
            return;
        }

        const startIndex = timeSlots.indexOf(startTime);
        const endIndex = timeSlots.indexOf(time);

        if (endIndex <= startIndex) {
            setError('O horário final deve ser depois do horário inicial');
            return;
        }

        for (let i = startIndex; i <= endIndex; i++) {
            if (!availableTimeSlots[i].isAvailable) {
                const [hour] = timeSlots[i].split(':').map(Number);
                let period = '';
                
                if (hour >= 0 && hour < 6) {
                    period = 'madrugada';
                } else if (hour >= 6 && hour < 12) {
                    period = 'manhã';
                } else if (hour >= 12 && hour < 18) {
                    period = 'tarde';
                } else {
                    period = 'noite';
                }

                setError(`Este cuidador não está disponível na ${period}. Por favor, escolha outro horário.`);
                return;
            }
        }

        setEndTime(time);
        setError('');
    };

    const validateTimeSelection = (): boolean => {
        if (!startTime || !endTime) {
            setError('Por favor, selecione os horários de início e término.');
            return false;
        }

        const [startHour] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);

        if (startHour >= endHour) {
            setError('O horário de término deve ser depois do horário de início.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedDate || !startTime || !endTime) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!validateTimeSelection()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Iniciando processo de agendamento...');
            console.log('Dados do agendamento:', {
                caregiverId,
                selectedDate,
                startTime,
                endTime,
                user: user.uid
            });

            const appointmentId = await retryOperation(async () => {
                console.log('Iniciando transação no Firestore...');
                return await runTransaction(db, async (transaction) => {
                  
                    const appointmentsRef = collection(db, 'hireRequests');
                  
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const startOfDay = new Date(year, month - 1, day);
                    startOfDay.setHours(0, 0, 0, 0);
                    
                    const endOfDay = new Date(year, month - 1, day);
                    endOfDay.setHours(23, 59, 59, 999);

                    console.log('Verificando conflitos de agendamento...');
                    const q = query(
                        appointmentsRef,
                        where('caregiverId', '==', caregiverId),
                        where('date', '>=', Timestamp.fromDate(startOfDay)),
                        where('date', '<=', Timestamp.fromDate(endOfDay))
                    );

                    const querySnapshot = await getDocs(q);
                    const conflictingAppointment = querySnapshot.docs.some(doc => {
                        const data = doc.data();
                        return (
                            (data.startTime >= startTime && data.startTime < endTime) ||
                            (data.endTime > startTime && data.endTime <= endTime) ||
                            (data.startTime <= startTime && data.endTime >= endTime)
                        );
                    });

                    if (conflictingAppointment) {
                        console.error('Conflito de agendamento detectado');
                        throw new Error('Este horário já foi reservado por outro cliente');
                    }

                   
                    console.log('Buscando informações do cliente...');
                    const clientRef = doc(db, 'users', user.uid);
                    const clientSnap = await getDoc(clientRef);
                    
                    if (!clientSnap.exists()) {
                        console.error('Cliente não encontrado no banco de dados');
                        throw new Error('Seu perfil de usuário não foi encontrado');
                    }

                    const clientData = clientSnap.data();
                    const clientName = clientData?.fullName || user.displayName || 'Cliente';

                 
                    const appointmentDate = new Date(year, month - 1, day);
                    const [startHour, startMinute] = startTime.split(':').map(Number);
                    appointmentDate.setHours(startHour, startMinute, 0, 0);

                   
                    const startTimeDate = new Date(0, 0, 0, startHour, startMinute);
                    const [endHour, endMinute] = endTime.split(':').map(Number);
                    const endTimeDate = new Date(0, 0, 0, endHour, endMinute);
                    const durationInHours = (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60 * 60);
                    const calculatedTotalAmount = hourlyRate * durationInHours;

                    const hireRequestData = {
                        caregiverId,
                        clientId: user.uid,
                        clientName,
                        date: Timestamp.fromDate(appointmentDate),
                        startTime,
                        endTime,
                        totalAmount: calculatedTotalAmount,
                        notes: '',
                        status: 'pending',
                        createdAt: serverTimestamp()
                    };

                    console.log('Criando novo agendamento:', hireRequestData);
                    const newAppointmentRef = doc(collection(db, 'hireRequests'));
                    transaction.set(newAppointmentRef, hireRequestData);

                    // Desativado as notificações
                    // try {
                    //     console.log('Criando notificação de agendamento...');
                    //     await createNewAppointmentRequestNotification({
                    //         caregiverId,
                    //         appointmentId: newAppointmentRef.id,
                    //         clientName,
                    //         date: appointmentDate,
                    //         startTime,
                    //         endTime
                    //     });
                    // } catch (notificationError) {
                    //     console.error('Erro ao criar notificação:', notificationError);
                    //     throw new Error('Falha ao criar notificação de agendamento');
                    // }

                    console.log('Agendamento criado com sucesso:', newAppointmentRef.id);
                    return newAppointmentRef.id;
                });
            });

            console.log('Agendamento concluído com sucesso. Redirecionando...');
           
            onClose();
            navigate('/dashboard');
            
        } catch (err: any) {
            console.error('Erro detalhado ao realizar agendamento:', {
                error: err,
                message: err.message,
                stack: err.stack
            });

            let errorMessage = 'Falha ao realizar o agendamento. Por favor, tente novamente.';
            
            if (err.message.includes('Missing or insufficient permissions')) {
                errorMessage = 'Você não tem permissão para realizar esta operação. Por favor, faça login novamente.';
            } else if (err.message.includes('Conflito de agendamento')) {
                errorMessage = err.message;
            } else if (err.message.includes('perfil de usuário')) {
                errorMessage = 'Seu perfil de usuário não foi encontrado. Por favor, complete seu cadastro.';
            } else if (err.message.includes('notificação')) {
                errorMessage = 'Agendamento realizado, mas houve um problema ao enviar a notificação.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isDateDisabled = (date: string) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today;
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Agendar Horário</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                const date = e.target.value;
                                if (!isDateDisabled(date)) {
                                    setSelectedDate(date);
                                }
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    {selectedDate && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Horário de Início
                                </label>
                                <select
                                    value={startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                >
                                    <option value="">Selecione o horário</option>
                                    {availableTimeSlots.map((slot) => (
                                        <option
                                            key={slot.time}
                                            value={slot.time}
                                            disabled={!slot.isAvailable}
                                        >
                                            {slot.time}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {startTime && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Horário de Término
                                    </label>
                                    <select
                                        value={endTime}
                                        onChange={(e) => handleEndTimeChange(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        <option value="">Selecione o horário</option>
                                        {availableTimeSlots.map((slot, index) => {
                                            const slotTime = timeSlots[index];
                                            const startIndex = timeSlots.indexOf(startTime);
                                            return index > startIndex && (
                                                <option
                                                    key={slotTime}
                                                    value={slotTime}
                                                    disabled={!slot.isAvailable}
                                                >
                                                    {slotTime}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !startTime || !endTime}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                (loading || !startTime || !endTime) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Agendando...' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MultiHourAppointmentBooking;