# Primerjalnik Cen - Backend

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen?logo=mongodb)](https://www.mongodb.com/) 

This is the backend repository for the project Primerjalnik Cen, a price comparison website for cars. It provides a REST API for the frontend and handles data storage in MongoDB.

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)

## Project Structure


## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/FERIMaribor/backend.git
cd backend
```
Install dependencies:
```bash
npm install
```
add this to your .env file:
```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run the API crawling script that imports car listings from autolina.ch
```bash
node scripts/importAutolinaCars.js
```
Start the backend
```bash
npm start
```
The backend will start on http://localhost:5000 by default.




## Features

- REST API for accessing car listings and vehicle data
- Support for Cars, Motorcycles, and Trucks
- AI-powered search integration (via LLM services)
- MongoDB database with Mongoose models
- Data crawling and import functionality (`importAutolinaCars.js`)
- Flexible architecture ready for future expansion

## API Endpoints

### Cars

- `POST /api/cars`  
  Add a new car to the database

- `GET /api/cars`  
  Retrieve all cars

- `GET /api/cars/:id`  
  Retrieve a car by its ID

- `PUT /api/cars/:id`  
  Update a car by its ID

- `DELETE /api/cars/:id`  
  Delete a car by its ID

- `GET /api/cars/carquery/makes`  
  Retrieve list of car makes from CarQuery API

- `GET /api/cars/carquery/models?make=...`  
  Retrieve list of car models for a specific make from CarQuery API

### Motorcycles

- `POST /api/motorcycles`  
  Add a new motorcycle to the database

- `GET /api/motorcycles`  
  Retrieve all motorcycles

- `GET /api/motorcycles/makes`  
  Retrieve list of motorcycle makes

- `GET /api/motorcycles/models?make=...`  
  Retrieve list of motorcycle models for a specific make

### Trucks

- `POST /api/trucks`  
  Add a new truck to the database

- `GET /api/trucks`  
  Retrieve all trucks

- `GET /api/trucks/makes`  
  Retrieve list of truck makes

- `GET /api/trucks/models?make=...`  
  Retrieve list of truck models for a specific make

### Users

- `POST /api/users/register`  
  Register a user with Firebase

- `POST /api/users/login`  
  Login a user with Firebase

- `POST /api/users/loginWithGoogle`  
  Login a user with Google

- `GET /api/users`  
  Retrieve list of all users (protected route)

- `GET /api/users/:id`  
  Retrieve a user by ID (protected route)

- `PUT /api/users/:id`  
  Update a user by ID (protected route)

- `DELETE /api/users/:id`  
  Delete a user by ID (protected route)

- `PUT /api/users/:userId/preferences`  
  Update user preferences (protected route)

### AI Search

- `POST /api/ai/search`  
  Perform AI-powered search on vehicles



Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Contact
Repository: https://github.com/FERIMaribor/backend

For any inquiries or suggestions, please contact the project maintainers via GitHub.









