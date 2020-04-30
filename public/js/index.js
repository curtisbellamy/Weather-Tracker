var map;

const markers = [];

// Google provided function to initiate the map.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.726669, lng: -127.647621 },
        zoom: 6,
    });
}

// Loads up all markers and displays them on map from local storage coordinates.
window.onload = loadMarkers = () => {
    //load lat lng from localstorage
    for (var i = 0; i < localStorage.length; i++) {
        let data = localStorage.getItem(localStorage.key(i));
        let myLatLng = JSON.parse(data);
        let key = localStorage.key(i);

        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: key.replace('.', ' '),
        });

        markers.push(marker);
    }

    // Assign individual event listeners.
    markers.map((marker) => {
        marker.addListener('click', function () {
            map.setZoom(10);
            map.setCenter(marker.getPosition());
        });
    });

    synchronizeCitiesAndMarkers();
};

// Compares all local storage data with the cuurent cities displayed in the control panel.
// Deletes from local storage if any elements are found that dont have a match on the control panel.

// NOTE: This is a shortcut and my only small bug at this time after testing. The marker will be removed from localstorage,
// however it will stay displayed until the next time the window is refreshed.
const synchronizeCitiesAndMarkers = () => {
    let elements = document.getElementsByClassName('cityInnerLabel');
    let cityList = [];

    for (let index = 0; index < elements.length; index++) {
        let temp = elements[index].textContent.trim();
        let name = temp.split(' ');

        let i = name.indexOf('-');
        name[i] = '.';

        cityList.push(name.join(''));
    }

    for (var i = 0; i < localStorage.length; i++) {
        let data = localStorage.getItem(localStorage.key(i));
        let key = localStorage.key(i);
        if (!cityList.includes(key)) {
            localStorage.removeItem(key);
        }
    }
};

// Gets the marker's coordinates from the markers array and centers the map on it.
const centerOnMarker = (city, province) => {
    let name = `${city} ${province}`;

    let marker;
    markers.map((test) => {
        if (test.title === name) {
            marker = test;
        }
    });

    map.setCenter(marker.getPosition());
    map.setZoom(11);
};

// Geocodes the city and province, then enters the city, province, lat, lng into local storage to then be displayed as a marker.
const addMarker = () => {
    let cityName = document.getElementById('cityInput').value;
    let provinceName = document.getElementById('provinceInput').value;

    let localStorageName = cityName.replace(/ +/g, '');

    // Format city and province name for GeoCoding compatibility.
    let formattedCityName = cityName.replace(' ', '+');
    let formattedProvinceName = `+${provinceName}`;

    let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedCityName},${formattedProvinceName}&key=AIzaSyA94Pe1czyW0kPdjvd04s3ukkDejTEK3QM`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem(
                `${localStorageName}.${provinceName}`,
                JSON.stringify(data.results[0].geometry.location)
            );
        });
};

// Displays loading spinner while loading forecast data.
const load = () => {
    document.getElementById('spinner').style.visibility = 'visible';
};
