/**
 * Recursively removes specified keys from an object or array (in-place).
 * @param {object|array} obj - The object or array to process.
 * @param {string[]} keysToRemove - The keys to remove.
 */
function removeKeysDeep(obj, keysToRemove) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => removeKeysDeep(item, keysToRemove));
  } else if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (keysToRemove.includes(key)) {
        delete obj[key];
      } else {
        removeKeysDeep(obj[key], keysToRemove);
      }
    }
  }
}

export default removeKeysDeep;
