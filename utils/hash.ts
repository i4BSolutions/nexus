import SHA256 from "crypto-js/sha256";
import encHex from "crypto-js/enc-hex";
import { Buffer } from "buffer";

/**
 * Compute SHA-256 hash using crypto-js
 */
export function hashFile(buffer: ArrayBuffer | Buffer): string {
  if (buffer instanceof ArrayBuffer) {
    const wordArray = SHA256(Buffer.from(buffer).toString("utf8")); // convert arrayBuffer → string for hashing
    return wordArray.toString(encHex);
  }

  // Node Buffer
  return SHA256(buffer.toString("utf8")).toString(encHex);
}
