const request = require('supertest');
const express = require('express');
const carRoutes = require('../../routes/carRoutes');
const axios = require('axios');

// Mock carController methods
jest.mock('../../controllers/carController', () => ({
    createCar: jest.fn((req, res) => res.status(201).json({ message: 'Car created' })),
    getAllCars: jest.fn((req, res) => res.status(200).json([{ id: '1', make: 'Toyota' }])),
    getCarById: jest.fn((req, res) => res.status(200).json({ id: req.params.id, make: 'Honda' })),
    updateCar: jest.fn((req, res) => res.status(200).json({ message: 'Car updated' })),
    deleteCar: jest.fn((req, res) => res.status(204).send()),
}));

// Mock axios
jest.mock('axios');

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

    describe('External API proxy endpoints', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        it('GET /cars/carquery/makes - success', async () => {
            const fakeMakesResponse = { Makes: [{ make_id: 'toyota', make_display: 'Toyota' }] };
            axios.get.mockResolvedValue({ data: fakeMakesResponse });

            const res = await request(app).get('/cars/carquery/makes');

            expect(axios.get).toHaveBeenCalledWith('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(fakeMakesResponse);
        });

        it('GET /cars/carquery/makes - failure', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));

            const res = await request(app).get('/cars/carquery/makes');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch car makes');
            expect(res.body).toHaveProperty('error', 'Network error');
        });

        it('GET /cars/carquery/models - missing make param', async () => {
            const res = await request(app).get('/cars/carquery/models');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing make query parameter');
        });

        it('GET /cars/carquery/models - success', async () => {
            const make = 'toyota';
            const fakeModelsResponse = { Models: [{ model_name: 'Corolla' }] };
            axios.get.mockResolvedValue({ data: fakeModelsResponse });

            const res = await request(app).get(`/cars/carquery/models?make=${make}`);

            expect(axios.get).toHaveBeenCalledWith(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}`);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(fakeModelsResponse);
        });

        it('GET /cars/carquery/models - failure', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));

            const res = await request(app).get('/cars/carquery/models?make=toyota');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch car models');
            expect(res.body).toHaveProperty('error', 'Network error');
        });
    });
});
