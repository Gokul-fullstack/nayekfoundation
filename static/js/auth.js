/* ============================================================
   auth.js — Authentication Handling
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     Utility Functions (exposed globally)
     ========================================================== */

  window.getToken = function () {
    return localStorage.getItem('token');
  };

  window.getRole = function () {
    return localStorage.getItem('role');
  };

  window.isLoggedIn = function () {
    return !!window.getToken();
  };

  window.logout = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  window.authFetch = function (url, options) {
    options = options || {};
    options.headers = options.headers || {};
    var token = window.getToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
    }
    return fetch(url, options);
  };

  /* ==========================================================
     LOGIN FORM
     ========================================================== */
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = loginForm.querySelector('[name="email"], #login-email');
      var password = loginForm.querySelector('[name="password"], #login-password');
      var submitBtn = loginForm.querySelector('button[type="submit"], .btn-submit');

      if (!email || !password) return;

      var emailVal = email.value.trim();
      var passVal = password.value.trim();

      // Validate
      if (!emailVal || !passVal) {
        showToastSafe('Please fill in all fields.', 'warning');
        return;
      }

      if (!isValidEmail(emailVal)) {
        showToastSafe('Please enter a valid email address.', 'warning');
        return;
      }

      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
      }

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: passVal })
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (result) {
          if (result.ok && result.data.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('role', result.data.role || 'volunteer');
            showToastSafe('Login successful! Redirecting...', 'success');

            setTimeout(function () {
              var role = result.data.role || 'volunteer';
              window.location.href = role === 'admin' ? '/admin' : '/dashboard';
            }, 800);
          } else {
            showToastSafe(result.data.message || result.data.error || 'Invalid credentials.', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Log In';
            }
          }
        })
        .catch(function () {
          showToastSafe('Network error. Please try again.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
          }
        });
    });
  }

  /* ==========================================================
     REGISTRATION FORM — Multi-step Wizard
     ========================================================== */
  var registerForm = document.getElementById('register-form');
  if (registerForm) {
    var panels = registerForm.querySelectorAll('.wizard-panel');
    var steps = document.querySelectorAll('.wizard-step');
    var progressBar = document.querySelector('.wizard-progress-bar, .wizard-progress');
    var currentStep = 0;
    var totalSteps = panels.length || 4;

    /* ---------- Show a specific step ---------- */
    function showStep(index) {
      panels.forEach(function (panel, i) {
        panel.classList.toggle('active', i === index);
        panel.style.display = i === index ? '' : 'none';
      });

      steps.forEach(function (step, i) {
        step.classList.remove('active', 'completed');
        if (i < index) step.classList.add('completed');
        if (i === index) step.classList.add('active');
      });

      if (progressBar) {
        var pct = ((index) / (totalSteps - 1)) * 100;
        progressBar.style.width = pct + '%';
      }

      currentStep = index;

      if (index === 3) {
        updateReviewPanel();
      }
    }

    function updateReviewPanel() {
      var name = document.getElementById('regName') ? document.getElementById('regName').value : '';
      var age = document.getElementById('regAge') ? document.getElementById('regAge').value : '';
      var email = document.getElementById('regEmail') ? document.getElementById('regEmail').value : '';
      var phone = document.getElementById('regPhone') ? document.getElementById('regPhone').value : '';
      var bio = document.getElementById('regBio') ? document.getElementById('regBio').value : '';

      var selectedSkills = [];
      registerForm.querySelectorAll('input[name="skills"]:checked').forEach(function (cb) {
        selectedSkills.push(cb.value);
      });
      var skillsText = selectedSkills.join(', ') || 'None';

      var city = document.getElementById('regCity') ? document.getElementById('regCity').value : '';
      var state = document.getElementById('regState') ? document.getElementById('regState').value : '';

      var availInput = registerForm.querySelector('input[name="availability"]:checked');
      var availability = availInput ? availInput.value : 'Not specified';

      var lat = document.getElementById('regLat') ? document.getElementById('regLat').value : '';
      var lng = document.getElementById('regLng') ? document.getElementById('regLng').value : '';
      var locText = (lat && lng) ? lat + ', ' + lng : 'Not detected';

      var personalDiv = document.getElementById('reviewPersonal');
      if (personalDiv) {
        personalDiv.innerHTML =
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.95rem;">' +
            '<div><strong>Name:</strong> ' + name + '</div>' +
            '<div><strong>Age:</strong> ' + age + '</div>' +
            '<div style="grid-column: span 2;"><strong>Email:</strong> ' + email + '</div>' +
            '<div style="grid-column: span 2;"><strong>Phone:</strong> ' + phone + '</div>' +
          '</div>';
      }

      var skillsDiv = document.getElementById('reviewSkills');
      if (skillsDiv) {
        skillsDiv.innerHTML =
          '<div style="font-size:0.95rem;">' +
            '<div style="margin-bottom:0.5rem;"><strong>Selected Skills:</strong> ' + skillsText + '</div>' +
            '<div><strong>Short Bio:</strong> ' + (bio || 'No bio provided.') + '</div>' +
          '</div>';
      }

      var availDiv = document.getElementById('reviewAvailability');
      if (availDiv) {
        availDiv.innerHTML =
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.95rem;">' +
            '<div><strong>City:</strong> ' + city + '</div>' +
            '<div><strong>State:</strong> ' + state + '</div>' +
            '<div style="grid-column: span 2;"><strong>Availability:</strong> ' + availability + '</div>' +
            '<div style="grid-column: span 2;"><strong>Detected Coordinates:</strong> ' + locText + '</div>' +
          '</div>';
      }
    }

    /* ---------- Validation per step ---------- */
    function validateStep(index) {
      var panel = panels[index];
      if (!panel) return true;

      var requiredFields = panel.querySelectorAll('[required]');
      var valid = true;

      // Clear old errors
      panel.querySelectorAll('.form-error').forEach(function (el) {
        el.textContent = '';
        el.style.display = 'none';
      });

      requiredFields.forEach(function (field) {
        var val = field.value.trim();
        var errorEl = field.parentElement.querySelector('.form-error') ||
                      field.closest('.form-group, .form-field')?.querySelector('.form-error');

        if (!val) {
          valid = false;
          showFieldError(field, errorEl, 'This field is required.');
          return;
        }

        // Email
        if (field.type === 'email' && !isValidEmail(val)) {
          valid = false;
          showFieldError(field, errorEl, 'Please enter a valid email.');
          return;
        }

        // Password
        if (field.type === 'password' && val.length < 6) {
          valid = false;
          showFieldError(field, errorEl, 'Password must be at least 6 characters.');
          return;
        }

        // Phone
        if ((field.name === 'phone' || field.type === 'tel') && !/^\d{10}$/.test(val)) {
          valid = false;
          showFieldError(field, errorEl, 'Phone number must be 10 digits.');
          return;
        }
      });

      return valid;
    }

    function showFieldError(field, errorEl, msg) {
      field.classList.add('input-error');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
    }

    // Clear error on input
    registerForm.addEventListener('input', function (e) {
      var field = e.target;
      field.classList.remove('input-error');
      var errorEl = field.parentElement.querySelector('.form-error') ||
                    field.closest('.form-group, .form-field')?.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    });

    /* ---------- Next / Prev ---------- */
    window.nextStep = function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps - 1) {
        showStep(currentStep + 1);
      }
    };

    window.prevStep = function () {
      if (currentStep > 0) {
        showStep(currentStep - 1);
      }
    };

    // Wire up buttons
    registerForm.querySelectorAll('.btn-next, [data-action="next"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.nextStep();
      });
    });

    registerForm.querySelectorAll('.btn-prev, [data-action="prev"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.prevStep();
      });
    });

    /* ---------- Geolocation (optional) ---------- */
    var latField = registerForm.querySelector('[name="latitude"], #reg-latitude');
    var lngField = registerForm.querySelector('[name="longitude"], #reg-longitude');

    if (latField && lngField && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latField.value = pos.coords.latitude.toFixed(6);
          lngField.value = pos.coords.longitude.toFixed(6);
        },
        function () {
          // Geolocation denied or unavailable — silent fallback
        }
      );
    }

    /* ---------- Submit ---------- */
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateStep(currentStep)) return;

      var formData = new FormData(registerForm);
      var payload = {};
      formData.forEach(function (value, key) {
        // Handle multi-select / checkboxes
        if (payload[key]) {
          if (!Array.isArray(payload[key])) {
            payload[key] = [payload[key]];
          }
          payload[key].push(value);
        } else {
          payload[key] = value;
        }
      });

      var submitBtn = registerForm.querySelector('button[type="submit"], .btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
      }

      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (result) {
          if (result.ok && result.data.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('role', result.data.role || 'volunteer');
            showToastSafe('Registration successful! Welcome aboard! 🎉', 'success');

            setTimeout(function () {
              window.location.href = '/dashboard';
            }, 1000);
          } else {
            showToastSafe(result.data.message || result.data.error || 'Registration failed.', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Account';
            }
          }
        })
        .catch(function () {
          showToastSafe('Network error. Please try again.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
          }
        });
    });

    /* ---------- Init first step ---------- */
    showStep(0);
  }

  /* ==========================================================
     Helpers
     ========================================================== */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToastSafe(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

  /* ==========================================================
     Logout buttons
     ========================================================== */
  document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.logout();
    });
  });
})();
