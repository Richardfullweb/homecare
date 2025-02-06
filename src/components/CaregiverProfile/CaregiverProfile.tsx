    import React, { useState, useEffect } from 'react';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { auth, db } from '../../firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import AppointmentBooking from '../Scheduling/AppointmentBooking';
    import HireRequestForm from '../Scheduling/HireRequestForm';
    import ReviewSection from './ReviewSection';

    interface CaregiverProfileProps {
      caregiverId: string;
    }

    const CaregiverProfile: React.FC<CaregiverProfileProps> = ({ caregiverId }) => {
      const [user] = useAuthState(auth);
      const [caregiver, setCaregiver] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [showHireModal, setShowHireModal] = useState(false);

      useEffect(() => {
        const fetchCaregiver = async () => {
          try {
            const docRef = doc(db, 'users', caregiverId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              setCaregiver({ id: docSnap.id, ...docSnap.data() });
            } else {
              setError('Caregiver not found');
            }
          } catch (err) {
            setError('Failed to load caregiver');
            console.error('Error fetching caregiver:', err);
          } finally {
            setLoading(false);
          }
        };

        fetchCaregiver();
      }, [caregiverId]);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        );
      }

      if (!caregiver) return null;

      return (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-6">
              <img
                src={caregiver.imageUrl || '/default-avatar.png'}
                alt={caregiver.fullName}
                className="h-24 w-24 rounded-full object-cover mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold">{caregiver.fullName}</h2>
                <p className="text-gray-600">
                  {caregiver.specialties?.join(', ')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p>
                <strong>Bio:</strong> {caregiver.bio}
              </p>
              <p>
                <strong>Hourly Rate:</strong> ${caregiver.hourlyRate}
              </p>
              <div>
                <strong>Availability:</strong>
                <div className="mt-2 text-gray-500">
                  {caregiver.availability || 'No availability information'}
                </div>
              </div>
            </div>
          </div>
          <ReviewSection caregiverId={caregiverId} />
          {user && user.uid !== caregiver.id && (
            <div className="mt-8">
              <AppointmentBooking
                caregiverId={caregiver.id}
                hourlyRate={caregiver.hourlyRate || 0}
              />
              <button
                onClick={() => setShowHireModal(true)}
                className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Request Caregiver
              </button>
              {showHireModal && (
                <HireRequestForm
                  caregiverId={caregiver.id}
                  onClose={() => setShowHireModal(false)}
                />
              )}
            </div>
          )}
        </div>
      );
    };

    export default CaregiverProfile;
