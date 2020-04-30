var map;

// Google provided function to initiate the map.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 49.2193226, lng: -122.5983981 },
        zoom: 11,
        disableDefaultUI: true,
    });
}

// Centers map on marker for the preview map on left hand side.
const centerMap = (city) => {
    let data;
    let formattedCity = city.replace(/\s/g, '');
    for (var i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        console.log(key.split('.')[0]);
        if (key.split('.')[0] === formattedCity) {
            data = localStorage.getItem(localStorage.key(i));
        }
    }

    let myLatLng = JSON.parse(data);

    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 11,
        disableDefaultUI: true,
    });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: `${city}`,
    });
};

// Removes the given city from local storage.
const removeCity = (city) => {
    // Find and delete city from local storage.
    for (var i = 0; i < localStorage.length; i++) {
        let data = localStorage.getItem(localStorage.key(i));
        let key = localStorage.key(i);
        let splitKey = localStorage.key(i).split('.')[0];

        if (splitKey === city) {
            localStorage.removeItem(key);
        }
    }
};
