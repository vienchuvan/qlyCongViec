const crypto = require('crypto');
var _3DES = require('nod3des');
const IV_LENGTH = 16;

// Secret key (must be shared securely between frontend and backend)
const SECRET_KEY = "BIryQ4iRqJo1NqwJzJbMvTShcU6Iz4/b"; // 32 bytes for AES-256

// Encrypt function
function encrypt(data) {
    // Convert JSON objects to strings
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    
    return iv.toString('hex') + ':' + encrypted; // Combine IV and encrypted data
}

// Decrypt function
function decrypt(data) {
    if (typeof data !== 'string') {
      throw new TypeError('Data to decrypt must be a string');
    }
  
    const parts = data.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
  
    const ivHex = parts[0];
    const encryptedHex = parts[1];
  
    const key = CryptoJS.enc.Utf8.parse("BIryQ4iRqJo1NqwJzJbMvTShcU6Iz4/b"); // hoặc lấy key đúng theo bạn dùng
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
  
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString(CryptoJS.enc.Utf8);
  
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

module.exports = { encrypt, decrypt };