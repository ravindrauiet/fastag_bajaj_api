import axios from 'axios';

const BASE_URL = 'https://pay-api-uat.bajajfinserv.in/';

export const sendOtp = async (mobileNo, vehicleNo, chassisNo) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/sendOtp`, {
      validateCustReq: { mobileNo, vehicleNo, chassisNo },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const validateOtp = async (otp, requestId, sessionId) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/validateCustomerDetails`, {
      validateOtpReq: { otp, requestId, sessionId },
    });
    return response.data;
  } catch (error) {
    console.error('Error validating OTP:', error);
    throw error;
  }
};

export const createWallet = async (walletDetails) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/createCustomer`, {
      reqWallet: {
        requestId: walletDetails.requestId,
        sessionId: walletDetails.sessionId,
        channel: walletDetails.channel,
        agentId: walletDetails.agentId,
        reqDateTime: walletDetails.reqDateTime,
      },
      custDetails: {
        name: walletDetails.name,
        lastName: walletDetails.lastName,
        mobileNo: walletDetails.mobileNo,
        dob: walletDetails.dob,
        doc: walletDetails.doc,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

export const uploadDocument = async (requestId, sessionId, imageType, image) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v1/uploadDocument`, {
      regDetails: { requestId, sessionId },
      documentDetails: { imageType, image },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const registerFastag = async (regDetails) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/registerFastag`, regDetails);
    return response.data;
  } catch (error) {
    console.error('Error registering Fastag:', error);
    throw error;
  }
};

export const replaceFastag = async (tagReplaceReq) => {
  try {
    const response = await axios.post(`${BASE_URL}/ftAggregatorService/v2/replaceFastag`, tagReplaceReq);
    return response.data;
  } catch (error) {
    console.error('Error replacing Fastag:', error);
    throw error;
  }
};
