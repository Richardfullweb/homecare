import React from 'react';
    import Navbar from './Navbar';

    interface LayoutProps {
      children: React.ReactNode;
    }

    const Layout: React.FC<LayoutProps> = ({ children }) => {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 pt-24 pb-8 mt-8">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} CareConnect. All rights reserved.</p>
            </div>
          </footer>
        </div>
      );
    };

    export default Layout;
