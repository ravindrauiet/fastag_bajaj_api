import CryptoJS from 'crypto-js';
import axios from 'axios';

// Constants
const BASE_URL = 'https://uatlicenseeportal.bajajallianz.com/fastag';
const LICENSE_ID = 'LICENSEE_ID_HERE'; // Replace with actual licensee ID
const AUTHORIZATION_TOKEN = 'AUTHORIZATION_TOKEN_HERE'; // Replace with actual token
const SECRET_KEY = 'SECRET_KEY_HERE'; // Replace with actual secret key

// API class
const bajajApi = {
  // Encrypt data with AES
  encrypt: (data) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  },

  // Decrypt data with AES
  decrypt: (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  // Generate token based on license ID
  generateToken: () => {
    // This is a placeholder - implement actual token generation as per Bajaj API docs
    return AUTHORIZATION_TOKEN;
  },

  // Validate customer and send OTP
  validateCustomerAndSendOtp: async (mobileNo, vehicleNo = null, chassisNo = null, engineNo = null) => {
    try {
      const requestData = {
        licenseeId: LICENSE_ID,
        mobileNo: mobileNo,
        vehicleNo: vehicleNo,
        chassisNo: chassisNo,
        engineNo: engineNo
      };

      // Remove null fields
      Object.keys(requestData).forEach(key => 
        requestData[key] === null && delete requestData[key]
      );
      
      // Encrypt request data
      const encryptedData = bajajApi.encrypt(JSON.stringify(requestData));
      
      const response = await axios.post(`${BASE_URL}/validateCustomer`, {
        licenseeId: LICENSE_ID,
        request: encryptedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });

      // Decrypt the response
      if (response.data && response.data.response) {
        const decryptedResponse = bajajApi.decrypt(response.data.response);
        return {
          ...response.data,
          response: JSON.parse(decryptedResponse),
          validateCustResp: response.data.validateCustResp
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Validation API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate customer');
    }
  },
  
  // Verify OTP
  verifyOtp: async (requestId, sessionId, mobileNo, otp) => {
    try {
      const requestData = {
        licenseeId: LICENSE_ID,
        requestId: requestId,
        sessionId: sessionId,
        mobileNo: mobileNo,
        otp: otp
      };
      
      // Encrypt request data
      const encryptedData = bajajApi.encrypt(JSON.stringify(requestData));
      
      const response = await axios.post(`${BASE_URL}/verifyOtp`, {
        licenseeId: LICENSE_ID,
        request: encryptedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      // Decrypt the response
      if (response.data && response.data.response) {
        const decryptedResponse = bajajApi.decrypt(response.data.response);
        return {
          ...response.data,
          response: JSON.parse(decryptedResponse)
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('OTP Verification API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },
  
  // Register user
  registerUser: async (userData) => {
    try {
      // Encrypt request data
      const encryptedData = bajajApi.encrypt(JSON.stringify({
        licenseeId: LICENSE_ID,
        ...userData
      }));
      
      const response = await axios.post(`${BASE_URL}/registerCustomer`, {
        licenseeId: LICENSE_ID,
        request: encryptedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      // Decrypt the response
      if (response.data && response.data.response) {
        const decryptedResponse = bajajApi.decrypt(response.data.response);
        return {
          ...response.data,
          response: JSON.parse(decryptedResponse)
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register user');
    }
  },
  
  // Upload KYC documents
  uploadDocument: async (documentType, documentData, requestId) => {
    try {
      const formData = new FormData();
      formData.append('licenseeId', LICENSE_ID);
      formData.append('requestId', requestId);
      formData.append('documentType', documentType);
      formData.append('document', documentData);
      
      const response = await axios.post(`${BASE_URL}/uploadDocument`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Document Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },
  
  // Update VRN (Vehicle Registration Number)
  updateVRN: async (requestId, oldVRN, newVRN) => {
    try {
      const requestData = {
        licenseeId: LICENSE_ID,
        requestId: requestId,
        oldVRN: oldVRN,
        newVRN: newVRN
      };
      
      // Encrypt request data
      const encryptedData = bajajApi.encrypt(JSON.stringify(requestData));
      
      const response = await axios.post(`${BASE_URL}/updateVRN`, {
        licenseeId: LICENSE_ID,
        request: encryptedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      // Decrypt the response
      if (response.data && response.data.response) {
        const decryptedResponse = bajajApi.decrypt(response.data.response);
        return {
          ...response.data,
          response: JSON.parse(decryptedResponse)
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('VRN Update API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update VRN');
    }
  },
  
  // Re-KYC image upload
  uploadRekycImage: async (requestId, imageType, imageData) => {
    try {
      const formData = new FormData();
      formData.append('licenseeId', LICENSE_ID);
      formData.append('requestId', requestId);
      formData.append('imageType', imageType);
      formData.append('image', imageData);
      
      const response = await axios.post(`${BASE_URL}/uploadRekycImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Re-KYC Image Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload Re-KYC image');
    }
  },
  
  // Get account balance
  getBalance: async () => {
    try {
      const requestData = {
        licenseeId: LICENSE_ID
      };
      
      // Encrypt request data
      const encryptedData = bajajApi.encrypt(JSON.stringify(requestData));
      
      const response = await axios.post(`${BASE_URL}/getBalance`, {
        licenseeId: LICENSE_ID,
        request: encryptedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bajajApi.generateToken()}`
        }
      });
      
      // Decrypt the response
      if (response.data && response.data.response) {
        const decryptedResponse = bajajApi.decrypt(response.data.response);
        return {
          ...response.data,
          response: JSON.parse(decryptedResponse)
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Balance API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get balance');
    }
  }
};

export default bajajApi; 