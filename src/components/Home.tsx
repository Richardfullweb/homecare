import React from 'react';
    import { Link } from 'react-router-dom';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { auth } from '../firebase';

    const Home = () => {
      const [user] = useAuthState(auth);

      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-4xl font-bold mb-6">Bem-vindo ao CareConnect</h1>
          <p className="text-xl mb-8">
            Conectando cuidadores profissionais com aqueles que precisam de cuidados
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Para Clientes</h2>
              <p className="mb-4">Encontre cuidadores qualificados em sua área</p>
              {!user && (
                <Link
                  to="/register/client"
                  className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Comece agora
                </Link>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Para Cuidadores</h2>
              <p className="mb-4">Conecte-se com clientes e cresça sua prática</p>
              {!user && (
                <Link
                  to="/register/caregiver"
                  className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Junte-se agora
                </Link>
              )}
            </div>
          </div>

          {user && (
            <div className="space-x-4">
              <Link
                to="/search"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Buscar Cuidadores
              </Link>
              <Link
                to="/profile"
                className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Ver Perfil
              </Link>
            </div>
          )}
        </div>
      );
    };

    export default Home;
