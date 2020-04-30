const CityModel = require('../models/city');

// Adds new city then redirects back to the dashboard.
const addNew = (req, res) => {
    let province = req.body.province;
    let city = req.body.city;

    let cityObj = {
        city: city,
        province: province,
    };

    CityModel.add(cityObj).then((message) => {
        console.log(message);
        res.redirect('/');
    });
};

// Removes the city then redirects back to the dashboard.
const removeCity = (req, res) => {
    let city = req.params.cityName;

    CityModel.remove(city);

    res.redirect('/');
};

module.exports = {
    add: addNew,
    remove: removeCity,
};
