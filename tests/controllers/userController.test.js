const request = require('supertest');
const express = require('express');
const mockingoose = require('mockingoose');
const admin = require('firebase-admin');
const userRoutes = require('../../routes/userRoutes');
const User = require('../../models/User');

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
    return {
        auth: () => ({
            verifyIdToken: jest.fn(),
        }),
    };
});

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
            make: 'Toyota',
            model: 'Yaris',
            maxPrice: 10000,
        },
    };

    beforeEach(() => {
        mockingoose.resetAll();
    });

    // // REGISTER
    // it('should register a new user with valid Firebase token', async () => {
    //     admin.auth().verifyIdToken.mockResolvedValue({ uid: 'fakeUid123', email: 'test@example.com' });

    //     mockingoose(User).toReturn(null, 'findOne'); // No existing user
    //     mockingoose(User).toReturn(fakeUser, 'save');

    //     const res = await request(app).post('/api/users/register').send({
    //         token: 'valid_token',
    //         ime: 'Test',
    //         priimek: 'User',
    //         telefon: '1234567890',
    //         preferences: {
    //             make: 'Toyota',
    //             model: 'Yaris',
    //             maxPrice: 10000,
    //         },
    //     });

    //     expect(res.status).toBe(201);
    //     expect(res.body).toHaveProperty('id');
    //     expect(res.body).toHaveProperty('email', 'test@example.com');
    // });

    // // LOGIN
    // it('should login existing user with valid Firebase token', async () => {
    //     admin.auth().verifyIdToken.mockResolvedValue({ uid: 'fakeUid123', email: 'test@example.com' });
    //     mockingoose(User).toReturn(fakeUser, 'findOne');

    //     const res = await request(app).post('/api/users/login').send({ token: 'valid_token' });

    //     expect(res.status).toBe(200);
    //     expect(res.body).toMatchObject({ id: fakeUser._id.toString(), email: fakeUser.email });
    // });

    it('should not login with invalid token', async () => {
        admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        const res = await request(app).post('/api/users/login').send({ token: 'bad_token' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    // LIST USERS
    it('should list all users', async () => {
        mockingoose(User).toReturn([fakeUser], 'find');

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    // GET USER BY ID
    it('should return a user by ID', async () => {
        mockingoose(User).toReturn(fakeUser, 'findOne');

        const res = await request(app).get(`/api/users/${fakeUser._id}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(fakeUser.email);
    });

    // UPDATE USER
    it('should update a user', async () => {
        const updatedUser = { ...fakeUser, ime: 'Updated' };
        mockingoose(User).toReturn(fakeUser, 'findOne'); // for .findById
        mockingoose(User).toReturn(updatedUser, 'save');

        const res = await request(app)
            .put(`/api/users/${fakeUser._id}`)
            .send({ ime: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.ime).toBe('Updated');
    });

    // DELETE USER
    it('should delete a user', async () => {
        mockingoose(User).toReturn(fakeUser, 'findOne');
        mockingoose(User).toReturn(fakeUser, 'findOneAndDelete');

        const res = await request(app).delete(`/api/users/${fakeUser._id}`);
        expect(res.status).toBe(204);
    });

    // UPDATE PREFERENCES
    it('should update user preferences', async () => {
        const newPreferences = { make: 'BMW', model: 'i3' };
        const updatedUser = { ...fakeUser, preferences: newPreferences };

        mockingoose(User).toReturn(fakeUser, 'findOne');
        mockingoose(User).toReturn(updatedUser, 'save');

        const res = await request(app)
            .put(`/api/users/${fakeUser.firebaseUid}/preferences`)
            .send({ preferences: newPreferences });

        expect(res.status).toBe(200);
        expect(res.body.preferences.make).toBe('BMW');
    });

    it('should not update preferences with invalid payload', async () => {
        mockingoose(User).toReturn(fakeUser, 'findOne');

        const res = await request(app)
            .put(`/api/users/${fakeUser.firebaseUid}/preferences`)
            .send({ preferences: "not_an_object" });

        expect(res.status).toBe(400);
    });
});
