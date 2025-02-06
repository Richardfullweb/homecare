import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { auth, db } from '../firebase';
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { doc, setDoc } from 'firebase/firestore';

    const Register = () => {
      const navigate = useNavigate();
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Create user profile document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email,
            role: 'client',
            createdAt: new Date(),
          });

          navigate('/profile');
        } catch (err: any) {
          if (err.code === 'auth/email-already-in-use') {
            setError('This email is already in use. Please use a different email or log in.');
          } else {
            setError(err.message);
          }
        }
      };

      return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Register</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Register
            </button>
          </form>
        </div>
      );
    };

    export default Register;
