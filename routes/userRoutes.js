const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/register', userController.registerWithFirebase); 

// login a user
router.post('/login', userController.loginWithFirebase); 

// Get all users
router.get('/', userController.list); // GET /api/users

// Get a user by ID
router.get('/:id', userController.show); // GET /api/users/:id

// Update a user by ID
router.put('/:id', userController.update); // PUT /api/users/:id

// Delete a user by ID
router.delete('/:id', userController.remove); // DELETE /api/users/:id

module.exports = router;