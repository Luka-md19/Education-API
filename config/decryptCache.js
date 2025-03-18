const crypto = require("crypto");

// Define algorithm and key
const algorithm = "aes-256-cbc";
const key = process.env.ENCRYPTION_KEY;

if (!key || key.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
}

const decrypt = (text) => {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, "hex"),
    iv
  );
  let decrypted = decipher.update(parts.join(":"), "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Replace this with the encrypted value from Redis
const encryptedValue =
  "f8616aaacd89e2c38518d9e3c372015b:1e62f5c012716af854a7d0cd80649685";

const decryptedValue = decrypt(encryptedValue);
console.log("Decrypted Value:", decryptedValue);
