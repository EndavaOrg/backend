const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Motorcycle = require("../../models/Motorcycle");
const motorcycleRoutes = require("../../routes/motorcycleRoutes");

const app = express();
app.use(express.json());
app.use("/motorcycles", motorcycleRoutes);

let mongoServer;

const motorcycleData = {
    make: "Yamaha",
    model: "MT-07",
    first_registration: 2018,
    mileage_km: 15000,
    fuel_type: "bencin",
    gearbox: "ročni",
    engine_ccm: 689,
    engine_kw: 55,
    engine_hp: 74,
    price_eur: 6200,
    image_url: "http://example.com/moto.jpg",
    link: "http://example.com",
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Motorcycle.deleteMany({});
});

describe("Motorcycle Controller", () => {
    it("should create a new motorcycle", async () => {
        const res = await request(app)
            .post("/motorcycles")
            .send(motorcycleData)
            .expect(201);

        expect(res.body).toHaveProperty("_id");
        expect(res.body.make).toBe(motorcycleData.make);
    });

    it("should get all motorcycles", async () => {
        await new Motorcycle(motorcycleData).save();

        const res = await request(app)
            .get("/motorcycles")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should filter motorcycles by make and registration year", async () => {
        await new Motorcycle(motorcycleData).save();

        const res = await request(app)
            .get("/motorcycles")
            .query({ make: "yamaha", first_registration: 2015 })
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].make).toMatch(/yamaha/i);
        expect(res.body[0].first_registration).toBeGreaterThanOrEqual(2015);
    });

    it("should return an empty array when no motorcycles match the filter", async () => {
        await new Motorcycle(motorcycleData).save();

        const res = await request(app)
            .get("/motorcycles")
            .query({ make: "Ducati", priceFrom: 10000 })
            .expect(200);

        expect(res.body.length).toBe(0);
    });
});