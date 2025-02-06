import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationBell from "./NotificationBell";
import { Notification } from "../../types/notification";

export const NotificationCenter = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications(userId);

  const toggleNotifications = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative">
      <NotificationBell 
        count={notifications.filter(n => !n.read).length}
        onClick={toggleNotifications}
      />
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notificações</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  notification.read ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(notification.createdAt?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
