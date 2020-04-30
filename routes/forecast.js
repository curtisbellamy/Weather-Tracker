const express = require('express');
const router = express.Router();
const ForecastController = require('../controllers/ForecastController');

router.get(
    '/getWeather/:cityName/:provinceName',
    ForecastController.getForecast
);

module.exports = router;
