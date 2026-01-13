// Simple hash function using a basic hashing algorithm
const hashPassword = (password) => {
  let hash = 0;
  const str = password + 'habitgrid_salt_2026'; // Add salt for security
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex and add more complexity
  const hexHash = Math.abs(hash).toString(36) + str.length.toString(36);
  return btoa(hexHash); // Base64 encode for additional obfuscation
};

// Verify password against stored hash
export const verifyPassword = (password, storedHash) => {
  const hash = hashPassword(password);
  return hash === storedHash;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('habitgrid_auth') !== null;
};

// Save authentication
export const saveAuth = (password) => {
  const hash = hashPassword(password);
  localStorage.setItem('habitgrid_auth', hash);
};

// Clear authentication
export const clearAuth = () => {
  localStorage.removeItem('habitgrid_auth');
};

// Get stored hash
export const getStoredHash = () => {
  return localStorage.getItem('habitgrid_auth');
};
