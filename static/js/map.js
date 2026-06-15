/* ============================================================
   map.js — Leaflet Volunteer Map
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof L === 'undefined') return;

  var mapContainer = document.getElementById('volunteer-map') || document.getElementById('adminMap');
  if (!mapContainer) return;

  /* ---------- Mock cities (fallback) ---------- */
  var mockCities = [
    { name: 'Mumbai',     lat: 19.0760, lng: 72.8777, volunteers: 420, risk: 'low' },
    { name: 'Delhi',      lat: 28.6139, lng: 77.2090, volunteers: 380, risk: 'low' },
    { name: 'Bangalore',  lat: 12.9716, lng: 77.5946, volunteers: 310, risk: 'medium' },
    { name: 'Kolkata',    lat: 22.5726, lng: 88.3639, volunteers: 260, risk: 'low' },
    { name: 'Chennai',    lat: 13.0827, lng: 80.2707, volunteers: 240, risk: 'medium' },
    { name: 'Lucknow',    lat: 26.8467, lng: 80.9462, volunteers: 190, risk: 'low' },
    { name: 'Pune',       lat: 18.5204, lng: 73.8567, volunteers: 180, risk: 'low' },
    { name: 'Jaipur',     lat: 26.9124, lng: 75.7873, volunteers: 150, risk: 'medium' },
    { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867, volunteers: 140, risk: 'high' },
    { name: 'Ahmedabad',  lat: 23.0225, lng: 72.5714, volunteers: 120, risk: 'low' }
  ];

  /* ---------- Risk → color ---------- */
  function riskColor(risk) {
    switch ((risk || '').toLowerCase()) {
      case 'high':   return '#EF476F';
      case 'medium': return '#FFD166';
      case 'low':    return '#06D6A0';
      default:       return '#118AB2';
    }
  }

  /* ---------- Init Map ---------- */
  var map = L.map(mapContainer, {
    scrollWheelZoom: false
  }).setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  /* ---------- Add markers ---------- */
  function addMarkers(data) {
    data.forEach(function (item) {
      var lat = item.lat || item.latitude;
      var lng = item.lng || item.longitude;
      if (!lat || !lng) return;

      var risk = item.risk || item.retention_risk || 'low';
      var color = riskColor(risk);

      var marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6
      }).addTo(map);

      var skills = item.skills || item.skill || '';
      if (Array.isArray(skills)) skills = skills.join(', ');

      var popupContent =
        '<div class="map-popup">' +
          '<strong>' + (item.name || item.full_name || 'Volunteer') + '</strong><br>' +
          (item.city ? '<span>📍 ' + item.city + '</span><br>' : '') +
          (skills ? '<span>🛠 ' + skills + '</span><br>' : '') +
          (item.volunteers ? '<span>👥 ' + item.volunteers + ' volunteers</span><br>' : '') +
          '<span class="risk-badge risk-' + risk + '">' +
            risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk' +
          '</span>' +
        '</div>';

      marker.bindPopup(popupContent);
    });
  }

  /* ---------- Load data ---------- */
  function loadMapData() {
    var token = localStorage.getItem('token');
    var headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    fetch('/api/volunteers', { headers: headers })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (data) {
        var volunteers = Array.isArray(data) ? data : (data.volunteers || []);
        if (volunteers.length > 0) {
          addMarkers(volunteers);
        } else {
          addMarkers(mockCities);
        }
      })
      .catch(function () {
        addMarkers(mockCities);
      });
  }

  loadMapData();

  /* ---------- Responsive ---------- */
  window.addEventListener('resize', function () {
    map.invalidateSize();
  });

  /* ---------- Public API ---------- */
  window.volunteerMap = map;
  window.refreshMap = function () {
    map.eachLayer(function (layer) {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });
    loadMapData();
  };
})();
