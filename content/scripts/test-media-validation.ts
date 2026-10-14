import {
  analyzeContentAsset,
  VALIDATION_MESSAGES,
} from "../lib/ai-analyzer";
import { ContentAsset } from "../lib/db/schema";
import { generateWeeklyContentStrategy } from "../lib/strategy-engine";
import { analyzeContentGaps } from "../lib/gap-analyzer";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

async function runAllVerificationTests() {
  console.log("================================================================");
  console.log("ContentPilot Media Validation & Readability Test Suite");
  console.log("Testing All 12 Required Test Cases");
  console.log("================================================================\n");

  const baseRestaurant = {
    id: "rest-test-01",
    name: "Mama Put Delight",
    location: "Victoria Island, Lagos",
    restaurantType: "Casual Nigerian Dining",
    targetAudience: "Working corporate lunch crowd & families",
    primaryCustomerAction: "whatsapp_order",
  };

  // -------------------------------------------------------------------------
  // Test Case 1: Clear photo of a plated meal
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("TEST 1: Clear photo of a plated meal");
  const case1Asset: ContentAsset = {
    id: "asset-1-plated-meal",
    restaurantId: baseRestaurant.id,
    fileName: "plated_jollof_rice_with_smoked_chicken_and_fried_plantains.jpg",
    fileUrl: "https://example.com/jollof-rice-plate.jpg",
    fileSize: 2.4 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res1 = await analyzeContentAsset(case1Asset, { context: baseRestaurant });
  assert(res1.validationStatus === "valid", "Status is valid");
  assert(res1.contentCategory === "food_related", "Category is food_related");
  assert(res1.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res1.confidence >= 0.8, `Confidence is high (${res1.confidence})`);
  assert(res1.rejectionReason === undefined, "No rejection reason is present");
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 2: Video showing food preparation
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("TEST 2: Video showing food preparation");
  const case2Asset: ContentAsset = {
    id: "asset-2-food-prep-video",
    restaurantId: baseRestaurant.id,
    fileName: "chef_stirring_peppersoup_pot_and_grilling_fish.mp4",
    fileUrl: "https://example.com/kitchen-prep.mp4",
    fileSize: 18 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res2 = await analyzeContentAsset(case2Asset, {
    context: baseRestaurant,
    frames: ["data:image/jpeg;base64,frame1", "data:image/jpeg;base64,frame2"],
  });
  assert(res2.validationStatus === "valid", "Status is valid");
  assert(res2.contentCategory === "food_related", "Category is food_related");
  assert(res2.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res2.confidence >= 0.8, `Confidence is high (${res2.confidence})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 3: Photo of ingredients or packaged food products
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("TEST 3: Photo of ingredients or packaged food products");
  const case3Asset: ContentAsset = {
    id: "asset-3-ingredients",
    restaurantId: baseRestaurant.id,
    fileName: "fresh_market_spices_peppers_garlic_and_secret_sauce_jar.png",
    fileUrl: "https://example.com/fresh-ingredients.png",
    fileSize: 1.8 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res3 = await analyzeContentAsset(case3Asset, { context: baseRestaurant });
  assert(res3.validationStatus === "valid", "Status is valid");
  assert(res3.contentCategory === "food_related", "Category is food_related");
  assert(res3.processingStatus === "analyzed", "Processing status is analyzed");
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 4: Photo of a restaurant interior with no food visible
  // Expected: accepted as restaurant-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("TEST 4: Photo of a restaurant interior with no food visible");
  const case4Asset: ContentAsset = {
    id: "asset-4-interior",
    restaurantId: baseRestaurant.id,
    fileName: "dining_room_booths_interior_decor_and_lighting.jpg",
    fileUrl: "https://example.com/dining-room.jpg",
    fileSize: 3.1 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res4 = await analyzeContentAsset(case4Asset, { context: baseRestaurant });
  assert(res4.validationStatus === "valid", "Status is valid");
  assert(res4.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res4.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res4.contentType === "Ambience", `Content type is Ambience (${res4.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 5: Unrelated selfie
  // Expected: rejected with the exact non-food message
  // -------------------------------------------------------------------------
  console.log("TEST 5: Unrelated selfie");
  const case5Asset: ContentAsset = {
    id: "asset-5-selfie",
    restaurantId: baseRestaurant.id,
    fileName: "gym_workout_selfie_bathroom_mirror.jpg",
    fileUrl: "https://example.com/selfie.jpg",
    fileSize: 1.2 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res5 = await analyzeContentAsset(case5Asset, { context: baseRestaurant });
  assert(res5.validationStatus === "rejected", "Status is rejected");
  assert(res5.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res5.processingStatus === "rejected", "Processing status is rejected");
  assert(
    res5.rejectionReason === VALIDATION_MESSAGES.NON_FOOD_REJECTED,
    "Rejection message matches exact 4.A message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 5b: Camera upload selfie without 'selfie' keyword (WhatsApp Image)
  // Expected: rejected with the exact non-food message
  // -------------------------------------------------------------------------
  console.log("TEST 5b: Camera upload selfie without 'selfie' keyword (WhatsApp Image)");
  const case5bAsset: ContentAsset = {
    id: "asset-5b-whatsapp-selfie",
    restaurantId: baseRestaurant.id,
    fileName: "WhatsApp Image 2026-08-29 at 7.08.15 PM.jpeg",
    fileUrl: "https://example.com/WhatsApp_Image.jpeg",
    fileSize: 32102,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res5b = await analyzeContentAsset(case5bAsset, { context: baseRestaurant });
  assert(res5b.validationStatus === "rejected" || res5b.validationStatus === "uncertain", "Status is rejected or uncertain (not food)");
  assert(res5b.contentCategory !== "food_related", "Selfie is NEVER classified as food");
  assert(res5b.processingStatus !== "analyzed", "Selfie is NEVER marked as successfully analyzed food");
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 6: Unrelated vehicle or landscape
  // Expected: rejected with the exact non-food message
  // -------------------------------------------------------------------------
  console.log("TEST 6: Unrelated vehicle or landscape");
  const case6Asset: ContentAsset = {
    id: "asset-6-vehicle",
    restaurantId: baseRestaurant.id,
    fileName: "highway_traffic_mountain_sunset_landscape.png",
    fileUrl: "https://example.com/car.png",
    fileSize: 2.0 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res6 = await analyzeContentAsset(case6Asset, { context: baseRestaurant });
  assert(res6.validationStatus === "rejected", "Status is rejected");
  assert(res6.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res6.processingStatus === "rejected", "Processing status is rejected");
  assert(
    res6.rejectionReason === VALIDATION_MESSAGES.NON_FOOD_REJECTED,
    "Rejection message matches exact 4.A message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 7: Blurry or ambiguous image
  // Expected: handled as uncertain, requesting a clearer upload with exact message
  // -------------------------------------------------------------------------
  console.log("TEST 7: Blurry or ambiguous image");
  const case7Asset: ContentAsset = {
    id: "asset-7-blurry",
    restaurantId: baseRestaurant.id,
    fileName: "blurry_dark_unclear_fuzzy_shot.jpg",
    fileUrl: "https://example.com/blurry.jpg",
    fileSize: 0.5 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res7 = await analyzeContentAsset(case7Asset, { context: baseRestaurant });
  assert(res7.validationStatus === "uncertain", "Status is uncertain");
  assert(res7.contentCategory === "uncertain", "Category is uncertain");
  assert(res7.processingStatus === "needs_review", "Processing status is needs_review");
  assert(
    res7.rejectionReason === VALIDATION_MESSAGES.UNCERTAIN,
    "Message matches exact 4.B uncertain message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 8: Unrelated video
  // Expected: rejected with the exact non-food message
  // -------------------------------------------------------------------------
  console.log("TEST 8: Unrelated video");
  const case8Asset: ContentAsset = {
    id: "asset-8-unrelated-video",
    restaurantId: baseRestaurant.id,
    fileName: "crypto_stock_chart_trading_tutorial.mp4",
    fileUrl: "https://example.com/trading.mp4",
    fileSize: 22 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res8 = await analyzeContentAsset(case8Asset, {
    context: baseRestaurant,
    frames: ["data:image/jpeg;base64,chart1"],
  });
  assert(res8.validationStatus === "rejected", "Status is rejected");
  assert(res8.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res8.processingStatus === "rejected", "Processing status is rejected");
  assert(
    res8.rejectionReason === VALIDATION_MESSAGES.NON_FOOD_REJECTED,
    "Rejection message matches exact 4.A message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 9: Video exceeding processing limits (>200MB)
  // Expected: technical limitation error, NOT rejected as non-food
  // -------------------------------------------------------------------------
  console.log("TEST 9: Video exceeding processing limits (>200MB)");
  const case9Asset: ContentAsset = {
    id: "asset-9-oversized-video",
    restaurantId: baseRestaurant.id,
    fileName: "two_hour_raw_4k_buffet_recording.mp4",
    fileUrl: "https://example.com/huge-recording.mp4",
    fileSize: 240 * 1024 * 1024, // 240MB > 200MB limit
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res9 = await analyzeContentAsset(case9Asset, { context: baseRestaurant });
  assert(res9.validationStatus === "unsupported", "Status is unsupported");
  assert(res9.processingStatus === "failed", "Processing status is failed");
  assert(
    res9.contentCategory !== "non_food_unrelated",
    "Not falsely labeled as non-food"
  );
  assert(
    res9.rejectionReason === VALIDATION_MESSAGES.UNSUPPORTED_VIDEO_SIZE,
    "Message matches specific size limit message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 10: Unsupported video format (.avi)
  // Expected: clear technical error indicating format issue, NOT non-food
  // -------------------------------------------------------------------------
  console.log("TEST 10: Unsupported video format (.avi)");
  const case10Asset: ContentAsset = {
    id: "asset-10-unsupported-format",
    restaurantId: baseRestaurant.id,
    fileName: "restaurant_promo.avi",
    fileUrl: "https://example.com/promo.avi",
    fileSize: 12 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/x-msvideo",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res10 = await analyzeContentAsset(case10Asset, { context: baseRestaurant });
  assert(res10.validationStatus === "unsupported", "Status is unsupported");
  assert(res10.processingStatus === "failed", "Processing status is failed");
  assert(
    res10.contentCategory !== "non_food_unrelated",
    "Not falsely labeled as non-food"
  );
  assert(
    res10.rejectionReason === VALIDATION_MESSAGES.UNSUPPORTED_VIDEO_FORMAT,
    "Message specifies supported formats (MP4, MOV, WEBM)"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 11: Temporary AI failure or timeout
  // Expected: temporary failure message, NOT rejected as non-food
  // -------------------------------------------------------------------------
  console.log("TEST 11: Temporary AI failure or timeout");
  const case11AssetVideo: ContentAsset = {
    id: "asset-11-timeout-video",
    restaurantId: baseRestaurant.id,
    fileName: "fresh_cocktails_being_poured.mp4",
    fileUrl: "https://example.com/cocktails.mp4",
    fileSize: 8 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res11Video = await analyzeContentAsset(case11AssetVideo, {
    context: baseRestaurant,
    simulateTimeout: true,
  });
  assert(res11Video.validationStatus === "error", "Status is error");
  assert(res11Video.processingStatus === "failed", "Processing status is failed");
  assert(
    res11Video.contentCategory !== "non_food_unrelated",
    "Video timeout is NOT treated as non-food"
  );
  assert(
    res11Video.rejectionReason === VALIDATION_MESSAGES.AI_FAILURE_VIDEO,
    "Message matches exact 4.D video retry message"
  );

  const case11AssetImage: ContentAsset = {
    id: "asset-11-timeout-image",
    restaurantId: baseRestaurant.id,
    fileName: "artisan_sourdough_bread.jpg",
    fileUrl: "https://example.com/sourdough.jpg",
    fileSize: 2 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  const res11Image = await analyzeContentAsset(case11AssetImage, {
    context: baseRestaurant,
    simulateTimeout: true,
  });
  assert(res11Image.validationStatus === "error", "Status is error");
  assert(res11Image.processingStatus === "failed", "Processing status is failed");
  assert(
    res11Image.contentCategory !== "non_food_unrelated",
    "Image timeout is NOT treated as non-food"
  );
  assert(
    res11Image.rejectionReason === VALIDATION_MESSAGES.AI_FAILURE_IMAGE,
    "Message matches exact 4.D image retry message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Test Case 12: Verify that accepted media continues through analysis workflow
  // and rejected media does not (Downstream Content Strategy & Gap Analysis)
  // -------------------------------------------------------------------------
  console.log("TEST 12: Downstream Content Strategy & Gap Analysis Isolation");

  const validAnalyzedImage: ContentAsset = {
    ...case1Asset,
    processingStatus: "analyzed",
    validationStatus: "valid",
    contentCategory: "food_related",
    contentPillar: "product",
    suggestedPlatform: "instagram",
    aiDescription: "Steaming hot Nigerian jollof rice garnished with grilled chicken and plantain slices.",
  };

  const validAnalyzedVideo: ContentAsset = {
    ...case2Asset,
    processingStatus: "analyzed",
    validationStatus: "valid",
    contentCategory: "food_related",
    contentPillar: "behind_the_scenes",
    suggestedPlatform: "tiktok",
    aiDescription: "Behind the scenes video of head chef seasoning grilled catfish and simmering sauce.",
  };

  const rejectedSelfieAsset: ContentAsset = {
    ...case5Asset,
    processingStatus: "rejected",
    validationStatus: "rejected",
    contentCategory: "non_food_unrelated",
    rejectionReason: VALIDATION_MESSAGES.NON_FOOD_REJECTED,
  };

  const mixedAssets: ContentAsset[] = [
    validAnalyzedImage,
    validAnalyzedVideo,
    rejectedSelfieAsset,
  ];

  // 1. Test Gap Analysis (Assert that rejected selfie is excluded)
  const gaps = analyzeContentGaps(mixedAssets, "increase_lunch_orders", baseRestaurant);
  assert(
    gaps.totalAssetsCount === 2,
    `Gap analysis totalAssetsCount excludes rejected asset (expected 2, got ${gaps.totalAssetsCount})`
  );
  assert(
    gaps.photosCount === 1,
    `Gap analysis photosCount excludes rejected selfie (expected 1, got ${gaps.photosCount})`
  );

  // 2. Test Weekly Strategy Generation
  const strategy = await generateWeeklyContentStrategy({
    restaurantId: baseRestaurant.id,
    restaurantName: baseRestaurant.name,
    location: baseRestaurant.location,
    targetAudience: baseRestaurant.targetAudience,
    primaryCustomerAction: baseRestaurant.primaryCustomerAction,
    goal: "increase_lunch_orders",
    availableAssets: mixedAssets,
    weekStart: "2026-10-19",
  });

  const matchedIds = strategy.items
    .map((item) => item.assetId)
    .filter(Boolean);

  assert(
    matchedIds.includes(validAnalyzedImage.id),
    "Valid food photo is matched in strategy"
  );
  assert(
    matchedIds.includes(validAnalyzedVideo.id),
    "Valid food prep video is matched in strategy"
  );
  assert(
    !matchedIds.includes(rejectedSelfieAsset.id),
    "Rejected non-food media is NEVER matched in strategy"
  );

  console.log("\n================================================================");
  console.log(`Test Results: ${passedCount} passed, ${failedCount} failed`);
  console.log("================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllVerificationTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
