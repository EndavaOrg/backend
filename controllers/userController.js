const UserModel = require('../models/userModel.js');

/**
 * userController.js
 *
 * Modernized controller for managing users with async/await.
 */
module.exports = {
    // Get all users
    list: async (req, res) => {
        try {
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
        }
    },

    // Get user by ID
    show: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error });
        }
    },

    // Create new user
    create: async (req, res) => {
        try {
            const { Name, Surname, Email, dateOfBirth } = req.body;
            const newUser = new UserModel({ Name, Surname, Email, dateOfBirth });
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error });
        }
    },

    // Update user by ID
    update: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { Name, Surname, Email, dateOfBirth } = req.body;
            user.Name = Name ?? user.Name;
            user.Surname = Surname ?? user.Surname;
            user.Email = Email ?? user.Email;
            user.dateOfBirth = dateOfBirth ?? user.dateOfBirth;

            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error });
        }
    },

    // Delete user by ID
    remove: async (req, res) => {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }
};
