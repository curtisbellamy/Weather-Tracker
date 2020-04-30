const express = require('express');
const router = express.Router();
const CityController = require('../controllers/CityController');

router.post('/addCity', CityController.add);

router.post('/removeCity/:cityName', CityController.remove);

module.exports = router;
