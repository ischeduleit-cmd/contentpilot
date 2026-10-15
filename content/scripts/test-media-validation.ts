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
  console.log("Testing All 23 Implementation Scenarios + Downstream Pipeline");
  console.log("================================================================\n");

  const baseRestaurant = {
    id: "rest-test-01",
    name: "Mama Put Delight",
    location: "Victoria Island, Lagos",
    restaurantType: "Casual Nigerian Dining",
    targetAudience: "Working corporate lunch crowd & families",
    primaryCustomerAction: "whatsapp_order",
    activeGoal: "increase_lunch_orders",
  };

  // -------------------------------------------------------------------------
  // Scenario 1: Clear photo of a plated meal
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("SCENARIO 1: Clear photo of a plated meal");
  const s1: ContentAsset = {
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
  const res1 = await analyzeContentAsset(s1, { context: baseRestaurant });
  assert(res1.validationStatus === "valid", "Status is valid");
  assert(res1.contentCategory === "food_related", "Category is food_related");
  assert(res1.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res1.confidence >= 0.8, `Confidence is high (${res1.confidence})`);
  assert(res1.rejectionReason === undefined, "No rejection reason is present");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 2: Video showing cooking or food preparation
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("SCENARIO 2: Video showing cooking or food preparation");
  const s2: ContentAsset = {
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
  const res2 = await analyzeContentAsset(s2, {
    context: baseRestaurant,
    frames: ["data:image/jpeg;base64,frame1", "data:image/jpeg;base64,frame2"],
  });
  assert(res2.validationStatus === "valid", "Status is valid");
  assert(res2.contentCategory === "food_related", "Category is food_related");
  assert(res2.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res2.contentType === "Behind the scenes", `Content type is Behind the scenes (${res2.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 3: Photo of ingredients or packaged food products
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("SCENARIO 3: Photo of ingredients or packaged food products");
  const s3: ContentAsset = {
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
  const res3 = await analyzeContentAsset(s3, { context: baseRestaurant });
  assert(res3.validationStatus === "valid", "Status is valid");
  assert(res3.contentCategory === "food_related", "Category is food_related");
  assert(res3.processingStatus === "analyzed", "Processing status is analyzed");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 4: Video where food appears in later frames
  // Expected: accepted as food-related, analyzed successfully
  // -------------------------------------------------------------------------
  console.log("SCENARIO 4: Video where food appears in later frames");
  const s4: ContentAsset = {
    id: "asset-4-later-food-video",
    restaurantId: baseRestaurant.id,
    fileName: "restaurant_introduction_and_sizzling_platter_reveal.mp4",
    fileUrl: "https://example.com/reveal.mp4",
    fileSize: 15 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res4 = await analyzeContentAsset(s4, {
    context: baseRestaurant,
    frames: ["data:image/jpeg;base64,intro", "data:image/jpeg;base64,sizzling_food"],
  });
  assert(res4.validationStatus === "valid", "Status is valid");
  assert(res4.contentCategory === "food_related", "Category is food_related");
  assert(res4.processingStatus === "analyzed", "Processing status is analyzed");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 5: Restaurant menu design or photograph of physical menu
  // Expected: accepted as restaurant-related marketing content
  // -------------------------------------------------------------------------
  console.log("SCENARIO 5: Restaurant menu design or photograph of physical menu");
  const s5: ContentAsset = {
    id: "asset-5-menu",
    restaurantId: baseRestaurant.id,
    fileName: "restaurant_food_and_drinks_menu_pricing.jpg",
    fileUrl: "https://example.com/menu.jpg",
    fileSize: 2.1 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res5 = await analyzeContentAsset(s5, { context: baseRestaurant });
  assert(res5.validationStatus === "valid", "Status is valid");
  assert(res5.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res5.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res5.contentType === "Promotional", `Content type is Promotional (${res5.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 6: Event flyer for restaurant event (live music, buffet, brunch)
  // Expected: accepted as restaurant-related marketing content
  // -------------------------------------------------------------------------
  console.log("SCENARIO 6: Event flyer for restaurant event (live music, brunch, etc.)");
  const s6: ContentAsset = {
    id: "asset-6-event-flyer",
    restaurantId: baseRestaurant.id,
    fileName: "sunday_brunch_buffet_live_music_event_flyer.jpg",
    fileUrl: "https://example.com/sunday-brunch-flyer.jpg",
    fileSize: 1.5 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res6 = await analyzeContentAsset(s6, { context: baseRestaurant });
  assert(res6.validationStatus === "valid", "Status is valid");
  assert(res6.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res6.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res6.contentType === "Event", `Content type is Event (${res6.contentType})`);
  assert(res6.contentPillar === "promotion", `Content pillar is promotion (${res6.contentPillar})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 7: Promotional graphic announcing discount/offer
  // Expected: accepted as restaurant-related marketing content
  // -------------------------------------------------------------------------
  console.log("SCENARIO 7: Promotional graphic announcing restaurant discount/offer");
  const s7: ContentAsset = {
    id: "asset-7-discount-graphic",
    restaurantId: baseRestaurant.id,
    fileName: "20_percent_discount_weekend_combo_offer.png",
    fileUrl: "https://example.com/discount.png",
    fileSize: 1.2 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res7 = await analyzeContentAsset(s7, { context: baseRestaurant });
  assert(res7.validationStatus === "valid", "Status is valid");
  assert(res7.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res7.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res7.contentType === "Promotional", `Content type is Promotional (${res7.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 8: Restaurant announcement graphic (grand opening, new hours)
  // Expected: accepted as restaurant-related marketing content
  // -------------------------------------------------------------------------
  console.log("SCENARIO 8: Restaurant announcement graphic (grand opening, new hours)");
  const s8: ContentAsset = {
    id: "asset-8-announcement",
    restaurantId: baseRestaurant.id,
    fileName: "grand_opening_new_location_announcement.png",
    fileUrl: "https://example.com/announcement.png",
    fileSize: 1.4 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res8 = await analyzeContentAsset(s8, { context: baseRestaurant });
  assert(res8.validationStatus === "valid", "Status is valid");
  assert(res8.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res8.processingStatus === "analyzed", "Processing status is analyzed");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 9: Photo of restaurant interior or patio with no food visible
  // Expected: accepted as restaurant-related
  // -------------------------------------------------------------------------
  console.log("SCENARIO 9: Photo of restaurant interior or patio with no food visible");
  const s9: ContentAsset = {
    id: "asset-9-interior",
    restaurantId: baseRestaurant.id,
    fileName: "dining_room_booths_interior_decor_and_lighting.jpg",
    fileUrl: "https://example.com/dining-room.jpg",
    fileSize: 3.1 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res9 = await analyzeContentAsset(s9, { context: baseRestaurant });
  assert(res9.validationStatus === "valid", "Status is valid");
  assert(res9.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res9.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res9.contentType === "Ambience", `Content type is Ambience (${res9.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 10: Photo of restaurant team, chef, or staff
  // Expected: accepted as restaurant-related
  // -------------------------------------------------------------------------
  console.log("SCENARIO 10: Photo of restaurant team, chef, or staff");
  const s10: ContentAsset = {
    id: "asset-10-staff",
    restaurantId: baseRestaurant.id,
    fileName: "head_chef_and_hospitality_service_team.jpg",
    fileUrl: "https://example.com/team.jpg",
    fileSize: 2.8 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res10 = await analyzeContentAsset(s10, { context: baseRestaurant });
  assert(res10.validationStatus === "valid", "Status is valid");
  assert(res10.contentCategory === "restaurant_related", "Category is restaurant_related");
  assert(res10.processingStatus === "analyzed", "Processing status is analyzed");
  assert(res10.contentType === "Staff", `Content type is Staff (${res10.contentType})`);
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 11: Standalone personal selfie
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 11: Standalone personal selfie");
  const s11: ContentAsset = {
    id: "asset-11-selfie",
    restaurantId: baseRestaurant.id,
    fileName: "gym_workout_selfie_bathroom_mirror.jpg",
    fileUrl: "https://example.com/selfie.jpg",
    fileSize: 1.2 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res11 = await analyzeContentAsset(s11, { context: baseRestaurant });
  assert(res11.validationStatus === "rejected", "Status is rejected");
  assert(res11.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res11.processingStatus === "rejected", "Processing status is rejected");
  assert(
    res11.rejectionReason === VALIDATION_MESSAGES.NON_FOOD_REJECTED,
    "Rejection message matches exact 4.A message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 12: Personal portrait unrelated to restaurant
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 12: Personal portrait unrelated to restaurant");
  const s12: ContentAsset = {
    id: "asset-12-portrait",
    restaurantId: baseRestaurant.id,
    fileName: "personal_portrait_studio_headshot.jpg",
    fileUrl: "https://example.com/headshot.jpg",
    fileSize: 1.1 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res12 = await analyzeContentAsset(s12, { context: baseRestaurant });
  assert(res12.validationStatus === "rejected", "Status is rejected");
  assert(res12.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res12.processingStatus === "rejected", "Processing status is rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 13: Unrelated vehicle photo
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 13: Unrelated vehicle photo");
  const s13: ContentAsset = {
    id: "asset-13-car",
    restaurantId: baseRestaurant.id,
    fileName: "toyota_sedan_car_parking_lot.jpg",
    fileUrl: "https://example.com/sedan.jpg",
    fileSize: 1.9 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res13 = await analyzeContentAsset(s13, { context: baseRestaurant });
  assert(res13.validationStatus === "rejected", "Status is rejected");
  assert(res13.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res13.processingStatus === "rejected", "Processing status is rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 14: Unrelated landscape photo
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 14: Unrelated landscape photo");
  const s14: ContentAsset = {
    id: "asset-14-landscape",
    restaurantId: baseRestaurant.id,
    fileName: "mountain_sunset_ocean_beach_nature.png",
    fileUrl: "https://example.com/nature.png",
    fileSize: 2.5 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res14 = await analyzeContentAsset(s14, { context: baseRestaurant });
  assert(res14.validationStatus === "rejected", "Status is rejected");
  assert(res14.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res14.processingStatus === "rejected", "Processing status is rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 15: Unrelated business/tech event flyer
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 15: Unrelated business/tech event flyer");
  const s15: ContentAsset = {
    id: "asset-15-tech-flyer",
    restaurantId: baseRestaurant.id,
    fileName: "crypto_summit_tech_conference_hackathon_flyer.jpg",
    fileUrl: "https://example.com/crypto-flyer.jpg",
    fileSize: 1.3 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res15 = await analyzeContentAsset(s15, { context: baseRestaurant });
  assert(res15.validationStatus === "rejected", "Status is rejected");
  assert(res15.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res15.processingStatus === "rejected", "Processing status is rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 16: Unrelated video
  // Expected: rejected with exact non-food message
  // -------------------------------------------------------------------------
  console.log("SCENARIO 16: Unrelated video");
  const s16: ContentAsset = {
    id: "asset-16-crypto-video",
    restaurantId: baseRestaurant.id,
    fileName: "crypto_stock_chart_trading_tutorial.mp4",
    fileUrl: "https://example.com/trading.mp4",
    fileSize: 22 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res16 = await analyzeContentAsset(s16, { context: baseRestaurant });
  assert(res16.validationStatus === "rejected", "Status is rejected");
  assert(res16.contentCategory === "non_food_unrelated", "Category is non_food_unrelated");
  assert(res16.processingStatus === "rejected", "Processing status is rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 17: Genuinely blurry/unreadable image
  // Expected: handled as uncertain, requesting clearer upload
  // -------------------------------------------------------------------------
  console.log("SCENARIO 17: Genuinely blurry/unreadable image");
  const s17: ContentAsset = {
    id: "asset-17-blurry",
    restaurantId: baseRestaurant.id,
    fileName: "blurry_dark_unclear_fuzzy_shot.jpg",
    fileUrl: "https://example.com/blurry.jpg",
    fileSize: 0.5 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res17 = await analyzeContentAsset(s17, { context: baseRestaurant });
  assert(res17.validationStatus === "uncertain", "Status is uncertain");
  assert(res17.contentCategory === "uncertain", "Category is uncertain");
  assert(res17.processingStatus === "needs_review", "Processing status is needs_review");
  assert(
    res17.rejectionReason === VALIDATION_MESSAGES.UNCERTAIN,
    "Message matches exact 4.B uncertain message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 18: Ambiguous graphic with unreadable text
  // Expected: handled as uncertain, requesting clearer upload
  // -------------------------------------------------------------------------
  console.log("SCENARIO 18: Ambiguous graphic with unreadable text");
  const s18: ContentAsset = {
    id: "asset-18-ambiguous",
    restaurantId: baseRestaurant.id,
    fileName: "ambiguous_graphic_abstract_noise.png",
    fileUrl: "https://example.com/abstract.png",
    fileSize: 0.8 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/png",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res18 = await analyzeContentAsset(s18, { context: baseRestaurant });
  assert(res18.validationStatus === "uncertain", "Status is uncertain");
  assert(res18.contentCategory === "uncertain", "Category is uncertain");
  assert(res18.processingStatus === "needs_review", "Processing status is needs_review");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 19: Video whose frames are too dark or ambiguous to classify
  // Expected: handled as uncertain, requesting clearer upload
  // -------------------------------------------------------------------------
  console.log("SCENARIO 19: Video whose frames are too dark or ambiguous to classify");
  const s19: ContentAsset = {
    id: "asset-19-dark-video",
    restaurantId: baseRestaurant.id,
    fileName: "pitch_black_obscure_video_recording.mp4",
    fileUrl: "https://example.com/pitchblack.mp4",
    fileSize: 5 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res19 = await analyzeContentAsset(s19, { context: baseRestaurant });
  assert(res19.validationStatus === "uncertain", "Status is uncertain");
  assert(res19.contentCategory === "uncertain", "Category is uncertain");
  assert(res19.processingStatus === "needs_review", "Processing status is needs_review");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 20: Video in unsupported format (.avi)
  // Expected: technical limitation error, NOT non-food, NOT review
  // -------------------------------------------------------------------------
  console.log("SCENARIO 20: Video in unsupported format (.avi)");
  const s20: ContentAsset = {
    id: "asset-20-unsupported-format",
    restaurantId: baseRestaurant.id,
    fileName: "restaurant_promo.avi",
    fileUrl: "https://example.com/promo.avi",
    fileSize: 12 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/x-msvideo",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res20 = await analyzeContentAsset(s20, { context: baseRestaurant });
  assert(res20.validationStatus === "unsupported", "Status is unsupported");
  assert(res20.processingStatus === "failed", "Processing status is failed");
  assert(res20.contentCategory !== "non_food_unrelated", "Not falsely labeled as non-food");
  assert(
    res20.rejectionReason === VALIDATION_MESSAGES.UNSUPPORTED_VIDEO_FORMAT,
    "Message specifies supported formats (MP4, MOV, WEBM)"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 21: Video exceeding size limit (>200MB)
  // Expected: technical limitation error, NOT non-food, NOT review
  // -------------------------------------------------------------------------
  console.log("SCENARIO 21: Video exceeding size limit (>200MB)");
  const s21: ContentAsset = {
    id: "asset-21-oversized-video",
    restaurantId: baseRestaurant.id,
    fileName: "two_hour_raw_4k_buffet_recording.mp4",
    fileUrl: "https://example.com/huge-recording.mp4",
    fileSize: 240 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res21 = await analyzeContentAsset(s21, { context: baseRestaurant });
  assert(res21.validationStatus === "unsupported", "Status is unsupported");
  assert(res21.processingStatus === "failed", "Processing status is failed");
  assert(res21.contentCategory !== "non_food_unrelated", "Not falsely labeled as non-food");
  assert(
    res21.rejectionReason === VALIDATION_MESSAGES.UNSUPPORTED_VIDEO_SIZE,
    "Message specifies maximum video size 200MB"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 22: Temporary AI failure or timeout
  // Expected: temporary failure message, NOT non-food, NOT review
  // -------------------------------------------------------------------------
  console.log("SCENARIO 22: Temporary AI failure or timeout");
  const s22Video: ContentAsset = {
    id: "asset-22-timeout-video",
    restaurantId: baseRestaurant.id,
    fileName: "fresh_cocktails_being_poured.mp4",
    fileUrl: "https://example.com/cocktails.mp4",
    fileSize: 8 * 1024 * 1024,
    mediaType: "video",
    mimeType: "video/mp4",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res22Video = await analyzeContentAsset(s22Video, {
    context: baseRestaurant,
    simulateTimeout: true,
  });
  assert(res22Video.validationStatus === "error", "Status is error");
  assert(res22Video.processingStatus === "failed", "Processing status is failed");
  assert(res22Video.contentCategory !== "non_food_unrelated", "Not treated as non-food");
  assert(
    res22Video.rejectionReason === VALIDATION_MESSAGES.AI_FAILURE_VIDEO,
    "Message matches exact 4.D video retry message"
  );

  const s22Image: ContentAsset = {
    id: "asset-22-timeout-image",
    restaurantId: baseRestaurant.id,
    fileName: "artisan_sourdough_bread.jpg",
    fileUrl: "https://example.com/sourdough.jpg",
    fileSize: 2 * 1024 * 1024,
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  const res22Image = await analyzeContentAsset(s22Image, {
    context: baseRestaurant,
    simulateTimeout: true,
  });
  assert(res22Image.validationStatus === "error", "Status is error");
  assert(res22Image.processingStatus === "failed", "Processing status is failed");
  assert(res22Image.contentCategory !== "non_food_unrelated", "Not treated as non-food");
  assert(
    res22Image.rejectionReason === VALIDATION_MESSAGES.AI_FAILURE_IMAGE,
    "Message matches exact 4.D image retry message"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 23: Valid asset with missing optional field
  // Expected: Handled gracefully, valid output
  // -------------------------------------------------------------------------
  console.log("SCENARIO 23: Valid asset with missing optional context or fields");
  const s23 = {
    id: "asset-23-missing-fields",
    fileName: "grilled_suya_beef_skewer.jpg",
    fileUrl: "https://example.com/suya.jpg",
    mediaType: "image",
    mimeType: "image/jpeg",
    processingStatus: "pending" as const,
    createdAt: new Date().toISOString(),
  } as ContentAsset;
  const res23 = await analyzeContentAsset(s23, {});
  assert(res23.validationStatus === "valid", "Status is valid despite missing optional fields");
  assert(res23.contentCategory === "food_related", "Category is food_related");
  assert(res23.processingStatus === "analyzed", "Processing status is analyzed");
  assert(Boolean(res23.aiDescription), "AI description is populated");
  assert(Boolean(res23.suggestedAngle), "Suggested angle is populated");
  console.log("");

  // -------------------------------------------------------------------------
  // Scenario 24: Downstream Content Strategy & Gap Analysis Isolation
  // Verify accepted media continues through analysis workflow and rejected media does not
  // -------------------------------------------------------------------------
  console.log("SCENARIO 24: Downstream Content Strategy & Gap Analysis Isolation");

  const validAnalyzedFood: ContentAsset = {
    ...s1,
    processingStatus: "analyzed",
    validationStatus: "valid",
    contentCategory: "food_related",
    contentPillar: "product",
    suggestedPlatform: "instagram",
    aiDescription: "Steaming hot Nigerian jollof rice garnished with grilled chicken and plantain slices.",
  };

  const validAnalyzedFlyer: ContentAsset = {
    ...s6,
    processingStatus: "analyzed",
    validationStatus: "valid",
    contentCategory: "restaurant_related",
    contentPillar: "promotion",
    suggestedPlatform: "instagram",
    aiDescription: "Sunday brunch buffet live music promotional flyer.",
  };

  const rejectedSelfie: ContentAsset = {
    ...s11,
    processingStatus: "rejected",
    validationStatus: "rejected",
    contentCategory: "non_food_unrelated",
    rejectionReason: VALIDATION_MESSAGES.NON_FOOD_REJECTED,
  };

  const rejectedTechFlyer: ContentAsset = {
    ...s15,
    processingStatus: "rejected",
    validationStatus: "rejected",
    contentCategory: "non_food_unrelated",
    rejectionReason: VALIDATION_MESSAGES.NON_FOOD_REJECTED,
  };

  const mixedAssets: ContentAsset[] = [
    validAnalyzedFood,
    validAnalyzedFlyer,
    rejectedSelfie,
    rejectedTechFlyer,
  ];

  // 1. Test Gap Analysis
  const gaps = analyzeContentGaps(mixedAssets, "increase_lunch_orders", baseRestaurant);
  assert(
    gaps.totalAssetsCount === 2,
    `Gap analysis totalAssetsCount excludes rejected assets (expected 2, got ${gaps.totalAssetsCount})`
  );
  assert(
    gaps.photosCount === 2,
    `Gap analysis photosCount accurately counts valid photos/graphics (expected 2, got ${gaps.photosCount})`
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

  const matchedIds = strategy.items.map((item) => item.assetId).filter(Boolean);

  assert(
    matchedIds.includes(validAnalyzedFood.id),
    "Valid food photo is matched in strategy"
  );
  assert(
    !matchedIds.includes(rejectedSelfie.id),
    "Rejected selfie is NEVER matched in strategy"
  );
  assert(
    !matchedIds.includes(rejectedTechFlyer.id),
    "Rejected tech flyer is NEVER matched in strategy"
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
