// tests/routes/truckRoutes.test.js

const express = require('express');
const request = require('supertest');

// FULLY MOCK THE MODEL BEFORE IMPORTING ROUTES
jest.mock('../../models/Truck', () => ({
    distinct: jest.fn(),
    find: jest.fn(),
}));

const Truck = require('../../models/Truck');
const truckRoutes = require('../../routes/truckRoutes');

const app = express();
app.use(express.json());
app.use('/trucks', truckRoutes);

describe('Truck Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /trucks/makes', () => {
        it('should return sorted truck makes', async () => {
            Truck.distinct.mockResolvedValue(['Volvo', 'Scania']);

            const res = await request(app).get('/trucks/makes');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(['Scania', 'Volvo']);
        });

        it('should handle DB error for makes', async () => {
            Truck.distinct.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/trucks/makes');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch truck makes');
        });
    });

    describe('GET /trucks/models', () => {
        it('should return sorted models for given make', async () => {
            Truck.find.mockReturnValue({
                distinct: jest.fn().mockResolvedValue(['FH16', 'FMX']),
            });

            const res = await request(app).get('/trucks/models?make=Volvo');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(['FH16', 'FMX']);
        });

        it('should return 400 if make query param is missing', async () => {
            const res = await request(app).get('/trucks/models');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing make query parameter');
        });

        it('should handle DB error for models', async () => {
            Truck.find.mockReturnValue({
                distinct: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            const res = await request(app).get('/trucks/models?make=Volvo');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch truck models');
        });
    });
});