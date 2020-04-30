const fs = require('fs');
const fetch = require('node-fetch');

// Returns all city objects from the cities.json file.
const getAllCities = () => {
    let rawdata = fs.readFileSync('cities.json');
    let data = JSON.parse(rawdata);

    return data;
};

// Geocodes the city and province, then adds it to the cities.json file along with it's coordinates.
const addCity = (object) => {
    let cityName = object.city;
    let provinceName = object.province;

    //Format city and province name for GeoCoding compatibility.
    let formattedCityName = cityName.replace(' ', '+');
    let formattedProvinceName = `+${provinceName}`;

    return new Promise((resolve, reject) => {
        let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedCityName},${formattedProvinceName}&key=AIzaSyA94Pe1czyW0kPdjvd04s3ukkDejTEK3QM`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                let myLatLng = data.results[0].geometry.location;

                let obj = {
                    city: cityName,
                    province: provinceName,
                    lat: myLatLng.lat,
                    lng: myLatLng.lng,
                };

                let cityList = getAllCities();

                cityList.push(obj);

                fs.writeFileSync(
                    'cities.json',
                    JSON.stringify(cityList, null, 4)
                );

                resolve('Write to file complete');
            });
    });
};

// Finds the matching city, then deletes from the cities.json file.
const removeCity = (city) => {
    let rawdata = fs.readFileSync('cities.json');
    let data = JSON.parse(rawdata);

    for (let index = 0; index < data.length; index++) {
        if (data[index].city === city.toString()) {
            data.splice(index, 1);
        }
    }

    fs.writeFileSync('cities.json', JSON.stringify(data, null, 4));
};

module.exports = {
    add: addCity,
    remove: removeCity,
};
