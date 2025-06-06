const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

router.post("/search", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Missing prompt." });

  try {
    const geminiPrompt = `
You are a car search assistant that helps extract structured filters from natural language.

Your task:
👉 Analyze the user's natural-language prompt and infer any intent that relates to a car listing.
👉 Map vague concepts into concrete filter values where possible.
👉 Return only valid JSON like this (no text, no code blocks):

{
  "make": "Audi",
  "gearbox": "automatic",
  "price_max": 15000,
  "year_max": 2005,
  "fuel_type": "petrol",
  ...
}

Supported fields:
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
- "off-road", "off-road capabilities" → engine_kw_min >= 120, gearbox = "automatic" or "manual", prioritize SUVs or 4x4 if possible (map to gearbox if known)
- "city car", "small city car" → engine_ccm_max <= 1600, engine_kw_max <= 100, small car (no direct field, so return engine filters only)

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


    if (filters.year_min || filters.year_max) {
      query.first_registration = {};
      if (filters.year_min) query.first_registration.$gte = filters.year_min;
      if (filters.year_max) query.first_registration.$lte = filters.year_max;
    }

    if (filters.engine_kw_min || filters.engine_kw_max) {
      query.engine_kw = {};
      if (filters.engine_kw_min) query.engine_kw.$gte = filters.engine_kw_min;
      if (filters.engine_kw_max) query.engine_kw.$lte = filters.engine_kw_max;
    }

    if (filters.engine_ccm_min || filters.engine_ccm_max) {
      query.engine_ccm = {};
      if (filters.engine_ccm_min) query.engine_ccm.$gte = filters.engine_ccm_min;
      if (filters.engine_ccm_max) query.engine_ccm.$lte = filters.engine_ccm_max;
    }

    if (filters.state) query.state = filters.state.toUpperCase();

    const results = await Car.find(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("AI Search failed:", error.message);
    res.status(500).json({ message: "AI search failed.", error: error.message });
  }
});

module.exports = router;
