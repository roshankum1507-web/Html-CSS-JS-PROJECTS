const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const statusText = document.getElementById("statusText");
const currentCard = document.getElementById("currentCard");
const placeName = document.getElementById("placeName");
const localTime = document.getElementById("localTime");
const tempValue = document.getElementById("tempValue");
const windValue = document.getElementById("windValue");
const forecastGrid = document.getElementById("forecastGrid");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  await loadWeatherByCity(city);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Geolocation not supported in this browser.");
    return;
  }

  setStatus("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await loadWeatherByCoords(latitude, longitude, "Your Location");
    },
    () => {
      setStatus("Location access denied. You can search by city instead.");
    }
  );
});

async function loadWeatherByCity(city) {
  try {
    setStatus("Searching city...");
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("City lookup failed.");

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      setStatus("City not found. Try another name.");
      return;
    }

    const place = geoData.results[0];
    const label = `${place.name}, ${place.country}`;
    await loadWeatherByCoords(place.latitude, place.longitude, label, place.timezone);
  } catch {
    setStatus("Could not fetch city details. Check your internet connection.");
  }
}

async function loadWeatherByCoords(lat, lon, label, timezone = "auto") {
  try {
    setStatus("Fetching weather...");
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=${timezone}`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Weather fetch failed.");

    const weatherData = await weatherRes.json();
    renderWeather(label, weatherData);
    setStatus("Weather loaded successfully.");
  } catch {
    setStatus("Could not fetch weather data right now.");
  }
}

function renderWeather(label, data) {
  currentCard.classList.remove("hidden");
  placeName.textContent = label;
  localTime.textContent = `Local time: ${formatLocalDate(data.current.time)}`;
  tempValue.textContent = `${Number(data.current.temperature_2m).toFixed(1)} C`;
  windValue.textContent = `Wind: ${Number(data.current.wind_speed_10m).toFixed(1)} km/h`;

  forecastGrid.innerHTML = "";
  const days = data.daily.time.slice(0, 5);
  days.forEach((date, index) => {
    const max = data.daily.temperature_2m_max[index];
    const min = data.daily.temperature_2m_min[index];
    const code = data.daily.weather_code[index];

    const card = document.createElement("article");
    card.className = "forecast-item";
    card.innerHTML = `
      <p><strong>${formatWeekday(date)}</strong></p>
      <p>${formatLocalDate(date)}</p>
      <p>${weatherCodeToText(code)}</p>
      <p>Max: ${max.toFixed(1)} C</p>
      <p>Min: ${min.toFixed(1)} C</p>
    `;

    forecastGrid.appendChild(card);
  });
}

function weatherCodeToText(code) {
  if ([0].includes(code)) return "Clear Sky";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([85, 86].includes(code)) return "Snow Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function setStatus(message) {
  statusText.textContent = message;
}

function formatWeekday(dateText) {
  return new Date(dateText).toLocaleDateString(undefined, { weekday: "short" });
}

function formatLocalDate(dateText) {
  return new Date(dateText).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}
