import CryptoJS from 'crypto-js';
import axios from 'axios';

// Constants for API integration
const BASE_URL = 'https://pay-api-uat.bajajfinserv.in/'; // UAT URL
const PROD_URL = 'https://pay-pgapi.bajajfinserv.in/'; // Production URL
const ENCRYPTION_KEY = 'dmdkgehajqc87net3lzgcirsgao2yy8f'; // Production Encryption Key
const API_SUBSCRIPTION_KEY = 'b9f873ec7376470dad2609d2d200f621'; // Production Subscription Key
const CHANNEL = 'CBPL'; // Channel
const AGENT_ID = '70003'; // Agent ID

// Utility functions for encryption and decryption
const generateIv = (keyString) => {
  return CryptoJS.enc.Utf8.parse(keyString.substring(0, 16));
};

const encrypt = (value) => {
  try {
    const iv = generateIv(ENCRYPTION_KEY);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const encrypted = CryptoJS.AES.encrypt(value, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption Error:', error);
    throw new Error('Failed to encrypt data');
  }
};

const decrypt = (encrypted) => {
  try {
    const iv = generateIv(ENCRYPTION_KEY);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption Error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Helper function to get current date time in required format
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// Helper function to generate request ID
const generateRequestId = () => {
  // Create a random string of 12 characters (alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Internal token generation to avoid circular reference
const generateTokenInternally = async () => {
  try {
    const requestId = generateRequestId();
    const reqDateTime = getCurrentDateTime();

    const requestData = {
      requestId,
      channel: CHANNEL,
      agentId: AGENT_ID,
      reqDateTime
    };

    const encryptedData = encrypt(JSON.stringify(requestData));

    const response = await axios.post(`${BASE_URL}/ftVasService/v1/tokenGeneration`, encryptedData, {
      headers: {
        'Content-Type': 'application/json',
        'aggr_channel': CHANNEL
      }
    });

    if (response.data) {
      const decryptedResponse = decrypt(response.data);
      const parsedResponse = JSON.parse(decryptedResponse);
      return parsedResponse.tokenResp.token;
    }

    return null;
  } catch (error) {
    console.error('Token Generation API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate token');
  }
};

// API functions
const bajajApi = {
  // 1. Validate Customer & Vehicle (OTP Trigger)
  sendOtp: async (mobileNo, vehicleNo = null, chassisNo = null, engineNo = null, reqType = 'REG', resend = 0, isChassis = 0) => {
    try {
      const requestId = generateRequestId();
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        validateCustReq: {
          requestId,
          mobileNo,
          vehicleNo: vehicleNo || "",
          chassisNo: chassisNo || "",
          engineNo: engineNo || "",
          reqType,
          resend,
          channel: CHANNEL,
          agentId: AGENT_ID,
          isChassis,
          reqDateTime,
          udf1: "PK1",
          udf2: "value2",
          udf3: "value3",
          udf4: "value4",
          udf5: "value5"
        }
      };

      // Console log the original request data
      console.log('=== SEND OTP REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));

      // Console log the encrypted request
      console.log('=== SEND OTP ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/sendOtp`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== SEND OTP ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== SEND OTP DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== SEND OTP PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('=== SEND OTP API ERROR ===');
      console.error(error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Alias for send OTP - used by ValidateCustomerScreen
  validateCustomerAndSendOtp: async (mobileNo, vehicleNo, chassisNo, engineNo, reqType = 'REG', resend = 0, isChassis = 0) => {
    try {
      // Call the sendOtp function
      const response = await bajajApi.sendOtp(
        mobileNo,
        vehicleNo,
        chassisNo,
        engineNo,
        reqType,
        resend,
        isChassis
      );
      
      // Log the full response to help with debugging
      console.log('Send OTP Full Response:', JSON.stringify(response, null, 2));
      
      // Extract and log the key fields needed for OTP verification
      if (response && response.response && response.response.status === 'success') {
        const requestId = response.validateCustResp?.requestId;
        const sessionId = response.validateCustResp?.sessionId;
        
        console.log('Successfully extracted requestId:', requestId);
        console.log('Successfully extracted sessionId:', sessionId);
      }
      
      return response;
    } catch (error) {
      console.error('ValidateCustomer and SendOtp Error:', error);
      throw error;
    }
  },
  
  // Alias for backward compatibility - Add this as well
  validateCustomer: async (mobileNo, vehicleNo = null, chassisNo = null, engineNo = null) => {
    try {
      const api = bajajApi;
      return await api.sendOtp(mobileNo, vehicleNo, chassisNo, engineNo);
    } catch (error) {
      console.error('Validation API Error:', error);
      throw error;
    }
  },

  // 2. Validate OTP
  validateOtp: async (otp, requestId, sessionId) => {
    try {
      const reqDateTime = getCurrentDateTime();

      // The parameters should match according to documentation:
      // requestId and sessionId should be from the sendOtp response (not switched)
      const requestData = {
        validateOtpReq: {
          otp, // This should be the actual OTP received by user (e.g., "123456")
          requestId, // This should be the requestId received in sendOtp response
          sessionId, // This should be the sessionId received in sendOtp response
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        }
      };
      
      // Console log the original request data
      console.log('=== VALIDATE OTP REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== VALIDATE OTP ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/validateCustomerDetails`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== VALIDATE OTP ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== VALIDATE OTP DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== VALIDATE OTP PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('=== VALIDATE OTP API ERROR ===');
      console.error(error);
      throw new Error(error.response?.data?.message || 'Failed to validate OTP');
    }
  },

  // Validate OTP (renamed from verifyOtp to match your usage in ValidateOtpScreen)
  verifyOtp: async (otp, requestId, sessionId) => {
    try {
      // Debug logs
      console.log('Verifying OTP with parameters:');
      console.log('OTP:', otp); // This should be the actual OTP like "123456"
      console.log('RequestId:', requestId);
      console.log('SessionId:', sessionId);
      
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        validateOtpReq: {
          otp, // The OTP entered by the user (e.g., "123456")
          requestId, // RequestId from sendOtp response
          sessionId, // SessionId from sendOtp response
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        }
      };
      
      // Console log the original request data
      console.log('=== VALIDATE OTP REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== VALIDATE OTP ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/validateCustomerDetails`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== VALIDATE OTP ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== VALIDATE OTP DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== VALIDATE OTP PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // 3. Create Wallet (New Customer)
  createWallet: async (name, lastName, mobileNo, dob, documentDetails) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId; // Can use requestId as sessionId or generate a new one
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        reqWallet: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        custDetails: {
          name,
          lastName,
          mobileNo,
          dob, // Format: DD-MM-YYYY
          doc: documentDetails // Array of document objects like: [{docType: "1", docNo: "ABCPD1234D"}, ...]
        }
      };
      
      // Console log the original request data
      console.log('=== CREATE WALLET REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== CREATE WALLET ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/createCustomer`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== CREATE WALLET ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== CREATE WALLET DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== CREATE WALLET PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Create Wallet API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create wallet');
    }
  },
  
  // Register User function - maps to createWallet
  registerUser: async (userData) => {
    try {
      // Map user data to the format expected by createWallet
      const { firstName, lastName, mobileNo, dob, documentType, documentNumber, expiryDate, requestId: origRequestId, sessionId: origSessionId } = userData;
      
      // Convert document type to the format expected by the API
      let docTypeCode;
      switch (documentType) {
        case 'PAN':
          docTypeCode = "1";
          break;
        case 'DL':
          docTypeCode = "2";
          break;
        case 'VID':
          docTypeCode = "3";
          break;
        case 'PASS':
          docTypeCode = "4";
          break;
        default:
          docTypeCode = "1";
      }
      
      // Format date strings to ensure they're in DD-MM-YYYY format with proper zero-padding
      const formatDateString = (dateStr) => {
        if (!dateStr) return '';
        
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        
        // Zero-pad day and month if needed
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        return `${day}-${month}-${year}`;
      };
      
      // Format the DOB
      const formattedDob = formatDateString(dob);
      console.log('DOB provided:', dob);
      console.log('Formatted DOB for API:', formattedDob);
      
      // Prepare document details as an array according to API documentation
      const documentDetails = [];
      
      // Create the document object
      const docObj = {
        docType: docTypeCode,
        docNo: documentType === 'PAN' ? documentNumber.toUpperCase() : documentNumber
      };
      
      // Add expiry date if present (required for DL and Passport)
      if ((documentType === 'DL' || documentType === 'PASS') && expiryDate) {
        const formattedExpiryDate = formatDateString(expiryDate);
        docObj.expiryDate = formattedExpiryDate;
        console.log('Expiry date provided:', expiryDate);
        console.log('Formatted expiry date for API:', formattedExpiryDate);
      }
      
      // Add the document to the array
      documentDetails.push(docObj);
      
      // IMPORTANT: Always use the original requestId and sessionId from OTP verification
      // Never generate new ones when coming from OTP verification flow
      let requestId, sessionId;
      
      if (origRequestId && origSessionId) {
        requestId = origRequestId;
        sessionId = origSessionId;
        console.log('Using original requestId from OTP verification:', requestId);
        console.log('Using original sessionId from OTP verification:', sessionId);
      } else {
        requestId = generateRequestId();
        sessionId = requestId;
        console.log('No original IDs provided. Generated new requestId:', requestId);
        console.log('Using sessionId:', sessionId);
      }
      
      const reqDateTime = getCurrentDateTime();
      
      // Create the exact structure needed by the API according to documentation
      const requestData = {
        reqWallet: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        custDetails: {
          name: firstName,
          lastName,
          mobileNo,
          dob: formattedDob,
          doc: documentDetails // Array of document objects
        }
      };
      
      // Log the document details for debugging
      console.log('=== FORMATTED WALLET REQUEST FOR API ===');
      console.log(JSON.stringify(requestData, null, 2));
      
      // Send the properly formatted request to the API
      const encryptedData = encrypt(JSON.stringify(requestData));
      
      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/createCustomer`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });
      
      // Console log the encrypted response
      console.log('=== CREATE WALLET ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== CREATE WALLET DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== CREATE WALLET PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Register User API Error:', error);
      throw error;
    }
  },

  // 4.1 Get Vehicle Make
  getVehicleMake: async () => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        getVehicleMake: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        }
      };

      // Console log the original request data
      console.log('=== GET VEHICLE MAKE REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== GET VEHICLE MAKE ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/vehicleMakerList`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== GET VEHICLE MAKE ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== GET VEHICLE MAKE DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== GET VEHICLE MAKE PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Vehicle Make API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get vehicle makers');
    }
  },

  // 4.2 Get Vehicle Model
  getVehicleModel: async (vehicleMake) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        getVehicleModel: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime,
          vehicleMake
        }
      };

      // Console log the original request data
      console.log('=== GET VEHICLE MODEL REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== GET VEHICLE MODEL ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/vehicleModelList`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== GET VEHICLE MODEL ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== GET VEHICLE MODEL DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== GET VEHICLE MODEL PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Vehicle Model API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get vehicle models');
    }
  },

  // 5. Document Upload
  uploadDocument: async (requestId, sessionId, imageType, image, isDevelopmentMode = false) => {
    try {
      // If in development mode, simulate a successful upload
      if (isDevelopmentMode) {
        console.log('=== DEVELOPMENT MODE: SIMULATING DOCUMENT UPLOAD ===');
        console.log(`Document Type: ${imageType}`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Session ID: ${sessionId}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return a simulated successful response
        return {
          response: {
            status: 'success',
            errorCode: '0',
            errorDesc: 'Success',
            documentId: `DEV_${Date.now()}_${imageType}`,
            documentType: imageType,
            uploadDateTime: new Date().toISOString()
          }
        };
      }
      
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        documentDetails: {
          imageType, // Must be one of: RCFRONT, RCBACK, VEHICLEFRONT, VEHICLESIDE, TAGAFFIX
          image      // Base64 encoded image
        }
      };

      // Console log the original request data (shorten image data for clarity)
      const loggableRequest = { ...requestData };
      if (loggableRequest.documentDetails.image) {
        loggableRequest.documentDetails.image = loggableRequest.documentDetails.image.substring(0, 50) + '... (truncated)';
      }
      console.log('=== UPLOAD DOCUMENT REQUEST ===');
      console.log(JSON.stringify(loggableRequest, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request (shortened)
      console.log('=== UPLOAD DOCUMENT ENCRYPTED REQUEST ===');
      console.log(encryptedData.substring(0, 100) + '... (truncated)');

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/uploadDocument`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== UPLOAD DOCUMENT ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== UPLOAD DOCUMENT DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== UPLOAD DOCUMENT PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Document Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },

  // 6. FasTag Registration
  registerFastag: async (regDetails, vrnDetails, custDetails, fasTagDetails) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails,
        vrnDetails,
        custDetails,
        fasTagDetails
      };

      // Console log the original request data
      console.log('=== REGISTER FASTAG REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== REGISTER FASTAG ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/registerFastag`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== REGISTER FASTAG ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== REGISTER FASTAG DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== REGISTER FASTAG PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('FasTag Registration API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register FasTag');
    }
  },

  // New function that accepts a single object parameter
  registerFasTag: async (registrationData) => {
    try {
      // Ensure the data has the required structure
      if (!registrationData.regDetails || !registrationData.vrnDetails || 
          !registrationData.custDetails || !registrationData.fasTagDetails) {
        throw new Error('Invalid registration data structure');
      }
      
      // Field mapping note:
      // The OTP response has different field names than what the registration API expects:
      // OTP Response      →  Registration API
      // vehicleNo         →  vrn
      // chassisNo         →  chassis  
      // engineNo          →  engine
      
      // Console log the original request data
      console.log('=== REGISTER NEW FASTAG REQUEST ===');
      console.log(JSON.stringify(registrationData, null, 2));

      const encryptedData = encrypt(JSON.stringify(registrationData));
      
      // Console log the encrypted request
      console.log('=== REGISTER NEW FASTAG ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/registerFastag`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== REGISTER NEW FASTAG ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== REGISTER NEW FASTAG DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        return parsedResponse;
      }
      
      throw new Error('Empty response from server');
    } catch (error) {
      console.error('Register FasTag Error:', error);
      throw error;
    }
  },

  // 7. FasTag Replacement
  replaceFastag: async (walletId, vehicleNo, debitAmt, reason, reasonDesc = '', serialNo, chassisNo, engineNo, isNationalPermit, permitExpiryDate, stateOfRegistration, vehicleDescriptor) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();
      const mobileNo = ''; // This should be provided if needed

      const requestData = {
        tagReplaceReq: {
          mobileNo,
          walletId,
          vehicleNo,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime,
          debitAmt,
          requestId,
          sessionId,
          serialNo,
          reason,
          reasonDesc,
          chassisNo,
          engineNo,
          isNationalPermit,
          permitExpiryDate,
          stateOfRegistration,
          vehicleDescriptor,
          udf1: "PK1",
          udf2: "value2",
          udf3: "value3",
          udf4: "value4",
          udf5: "value5"
        }
      };

      // Console log the original request data
      console.log('=== REPLACE FASTAG REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== REPLACE FASTAG ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/replaceFastag`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== REPLACE FASTAG ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== REPLACE FASTAG DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== REPLACE FASTAG PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('FasTag Replacement API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to replace FasTag');
    }
  },

  // 8. Token Generate API
  generateToken: async () => {
    try {
      const requestId = generateRequestId();
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        requestId,
        channel: CHANNEL,
        agentId: AGENT_ID,
        reqDateTime
      };

      // Console log the original request data
      console.log('=== GENERATE TOKEN REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== GENERATE TOKEN ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/tokenGeneration`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL
        }
      });

      // Console log the encrypted response
      console.log('=== GENERATE TOKEN ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== GENERATE TOKEN DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== GENERATE TOKEN PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse.tokenResp.token;
      }

      return null;
    } catch (error) {
      console.error('Token Generation API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate token');
    }
  },

  // 9. VRN Update API
  updateVRN: async (vehicleNo, chassisNo, engineNo, mobileNo, serialNo, tid = "") => {
    try {
      const requestId = generateRequestId();
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails: {
          requestId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        vrnUpdateReq: {
          vehicleNo,
          chassisNo,
          engineNo,
          mobileNo,
          serialNo,
          tid,
          udf1: "PK1"
        }
      };

      // Console log the original request data
      console.log('=== UPDATE VRN REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));
      
      // Generate token first - avoid circular reference
      const token = await generateTokenInternally();
      console.log('=== UPDATE VRN USING TOKEN ===');
      console.log(token.substring(0, 50) + '... (truncated)');

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== UPDATE VRN ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/vrnUpdate`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      // Console log the encrypted response
      console.log('=== UPDATE VRN ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== UPDATE VRN DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== UPDATE VRN PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('VRN Update API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update VRN');
    }
  },

  // 10. VRN Update Document
  updateVRNDocument: async (sessionId, rcImageFront, rcImageBack, mobileNo) => {
    try {
      const requestId = generateRequestId();
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        documentDetails: {
          rcImageFront,  // Base64 encoded image
          rcImageBack    // Base64 encoded image
        },
        mobileNo
      };

      // Console log the original request data (shorten image data for clarity)
      const loggableRequest = { ...requestData };
      if (loggableRequest.documentDetails.rcImageFront) {
        loggableRequest.documentDetails.rcImageFront = loggableRequest.documentDetails.rcImageFront.substring(0, 50) + '... (truncated)';
      }
      if (loggableRequest.documentDetails.rcImageBack) {
        loggableRequest.documentDetails.rcImageBack = loggableRequest.documentDetails.rcImageBack.substring(0, 50) + '... (truncated)';
      }
      console.log('=== UPDATE VRN DOCUMENT REQUEST ===');
      console.log(JSON.stringify(loggableRequest, null, 2));
      
      // Generate token first
      const token = await generateTokenInternally();
      console.log('=== UPDATE VRN DOCUMENT USING TOKEN ===');
      console.log(token.substring(0, 50) + '... (truncated)');

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request (shortened)
      console.log('=== UPDATE VRN DOCUMENT ENCRYPTED REQUEST ===');
      console.log(encryptedData.substring(0, 100) + '... (truncated)');

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/vrnUpdateDoc`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      // Console log the encrypted response
      console.log('=== UPDATE VRN DOCUMENT ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== UPDATE VRN DOCUMENT DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== UPDATE VRN DOCUMENT PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('VRN Update Document API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update VRN documents');
    }
  },

  // 11. FasTag Re-KYV Image Upload
  uploadReKYVImage: async (vrn, mobileNo, serialNo, imageType, image) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        documentDetails: {
          vrn,
          mobileNo,
          serialNo,
          imageType, // Must be one of: RCFRONT, RCBACK, VEHICLEFRONT, VEHICLESIDE, TAGAFFIX
          image,     // Base64 encoded image
          sessionId: null,
          udf1: null,
          udf2: null,
          udf3: null,
          udf4: null,
          udf5: null
        }
      };

      // Console log the original request data (shorten image data for clarity)
      const loggableRequest = JSON.parse(JSON.stringify(requestData));
      if (loggableRequest.documentDetails.image) {
        loggableRequest.documentDetails.image = loggableRequest.documentDetails.image.substring(0, 50) + '... (truncated)';
      }
      console.log('=== UPLOAD RE-KYV IMAGE REQUEST ===');
      console.log(JSON.stringify(loggableRequest, null, 2));
      
      // Generate token first
      const token = await generateTokenInternally();
      console.log('=== UPLOAD RE-KYV IMAGE USING TOKEN ===');
      console.log(token.substring(0, 50) + '... (truncated)');

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request (shortened)
      console.log('=== UPLOAD RE-KYV IMAGE ENCRYPTED REQUEST ===');
      console.log(encryptedData.substring(0, 100) + '... (truncated)');

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/uploadKYVImages`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      // Console log the encrypted response
      console.log('=== UPLOAD RE-KYV IMAGE ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== UPLOAD RE-KYV IMAGE DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== UPLOAD RE-KYV IMAGE PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Re-KYV Image Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload Re-KYV image');
    }
  },

  // 12. FasTag Re-KYV Image Update API
  checkStatusKYVImages: async (vrn, mobileNo, serialNo) => {
    try {
      const requestId = generateRequestId();
      const sessionId = requestId;
      const reqDateTime = getCurrentDateTime();

      const requestData = {
        regDetails: {
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        },
        vrn,
        mobileNo,
        serialNo,
        udf1: null,
        udf2: null,
        udf3: null,
        udf4: null,
        udf5: null
      };

      // Console log the original request data
      console.log('=== CHECK STATUS KYV IMAGES REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));
      
      // Generate token first
      const token = await generateTokenInternally();
      console.log('=== CHECK STATUS KYV IMAGES USING TOKEN ===');
      console.log(token.substring(0, 50) + '... (truncated)');

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Console log the encrypted request
      console.log('=== CHECK STATUS KYV IMAGES ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/checkStatusKYVImages`, encryptedData, {
        headers: {
          'Content-Type': 'text/plain',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      // Console log the encrypted response
      console.log('=== CHECK STATUS KYV IMAGES ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== CHECK STATUS KYV IMAGES DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== CHECK STATUS KYV IMAGES PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('Check Status KYV Images API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to check status of KYV images');
    }
  },

  // Check if user has installed Bajaj Finserv App and visited FasTag section
  checkBajajAppStatus: async (mobileNo) => {
    try {
      const requestId = generateRequestId();
      const reqDateTime = getCurrentDateTime();

      // Data to be encrypted according to documentation section 3.13
      const requestData = {
        mobNo: mobileNo,
        aggrChannel: CHANNEL,
        agentId: AGENT_ID,
        udf1: "",
        udf2: "",
        udf3: "",
        udf4: "",
        udf5: ""
      };

      // Console log the original request data
      console.log('=== CHECK BAJAJ APP STATUS REQUEST ===');
      console.log(JSON.stringify(requestData, null, 2));

      const encryptedData = encrypt(JSON.stringify(requestData));

      // Console log the encrypted request
      console.log('=== CHECK BAJAJ APP STATUS ENCRYPTED REQUEST ===');
      console.log(encryptedData);

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/initDataCheck`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Ocp-Apim-Subscription-Key': API_SUBSCRIPTION_KEY
        }
      });

      // Console log the encrypted response
      console.log('=== CHECK BAJAJ APP STATUS ENCRYPTED RESPONSE ===');
      console.log(response.data);

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        
        // Console log the decrypted response
        console.log('=== CHECK BAJAJ APP STATUS DECRYPTED RESPONSE ===');
        console.log(decryptedResponse);
        
        const parsedResponse = JSON.parse(decryptedResponse);
        console.log('=== CHECK BAJAJ APP STATUS PARSED RESPONSE ===');
        console.log(JSON.stringify(parsedResponse, null, 2));
        
        return parsedResponse;
      }

      return response.data;
    } catch (error) {
      console.error('=== CHECK BAJAJ APP STATUS API ERROR ===');
      console.error(error);
      throw new Error(error.response?.data?.message || 'Failed to check Bajaj app status');
    }
  }
};

export default bajajApi;