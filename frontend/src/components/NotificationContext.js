// import React, { createContext, useContext, useState, useEffect } from 'react';

// const NotificationContext = createContext();

// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within a NotificationProvider');
//   }
//   return context;
// };

// export const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const loadNotifications = () => {
//       const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
//       setNotifications(storedNotifications);
      
//       const unread = storedNotifications.filter(notification => !notification.read).length;
//       setUnreadCount(unread);
//     };

//     loadNotifications();
    
//     const interval = setInterval(loadNotifications, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const addNotification = (notification) => {
//     const newNotification = {
//       id: Date.now(),
//       timestamp: new Date().toISOString(),
//       read: false,
//       ...notification
//     };

//     const updatedNotifications = [newNotification, ...notifications];
//     setNotifications(updatedNotifications);
//     localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
//     // Update unread count
//     const unread = updatedNotifications.filter(n => !n.read).length;
//     setUnreadCount(unread);
//   };

//   const markAsRead = (notificationId) => {
//     const updatedNotifications = notifications.map(notification =>
//       notification.id === notificationId ? { ...notification, read: true } : notification
//     );
    
//     setNotifications(updatedNotifications);
//     localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
//     const unread = updatedNotifications.filter(n => !n.read).length;
//     setUnreadCount(unread);
//   };

//   const markAllAsRead = () => {
//     const updatedNotifications = notifications.map(notification => ({
//       ...notification,
//       read: true
//     }));
    
//     setNotifications(updatedNotifications);
//     localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
//     setUnreadCount(0);
//   };

//   const clearAll = () => {
//     setNotifications([]);
//     localStorage.setItem('notifications', JSON.stringify([]));
//     setUnreadCount(0);
//   };

//   const value = {
//     notifications,
//     unreadCount,
//     addNotification,
//     markAsRead,
//     markAllAsRead,
//     clearAll
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };