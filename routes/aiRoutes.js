const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const Motorcycle = require("../models/Motorcycle");
const Truck = require("../models/Truck");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

router.post("/search", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Missing prompt." });

  try {
    const geminiPrompt = `
You are a vehicle search assistant that helps extract structured filters from natural language.

Your task:
- Analyze the user's natural-language prompt and infer any intent that relates to a vehicle listing.
- Map vague concepts into concrete filter values where possible.
- Return only valid JSON like this (no text, no code blocks):

{
  "vehicle_type": "car" | "motorcycle" | "truck",
  "make": "Audi",
  "gearbox": "automatic",
  "price_max": 15000,
  "year_max": 2005,
  "fuel_type": "petrol",
  ...
}

IMPORTANT:
If the user mentions anything related to motorcycles or trucks, YOU MUST set vehicle_type accordingly. Do NOT omit this field. If the prompt says "truck", "motorcycle", etc → vehicle_type must match. If no clear mention is found, default to "car".

Supported fields:
- vehicle_type
- make, model
- gearbox: "automatic" | "manual"
- price_min, price_max (number)
- mileage_min, mileage_max (number)
- fuel_type: "diesel" | "petrol" | "hybrid" | "electric"
- year_min, year_max (number)
- engine_kw_min, engine_kw_max
- engine_ccm_min, engine_ccm_max
- state: "NOVO" | "RABLJENO"

Concept mappings:
- "really old car" → year_max: 1990
- "new car" → year_min: 2020
- "cheap" → price_max: 5000
- "expensive" → price_min: 25000
- "low mileage" → mileage_max: 100000
- "powerful" → engine_kw_min: 110
- "weak engine" → engine_kw_max: 60
- "family car", "comfortable family car", "huge family car" → SUVs or Vans, year_min >= 2010, mileage_max <= 200000, price_max <= 15000
- "sports car" → engine_kw_min >= 150, price_min >= 10000
- "fast car" → engine_kw_min >= 180
- "slow car" → engine_kw_max <= 80
- "good fuel economy", "fuel efficient" → fuel_type = diesel OR hybrid OR electric, engine_ccm <= 1600
- "off-road", "off-road capabilities" → engine_kw_min >= 120, gearbox = "automatic" or "manual"
- "city car", "small city car" → engine_ccm_max <= 1600, engine_kw_max <= 100

Concept mappings for motorcycles:
- "motorcycle", "bike", "motorbike" → vehicle_type: motorcycle
- "small motorcycle", "city motorcycle" → engine_kw_max: 50
- "fast motorcycle", "powerful motorcycle", "sportbike" → engine_kw_min: 70
- "cheap motorcycle" → price_max: 3000
- "touring motorcycle", "comfortable motorcycle" → engine_kw_min >= 50, price_min >= 5000

Concept mappings for trucks:
- "truck", "trucks", "lorry", "HGV", "heavy vehicle", "delivery truck" → vehicle_type: truck
- "cheap truck" → price_max: 10000
- "big truck", "heavy truck" → engine_kw_min >= 150
- "fuel-efficient truck" → fuel_type = diesel, engine_ccm <= 5000
- "new truck" → year_min >= 2020
- "old truck" → year_max <= 2005

Additional concept mappings to handle flexible language:

- "newer than YEAR", "after YEAR", "since YEAR" → year_min = YEAR
- "older than YEAR", "before YEAR", "until YEAR" → year_max = YEAR
- "new", "brand new", "factory new" → state = NOVO
- "used", "second hand", "pre-owned" → state = RABLJENO
- "cheap", "affordable", "budget" → price_max = 5000
- "expensive", "premium", "luxury" → price_min = 25000
- "low mileage", "few kilometers", "not many kilometers" → mileage_max = 100000
- "high mileage", "a lot of kilometers", "many kilometers" → mileage_min = 100000

- "fast car", "fast truck", "fast motorcycle", "high speed", "powerful" → engine_kw_min = 150 (car/truck), 70 (motorcycle)
- "big truck", "heavy truck", "large truck" → engine_kw_min = 150
- "fuel efficient", "economical", "good fuel economy" → fuel_type = diesel OR hybrid OR electric, engine_ccm <= 1600
- "city car", "small city car", "urban car" → engine_ccm_max <= 1600, engine_kw_max <= 100

- "comfortable", "comfortable car", "comfortable motorcycle", "comfortable truck" → suggest newer (year_min >= 2015), low mileage (mileage_max <= 100000)
- "off-road", "off-road capabilities", "4x4" → engine_kw_min >= 120, gearbox = "automatic" or "manual"

Motorcycle-specific additional mappings:
- "cheap motorcycle", "affordable motorcycle", "budget motorcycle" → price_max = 3000
- "used motorcycle", "second hand motorcycle" → state = RABLJENO
- "new motorcycle", "brand new motorcycle" → state = NOVO
- "sportbike", "fast motorcycle", "powerful motorcycle", "racing motorcycle" → engine_kw_min = 70
- "city motorcycle", "urban motorcycle", "small motorcycle", "commuter motorcycle" → engine_kw_max = 50
- "comfortable motorcycle", "touring motorcycle" → engine_kw_min >= 50, year_min >= 2015, mileage_max <= 50000
- "off-road motorcycle", "dual sport", "enduro" → engine_kw_min >= 50, suggest year_min >= 2010

When users mention phrases like "newer than 2010", "after 2010", or "since 2010", ALWAYS extract "year_min": 2010 accordingly.
When users mention "older than 2010", "before 2010", or "until 2010", ALWAYS extract "year_max": 2010 accordingly.
These phrases can appear anywhere in the sentence — extract them even if other concepts are present.

Examples of combining mappings:
- If a user says "cheap truck newer than 2010", combine:
  → price_max = 10000
  → year_min = 2010

- If a user says "used motorcycle with low mileage":
  → state = RABLJENO
  → mileage_max = 100000

- If a user says "powerful sportbike newer than 2018":
  → engine_kw_min = 70
  → year_min = 2018

Always try to map as much as possible, even if user input is creative or not exact.
If multiple mappings apply, COMBINE them in the JSON.

Instructions:
- If a concept is mentioned but no direct field exists, map it using the rules above.
- Only return the JSON object, no explanation, no comments.

User prompt:
"${prompt}"

Now return only the JSON object.

`;

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
      })
    });

    const raw = await response.json();
    const jsonText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Gemini response");
    const filters = JSON.parse(jsonMatch[0]);

    // Determine collection
    let Model;
    if (filters.vehicle_type === "motorcycle") Model = Motorcycle;
    else if (filters.vehicle_type === "truck") Model = Truck;
    else Model = Car;

    console.log(`[AI Search] vehicle_type = ${filters.vehicle_type}`);
    console.log(`[AI Search] Filters:`, filters);

    // Build query
    const query = {};

    if (filters.make) query.make = new RegExp(filters.make, "i");
    if (filters.model) query.model = new RegExp(filters.model, "i");

    if (filters.price_max || filters.price_min) {
      query.price_eur = {};
      if (filters.price_max) query.price_eur.$lte = filters.price_max;
      if (filters.price_min) query.price_eur.$gte = filters.price_min;
    }

    if (filters.mileage_max || filters.mileage_min) {
      query.mileage_km = {};
      if (filters.mileage_max) query.mileage_km.$lte = filters.mileage_max;
      if (filters.mileage_min) query.mileage_km.$gte = filters.mileage_min;
    }

    // first_registration → universal for all
    if (filters.year_min || filters.year_max) {
      query.first_registration = {};
      if (filters.year_min) query.first_registration.$gte = filters.year_min;
      if (filters.year_max) query.first_registration.$lte = filters.year_max;
    }

    // engine_kw → safe for all
    if (filters.engine_kw_min || filters.engine_kw_max) {
      query.engine_kw = {};
      if (filters.engine_kw_min) query.engine_kw.$gte = filters.engine_kw_min;
      if (filters.engine_kw_max) query.engine_kw.$lte = filters.engine_kw_max;
    }

    // Fields only for car and truck
    if (filters.vehicle_type === "car" || filters.vehicle_type === "truck") {
      if (filters.gearbox === "automatic") query.gearbox = /avtomatski/i;
      if (filters.gearbox === "manual") query.gearbox = /ročni/i;

      if (filters.fuel_type) {
        const map = {
          diesel: /diesel/i,
          petrol: /bencin|petrol/i,
          hybrid: /hibrid/i,
          electric: /elektrika|elektro|electric/i
        };

        if (Array.isArray(filters.fuel_type)) {
          query.$or = filters.fuel_type.map(ft => ({ fuel_type: map[ft] }));
        } else {
          query.fuel_type = map[filters.fuel_type];
        }
      }

      if (filters.engine_ccm_min || filters.engine_ccm_max) {
        query.engine_ccm = {};
        if (filters.engine_ccm_min) query.engine_ccm.$gte = filters.engine_ccm_min;
        if (filters.engine_ccm_max) query.engine_ccm.$lte = filters.engine_ccm_max;
      }
    }

    // state → safe for all
    if (filters.state) query.state = filters.state.toUpperCase();

    // Execute query
    const results = await Model.find(query);

    // Truck → normalize first_registration from Year if needed
    if (filters.vehicle_type === "truck") {
      const trucksWithCorrectYear = results.map(truck => {
        const truckObj = truck.toObject();
        truckObj.first_registration = truckObj.first_registration ?? truckObj.Year ?? null;
        return truckObj;
      });
      console.log(`[AI Search] Found ${trucksWithCorrectYear.length} results (normalized).`);
      return res.status(200).json(trucksWithCorrectYear);
    }

    console.log(`[AI Search] Found ${results.length} results.`);
    res.status(200).json(results);

  } catch (error) {
    console.error("AI Search failed:", error.message);
    res.status(500).json({ message: "AI search failed.", error: error.message });
  }
});

module.exports = router;
