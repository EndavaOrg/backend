// tests/routes/motorcycleRoutes.test.js

const express = require('express');
const request = require('supertest');

// Manually mock the Motorcycle model completely BEFORE requiring routes
jest.mock('../../models/Motorcycle', () => ({
    distinct: jest.fn(),
    find: jest.fn(),
}));

const Motorcycle = require('../../models/Motorcycle');

const motorcycleRoutes = require('../../routes/motorcycleRoutes');

const app = express();
app.use(express.json());
app.use('/motorcycles', motorcycleRoutes);

describe('Motorcycle Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /motorcycles/makes', () => {
        it('should return sorted makes', async () => {
            Motorcycle.distinct.mockResolvedValue(['Yamaha', 'Honda']);

            const res = await request(app).get('/motorcycles/makes');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(['Honda', 'Yamaha']);
        });

        it('should handle error on makes', async () => {
            Motorcycle.distinct.mockRejectedValue(new Error('DB Error'));

            const res = await request(app).get('/motorcycles/makes');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch motorcycle makes');
        });
    });

    describe('GET /motorcycles/models', () => {
        it('should return sorted models', async () => {
            Motorcycle.find.mockReturnValue({
                distinct: jest.fn().mockResolvedValue(['CBR', 'Goldwing']),
            });

            const res = await request(app).get('/motorcycles/models?make=Honda');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(['CBR', 'Goldwing']);
        });

        it('should return 400 if make param missing', async () => {
            const res = await request(app).get('/motorcycles/models');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing make query parameter');
        });

        it('should handle error on models', async () => {
            Motorcycle.find.mockReturnValue({
                distinct: jest.fn().mockRejectedValue(new Error('DB Error')),
            });

            const res = await request(app).get('/motorcycles/models?make=Honda');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch motorcycle models');
        });
    });
});