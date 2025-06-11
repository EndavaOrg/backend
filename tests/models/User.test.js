const User = require('../../models/User');

describe('User model', () => {
    it('should require email and firebaseUid', () => {
        const user = new User({});
        const error = user.validateSync();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.firebaseUid).toBeDefined();
    });

    it('should embed preferences properly', () => {
        const user = new User({
            email: 'test@example.com',
            firebaseUid: 'abc123',
            preferences: {
                make: 'Tesla',
                maxPrice: 30000,
                fuelType: 'electric'
            }
        });

        expect(user.preferences.make).toBe('Tesla');
        expect(user.preferences.fuelType).toBe('electric');
    });
});
