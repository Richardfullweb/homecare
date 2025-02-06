import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { NotificationService } from '../../services/NotificationService';
import { BellIcon } from '@heroicons/react/24/outline';
import { Notification } from '../../types/notification';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationBellProps {}

export default function NotificationBell({}: NotificationBellProps) {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    console.log('Iniciando subscription de notificações para:', user.uid);
    const unsubscribe = NotificationService.subscribeToNotifications(
      user.uid,
      (notifications) => {
        console.log('Notificações recebidas:', notifications);
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
      }
    );

    return () => {
      console.log('Limpando subscription de notificações');
      unsubscribe();
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!user || notification.read) return;
    
    try {
      console.log('Marcando notificação como lida:', notification.id);
      if (!notification.id) return;
      await NotificationService.markAsRead(notification.id);
      
      // Atualiza localmente o estado das notificações
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    
    try {
      console.log('Marcando todas as notificações como lidas');
      await NotificationService.markAllAsRead(user.uid);
      
      // Atualiza localmente o estado das notificações
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_completed':
      case 'payment_pending':
      case 'payment_rejected':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (type.includes('payment')) {
      switch (priority) {
        case 'high':
          return 'text-red-500';
        case 'medium':
          return 'text-yellow-500';
        default:
          return 'text-green-500';
      }
    }
    return 'text-blue-500';
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <BellIcon className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2 p-2">
              <h3 className="text-lg font-medium text-white">Notificações</h3>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-700 ${
                      !notification.read ? 'bg-gray-600' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 ${notification.type && notification.priority ? getNotificationColor(notification.type, notification.priority) : 'text-blue-500'}`}>
                        {notification.type && getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {notification.createdAt && format(notification.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
