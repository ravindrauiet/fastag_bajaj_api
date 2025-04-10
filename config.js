// API Configuration
export const API_URL = 'https://api.example.com'; // Replace with your actual API URL

// Other configuration constants can be added here
export const APP_NAME = 'FasTag App';
export const APP_VERSION = '1.0.0';

// Environment configuration
export const IS_DEVELOPMENT = __DEV__;
export const IS_PRODUCTION = !__DEV__;

// API endpoints
export const API_ENDPOINTS = {
  FASTAG_REKYC: '/api/fastag/rekyc',
  DOCUMENT_UPLOAD: '/api/documents/upload',
  VRN_UPDATE: '/api/vrn/update',
  WALLET_CREATE: '/api/wallet/create',
  OTP_VERIFY: '/api/otp/verify',
  CUSTOMER_VALIDATE: '/api/customer/validate',
};

// Timeout configurations
export const API_TIMEOUT = 30000; // 30 seconds

// Image upload configurations
export const IMAGE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
  COMPRESSION_QUALITY: 0.8,
};

// Notification configurations
export const NOTIFICATION_CONFIG = {
  AUTO_HIDE_DURATION: 3000, // 3 seconds
  MAX_NOTIFICATIONS: 10,
}; 