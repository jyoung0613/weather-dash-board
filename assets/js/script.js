var searchBtn = document.querySelector("#city-search-btn");
var searchHistoryContainer = document.querySelector("#search-history");
var currentDayWeather = document.querySelector("#current-day-card-body");
var fiveDayWeather = document.querySelector("#five-day-forcast-container");
var weatherIcon = "http://openweathermap.org/img/wn/"; 

// get search history localStorage and parse back to object
var searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

// Add city to search history
var addCitySearchHistory = function(city) {
    
    searchHistory.unshift({"cityName":city});

    // If more than 10 items, remove the extra
    if(searchHistory.length > 10) {
        searchHistory.splice(10, searchHistory.length);
    }

    // localStorage updates with new adjusted array
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    
    loadSearchHistory();
}

// Load search history items from local storage
var loadSearchHistory = function() {
    searchHistoryContainer.innerHTML = "<p>Last 10 searches:</p>";

    // Create list group to contain search history items
    var historyListEl = document.createElement("ul");
    
    historyListEl.className = "list-group";

    // Loop through search history array and display results
    for(var i = 0; i < searchHistory.length; i++) {
        // Create list item
        var searchHistoryItemEl = document.createElement("li");
        searchHistoryItemEl.classList = "list-group-item search-history-items";
        searchHistoryItemEl.textContent = searchHistory[i].cityName;
        searchHistoryItemEl.setAttribute("data-city", searchHistory[i].cityName);

        // Add the list item to the list group
        historyListEl.appendChild(searchHistoryItemEl);
    }
    // Add new search history list to container
    searchHistoryContainer.appendChild(historyListEl);
}

// Call OpenWeather API 
var callWeatherAPI = function(city) {
    // get user input to trim and replace all spaces with a '+' for url
    adjustedCity = city.trim().split(' ').join('+');
    var cityName, country = "";
    
    // Compile URL
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + adjustedCity + 
    "&appid=8ca68beeae3b0a314bcd89138e8d3a1f";
    
    // Fetch first api
    fetch(apiUrl)
    .then(function(response) {
        if(response.ok) {
             // Response returned 
            return response.json();
        } else {
            // Response returned with error. Display Error Message
            currentDayWeather.innerHTML = "<h4>Something went wrong. Please try again.</h4>";
            fiveDayWeather.innerHTML = "";
            console.log("error");
            return;
        }
    })
    .then(function(response) {
        // Capture latitude and longitude to use in next fetch
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        cityName = response.name;
        country = response.sys.country;
        
        // Compile new url to fetch data from onecall api
        var newUrl = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" 
            + lat + "&lon=" 
            + lon 
            + "&exclude=minutely,hourly&appid=8ca68beeae3b0a314bcd89138e8d3a1f";

        // return the new api call with corresponding lat and long for searched city
        return fetch(newUrl);
    })
    .then(function(response) {
        if(response.ok) {
            // Response returned 
            return response.json();
        } else {
            // Response returned with error. Display Error Message
            currentDayWeather.innerHTML = "<h4>Something went wrong. Please try again.</h4>";
            fiveDayWeather.innerHTML = "";
            console.log("error");
            return;
        }
    })
    .then(function(response) {
        // obtain and display current date
        var uvi = response.current.uvi;
        // Check the UV Index to determine what condition warning should be used
        if(uvi < 5) {
            var uviCondition = "bg-success";
        } else if (uvi >= 5 && uvi < 8) {
            var uviCondition = "bg-warning";
        } else {
            var uviCondition = "bg-danger";
        }

        // Add Current Day Content to currentDayWeather 
        currentDayWeather.innerHTML = "<h2>" + cityName + ", " + country + " (" + moment.unix(response.current.dt).format("MM/DD/YYYY") + ")" 
                                        + "<img class='current-day-icon' src='" + weatherIcon + response.current.weather[0].icon + "@2x.png' /></h2>"
                                        + "<p>Temperature: " + response.current.temp + " " + String.fromCharCode(176) +"F</p>"
                                        + "<p>Humidity: " + response.current.humidity + "%</p>"
                                        + "<p>Wind Speed: " + response.current.wind_speed + " MPH</p>"
                                        + "<p>UV Index: <span class='uv-span " + uviCondition + "'>" + uvi + "</span></p>";

        // Display 5 day Forcast
        fiveDayWeather.innerHTML = "<h4>5-Day Forecast:</h4>";
        var fiveDayCardGroupEl = document.createElement("div");
        fiveDayCardGroupEl.classList = "card-deck justify-content-around";

        // Loop through and display each daily card
        for (var i = 1; i <= 5; i++) {
            // create card
            var dayCardEl = document.createElement("div");
            dayCardEl.classList = "card weather-card mx-0 mb-3";

            // Create card body
            var dayCardBodyEl = document.createElement("div");
            dayCardBodyEl.className = "card-body";
            dayCardBodyEl.innerHTML = "<p><span class='daily-date'>" + moment.unix(response.daily[i].dt).format("MM/DD/YYYY") + "</span></h4>"
                                    + "<p><img class='daily-icon' src='" + weatherIcon + response.daily[i].weather[0].icon + ".png' /></p>"
                                    + "<p>Temp: " + response.daily[i].temp.day + " " + String.fromCharCode(176) + "F</p>"
                                    + "<p>Wind Speed: " + response.daily[i].wind_speed + " MPH</p>"
                                    + "<p>Humidity: " + response.daily[i].humidity + "%</p>";
            // append card body to parent card
            dayCardEl.appendChild(dayCardBodyEl);
            // append card to five day card group
            fiveDayCardGroupEl.appendChild(dayCardEl);
        }
        // Append five day card group to container
        fiveDayWeather.appendChild(fiveDayCardGroupEl);
    }) 
    .catch(function(error) {
        // Dispaly message if a reponse code in the 500s is returned.
        console.log(error);
        currentDayWeather.innerHTML = "<h4>Something went wrong. Please try again.</h4>";
        fiveDayWeather.innerHTML = "";
    });
    
    // Update search history with new city
    addCitySearchHistory(city);
}

// Search City Event Handler
var searchCityEvent = function(event) {
    event.preventDefault();

    // obtain object that was clicked
    var itemClicked = event.target;

    if(itemClicked.id === "city-search-btn") {
        // get the value from the search field
        var cityName = document.getElementById("city-search-field").value;
        document.getElementById("city-search-field").value = "";
        
        if (cityName) {
            // city name provided. Call search against weather API
            callWeatherAPI(cityName);
        } else {
            // No city entered
            alert("You must enter a city name.");
        }
    } else if (itemClicked.className.includes("search-history-items")) {
        // Find weather for selected city
        callWeatherAPI(itemClicked.getAttribute("data-city"));
    }
}

// Load search history on refresh
loadSearchHistory();

// Event Listeners for Search Buttn and Search History Items
searchHistoryContainer.addEventListener("click", searchCityEvent);
searchBtn.addEventListener("click", searchCityEvent);
