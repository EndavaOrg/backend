const Car = require('../../models/Car');

describe('Car model', () => {
    it('should require make, model, and price_eur', async () => {
        const car = new Car({});
        const error = car.validateSync();
        expect(error.errors.make).toBeDefined();
        expect(error.errors.model).toBeDefined();
        expect(error.errors.price_eur).toBeDefined();
    });

    it('should apply default state "RABLJENO"', () => {
        const car = new Car({ make: 'Toyota', model: 'Corolla', price_eur: 10000 });
        expect(car.state).toBe('RABLJENO');
    });

    it('should create a valid car', () => {
        const car = new Car({ make: 'Ford', model: 'Focus', price_eur: 8000 });
        expect(car.make).toBe('Ford');
        expect(car.model).toBe('Focus');
        expect(car.price_eur).toBe(8000);
    });
});
