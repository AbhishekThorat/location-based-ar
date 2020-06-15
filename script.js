const loadPlaces = function (coords) {
    // COMMENT FOLLOWING LINE IF YOU WANT TO USE STATIC DATA AND ADD COORDINATES IN THE FOLLOWING 'PLACES' ARRAY
    const method = 'api';
    window.currentLat = coords.latitude;
    window.currentLng = coords.longitude;

    if (method === 'api') {
        return loadPlaceFromAPIs(coords);
    }
    return [
        {
            name: "Your current place",
            location: {
                lat: coords.latitude,
                lng: coords.longitude,
            }
        },
    ];
};

// getting places from REST APIs
function loadPlaceFromAPIs(position) {
    const params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'HUHNNBSGTO3BYFLYK3NV4FTKQBNNLJS1IWBIP0YLRZJ3S4KV',
        clientSecret: 'UOYX3YJDFHMVHODRAHBLDND0YFZZI4SWT3JLLMGK4OH3KCZ1',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            alert("Error with places API");
            console.error("Error with places API", err);
        })
};

function addLocation() {
    const scene = document.querySelector('a-scene');
    const latitude = window.currentLat;
    const longitude = window.currentLng;

    const locationLinkElement = document.createElement("a-entity");
    locationLinkElement.setAttribute("gps-entity-place", `latitude: ${latitude}; longitude: ${longitude};`);
    locationLinkElement.setAttribute("scale", "1 1 1");
    locationLinkElement.setAttribute("gltf-model", "./assets/articuno/scene.gltf");
    locationLinkElement.setAttribute("animation-mixer", "true");
    locationLinkElement.setAttribute("rotation", "0 180 0");


    locationLinkElement.addEventListener('loaded', () => {
        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
    });

    scene.appendChild(locationLinkElement);
}


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;
                    // const text = document.createElement('a-link');
                    // text.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    // text.setAttribute('title', place.name);
                    // text.setAttribute('href', 'http://www.example.com/' + place.name);
                    // text.setAttribute('scale', '13 13 13');

                    // text.addEventListener('loaded', () => {
                    //     window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    // });

                    // scene.appendChild(text);
                    
                    const locationTextElement = document.createElement("a-text");
                    locationTextElement.setAttribute("value", `${place.name}`);
                    locationTextElement.setAttribute("align", "center");
                    locationTextElement.setAttribute("look-at", "[gps-camera]");
                    locationTextElement.setAttribute("gps-entity-place", `latitude: ${latitude}; longitude: ${longitude};`);
                    locationTextElement.setAttribute("scale", "13 13 13");
                    
                    const locationLinkElement = document.createElement("a-entity");
                    locationLinkElement.setAttribute("gps-entity-place", `latitude: ${latitude}; longitude: ${longitude};`);
                    locationLinkElement.setAttribute("scale", "1 1 1");
                    locationLinkElement.setAttribute("gltf-model", "./assets/articuno/scene.gltf");
                    locationLinkElement.setAttribute("animation-mixer", "true");
                    locationLinkElement.setAttribute("rotation", "0 180 0");
                    locationLinkElement.setAttribute("look-at", "[gps-camera]");

                    scene.appendChild(locationTextElement);
                    scene.appendChild(locationLinkElement);
                });
            })
    },
        (err) => {
            alert("Error in retrieving position");
            console.error("Error in retrieving position", err);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};
