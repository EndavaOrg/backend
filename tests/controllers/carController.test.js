const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const carRoutes = require("../../routes/carRoutes");
const Car = require("../../models/Car");

const app = express();
app.use(express.json());
app.use("/cars", carRoutes);

let mongoServer;
let carId;

const carData = {
    make: "Toyota",
    model: "Corolla",
    first_registration: 2015,
    mileage_km: 120000,
    fuel_type: "bencin",
    gearbox: "ročni",
    engine_ccm: 1600,
    engine_kw: 90,
    engine_hp: 122,
    price_eur: 8500,
    image_url: "http://example.com/car.jpg",
    link: "http://example.com",
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        dbName: "test",
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Car.deleteMany({});
});

describe("Car Controller", () => {

    it("should get all cars", async () => {
        // Ensure at least one car is added
        await new Car(carData).save();

        const res = await request(app)
            .get("/cars")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 404 for non-existent car", async () => {
        const fakeId = new mongoose.Types.ObjectId(); // valid but non-existent ID
        const res = await request(app)
            .get(`/cars/${fakeId}`)
            .expect(404);

        expect(res.body.message).toMatch(/ni bilo najdeno/i);
    });
});
