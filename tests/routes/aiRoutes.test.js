const mockingoose = require('mockingoose');
const Car = require('../../models/Car');
const express = require('express');
const request = require('supertest');
const aiRoutes = require('../../routes/aiRoutes');
const fetch = require('node-fetch');

// Properly mock fetch
jest.mock('node-fetch', () => jest.fn());

describe('AI Routes', () => {
    let app;

    const fakePrompt = 'Find me a cheap Audi diesel';

    // Gemini response with clean JSON string
    const geminiResponse = {
        candidates: [
            {
                content: {
                    parts: [
                        {
                            text: JSON.stringify({
                                make: 'Audi',
                                price_max: 5000,
                                fuel_type: 'diesel'
                            })
                        }
                    ]
                }
            }
        ]
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/ai', aiRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // it('should return cars based on AI filters', async () => {
    //     // Mock fetch to return the geminiResponse
    //     fetch.mockResolvedValue({
    //         json: () => Promise.resolve(geminiResponse)
    //     });

    //     // Mock Car.find to return a matching car
    //     mockingoose(Car).toReturn(
    //         [
    //             {
    //                 make: 'Audi',
    //                 price_eur: 4500,
    //                 fuel_type: 'diesel' // Matches /diesel/i regex
    //             }
    //         ],
    //         'find'
    //     );

    //     const res = await request(app)
    //         .post('/ai/search')
    //         .send({ prompt: fakePrompt });

    //     expect(res.status).toBe(200);
    //     expect(res.body.length).toBe(1);
    //     expect(res.body[0].make).toBe('Audi');
    // });

    it('should return 400 if no prompt provided', async () => {
        const res = await request(app).post('/ai/search').send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing prompt.');
    });

    it('should handle Gemini response parsing failure', async () => {
        fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ candidates: [] })
        });

        const res = await request(app).post('/ai/search').send({ prompt: fakePrompt });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('AI search failed.');
    });

    it('should handle MongoDB error', async () => {
        fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(geminiResponse)
        });

        mockingoose(Car).toReturn(new Error('Mongo failure'), 'find');

        const res = await request(app)
            .post('/ai/search')
            .send({ prompt: fakePrompt });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('AI search failed.');
    });
});