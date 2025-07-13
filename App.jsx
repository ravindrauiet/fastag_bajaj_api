import './gesture-handler';
import React from 'react';

import AppNavigator from './navigation/AppNavigator';
import { NotificationProvider } from './contexts/NotificationContext';
import useExitConfirmation from './utils/useExitConfirmation';

export default function App() {
  // Handle back button press for exit confirmation
  useExitConfirmation();

  return (
    <NotificationProvider>
      <AppNavigator />
    </NotificationProvider>
  );
}