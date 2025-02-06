import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './ui/toast';

const RegisterCaregiver = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvar informações adicionais do cuidador
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: email,
        role: 'caregiver',
        specialties: specialties,
        availability: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        bio: '',
        fullName: '',
        imageUrl: '',
        phoneNumber: '',
        address: ''
      });

      showToast({
        title: 'Sucesso!',
        description: 'Cadastro de cuidador realizado com sucesso',
        variant: 'success',
      });
      navigate('/register/caregiver', { state: { success: true } });
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Ocorreu um erro ao cadastrar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md pt-8 md:pt-12 lg:pt-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Cadastro de Cuidador</h2>
      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
          <select
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            <option value="">Selecione uma especialidade</option>
            <option value="geriatra">Médico Geriatra</option>
            <option value="fisioterapeuta">Fisioterapeuta</option>
            <option value="enfermeiro">Enfermeiro</option>
            <option value="cuidador">Cuidador</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default RegisterCaregiver;
