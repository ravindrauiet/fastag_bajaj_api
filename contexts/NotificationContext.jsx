import React, { createContext, useState, useEffect } from 'react';

// Create the notification context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // State to store notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'FasTag registration successful', time: '2 mins ago', read: false },
    { id: 2, message: 'Wallet creation completed', time: '1 hour ago', read: false },
    { id: 3, message: 'Document upload approved', time: 'Yesterday', read: true },
  ]);
  
  // Add a new notification
  const addNotification = (notification) => {
    setNotifications(prevNotifications => [
      notification,
      ...prevNotifications
    ]);
  };
  
  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  // Remove a notification
  const removeNotification = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  // Get the count of unread notifications
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };
  
  // Add a screen completion notification
  const addScreenCompletionNotification = (screenName) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    addNotification({
      id: Date.now(),
      message: `Completed ${screenName}`,
      time: 'Just now',
      read: false,
      timestamp: timeString
    });
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        getUnreadCount,
        addScreenCompletionNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 