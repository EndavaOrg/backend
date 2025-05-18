const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateFirebaseToken = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.registerWithFirebase);
router.post('/login', userController.loginWithFirebase);
router.post('/loginWithGoogle', userController.loginWithGoogle);
// todo make login and loginWithGoogle into one call

// Protected routes
router.get('/', authenticateFirebaseToken, userController.list);
router.get('/:id', authenticateFirebaseToken, userController.show);
router.put('/:id', authenticateFirebaseToken, userController.update);
router.delete('/:id', authenticateFirebaseToken, userController.remove);

module.exports = router;
