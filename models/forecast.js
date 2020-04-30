const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();

// Fetches weather data for the given city and province from Environment Canada in XML format, converts to JS object.
// Collects daily forecast data, then collects hourly forecast data.
// Packages a custom object then returns in a promise.

// If no data can be found, removes the current city from cites.json because it is of no use to us.
const getWeatherData = (city, province) => {
    return new Promise((resolve, reject) => {
        generateSiteCode(city, province)
            .then((code) => {
                //fetch data
                let url = `https://dd.weather.gc.ca/citypage_weather/xml/${province}/${code}_e.xml`;
                fetch(url)
                    .then((response) => response.text())
                    .then((data) => {
                        parser.parseString(data, (err, result) => {
                            if (err) {
                                console.error('ERROR:' + err);
                                return;
                            }

                            // Begin scraping daily forecast data.

                            let textSummaries = [];

                            let windSummaries = [];

                            let periods = [];

                            let region = result.siteData.location[0].name[0]._;

                            let currentDateTime =
                                result.siteData.forecastGroup[0].dateTime[1]
                                    .textSummary[0];

                            let currentTemp =
                                result.siteData.currentConditions[0]
                                    .temperature[0]._;

                            let currentPressure =
                                result.siteData.currentConditions[0].pressure[0]
                                    ._;

                            let currentWind = `${result.siteData.currentConditions[0].wind[0].speed[0]._} km/h ${result.siteData.currentConditions[0].wind[0].direction[0]}`;

                            let forecast =
                                result.siteData.forecastGroup[0].forecast;

                            forecast.map((x) => {
                                textSummaries.push(x.textSummary[0]);
                                periods.push(x.period[0]._);
                                //console.log(x.period[0]._);
                                if (x.winds[0]) {
                                    windSummaries.push(
                                        x.winds[0].textSummary[0]
                                    );
                                } else {
                                    windSummaries.push(' ');
                                }
                            });

                            // end.

                            // Begin scraping hourly data.

                            let hourlyPeriods = [];

                            let hourlyConditions = [];

                            let hourlyTemps = [];

                            let hourlyPrecip = [];

                            let hourlyWind = [];

                            let hourlyForecast =
                                result.siteData.hourlyForecastGroup[0]
                                    .hourlyForecast;

                            hourlyForecast.map((x) => {
                                // convert date into local time and readable format.
                                let dateNum = x['$'].dateTimeUTC;
                                let dateString = dateNum.toString();
                                let year = dateString.substring(0, 4);
                                let month = dateString.substring(4, 6);
                                let day = dateString.substring(6, 8);
                                let time = dateString.substring(8, 12);
                                let hour = time.substring(0, 2);
                                let min = time.substring(2, 4);

                                let date = new Date(
                                    `${year}-${month}-${day} ${hour}:${min} UTC`
                                );

                                hourlyPeriods.push(
                                    date.toString().substring(0, 21)
                                );

                                // Finished date conversion.

                                hourlyConditions.push(x.condition[0]);
                                hourlyTemps.push(x.temperature[0]._);
                                hourlyPrecip.push(x.lop[0]._);
                                hourlyWind.push(
                                    `${x.wind[0].speed[0]._} km/h ${x.wind[0].direction[0]._}`
                                );
                            });

                            // end.

                            let dataObject = {
                                currentRegion: region,
                                currentDT: currentDateTime,
                                currentTmp: currentTemp,
                                currentPress: currentPressure,
                                currentWnd: currentWind,
                                daily: [],
                                hourly: [],
                            };

                            for (var i = 0; i < textSummaries.length; i++) {
                                dataObject.daily.push({
                                    period: periods[i],
                                    text: textSummaries[i],
                                    wind: windSummaries[i],
                                });
                            }

                            for (var i = 0; i < textSummaries.length; i++) {
                                dataObject.daily.push({
                                    period: periods[i],
                                    text: textSummaries[i],
                                    wind: windSummaries[i],
                                });
                            }

                            for (var i = 0; i < hourlyPeriods.length; i++) {
                                dataObject.hourly.push({
                                    period: hourlyPeriods[i],
                                    cond: hourlyConditions[i],
                                    temps: hourlyTemps[i],
                                    precip: hourlyPrecip[i],
                                    wnd: hourlyWind[i],
                                });
                            }

                            resolve(dataObject);

                            if (!dataObject) {
                                reject('Data could not be returned');
                            }
                        });
                    });
            })
            .catch((e) => {
                console.error(e);
                reject('Data could not be returned');

                // Automatically remove this city from the Dashboard list because it provides no data.
                let rawdata = fs.readFileSync('cities.json');
                let data = JSON.parse(rawdata);

                for (let index = 0; index < data.length; index++) {
                    if (data[index].city === city.toString()) {
                        data.splice(index, 1);
                    }
                }

                fs.writeFileSync('cities.json', JSON.stringify(data, null, 4));
            });
    });
};

// Fetches GeoJSON to obtain the site code representing the city we're looking for.
// We then use this site code in getWeatherData() to query for the right city and province.
const generateSiteCode = (city, province) => {
    let citySiteCodeURL =
        'https://collaboration.cmc.ec.gc.ca/cmc/cmos/public_doc/msc-data/citypage-weather/site_list_en.geojson';

    return new Promise((resolve, reject) => {
        fetch(citySiteCodeURL)
            .then((response) => response.json())
            .then((json) => {
                let obj = json.features;
                obj.map((element) => {
                    if (
                        element.properties['English Names'].toLowerCase() === city.toLowerCase() &&
                        element.properties['Province Codes'] === province
                    ) {
                        resolve(element.properties['Codes']);
                    }
                });

                reject('Unable to generate site code');
            });
    });
};

module.exports = {
    getData: getWeatherData,
    generateCode: generateSiteCode,
};
