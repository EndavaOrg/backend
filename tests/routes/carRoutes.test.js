const request = require('supertest');
const express = require('express');

// Mock carController methods
jest.mock('../../controllers/carController', () => ({
    createCar: jest.fn((req, res) => res.status(201).json({ message: 'Car created' })),
    getAllCars: jest.fn((req, res) => res.status(200).json([{ id: '1', make: 'Toyota' }])),
    getCarById: jest.fn((req, res) => res.status(200).json({ id: req.params.id, make: 'Honda' })),
    updateCar: jest.fn((req, res) => res.status(200).json({ message: 'Car updated' })),
    deleteCar: jest.fn((req, res) => res.status(204).send()),
}));

// Makes and models are read from the database (Car model), no longer from the CarQuery API
jest.mock('../../models/Car', () => ({
    distinct: jest.fn(),
}));

const Car = require('../../models/Car');
const carRoutes = require('../../routes/carRoutes');

const app = express();
app.use(express.json());
app.use('/cars', carRoutes);

describe('carRoutes', () => {
    describe('CRUD endpoints', () => {
        it('POST /cars - createCar', async () => {
            const res = await request(app)
                .post('/cars')
                .send({ make: 'Toyota', model: 'Camry' });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'Car created');
        });

        it('GET /cars - getAllCars', async () => {
            const res = await request(app).get('/cars');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('make', 'Toyota');
        });

        it('GET /cars/:id - getCarById', async () => {
            const res = await request(app).get('/cars/123');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id', '123');
            expect(res.body).toHaveProperty('make', 'Honda');
        });

        it('PUT /cars/:id - updateCar', async () => {
            const res = await request(app)
                .put('/cars/123')
                .send({ make: 'Ford' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Car updated');
        });

        it('DELETE /cars/:id - deleteCar', async () => {
            const res = await request(app).delete('/cars/123');

            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
        });
    });

    describe('Make and model endpoints (from database)', () => {
        it('GET /cars/carquery/makes - returns sorted makes without empty values', async () => {
            Car.distinct.mockResolvedValue(['Volkswagen', 'Audi', '', null]);

            const res = await request(app).get('/cars/carquery/makes');

            expect(Car.distinct).toHaveBeenCalledWith('make');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ Makes: [{ make_display: 'Audi' }, { make_display: 'Volkswagen' }] });
        });

        it('GET /cars/carquery/makes - failure', async () => {
            Car.distinct.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/cars/carquery/makes');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch car makes');
            expect(res.body).toHaveProperty('error', 'DB error');
        });

        it('GET /cars/carquery/models - missing make param', async () => {
            const res = await request(app).get('/cars/carquery/models');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing make query parameter');
        });

        it('GET /cars/carquery/models - success (make matched exactly, case-insensitive)', async () => {
            Car.distinct.mockResolvedValue(['Passat', 'Golf']);

            const res = await request(app).get('/cars/carquery/models?make=volkswagen');

            expect(Car.distinct).toHaveBeenCalledWith('model', { make: /^volkswagen$/i });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ Models: [{ model_name: 'Golf' }, { model_name: 'Passat' }] });
        });

        it('GET /cars/carquery/models - failure', async () => {
            Car.distinct.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/cars/carquery/models?make=toyota');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch car models');
            expect(res.body).toHaveProperty('error', 'DB error');
        });
    });
});