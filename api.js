import axios from 'axios';
import bajajApi from './api/bajajApi';

// Re-export functions from bajajApi for backward compatibility
export const sendOtp = bajajApi.sendOtp;
export const validateCustomerAndSendOtp = bajajApi.validateCustomerAndSendOtp;
export const validateCustomer = bajajApi.validateCustomer;
export const validateOtp = bajajApi.validateOtp;
export const verifyOtp = bajajApi.verifyOtp;
export const createWallet = bajajApi.createWallet;
export const uploadDocument = bajajApi.uploadDocument;
export const registerFastag = bajajApi.registerFastag;
export const replaceFastag = bajajApi.replaceFastag;
export const getVehicleMake = bajajApi.getVehicleMake;
export const getVehicleModel = bajajApi.getVehicleModel;
export const updateVRN = bajajApi.updateVRN;
export const updateVRNDocument = bajajApi.updateVRNDocument;
export const uploadReKYVImage = bajajApi.uploadReKYVImage;
export const checkStatusKYVImages = bajajApi.checkStatusKYVImages;

// Export the entire API for direct usage
export default bajajApi;