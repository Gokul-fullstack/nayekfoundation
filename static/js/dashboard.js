/* ============================================================
   dashboard.js — Volunteer Dashboard Controller
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  // Guard: Redirect to login if not authenticated
  if (!localStorage.getItem('token')) {
    window.location.href = '/login';
    return;
  }

  function riskLevel(score) {
    if (score >= 0.7) return 'Low';
    if (score >= 0.4) return 'Medium';
    return 'High';
  }

  function riskClass(level) {
    return 'risk-' + level.toLowerCase();
  }

  function loadDashboard() {
    window.authFetch('/api/volunteers/me')
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Not logged in or profile missing');
        }
        return res.json();
      })
      .then(function (data) {
        // Populate elements
        document.getElementById('welcomeName').textContent = 'Hello, ' + (data.name || 'Volunteer') + '!';
        document.getElementById('hoursVolunteered').textContent = (data.hours_volunteered || 0) + ' hrs';
        document.getElementById('eventsAttended').textContent = data.events_attended || 0;
        document.getElementById('activeCity').textContent = data.city || '—';

        // Populate Profile inputs
        document.getElementById('profileName').value = data.name || '';
        document.getElementById('profilePhone').value = data.phone || '';
        document.getElementById('profileAge').value = data.age || '';
        document.getElementById('profileCity').value = data.city || '';
        document.getElementById('profileState').value = data.state || '';
        
        var skillsJoined = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
        document.getElementById('profileSkills').value = skillsJoined;
        document.getElementById('profileBio').value = data.bio || '';

        // Registration date
        if (data.created_at) {
          var dateObj = new Date(data.created_at);
          var dateStr = dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          document.getElementById('signupDate').textContent = 'Joined NayePankh on ' + dateStr;
        }

        // Side card info
        document.getElementById('cardName').textContent = data.name || 'Volunteer';
        
        var statusCapitalized = (data.status || 'pending').charAt(0).toUpperCase() + (data.status || 'pending').slice(1);
        document.getElementById('cardRole').textContent = statusCapitalized + ' Volunteer';

        var avatarStr = (data.name || 'V').charAt(0).toUpperCase();
        document.getElementById('avatarIcon').textContent = avatarStr;

        // Account status badge
        var statusBadge = document.getElementById('accountStatus');
        if (statusBadge) {
          statusBadge.textContent = statusCapitalized;
          statusBadge.className = 'status-badge ' + (data.status || 'pending').toLowerCase();
        }

        document.getElementById('volunteerId').textContent = 'V-2026-' + String(data.id || 1).padStart(4, '0');

        // Engagement score ring (1 to 10 scale)
        var pct = (data.engagement_score || 0.0) * 10; // e.g. 7.5 -> 75%
        document.getElementById('engagementValue').textContent = (data.engagement_score || 0.0).toFixed(1) + '/10';
        document.getElementById('engagementRing').style.background =
          'conic-gradient(var(--primary) 0% ' + pct + '%, var(--border) ' + pct + '% 100%)';

        // Retention score prediction
        var retentionPct = ((data.retention_score || 0.0) * 100).toFixed(1);
        var level = riskLevel(data.retention_score);
        var predictEl = document.getElementById('retentionPredict');
        predictEl.innerHTML =
          'Retention Probability: <strong style="color:var(--primary);">' + retentionPct + '%</strong>' +
          '<br><span class="status-badge ' + riskClass(level) + '" style="margin-top:0.4rem; display:inline-block;">' + level + ' Risk</span>';

        // Recommended events
        var recEvents = data.recommended_events || [];
        var eventsHtml = '';
        recEvents.forEach(function (e) {
          eventsHtml +=
            '<div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.2rem; background: var(--glass-bg); margin-bottom:1rem; position:relative; overflow:hidden;">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">' +
                '<h4 style="font-weight:700; font-size:1rem; margin:0; color:var(--text);">' + e.title + '</h4>' +
                '<span style="font-size:0.75rem; color:var(--primary); font-weight:700; background:rgba(255,107,53,0.1); padding:0.2rem 0.6rem; border-radius:20px;">' + e.date + '</span>' +
              '</div>' +
              '<p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.8rem; line-height:1.5;">' + e.description + '</p>' +
              '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-muted);">' +
                '<span>📍 ' + e.location + '</span>' +
                '<span>👥 ' + e.volunteer_count + '+ joined</span>' +
              '</div>' +
            '</div>';
        });

        document.getElementById('recommendedEvents').innerHTML =
          eventsHtml || '<p style="color:var(--text-muted); font-size:0.9rem;">No matching events scheduled. Check back soon!</p>';
      })
      .catch(function (err) {
        showToastSafe('Failed to load dashboard. Redirecting to login...', 'error');
        setTimeout(function () {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }, 1200);
      });
  }

  // Handle profile form submit
  var profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = profileForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving changes...';
      }

      var payload = {
        name: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        age: parseInt(document.getElementById('profileAge').value, 10) || 18,
        city: document.getElementById('profileCity').value.trim(),
        state: document.getElementById('profileState').value.trim(),
        skills: document.getElementById('profileSkills').value.trim(),
        bio: document.getElementById('profileBio').value.trim()
      };

      if (!payload.name || !payload.city || !payload.state) {
        showToastSafe('Name, City, and State are required.', 'warning');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Update Profile Details';
        }
        return;
      }

      window.authFetch('/api/volunteers/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile Details';
          }
          if (data.error) {
            showToastSafe(data.error, 'error');
          } else {
            showToastSafe('Profile updated successfully!', 'success');
            loadDashboard();
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile Details';
          }
          showToastSafe('Failed to submit updates. Please try again.', 'error');
        });
    });
  }

  function showToastSafe(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

  // Load immediately
  loadDashboard();
})();
