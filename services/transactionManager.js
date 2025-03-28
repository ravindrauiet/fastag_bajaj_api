// services/transactionManager.js
import { masterAgentWallet } from '../api/masterAgentWallet';
import { upiPayment } from '../api/upiPayment';
import { registerFastag } from '../api/bajajApi';

export const transactionManager = {
  initiateRegistrationPayment: async (userData, vehicleData, amount) => {
    // Create a unique order ID for this transaction
    const orderId = `FASTAG_${Date.now()}_${userData.mobileNo.substring(6)}`;
    
    // Generate UPI payment link
    const paymentDetails = await upiPayment.generatePaymentLink(
      amount, 
      userData, 
      orderId
    );
    
    // Store transaction in your database (this is important for tracking)
    await storeTransactionDetails({
      orderId,
      userId: userData.id,
      amount,
      status: 'INITIATED',
      paymentLink: paymentDetails.paymentLink,
      timestamp: new Date()
    });
    
    return paymentDetails;
  },
  
  completeRegistration: async (orderId) => {
    // Check payment status
    const paymentStatus = await upiPayment.checkPaymentStatus(orderId);
    
    if (paymentStatus !== 'SUCCESS') {
      throw new Error(`Payment not successful. Status: ${paymentStatus}`);
    }
    
    // Get transaction from database
    const transaction = await getTransactionByOrderId(orderId);
    
    // Update transaction status
    await updateTransactionStatus(orderId, 'PAYMENT_RECEIVED');
    
    // Get user and vehicle data associated with this transaction
    const { userData, vehicleData } = await getUserAndVehicleData(transaction.userId);
    
    try {
      // Deduct from master agent wallet
      await masterAgentWallet.deductFromWallet(transaction.amount, {
        referenceId: orderId
      });
      
      // Update transaction status
      await updateTransactionStatus(orderId, 'WALLET_DEBITED');
      
      // Complete FasTag registration with Bajaj API
      const registrationResult = await registerFastag(
        vehicleData, 
        userData, 
        { orderId }
      );
      
      // Update transaction status to complete
      await updateTransactionStatus(orderId, 'COMPLETED', {
        fastagId: registrationResult.fastagId
      });
      
      return registrationResult;
    } catch (error) {
      // Update transaction status to failed
      await updateTransactionStatus(orderId, 'FAILED', {
        error: error.message
      });
      throw error;
    }
  }
};

// These functions would interact with your database
async function storeTransactionDetails(details) {
  // Store in database
}

async function getTransactionByOrderId(orderId) {
  // Retrieve from database
}

async function updateTransactionStatus(orderId, status, additionalData = {}) {
  // Update in database
}

async function getUserAndVehicleData(userId) {
  // Retrieve from database
}