import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useToast } from '../ui/toast';
import AvailabilitySelector from './AvailabilitySelector';

const ProfileCaregiver = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [profession, setProfession] = useState('caregiver');
  const [availability, setAvailability] = useState({
    monday: { morning: false, afternoon: false, evening: false, overnight: false },
    tuesday: { morning: false, afternoon: false, evening: false, overnight: false },
    wednesday: { morning: false, afternoon: false, evening: false, overnight: false },
    thursday: { morning: false, afternoon: false, evening: false, overnight: false },
    friday: { morning: false, afternoon: false, evening: false, overnight: false },
    saturday: { morning: false, afternoon: false, evening: false, overnight: false },
    sunday: { morning: false, afternoon: false, evening: false, overnight: false }
  });
  const [isVideoConsultation, setIsVideoConsultation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || '');
          setPhoneNumber(data.phoneNumber || '');
          setAddress(data.address || '');
          setBio(data.bio || '');
          setImageUrl(data.imageUrl || 'https://via.placeholder.com/150');
          setHourlyRate(data.hourlyRate?.toString() || '');
          setProfession(data.specialties === 'fisioterapeuta' ? 'physiotherapist' : 'caregiver');
          setAvailability(data.availability || {
            monday: { morning: false, afternoon: false, evening: false, overnight: false },
            tuesday: { morning: false, afternoon: false, evening: false, overnight: false },
            wednesday: { morning: false, afternoon: false, evening: false, overnight: false },
            thursday: { morning: false, afternoon: false, evening: false, overnight: false },
            friday: { morning: false, afternoon: false, evening: false, overnight: false },
            saturday: { morning: false, afternoon: false, evening: false, overnight: false },
            sunday: { morning: false, afternoon: false, evening: false, overnight: false }
          });
          setIsVideoConsultation(data.isVideoConsultation || false);
        }
      } catch (error) {
        showToast({
          title: 'Erro',
          description: 'Falha ao carregar perfil',
          variant: 'destructive',
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      await updateDoc(doc(db, 'users', user.uid), {
        fullName,
        phoneNumber,
        address,
        bio,
        imageUrl,
        hourlyRate: parseFloat(hourlyRate) || 0,
        averageRating: 0,
        completedAppointments: 0,
        availability,
        createdAt: new Date(),
        role: 'caregiver'
      });

      showToast({
        title: 'Perfil Salvo!',
        description: 'Suas informações foram salvas com sucesso.',
        variant: 'success',
      });
      navigate('/dashboard');
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl pt-12 md:pt-16 lg:pt-20">
      <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Complete seu Perfil
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como funciona
          </h3>
          <div className="space-y-5 text-gray-600">
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-1 mr-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>A plataforma CareConnect conecta cuidadores a clientes que precisam de serviços de cuidado.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-1 mr-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Para cada serviço realizado, 20% do valor é retido pela plataforma para manutenção e melhorias.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-1 mr-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>O valor restante é depositado diretamente na sua conta bancária cadastrada.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-1 mr-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Mantenha seu perfil sempre atualizado para atrair mais clientes e aumentar suas chances de ser contratado.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Informações Pessoais</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Sobre Você</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <ImageUpload 
                onUploadSuccess={(url) => setImageUrl(url)}
                initialImageUrl={imageUrl}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Informações Profissionais</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="caregiver">Cuidador</option>
                <option value="nurse">Enfermeiro</option>
                <option value="doctor">Médico</option>
                <option value="physiotherapist">Fisioterapeuta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxa Horária (R$/hora)</label>
              <input
                type="text"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            {profession === 'doctor' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="videoConsultation"
                  checked={isVideoConsultation}
                  onChange={(e) => setIsVideoConsultation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="videoConsultation" className="text-sm font-medium text-gray-700">
                  Atendimento por videochamada
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Disponibilidade</h3>
            <AvailabilitySelector 
              availability={availability}
              setAvailability={setAvailability}
              profession={profession}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCaregiver;
