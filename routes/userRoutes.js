const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateFirebaseToken = require('../middleware/authMiddleware');

router.post('/register', userController.registerWithFirebase);
router.post('/login', userController.loginWithFirebase);
router.post('/loginWithGoogle', userController.loginWithGoogle);

router.get('/', authenticateFirebaseToken, userController.list);
router.get('/:id', authenticateFirebaseToken, userController.show);
router.put('/:id', authenticateFirebaseToken, userController.update);
router.delete('/:id', authenticateFirebaseToken, userController.remove);
router.put('/:userId/preferences', authenticateFirebaseToken, userController.updatePreferences);
router.get('/byFirebaseUid/:firebaseUid', authenticateFirebaseToken, userController.findByFirebaseUid);
router.get('/:userId/preferences/:vehicleType', authenticateFirebaseToken, userController.getPreferencesByType);
router.delete('/:userId/preferences/:vehicleType/:index', authenticateFirebaseToken, userController.deletePreference);


module.exports = router;
