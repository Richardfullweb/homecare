import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import NotificationBell from './NotificationBell/NotificationBell';

const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-gray-800 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              CareConnect
            </Link>
          </div>

          {/* Links de Navegação */}
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                {userProfile?.role === 'caregiver' ? (
                  // Links para cuidadores
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/appointments" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Agendamentos
                    </Link>
                    <Link 
                      to="/profile/caregiver" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Perfil
                    </Link>
                  </>
                ) : (
                  // Links para clientes
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/search" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Buscar rápida
                    </Link>
                    <Link 
                      to="/favorites" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Favoritos
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Perfil
                    </Link>
                  </>
                )}

                {/* Notificações e Logout */}
                <div className="flex items-center pl-4 space-x-4 border-l border-gray-700">
                  <NotificationBell />
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
            
            {!user && (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/how-it-works" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Como Funciona
                </Link>
                <Link 
                  to="/professional" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profissionais
                </Link>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
