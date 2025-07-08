// Data Caching Utility to Reduce Firebase Reads
class DataCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Set cache with expiry
  set(key, data, expiryMs = this.defaultExpiry) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + expiryMs);
  }

  // Get cache if not expired
  get(key) {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  // Delete cache
  delete(key) {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Check if cache exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Get cache keys
  keys() {
    return Array.from(this.cache.keys());
  }

  // Cache user data
  setUserData(userId, data) {
    this.set(`user_${userId}`, data, 10 * 60 * 1000); // 10 minutes
  }

  // Get cached user data
  getUserData(userId) {
    return this.get(`user_${userId}`);
  }

  // Cache wallet balance
  setWalletBalance(userId, balance) {
    this.set(`wallet_${userId}`, balance, 2 * 60 * 1000); // 2 minutes
  }

  // Get cached wallet balance
  getWalletBalance(userId) {
    return this.get(`wallet_${userId}`);
  }

  // Cache transactions
  setTransactions(userId, transactions) {
    this.set(`transactions_${userId}`, transactions, 3 * 60 * 1000); // 3 minutes
  }

  // Get cached transactions
  getTransactions(userId) {
    return this.get(`transactions_${userId}`);
  }

  // Cache allocated tags
  setAllocatedTags(userId, tags) {
    this.set(`tags_${userId}`, tags, 5 * 60 * 1000); // 5 minutes
  }

  // Get cached allocated tags
  getAllocatedTags(userId) {
    return this.get(`tags_${userId}`);
  }
}

// Create singleton instance
const dataCache = new DataCache();

export default dataCache; 