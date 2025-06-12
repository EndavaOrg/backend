const request = require('supertest');
const express = require('express');
const mockingoose = require('mockingoose');
const admin = require('firebase-admin');
const userRoutes = require('../../routes/userRoutes');
const User = require('../../models/User');

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
    auth: () => ({
        verifyIdToken: jest.fn(),
    }),
}));

// Setup app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock middleware to bypass auth
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => next());

describe('User Controller', () => {
    const fakeUser = {
        _id: '507f191e810c19729de860ea',
        email: 'test@example.com',
        firebaseUid: 'fakeUid123',
        ime: 'Test',
        priimek: 'User',
        telefon: '1234567890',
        preferences: {
            car: [{ make: 'Toyota', model: 'Yaris', maxPrice: 10000 }],
            motorcycle: [],
            truck: [],
            selectedVehicleType: 'car',
        },
    };

    beforeEach(() => {
        mockingoose.resetAll();
        jest.clearAllMocks();
    });

    it('should not login with invalid token', async () => {
        admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        const res = await request(app).post('/api/users/login').send({ token: 'bad_token' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should list all users', async () => {
        mockingoose(User).toReturn([fakeUser], 'find');

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].email).toBe('test@example.com');
    });

    it('should return a user by ID', async () => {
        mockingoose(User).toReturn(fakeUser, 'findOne');

        const res = await request(app).get(`/api/users/${fakeUser._id}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(fakeUser.email);
    });

    it('should update a user', async () => {
        const updatedUser = { ...fakeUser, ime: 'Updated' };
        mockingoose(User).toReturn(fakeUser, 'findOne');
        mockingoose(User).toReturn(updatedUser, 'save');

        const res = await request(app)
            .put(`/api/users/${fakeUser._id}`)
            .send({ ime: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.ime).toBe('Updated');
    });

    it('should delete a user', async () => {
        mockingoose(User).toReturn(fakeUser, 'findOneAndDelete');

        const res = await request(app).delete(`/api/users/${fakeUser._id}`);

        expect(res.status).toBe(204);
    });
});