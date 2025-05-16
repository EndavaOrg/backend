const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /users
router.post('/create', userController.create);

// GET all users
router.get('/', userController.list);

// GET /users/:id
router.get('/:id', userController.show);

// PUT /users/:id
router.put('/:id', userController.update);

// DELETE /users/:id
router.delete('/:id', userController.remove);

module.exports = router;
