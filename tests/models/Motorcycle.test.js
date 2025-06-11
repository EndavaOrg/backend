const Motorcycle = require('../../models/Motorcycle');

describe('Motorcycle model', () => {
    it('should require make, model, and price_eur', () => {
        const moto = new Motorcycle({});
        const error = moto.validateSync();
        expect(error.errors.make).toBeDefined();
        expect(error.errors.model).toBeDefined();
        expect(error.errors.price_eur).toBeDefined();
    });

    it('should default state to "RABLJENO"', () => {
        const moto = new Motorcycle({ make: 'Yamaha', model: 'MT-07', price_eur: 5000 });
        expect(moto.state).toBe('RABLJENO');
    });
});
