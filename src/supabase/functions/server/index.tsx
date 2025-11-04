import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ef6ca5a0/health", (c) => {
  return c.json({ status: "ok" });
});

// Review endpoints

// Create a new review
app.post("/make-server-ef6ca5a0/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { restaurantId, userName, rating, comment } = body;

    if (!restaurantId || !userName || !rating || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const reviewId = `${restaurantId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const review = {
      id: reviewId,
      restaurantId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    // Store review
    await kv.set(`review:${reviewId}`, review);

    // Add review ID to restaurant's review list
    const restaurantReviews = await kv.get(`restaurant_reviews:${restaurantId}`) || [];
    restaurantReviews.push(reviewId);
    await kv.set(`restaurant_reviews:${restaurantId}`, restaurantReviews);

    console.log(`Review created: ${reviewId} for restaurant ${restaurantId}`);
    return c.json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    return c.json({ error: "Failed to create review", details: String(error) }, 500);
  }
});

// Get all reviews for a restaurant
app.get("/make-server-ef6ca5a0/reviews/:restaurantId", async (c) => {
  try {
    const restaurantId = c.req.param("restaurantId");
    const reviewIds = await kv.get(`restaurant_reviews:${restaurantId}`) || [];
    
    const reviews = [];
    for (const reviewId of reviewIds) {
      const review = await kv.get(`review:${reviewId}`);
      if (review) {
        // Get like count
        const likeKeys = await kv.getByPrefix(`review_like:${reviewId}:`);
        review.likes = likeKeys.length;
        reviews.push(review);
      }
    }

    // Sort by date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Retrieved ${reviews.length} reviews for restaurant ${restaurantId}`);
    return c.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return c.json({ error: "Failed to fetch reviews", details: String(error) }, 500);
  }
});

// Like a review
app.post("/make-server-ef6ca5a0/reviews/:reviewId/like", async (c) => {
  try {
    const reviewId = c.req.param("reviewId");
    const body = await c.req.json();
    const { userName } = body;

    if (!userName) {
      return c.json({ error: "userName is required" }, 400);
    }

    const likeKey = `review_like:${reviewId}:${userName}`;
    
    // Check if already liked
    const existingLike = await kv.get(likeKey);
    if (existingLike) {
      return c.json({ error: "Already liked this review" }, 400);
    }

    // Add like
    await kv.set(likeKey, { userName, likedAt: new Date().toISOString() });

    // Get updated like count
    const likeKeys = await kv.getByPrefix(`review_like:${reviewId}:`);
    const likes = likeKeys.length;

    console.log(`User ${userName} liked review ${reviewId}`);
    return c.json({ success: true, likes });
  } catch (error) {
    console.error("Error liking review:", error);
    return c.json({ error: "Failed to like review", details: String(error) }, 500);
  }
});

// Unlike a review
app.delete("/make-server-ef6ca5a0/reviews/:reviewId/like", async (c) => {
  try {
    const reviewId = c.req.param("reviewId");
    const body = await c.req.json();
    const { userName } = body;

    if (!userName) {
      return c.json({ error: "userName is required" }, 400);
    }

    const likeKey = `review_like:${reviewId}:${userName}`;
    
    // Remove like
    await kv.del(likeKey);

    // Get updated like count
    const likeKeys = await kv.getByPrefix(`review_like:${reviewId}:`);
    const likes = likeKeys.length;

    console.log(`User ${userName} unliked review ${reviewId}`);
    return c.json({ success: true, likes });
  } catch (error) {
    console.error("Error unliking review:", error);
    return c.json({ error: "Failed to unlike review", details: String(error) }, 500);
  }
});

// Check if user has liked a review
app.get("/make-server-ef6ca5a0/reviews/:reviewId/liked/:userName", async (c) => {
  try {
    const reviewId = c.req.param("reviewId");
    const userName = c.req.param("userName");

    const likeKey = `review_like:${reviewId}:${userName}`;
    const liked = await kv.get(likeKey);

    return c.json({ success: true, liked: !!liked });
  } catch (error) {
    console.error("Error checking like status:", error);
    return c.json({ error: "Failed to check like status", details: String(error) }, 500);
  }
});

// Search restaurants by location using Kakao Local API
app.get("/make-server-ef6ca5a0/restaurants/search", async (c) => {
  try {
    const query = c.req.query("query");
    const category = c.req.query("category"); // optional: 음식점 카테고리

    if (!query) {
      return c.json({ error: "Query parameter is required" }, 400);
    }

    const kakaoApiKey = Deno.env.get("KAKAO_REST_API_KEY");
    if (!kakaoApiKey) {
      return c.json({ error: "Kakao API key not configured" }, 500);
    }

    // Kakao Local API - 키워드로 장소 검색
    const searchQuery = category ? `${query} ${category}` : `${query} 맛집`;
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}&category_group_code=FD6`;

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${kakaoApiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Kakao API error: ${response.status} ${response.statusText}`);
      return c.json({ error: "Failed to fetch from Kakao API", status: response.status }, 500);
    }

    const data = await response.json();
    
    // Transform Kakao data to our restaurant format
    const restaurants = data.documents.map((place: any, index: number) => ({
      id: place.id || `kakao_${index}`,
      name: place.place_name,
      cuisine: place.category_name?.split(">").pop()?.trim() || "음식점",
      description: place.address_name,
      location: place.road_address_name || place.address_name,
      rating: 0, // Kakao API doesn't provide ratings directly
      priceRange: "medium",
      imageUrl: "", // Will be set by frontend with placeholder
      tags: [],
      phone: place.phone,
      placeUrl: place.place_url,
      x: place.x, // longitude
      y: place.y, // latitude
    }));

    console.log(`Found ${restaurants.length} restaurants for query: ${searchQuery}`);
    return c.json({ success: true, restaurants });
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return c.json({ error: "Failed to search restaurants", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);