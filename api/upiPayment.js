// api/upiPayment.js
import axios from 'axios';

// UPI payment gateway service (replace with your actual UPI provider)
export const upiPayment = {
  generatePaymentLink: async (amount, userDetails, orderId) => {
    try {
      const response = await axios.post('https://your-upi-gateway-api.com/create', {
        amount,
        orderId,
        purpose: 'FasTag Registration',
        customerName: userDetails.name,
        customerMobile: userDetails.mobileNo,
        merchantId: 'YOUR_MERCHANT_ID',
        callbackUrl: 'https://your-app-callback.com/payment-status'
      });
      
      return {
        paymentLink: response.data.paymentLink,
        orderId: response.data.orderId
      };
    } catch (error) {
      console.error('Error generating UPI payment link:', error);
      throw error;
    }
  },
  
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await axios.get(`https://your-upi-gateway-api.com/status/${orderId}`);
      return response.data.status; // SUCCESS, PENDING, FAILED
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
};