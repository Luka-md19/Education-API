const crypto = require("crypto");
const Redis = require("ioredis");

// Create Redis client or mock based on configuration
let redisClient;

// Check if Redis is enabled in the configuration
const redisEnabled = process.env.REDIS_ENABLED === "true";

if (redisEnabled) {
  try {
    console.log("Initializing Redis client...");

    const redisOptions = {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      connectTimeout: 20000, // 20 seconds timeout
      maxRetriesPerRequest: 3,
      retryStrategy: function (times) {
        if (times > 3) {
          console.log(
            "Redis connection failed after multiple retries, continuing without cache."
          );
          return null; // Stop retrying
        }
        return Math.min(times * 200, 3000); // Retry with exponential backoff
      },
    };

    if (process.env.REDIS_PASSWORD) {
      redisOptions.password = process.env.REDIS_PASSWORD;
    }

    redisClient = new Redis(redisOptions);

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisClient.on("ready", () => {
      console.log("Redis client is ready to use");
    });

    // Test Redis connection
    redisClient
      .ping()
      .then(() => {
        console.log("Redis connection successful (PING)");
      })
      .catch((err) => {
        console.error("Redis ping failed:", err);
      });
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    createMockRedisClient();
  }
} else {
  console.log("Redis is disabled in configuration. Using mock Redis client.");
  createMockRedisClient();
}

// Function to create a mock Redis client
function createMockRedisClient() {
  redisClient = {
    get: async () => null,
    set: async () => true,
    del: async () => true,
    on: () => {},
    ping: async () => "PONG",
    // Add other methods as needed
  };
  console.log("Using mock Redis client - caching disabled");
}

const algorithm = "aes-256-cbc";
const key = process.env.ENCRYPTION_KEY;
if (!key || key.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
}

// Function to encrypt data
const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, "hex"),
      iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return unencrypted in case of error
  }
};

// Function to decrypt data
const decrypt = (text) => {
  try {
    const parts = text.split(":");
    if (parts.length < 2) return text; // Invalid format

    const iv = Buffer.from(parts.shift(), "hex");
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, "hex"),
      iv
    );
    let decrypted = decipher.update(parts.join(":"), "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return text; // Return as is in case of error
  }
};

// Cache user course progress
const setUserCourseProgress = async (userId, courseId, progress) => {
  if (!redisEnabled) return;

  const cacheKey = `user:${userId}:course:${courseId}:progress`;
  try {
    const encryptedProgress = encrypt(JSON.stringify(progress));
    await redisClient.set(cacheKey, encryptedProgress, "EX", 3600); // Cache for 1 hour
  } catch (err) {
    console.error("Error setting user course progress in Redis:", err);
  }
};

// Get user course progress from cache
const getUserCourseProgress = async (userId, courseId) => {
  if (!redisEnabled) return null;

  const cacheKey = `user:${userId}:course:${courseId}:progress`;
  try {
    const cachedProgress = await redisClient.get(cacheKey);
    if (cachedProgress) {
      return JSON.parse(decrypt(cachedProgress));
    }
  } catch (err) {
    console.error("Error getting user course progress from Redis:", err);
  }
  return null; // Fetch from database if not in cache
};

module.exports = {
  setUserCourseProgress,
  getUserCourseProgress,
  redisClient,
  encrypt,
  decrypt,
};
