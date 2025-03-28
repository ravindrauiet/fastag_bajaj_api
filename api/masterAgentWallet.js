// api/masterAgentWallet.js
import axios from 'axios';
import { encrypt, decrypt } from './bajajApi'; // Reuse encryption methods

const MASTER_AGENT_ID = 'MASTER001'; // Your master agent ID

export const masterAgentWallet = {
  getWalletBalance: async () => {
    // API call to get wallet balance
    // This would call a Bajaj API endpoint for checking wallet balance
    try {
      const response = await axios.post('...wallet balance endpoint...', 
        { agentId: MASTER_AGENT_ID },
        { headers: { /* appropriate headers */ } }
      );
      return response.data.balance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },
  
  deductFromWallet: async (amount, transactionDetails) => {
    // API call to deduct funds from master wallet
    // This would call a Bajaj API endpoint for wallet transactions
    try {
      const response = await axios.post('...wallet transaction endpoint...', 
        {
          agentId: MASTER_AGENT_ID,
          amount,
          transactionType: 'DEBIT',
          referenceId: transactionDetails.referenceId,
          purpose: 'FasTag Registration'
        },
        { headers: { /* appropriate headers */ } }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing wallet transaction:', error);
      throw error;
    }
  }
};