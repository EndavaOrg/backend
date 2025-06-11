// tests/routes/userRoutes.test.js

const express = require('express');
const request = require('supertest');
const mockingoose = require('mockingoose');

// MOCK BEFORE ANY IMPORTS
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { uid: 'fakeUid123' }; // mock decoded firebase user
    next();
});

jest.mock('firebase-admin', () => ({
    auth: () => ({
        verifyIdToken: jest.fn(),
    }),
}));

const admin = require('firebase-admin');
const User = require('../../models/User');
const userRoutes = require('../../routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes', () => {
    const fakeUser = {
        _id: '507f191e810c19729de860ea',
        email: 'test@example.com',
        firebaseUid: 'fakeUid123',
        ime: 'Test',
        priimek: 'User',
        telefon: '1234567890',
        preferences: { make: 'Toyota', model: 'Yaris', maxPrice: 10000 },
    };

    beforeEach(() => {
        mockingoose.resetAll();
        jest.clearAllMocks();
    });

    describe('POST /users/register', () => {
        // it('should register user with valid token', async () => {
        //     admin.auth().verifyIdToken.mockResolvedValue({ uid: 'fakeUid123', email: 'test@example.com' });

        //     mockingoose(User).toReturn(null, 'findOne');
        //     mockingoose(User).toReturn(fakeUser, 'save');

        //     const res = await request(app).post('/users/register').send({
        //         token: 'valid_token',
        //         ime: 'Test',
        //         priimek: 'User',
        //         telefon: '1234567890',
        //         preferences: { make: 'Toyota', model: 'Yaris', maxPrice: 10000 },
        //     });

        //     expect(res.status).toBe(201);
        //     expect(res.body).toHaveProperty('email', 'test@example.com');
        // });

        it('should fail if token is invalid', async () => {
            admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app).post('/users/register').send({ token: 'invalid_token' });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /users/login', () => {
        // it('should login existing user', async () => {
        //     admin.auth().verifyIdToken.mockResolvedValue({ uid: 'fakeUid123', email: 'test@example.com' });
        //     mockingoose(User).toReturn(fakeUser, 'findOne');

        //     const res = await request(app).post('/users/login').send({ token: 'valid_token' });

        //     expect(res.status).toBe(200);
        //     expect(res.body).toHaveProperty('email', 'test@example.com');
        // });
    });

    describe('Protected routes', () => {
        describe('GET /users', () => {
            it('should return list of users', async () => {
                mockingoose(User).toReturn([fakeUser], 'find');

                const res = await request(app).get('/users');
                expect(res.status).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
            });
        });

        describe('GET /users/:id', () => {
            it('should return single user', async () => {
                mockingoose(User).toReturn(fakeUser, 'findOne');

                const res = await request(app).get(`/users/${fakeUser._id}`);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('email', 'test@example.com');
            });
        });

        describe('PUT /users/:id', () => {
            it('should update user data', async () => {
                const updatedUser = { ...fakeUser, ime: 'Updated' };

                mockingoose(User).toReturn(fakeUser, 'findOne');
                mockingoose(User).toReturn(updatedUser, 'save');

                const res = await request(app)
                    .put(`/users/${fakeUser._id}`)
                    .send({ ime: 'Updated' });

                expect(res.status).toBe(200);
                expect(res.body.ime).toBe('Updated');
            });
        });

        describe('DELETE /users/:id', () => {
            it('should delete user', async () => {
                mockingoose(User).toReturn(fakeUser, 'findOne');
                mockingoose(User).toReturn(fakeUser, 'findOneAndDelete');

                const res = await request(app).delete(`/users/${fakeUser._id}`);
                expect(res.status).toBe(204);
            });
        });

        describe('PUT /users/:userId/preferences', () => {
            it('should update preferences', async () => {
                const updatedUser = { ...fakeUser, preferences: { make: 'BMW', model: 'i3', maxPrice: 20000 } };

                mockingoose(User).toReturn(fakeUser, 'findOne');
                mockingoose(User).toReturn(updatedUser, 'save');

                const res = await request(app)
                    .put(`/users/${fakeUser.firebaseUid}/preferences`)
                    .send({ preferences: updatedUser.preferences });

                expect(res.status).toBe(200);
                expect(res.body.preferences.make).toBe('BMW');
            });

            it('should fail if invalid preferences payload', async () => {
                mockingoose(User).toReturn(fakeUser, 'findOne');

                const res = await request(app)
                    .put(`/users/${fakeUser.firebaseUid}/preferences`)
                    .send({ preferences: "invalid" });

                expect(res.status).toBe(400);
            });
        });
    });
});