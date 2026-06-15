/* ============================================================
   charts.js — Chart.js Dashboard Charts
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof Chart === 'undefined') return;
  if (!document.getElementById('growthChart')) return;

  /* ---------- Theme Colors ---------- */
  function getThemeColor(prop, fallback) {
    var val = getComputedStyle(document.documentElement).getPropertyValue(prop);
    return val ? val.trim() : fallback;
  }

  function applyThemeDefaults() {
    Chart.defaults.color = getThemeColor('--text', '#333333');
    Chart.defaults.borderColor = getThemeColor('--border', '#e0e0e0');
  }
  applyThemeDefaults();

  var palette = [
    '#FF6B35', '#FFD166', '#06D6A0', '#118AB2', '#EF476F',
    '#073B4C', '#F78C6B', '#83C5BE', '#FFDDD2', '#006D77'
  ];

  /* ---------- Chart instances ---------- */
  var charts = {};

  /* ---------- Gradient helper ---------- */
  function createGradient(ctx, c1, c2) {
    var gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    return gradient;
  }

  /* ---------- 1. Growth Chart (Line) ---------- */
  function buildGrowthChart(data) {
    var canvasEl = document.getElementById('growthChart');
    if (!canvasEl) return;
    var ctx = canvasEl.getContext('2d');

    var labels = data.growth_labels || generateLast30Days();
    var values = data.growth_data || generateMockGrowth();

    var gradient = createGradient(ctx, 'rgba(255,107,53,0.4)', 'rgba(255,107,53,0.02)');

    if (charts.growth) charts.growth.destroy();

    charts.growth = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Volunteer Signups',
          data: values,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#FF6B35',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#FF6B35',
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10, maxRotation: 0 }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
  }

  /* ---------- 2. Skills Chart (Doughnut) ---------- */
  function buildSkillsChart(data) {
    var canvasEl = document.getElementById('skillsChart');
    if (!canvasEl) return;
    var ctx = canvasEl.getContext('2d');

    var labels = data.skills_labels || ['Teaching', 'Healthcare', 'Technology', 'Arts', 'Social Work', 'Sports'];
    var values = data.skills_data || [35, 25, 20, 10, 8, 2];

    if (charts.skills) charts.skills.destroy();

    charts.skills = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: getThemeColor('--card-bg', '#ffffff'),
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 16, usePointStyle: true, pointStyleWidth: 12 }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                var pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ctx.label + ': ' + ctx.parsed + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  /* ---------- 3. City Chart (Horizontal Bar) ---------- */
  function buildCityChart(data) {
    var canvasEl = document.getElementById('citiesChart');
    if (!canvasEl) return;
    var ctx = canvasEl.getContext('2d');

    var labels = data.city_labels || ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Lucknow', 'Pune', 'Jaipur', 'Hyderabad', 'Ahmedabad'];
    var values = data.city_data || [420, 380, 310, 260, 240, 190, 180, 150, 140, 120];

    var barColors = labels.map(function (_, i) {
      return palette[i % palette.length];
    });

    if (charts.city) charts.city.destroy();

    charts.city = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Volunteers',
          data: values,
          backgroundColor: barColors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /* ---------- 4. Retention Chart (Doughnut) ---------- */
  function buildRetentionChart(data) {
    var canvasEl = document.getElementById('retentionChart');
    if (!canvasEl) return;
    var ctx = canvasEl.getContext('2d');

    var labels = data.retention_labels || ['Low Risk', 'Medium Risk', 'High Risk'];
    var values = data.retention_data || [65, 25, 10];
    var colors = ['#06D6A0', '#FFD166', '#EF476F'];

    if (charts.retention) charts.retention.destroy();

    charts.retention = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: getThemeColor('--card-bg', '#ffffff'),
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 16, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                var pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ctx.label + ': ' + ctx.parsed + '% (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  /* ---------- 5. Model Accuracy Chart (Bar) ---------- */
  function buildModelChart(data) {
    var canvasEl = document.getElementById('mlAccuracyChart');
    if (!canvasEl) return;
    var ctx = canvasEl.getContext('2d');

    var labels = data.model_labels || ['Random Forest', 'Logistic Regression', 'Decision Tree'];
    var values = data.model_data || [92.5, 88.3, 85.1];

    if (charts.model) charts.model.destroy();

    charts.model = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Accuracy (%)',
          data: values,
          backgroundColor: ['#FF6B35', '#118AB2', '#06D6A0'],
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.parsed.y + '%';
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: function (val) { return val + '%'; }
            }
          }
        }
      }
    });
  }

  /* ---------- Mock data generators ---------- */
  function generateLast30Days() {
    var labels = [];
    for (var i = 29; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return labels;
  }

  function generateMockGrowth() {
    var data = [];
    var base = 50;
    for (var i = 0; i < 30; i++) {
      base += Math.floor(Math.random() * 15) - 3;
      if (base < 20) base = 20;
      data.push(base);
    }
    return data;
  }

  /* ---------- Public API ---------- */
  window.initDashboardCharts = function () {
    fetch('/api/stats')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        buildGrowthChart(data);
        buildSkillsChart(data);
        buildCityChart(data);
        buildRetentionChart(data);
        buildModelChart(data);
      })
      .catch(function () {
        // Use mock data on failure
        var mock = {};
        buildGrowthChart(mock);
        buildSkillsChart(mock);
        buildCityChart(mock);
        buildRetentionChart(mock);
        buildModelChart(mock);
      });
  };

  /* ---------- Theme change handler ---------- */
  window.addEventListener('themeChanged', function () {
    applyThemeDefaults();
    Object.keys(charts).forEach(function (key) {
      if (charts[key]) {
        charts[key].options.plugins.legend.labels.color = Chart.defaults.color;
        charts[key].update();
      }
    });
  });

  /* ---------- Auto-init if on admin page ---------- */
  window.initDashboardCharts();
})();
