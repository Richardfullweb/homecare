import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { validateProfile } from '../utils/profileValidation';
import { useToast } from '../components/ui/toast';

const defaultProfile: Partial<UserProfile> = {
  fullName: '',
  phoneNumber: '',
  address: '',
  bio: '',
  role: 'client',
  specialties: '',
  availability: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
  imageUrl: '',
};

const Profile = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Partial<UserProfile>>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({ ...docSnap.data() as UserProfile });
        } else {
          // Create new profile if it doesn't exist
          const newProfile = {
            ...defaultProfile,
            id: user.uid,
            email: user.email,
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...profile,
        id: user.uid,
        email: user.email,
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setProfile(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [name]: checkbox.checked
        }
      }));
    } else if (type === 'select-one') {
      setProfile(prev => ({ ...prev, [name]: value }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Complete seu perfil para que possamos atendê-lo melhor.</h2>
        {profile.role === 'caregiver' ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Siga os passos abaixo para preencher seu perfil:
            </p>
            <ol className="list-decimal list-inside text-gray-700">
              <li><strong>Nome Completo:</strong> Preencha seu nome completo.</li>
              <li><strong>Número de Telefone:</strong> Insira seu número de telefone.</li>
              <li><strong>Endereço:</strong> Forneça seu endereço completo.</li>
              <li><strong>Biografia:</strong> Escreva uma breve biografia sobre você.</li>
              <li><strong>Profissão:</strong> Selecione sua especialidade.</li>
              <li><strong>Disponibilidade:</strong> Marque os dias da semana em que você está disponível.</li>
              <li><strong>Salvar as Alterações:</strong> Clique no botão "Salvar".</li>
            </ol>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Siga os passos abaixo para preencher seu perfil:
            </p>
            <ol className="list-decimal list-inside text-gray-700">
              <li><strong>Nome Completo:</strong> Preencha seu nome completo.</li>
              <li><strong>Número de Telefone:</strong> Insira seu número de telefone.</li>
              <li><strong>Endereço:</strong> Forneça seu endereço completo.</li>
              <li><strong>Salvar as Alterações:</strong> Clique no botão "Salvar".</li>
            </ol>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Editar Perfil
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={profile.role}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="client">Cliente</option>
                <option value="caregiver">profissional</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de Perfil
            </label>
            <input
              type="text"
              name="imageUrl"
              value={profile.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="URL da imagem"
            />
          </div>
          <div className="mb-4">
            {profile.imageUrl && (
              <img
                src={profile.imageUrl}
                alt="Foto de Perfil"
                className="mt-2 w-32 h-32 rounded-full border-2 border-gray-300"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
            </label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {profile.role === 'caregiver' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissão:
                </label>
                <select
                  name="specialties"
                  value={profile.specialties || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="Médico">Médico</option>
                  <option value="Fisioterapia">Fisioterapia</option>
                  <option value="Cuidador">Cuidador</option>
                  <option value="Enfermagem">Enfermagem</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Selecione sua especialidade.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidade
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(profile.availability || {}).map(([day, checked]) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name={`availability.${day}`}
                        checked={checked}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
