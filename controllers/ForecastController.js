const ForecastModel = require('../models/forecast');

const get = (req, res) => {
    let city = req.params.cityName;
    let province = req.params.provinceName;

    ForecastModel.getData(city, province)
        .then((data) => {
            res.render('cityForecast', {
                data: data,
                forecastVisible: true,
            });
        })
        .catch((e) => {
            console.error(e);

            res.render('cityForecast', {
                forecastVisible: true,
            });
        });
};

module.exports = {
    getForecast: get,
};
