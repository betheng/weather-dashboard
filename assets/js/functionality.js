var searchHistoryList = $('#search-history-list');
var searchCityInput = $("#search-city");
var searchCityButton = $("#search-city-button");
var clearHistoryButton = $("#clear-history");

var currentCity = $("#current-city");
var currentTemp = $("#current-temp");
var currentHumidity = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var UVindex = $("#uv-index");

var weatherContent = $("#weather-content");
// Get access to the OpenWeather API with key from signing up
var APIkey = "65324fa8df671670374e1ac47154e319";

var cityList = [];

// Find current date and display in title
const currentDate = moment().format('L');
$("#current-date").text(`(${currentDate})`);

// Check for search history on page load
initalizeHistory();
displayClearButton();

// Event listener for City Search button
$(document).on("submit", (event) => {
    event.preventDefault();
    const searchValue = searchCityInput.val().trim();
  
    if (searchValue) {
      currentConditionsRequest(searchValue);
      searchHistory(searchValue);
      searchCityInput.val("");
    }
  });  

// Adds city to search history
searchCityButton.on("click", (event) => {
    event.preventDefault();
    const searchValue = searchCityInput.val().trim();

    if (searchValue) {
        currentConditionsRequest(searchValue);
        searchHistory(searchValue);
        searchCityInput.val("");
    }
});

// Clear History functionality
clearHistoryButton.on("click", () => {
    cityList = [];
    listArray();
    clearHistoryButton.addClass("hide");
});

// Event listener to click on City in History bar
searchHistoryList.on("click", "li.city-btn", event => {
    const value = $(event.currentTarget).data("value");
    currentConditionsRequest(value);
    searchHistory(value);
});

// Ping OpenWeather API from input
function currentConditionsRequest(searchValue) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&units=imperial&appid=${APIkey}`;

    $.ajax({ url: queryURL, method: "GET" }).then(response => {
        currentCity.text(response.name)
                  .append(`<small class='text-muted' id='current-date'>(${currentDate})</small>`)
                  .append(`<img src='https://openweathermap.org/img/w/${response.weather[0].icon}.png' alt='${response.weather[0].main}' />`);

        currentTemp.html(`${response.main.temp}&deg;F`);
        currentHumidity.text(`${response.main.humidity}%`);
        currentWindSpeed.text(`${response.wind.speed}MPH`);

        const { lat, lon } = response.coord;
        const UVurl = `https://api.openweathermap.org/data/2.5/uvi?&lat=${lat}&lon=${lon}&appid=${APIkey}`;

        $.ajax({ url: UVurl, method: "GET" }).then(response => {
            UVindex.text(response.value);
        });

        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=${APIkey}&lat=${lat}&lon=${lon}`;
        
        $.ajax({ url: forecastURL, method: "GET" }).then(response => {
            $('#five-day-forecast').empty();

            for (let i = 1; i < response.list.length; i += 8) {
                const forecastDateString = moment(response.list[i].dt_txt).format("L");

                const forecastHTML = `
                    <div class='col-12 col-md-6 col-lg forecast-day mb-3'>
                        <div class='card'>
                            <div class='card-body'>
                                <h5 class='card-title'>${forecastDateString}</h5>
                                <img src='https://openweathermap.org/img/w/${response.list[i].weather[0].icon}.png' alt='${response.list[i].weather[0].main}' />
                                <p class='card-text mb-0'>Temp: ${response.list[i].main.temp}&deg;F</p>
                                <p class='card-text mb-0'>Humidity: ${response.list[i].main.humidity}%</p>
                            </div>
                        </div>
                    </div>
                `;

                $('#five-day-forecast').append(forecastHTML);
            }
        });
    });
};

// Search history of cities in sidebar
function searchHistory(searchValue) {
    if (!searchValue) return;

    const index = cityList.indexOf(searchValue);

    // If city is new, push it; if it exists, remove and push to update its position
    if (index === -1) {
        cityList.push(searchValue);
    } else {
        cityList.splice(index, 1);
        cityList.push(searchValue);
    }

    listArray();
    clearHistoryButton.removeClass("hide");
    weatherContent.removeClass("hide");
}

// Write out history into the search sidebar
function listArray() {
    searchHistoryList.empty();
    cityList.forEach(city => {
        searchHistoryList.prepend($('<li>').addClass('list-group-item city-btn')
                                           .attr('data-value', city)
                                           .text(city));
    });
    localStorage.setItem('cities', JSON.stringify(cityList));
}

// Retrieve and update the city list array from local storage for the search history sidebar
function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityList.length - 1;
        // console.log(cityList); // for debugging
        listArray();
        // Display the last city viewed
        if (cityList.length !== 0) {
            currentConditionsRequest(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}

// Show clear history button if search history sidebar has elements
function displayClearButton() {
    if (searchHistoryList.text().length > 0) {
        clearHistoryButton.removeClass("hide");
    }
}
