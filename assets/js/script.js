var cityInput = document.querySelector("#city-input");
var cityBtn = document.querySelector("#search-btn");
var cityNameEl = document.querySelector("#city-name");
var cityArr = [];
var apiKey = "8ca68beeae3b0a314bcd89138e8d3a1f"; // Enter API Key


var formHandler = function(event) {
    // create city name for display
    var selectedCity = cityInput
    .value.trim().toLowerCase().split("").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join("");

    if (selectedCity) {
        getDeets(selectedCity);
        cityInput.value = "";
    } else {
        alert("Enter a City!");
    };

};

// use "current weather api" to fetch lattitude and longitude
var getCoords = function(city) {
    var currentForecastApi = "https://api.openweathermap.org/data/2.5/weather/?appid=8ca68beeae3b0a314bcd89138e8d3a1f";
    fetch(currentForecastApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var lon = data.coord["lon"];
                var lat = data.coord["lat"];
                getCityForecast(city, lon, lat);

                // save the searched cities and refreshes rencent city list
                if (document.querySelector(".city-list")) {
                    document.querySelector(".city-list").remove();
                }

                saveCity(city);
                loadCities();
            });
        } else {
            alert("Error: ${response.statusText}")
        }
    })
    .catch(function(error) {
        alert("Could not load weather");
    })
}

// use latitude and logitude to fetch current weather and five-day forecast
var getCityForecast = function(city, lon, lat) {
    var oneCallApi = "https://api.openweathermap.org/data/2.5/onecall?lat=lat&lon=lon&units=imperial&exclude=minutely,hourly,alerts&appid=8ca68beeae3b0a314bcd89138e8d3a1f";
    fetch(oneCallApi).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {

                // identify city name in forecast
                cityNameEl.textContent = '${city} (${moment().format('M/D/YYYY')})';

                console.log(data)

                currentForecast(data);
                fiveDayForecast(data);
            });
        }
    })
}


