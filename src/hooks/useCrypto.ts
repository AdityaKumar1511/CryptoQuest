/**
 * Pure JS cryptographic operations for Caesar, Vigenere, and Hex conversions.
 */

/**
 * Caesar Cipher encryption/decryption.
 * @param text The input string to transform.
 * @param shift The number of alphabetical positions to shift.
 * @param decrypt Whether to shift backward (decrypt).
 */
export function caesar(text: string, shift: number, decrypt: boolean = false): string {
  const normShift = ((shift % 26) + 26) % 26;
  const actualShift = decrypt ? 26 - normShift : normShift;

  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + actualShift) % 26) + 65);
      }
      
      // Lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + actualShift) % 26) + 97);
      }
      
      // Other characters (spaces, punctuation) remain unchanged
      return char;
    })
    .join("");
}

/**
 * Vigenere Cipher encryption/decryption.
 * @param text The input string to transform.
 * @param key The alphabetic keyword.
 * @param decrypt Whether to shift backward (decrypt).
 */
export function vigenere(text: string, key: string, decrypt: boolean = false): string {
  if (!key) return text;
  
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanKey.length === 0) return text;
  
  let keyIndex = 0;
  
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        const keyCharShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        keyIndex++;
        const actualShift = decrypt ? (26 - keyCharShift) % 26 : keyCharShift;
        return String.fromCharCode(((code - 65 + actualShift) % 26) + 65);
      }
      
      // Lowercase letters
      if (code >= 97 && code <= 122) {
        const keyCharShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        keyIndex++;
        const actualShift = decrypt ? (26 - keyCharShift) % 26 : keyCharShift;
        return String.fromCharCode(((code - 97 + actualShift) % 26) + 97);
      }
      
      // Other characters remain unchanged and do not advance the key index
      return char;
    })
    .join("");
}

/**
 * Converts a hexadecimal string into an ASCII plaintext string.
 * Supports strings separated by spaces, colons, or continuous hex digits.
 */
export function hexToAscii(hexStr: string): string {
  // Clean the string (remove spaces, colons, etc.)
  const cleaned = hexStr.replace(/[\s:]/g, "");
  
  // If length is not even, we can't fully parse yet
  if (cleaned.length % 2 !== 0) {
    return "";
  }
  
  let ascii = "";
  for (let i = 0; i < cleaned.length; i += 2) {
    const hexByte = cleaned.substring(i, i + 2);
    const charCode = parseInt(hexByte, 16);
    if (!isNaN(charCode) && charCode >= 0) {
      ascii += String.fromCharCode(charCode);
    }
  }
  return ascii;
}

/**
 * Converts an ASCII string into a space-separated Hexadecimal string.
 */
export function asciiToHex(asciiStr: string): string {
  return asciiStr
    .split("")
    .map((char) => {
      const hex = char.charCodeAt(0).toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join(" ");
}

/**
 * Custom React Hook to export all operations.
 */
export function useCrypto() {
  return {
    caesar,
    vigenere,
    hexToAscii,
    asciiToHex,
  };
}
