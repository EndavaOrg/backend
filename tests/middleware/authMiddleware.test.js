const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const admin = require('firebase-admin');

jest.mock('firebase-admin', () => {
    const authMock = {
        verifyIdToken: jest.fn(),
    };
    return {
        apps: [],
        initializeApp: jest.fn(),
        credential: { applicationDefault: jest.fn() },
        auth: () => authMock,
    };
});

describe('authenticateFirebaseToken middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should respond 401 if no Authorization header', async () => {
        req.headers = {}; // no Authorization header
        await authenticateFirebaseToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 if Authorization header does not start with Bearer', async () => {
        req.headers.authorization = 'Basic abc123';
        await authenticateFirebaseToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set req.user on valid token', async () => {
        const validToken = 'valid.token.here';
        const decodedToken = { uid: 'user123', email: 'test@example.com' };
        req.headers.authorization = `Bearer ${validToken}`;
        admin.auth().verifyIdToken.mockResolvedValue(decodedToken);

        await authenticateFirebaseToken(req, res, next);

        expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(validToken);
        expect(req.user).toEqual(decodedToken);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should respond 403 on invalid or expired token', async () => {
        const invalidToken = 'invalid.token.here';
        req.headers.authorization = `Bearer ${invalidToken}`;
        admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        await authenticateFirebaseToken(req, res, next);

        expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(invalidToken);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });
});