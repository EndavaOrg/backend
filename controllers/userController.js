const UserModel = require('../models/User');
const admin = require('firebase-admin');

module.exports = {
    list: async (req, res) => {
        try {
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
        }
    },

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

    registerWithFirebase: async (req, res) => {
        const { token, ime, priimek, telefon, preferences } = req.body;

        if (!token) return res.status(400).json({ message: 'Firebase ID token required' });

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email } = decodedToken;

            const existingUser = await UserModel.findOne({ firebaseUid: uid });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = new UserModel({
                email,
                firebaseUid: uid,
                ime,
                priimek,
                telefon,
                preferences,
            });

            await user.save();

            res.status(201).json({ id: user._id, email: user.email });
        } catch (error) {
            console.error('Firebase register error:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    },


    loginWithFirebase: async (req, res) => {
        const { token } = req.body;

        if (!token) return res.status(400).json({ message: 'Firebase ID token required' });

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email } = decodedToken;

            const user = await UserModel.findOne({ firebaseUid: uid });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ id: user._id, email: user.email });
        } catch (error) {
            console.error('Firebase login error:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    },

    loginWithGoogle: async (req, res) => {
        const { token } = req.body;

        if (!token) return res.status(400).json({ message: 'Firebase ID token required' });

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email } = decodedToken;

            let user = await UserModel.findOne({ firebaseUid: uid });

            if (!user) {
                user = new UserModel({ email, firebaseUid: uid });
                await user.save();
            }

            res.status(200).json({ id: user._id, email: user.email });

        } catch (error) {
            console.error('Firebase auth error:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    },

    update: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { email, ime, priimek, telefon, preferences } = req.body;

            if (email !== undefined) user.email = email;
            if (ime !== undefined) user.ime = ime;
            if (priimek !== undefined) user.priimek = priimek;
            if (telefon !== undefined) user.telefon = telefon;
            if (preferences !== undefined) user.preferences = preferences;

            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error });
        }
    },

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
    },
    updatePreferences: async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findOne({ firebaseUid: userId });
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        const { vehicleType, preferences } = req.body;

        if (!vehicleType || !['car', 'motorcycle', 'truck'].includes(vehicleType)) {
        return res.status(400).json({ message: 'Invalid or missing vehicleType' });
        }

        if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ message: 'Invalid preferences object' });
        }

        if (!user.preferences || typeof user.preferences !== 'object') {
        user.preferences = {
            car: {},
            motorcycle: {},
            truck: {},
            selectedVehicleType: 'car',
        };
        }

        if (!user.preferences.car) user.preferences.car = {};
        if (!user.preferences.motorcycle) user.preferences.motorcycle = {};
        if (!user.preferences.truck) user.preferences.truck = {};

        user.preferences[vehicleType] = preferences;
        user.preferences.selectedVehicleType = vehicleType;

        const updatedUser = await user.save();
        res.status(200).json({
        message: 'Preferences updated',
        selectedVehicleType: updatedUser.preferences.selectedVehicleType,
        preferences: updatedUser.preferences[vehicleType],
        });
    } catch (error) {
        console.error('Error in updatePreferences:', error);
        res.status(500).json({ message: 'Error updating preferences', error });
    }
    },


    findByFirebaseUid: async (req, res) => {
        try {
            const user = await UserModel.findOne({ firebaseUid: req.params.firebaseUid });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user by firebaseUid', error });
        }
    }

       
};