const ors_api_key = "YOUR_OPENROUTESERVICE_API_KEY"; // Replace with your OpenRouteService API key

const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = L.layerGroup().addTo(map);
let userLocation = null;
let routeLayer = null;

function showCafes(cafes) {
  markers.clearLayers();
  if (cafes.length === 0) {
    alert("No cafes found nearby.");
    return;
  }
  cafes.forEach(cafe => {
    const lat = cafe.lat || (cafe.center && cafe.center.lat);
    const lon = cafe.lon || (cafe.center && cafe.center.lon);
    if (lat && lon) {
      const name = cafe.tags.name || "Unnamed Cafe";
      const marker = L.marker([lat, lon]).addTo(markers).bindPopup(name);

      marker.on('click', () => {
        if (!userLocation) {
          alert("User location unknown. Please click 'Find My Location' first.");
          return;
        }
        getRoute(userLocation.lat, userLocation.lng, lat, lon);
      });
    }
  });
}

async function fetchCafes(lat, lon, radius = 1000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](around:${radius},${lat},${lon});
      way["amenity"="cafe"](around:${radius},${lat},${lon});
      relation["amenity"="cafe"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  const url = "https://overpass-api.de/api/interpreter";
  const response = await fetch(url, {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "text/plain"
    }
  });
  if (!response.ok) {
    alert("Failed to fetch cafe data from Overpass API");
    return [];
  }
  const data = await response.json();
  return data.elements || [];
}

async function fetchCafesInBounds(southWest, northEast) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](${southWest.lat},${southWest.lng},${northEast.lat},${northEast.lng});
      way["amenity"="cafe"](${southWest.lat},${southWest.lng},${northEast.lat},${northEast.lng});
      relation["amenity"="cafe"](${southWest.lat},${southWest.lng},${northEast.lat},${northEast.lng});
    );
    out center;
  `;
  const url = "https://overpass-api.de/api/interpreter";
  const response = await fetch(url, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" }
  });
  if (!response.ok) {
    alert("Failed to fetch cafe data from Overpass API");
    return [];
  }
  const data = await response.json();
  return data.elements || [];
}

async function searchLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data && data.length > 0) {
    const { lat, lon } = data[0];
    userLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };
    map.setView([lat, lon], 15);
    const cafes = await fetchCafes(lat, lon);
    showCafes(cafes);
  } else {
    alert("Location not found");
  }
}

function locateMe() {
  if (!navigator.geolocation) {
    alert('Geolocation not supported by this browser');
    return;
  }
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    userLocation = { lat: latitude, lng: longitude };
    map.setView([latitude, longitude], 15);
    L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
    const cafes = await fetchCafes(latitude, longitude);
    showCafes(cafes);
  }, () => alert('Unable to get your location'));
}

async function getRoute(startLat, startLng, endLat, endLng) {
  if(routeLayer){
    map.removeLayer(routeLayer);
  }

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ors_api_key}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
  const response = await fetch(url);
  if(!response.ok){
    alert("Failed to get route");
    return;
  }
  const data = await response.json();
  const geojson = data.features[0].geometry;

  routeLayer = L.geoJSON(geojson, {
    style: {
      color: 'blue',
      weight: 5,
      opacity: 0.7
    }
  }).addTo(map);

  // Fit map bounds to route
  const bounds = routeLayer.getBounds();
  map.fitBounds(bounds);
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if(query){
    searchLocation(query);
  }
});

document.getElementById('locate-btn').addEventListener('click', locateMe);

document.getElementById('scan-btn').addEventListener('click', async () => {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const cafes = await fetchCafesInBounds(southWest, northEast);
  showCafes(cafes);
});
