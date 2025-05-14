// services/transactionManager.js
import { masterAgentWallet } from '../api/masterAgentWallet';
import { upiPayment } from '../api/upiPayment';
import { registerFastag } from '../api/bajajApi';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Add a new function to deduct from user wallet
export const deductFromUserWalletForFasTag = async (userId, amount, registrationDetails) => {
  try {
    // Validate inputs
    if (!userId) throw new Error('User ID is required');
    if (!amount || isNaN(amount) || amount <= 0) throw new Error('Valid amount is required');
    
    const transactionId = `FASTAG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Get current user wallet balance
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const currentBalance = userData.wallet || 0;
    
    // Check if user has sufficient balance
    if (currentBalance < amount) {
      throw new Error(`Insufficient wallet balance. Required: ₹${amount}, Available: ₹${currentBalance}`);
    }
    
    // Calculate new balance
    const newBalance = currentBalance - amount;
    
    // Create transaction record
    const transactionData = {
      userId,
      transactionId,
      type: 'debit',
      amount,
      previousBalance: currentBalance,
      newBalance,
      purpose: 'FasTag Registration',
      status: 'completed',
      timestamp: serverTimestamp(),
      details: {
        registrationId: registrationDetails?.registrationId || null,
        vehicleNo: registrationDetails?.vrn || registrationDetails?.vehicleNo || null,
        serialNo: registrationDetails?.serialNo || null,
        name: registrationDetails?.name || null
      }
    };
    
    // Add transaction to transactions collection
    await addDoc(collection(db, 'transactions'), transactionData);
    
    // Update user wallet balance
    await updateDoc(userRef, {
      wallet: newBalance,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      transactionId,
      previousBalance: currentBalance,
      newBalance,
      deductedAmount: amount
    };
  } catch (error) {
    console.error('Error deducting from user wallet:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

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