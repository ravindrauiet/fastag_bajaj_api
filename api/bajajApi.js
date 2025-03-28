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
  return now.toISOString().slice(0, 19).replace('T', ' ') + '.' + now.getMilliseconds().toString().padStart(3, '0');
};

// Helper function to generate request ID
const generateRequestId = () => {
  const timestamp = new Date().getTime();
  return `REQ_${timestamp}`;
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
          udf1: "",
          udf2: "",
          udf3: "",
          udf4: "",
          udf5: ""
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/sendOtp`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('Send OTP API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Alias for backward compatibility
  validateCustomerAndSendOtp: async (mobileNo, vehicleNo = null, chassisNo = null, engineNo = null) => {
    try {
      const api = bajajApi;
      return await api.sendOtp(mobileNo, vehicleNo, chassisNo, engineNo);
    } catch (error) {
      console.error('Validation API Error:', error);
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

      const requestData = {
        validateOtpReq: {
          otp,
          requestId,
          sessionId,
          channel: CHANNEL,
          agentId: AGENT_ID,
          reqDateTime
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/validateCustomerDetails`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('Validate OTP API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate OTP');
    }
  },

  // Alias for backward compatibility
  verifyOtp: async (otp, requestId, sessionId) => {
    try {
      const api = bajajApi;
      return await api.validateOtp(otp, requestId, sessionId);
    } catch (error) {
      console.error('OTP Verification API Error:', error);
      throw error;
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
          doc: documentDetails, // Array of document objects like: [{docType: "1", docNo: "ABCPD1234D"}, ...]
          udf1: "",
          udf2: "",
          udf3: "",
          udf4: "",
          udf5: ""
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/createCustomer`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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
      const { firstName, lastName, mobileNo, dob, documentType, documentNumber, expiryDate } = userData;
      
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
      
      // Prepare document details
      const documentDetails = [];
      
      // Create the document object
      const docObj = {
        docType: docTypeCode,
        docNo: documentNumber
      };
      
      // Add expiry date if present (required for DL and Passport)
      if (expiryDate && (documentType === 'DL' || documentType === 'PASS')) {
        docObj.expiryDate = expiryDate;
      }
      
      documentDetails.push(docObj);
      
      return await bajajApi.createWallet(firstName, lastName, mobileNo, dob, documentDetails);
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

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/vehicleMakerList`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'channel': CHANNEL,
          'Ocp-Apim-Subscription-Key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/vehicleModelList`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'channel': CHANNEL,
          'Ocp-Apim-Subscription-Key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('Vehicle Model API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get vehicle models');
    }
  },

  // 5. Document Upload
  uploadDocument: async (requestId, sessionId, imageType, image) => {
    try {
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

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/uploadDocument`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('Document Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },

  // 6. FasTag Registration
  registerFastag: async (vrnDetails, custDetails, fasTagDetails) => {
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
        vrnDetails,
        custDetails,
        fasTagDetails
      };

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/registerFastag`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('FasTag Registration API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register FasTag');
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
          udf1: "",
          udf2: "",
          udf3: "",
          udf4: "",
          udf5: ""
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));

      const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/replaceFastag`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'ocp-apim-subscription-key': API_SUBSCRIPTION_KEY
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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
          tid
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Generate token first - avoid circular reference
      const token = await generateTokenInternally();

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/vrnUpdate`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Generate token first
      const token = await generateTokenInternally();

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/vrnUpdateDoc`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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
          image      // Base64 encoded image
        }
      };

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Generate token first
      const token = await generateTokenInternally();

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/uploadKYVImages`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
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
        serialNo
      };

      const encryptedData = encrypt(JSON.stringify(requestData));
      
      // Generate token first
      const token = await generateTokenInternally();

      const response = await axios.post(`${BASE_URL}/ftVasService/v1/checkStatusKYVImages`, encryptedData, {
        headers: {
          'Content-Type': 'text/plain',
          'aggr_channel': CHANNEL,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const decryptedResponse = decrypt(response.data);
        return JSON.parse(decryptedResponse);
      }

      return response.data;
    } catch (error) {
      console.error('Check Status KYV Images API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to check status of KYV images');
    }
  }
};

export default bajajApi;