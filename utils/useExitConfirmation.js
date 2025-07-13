import { useEffect, useRef } from 'react';
import { BackHandler, Alert } from 'react-native';

const useExitConfirmation = () => {
  const exitAttempts = useRef(0);
  const lastExitAttempt = useRef(0);

  useEffect(() => {
    const backAction = () => {
      const now = Date.now();
      
      // Reset exit attempts if more than 2 seconds have passed
      if (now - lastExitAttempt.current > 2000) {
        exitAttempts.current = 0;
      }
      
      exitAttempts.current += 1;
      lastExitAttempt.current = now;

      // If user presses back twice within 2 seconds, exit immediately
      if (exitAttempts.current >= 2) {
        BackHandler.exitApp();
        return true;
      }

      // First attempt - show confirmation dialog
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit the app?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              exitAttempts.current = 0;
            },
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
            style: 'destructive',
          },
        ],
        { 
          cancelable: true,
          onDismiss: () => {
            // Reset attempts if dialog is dismissed
            setTimeout(() => {
              exitAttempts.current = 0;
            }, 2000);
          }
        }
      );
      
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);
};

export default useExitConfirmation; 