import './gesture-handler';
import React from 'react';

import AppNavigator from './navigation/AppNavigator';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <AppNavigator />
    </NotificationProvider>
  );
}