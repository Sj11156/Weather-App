const apiKey = "34fd185f3ccc7896796ebe4de4dae1bd"; // Replace with your OpenWeatherMap API key
const getWeatherBtn = document.getElementById('getWeather');
const cityInput = document.getElementById('city');
const weatherResult = document.getElementById('weatherResult');
const recentDiv = document.getElementById('recentSearches');
const darkModeToggle = document.getElementById('darkModeToggle');

// Dark mode setup
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', 
    document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
  );
});

// Save and display recent searches
function saveSearch(city) {
  let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  if (!searches.includes(city)) {
    searches.unshift(city);
    if (searches.length > 5) searches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  }
  displayRecentSearches();
}

function displayRecentSearches() {
  recentDiv.innerHTML = "<h3>Recent Searches</h3>";
  const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  searches.forEach(city => {
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', () => {
      cityInput.value = city;
      fetchWeather();
    });
    recentDiv.appendChild(btn);
  });
}
displayRecentSearches();

// Fetch current weather
function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;
  weatherResult.innerHTML = "<p>Loading...</p>";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      weatherResult.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
        <p><strong>Temp:</strong> ${data.main.temp}°C</p>
        <p><strong>Weather:</strong> ${data.weather[0].main}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      `;
      saveSearch(city);
      fetchForecast(city);
    })
    .catch(err => {
      weatherResult.innerHTML = `<p style="color:red">${err.message}</p>`;
    });
}

// Fetch 5-day forecast
function fetchForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      let daily = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date] && item.dt_txt.includes('12:00:00')) {
          daily[date] = item;
        }
      });

      let forecastHTML = '<h3>5-Day Forecast</h3><div class="forecast">';
      for (const date in daily) {
        const day = daily[date];
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        forecastHTML += `
          <div class="forecast-day">
            <strong>${date}</strong><br>
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather-icon"><br>
            ${day.main.temp}°C<br>${day.weather[0].main}
          </div>
        `;
      }
      forecastHTML += '</div>';
      weatherResult.innerHTML += forecastHTML;
    });
}

getWeatherBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') fetchWeather();
});
