// testRedis.js
require("dotenv").config({ path: "./config.env" });

const {
  setUserCourseProgress,
  getUserCourseProgress,
} = require("./utils/cacheUtils");

async function testRedis() {
  const userId = "666f183b4b7aa8f841a8bc38";
  const courseId = "666df4b1d7a5dd9fb905e1a6";
  const progress = 75;

  await setUserCourseProgress(userId, courseId, progress);
  console.log("Progress set successfully");

  const cachedProgress = await getUserCourseProgress(userId, courseId);
  console.log("Cached Progress:", cachedProgress);
}

testRedis();
