const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Truck = require("../../models/Truck");
const truckRoutes = require("../../routes/truckRoutes");

const app = express();
app.use(express.json());
app.use("/trucks", truckRoutes);

let mongoServer;

const sampleTruck = {
    make: "Volvo",
    model: "FH16",
    first_registration: 2020,
    mileage_km: 120000,
    fuel_type: "diesel",
    gearbox: "avtomatski",
    engine_ccm: 16000,
    engine_kw: 550,
    engine_hp: 750,
    price_eur: 95000,
    image_url: "http://example.com/truck.jpg",
    link: "http://example.com/volvo"
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
    await Truck.deleteMany({});
});

describe("Truck Controller", () => {
    it("should create a new truck", async () => {
        const res = await request(app)
            .post("/trucks")
            .send(sampleTruck)
            .expect(201);

        expect(res.body).toHaveProperty("_id");
        expect(res.body.make).toBe(sampleTruck.make);
    });

    it("should fetch all trucks", async () => {
        await new Truck(sampleTruck).save();

        const res = await request(app)
            .get("/trucks")
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].make).toBe("Volvo");
    });

    it("should filter trucks by make and gearbox", async () => {
        await new Truck(sampleTruck).save();

        const res = await request(app)
            .get("/trucks")
            .query({ make: "volvo", gearbox: "avtomatski" })
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].gearbox).toMatch(/avtomatski/i);
    });

    it("should return no results for unmatched filters", async () => {
        await new Truck(sampleTruck).save();

        const res = await request(app)
            .get("/trucks")
            .query({ make: "Scania", priceFrom: 150000 })
            .expect(200);

        expect(res.body.length).toBe(0);
    });

    it("should return distinct makes", async () => {
        await Truck.insertMany([
            sampleTruck,
            { ...sampleTruck, make: "MAN", model: "TGX" }
        ]);

        const res = await request(app)
            .get("/trucks/makes")
            .expect(200);

        expect(res.body).toContain("Volvo");
        expect(res.body).toContain("MAN");
    });

    it("should return distinct models for a given make", async () => {
        await Truck.insertMany([
            sampleTruck,
            { ...sampleTruck, model: "FMX" },
            { ...sampleTruck, make: "Scania", model: "R500" }
        ]);

        const res = await request(app)
            .get("/trucks/models")
            .query({ make: "Volvo" })
            .expect(200);

        expect(res.body).toContain("FH16");
        expect(res.body).toContain("FMX");
        expect(res.body).not.toContain("R500");
    });

    it("should return 400 if make is missing in /models route", async () => {
        const res = await request(app)
            .get("/trucks/models")
            .expect(400);

        expect(res.body.message).toMatch(/Missing make/i);
    });
});
