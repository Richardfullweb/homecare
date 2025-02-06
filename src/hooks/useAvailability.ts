import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

const DEFAULT_SLOTS = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
];

// Função auxiliar para converter horários em minutos desde a meia-noite
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const useAvailability = (caregiverId: string, selectedDate: string) => {
    const [user, authLoading] = useAuthState(auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (authLoading) {
                return;
            }

            if (!user) {
                setError('Você precisa estar logado para ver a disponibilidade');
                setLoading(false);
                return;
            }

            if (!caregiverId || !selectedDate) {
                setAvailableSlots([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Buscar agendamentos existentes
                const requestsRef = collection(db, 'hireRequests');
                const q = query(
                    requestsRef,
                    where('caregiverId', '==', caregiverId),
                    where('status', 'in', ['pending', 'accepted'])
                );

                const querySnapshot = await getDocs(q);
                const bookedSlots = querySnapshot.docs
                    .filter(doc => {
                        const data = doc.data();
                        const bookingDate = data.date.toDate().toISOString().split('T')[0];
                        return bookingDate === selectedDate;
                    })
                    .map(doc => ({
                        startTime: doc.data().startTime,
                        endTime: doc.data().endTime
                    }));

                // Gerar slots disponíveis
                const slots = DEFAULT_SLOTS.map(slot => {
                    const slotStartMinutes = timeToMinutes(slot.start);
                    const slotEndMinutes = timeToMinutes(slot.end);

                    const isBooked = bookedSlots.some(booking => {
                        const bookingStartMinutes = timeToMinutes(booking.startTime);
                        const bookingEndMinutes = timeToMinutes(booking.endTime);

                        // Verifica se há sobreposição de horários
                        return (
                            (slotStartMinutes >= bookingStartMinutes && slotStartMinutes < bookingEndMinutes) ||
                            (slotEndMinutes > bookingStartMinutes && slotEndMinutes <= bookingEndMinutes) ||
                            (slotStartMinutes <= bookingStartMinutes && slotEndMinutes >= bookingEndMinutes)
                        );
                    });

                    return {
                        startTime: slot.start,
                        endTime: slot.end,
                        available: !isBooked
                    };
                });

                setAvailableSlots(slots);
            } catch (err) {
                console.error('Erro ao buscar disponibilidade:', err);
                setError('Erro ao carregar disponibilidade. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [caregiverId, selectedDate, user, authLoading]);

    return { availableSlots, loading: loading || authLoading, error };
};

export const getHireRequests = async () => {
    try {
        const requestsRef = collection(db, 'hireRequests');
        const querySnapshot = await getDocs(requestsRef);
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return requests;
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
    }
};