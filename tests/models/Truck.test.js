const Truck = require('../../models/Truck');

describe('Truck model', () => {
    it('should require make, model, and price_eur', () => {
        const truck = new Truck({});
        const error = truck.validateSync();
        expect(error.errors.make).toBeDefined();
        expect(error.errors.model).toBeDefined();
        expect(error.errors.price_eur).toBeDefined();
    });

    it('should default state to "RABLJENO"', () => {
        const truck = new Truck({ make: 'MAN', model: 'TGL', price_eur: 12000 });
        expect(truck.state).toBe('RABLJENO');
    });
});
