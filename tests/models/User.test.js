const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // Ensure indexes are created
    await User.createIndexes();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Model Test', () => {

    it('should create and save a valid user', async () => {
        const validUser = new User({
            email: 'test@example.com',
            firebaseUid: 'firebase123',
            ime: 'John',
            priimek: 'Doe',
            telefon: '123456789',
            preferences: {
                car: [{
                    make: 'Audi',
                    model: 'A4',
                    minYear: 2015,
                    maxPrice: 20000,
                    maxMileage: 100000,
                    fuelType: 'diesel',
                    gearbox: 'manual'
                }],
                selectedVehicleType: 'car'
            }
        });

        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe('test@example.com');
        expect(savedUser.preferences.car[0].make).toBe('Audi');
        expect(savedUser.preferences.selectedVehicleType).toBe('car');
    });

    it('should fail if required fields are missing', async () => {
        const invalidUser = new User({
            ime: 'John'
        });

        let err;
        try {
            await invalidUser.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors['email']).toBeDefined();
        expect(err.errors['firebaseUid']).toBeDefined();
    });

    it('should enforce unique email and firebaseUid', async () => {
        const user1 = new User({
            email: 'test@example.com',
            firebaseUid: 'firebase123',
        });

        const user2 = new User({
            email: 'test@example.com', // same email
            firebaseUid: 'firebase123', // same uid
        });

        await user1.save();

        let err;
        try {
            await user2.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe(11000); // Mongo duplicate key error
    });

    it('should default selectedVehicleType to car', async () => {
        const user = new User({
            email: 'test2@example.com',
            firebaseUid: 'firebase456',
        });

        const savedUser = await user.save();
        expect(savedUser.preferences.selectedVehicleType).toBe('car');
    });

});