/* ============================================================
   admin.js — Admin Dashboard Controller
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Guard: only run on admin page ---------- */
  var adminTable = document.getElementById('adminVolunteersTable');
  if (!adminTable) return;

  /* ==========================================================
     State
     ========================================================== */
  var volunteers = [];
  var filtered = [];
  var currentPage = 1;
  var perPage = 10;
  var sortColumn = '';
  var sortDirection = 'asc';

  /* ==========================================================
     DOM Refs
     ========================================================== */
  var tableBody = document.getElementById('adminVolunteersBody');
  var searchInput = document.getElementById('adminSearchInput');
  var statusFilter = document.getElementById('filterStatus');
  var riskFilter = null;
  var paginationContainer = document.getElementById('adminPagination');
  var pdfBtn = document.getElementById('btnGeneratePDF');
  var csvBtn = document.getElementById('btnExportCSV');
  var refreshBtn = null;
  var confirmModal = document.getElementById('confirmModal');
  var confirmYes = confirmModal ? confirmModal.querySelector('#modalConfirm') : null;
  var confirmNo = confirmModal ? confirmModal.querySelector('#modalCancel') : null;
  var confirmMessage = confirmModal ? confirmModal.querySelector('#modalText') : null;

  /* ==========================================================
     Load Volunteers
     ========================================================== */
  function loadVolunteers() {
    window.authFetch('/api/volunteers')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        volunteers = Array.isArray(data) ? data : (data.volunteers || []);
        applyFilters();
        loadStats();
      })
      .catch(function () {
        showToastSafe('Failed to load volunteers.', 'error');
      });
  }

  /* ==========================================================
     Load Stats
     ========================================================== */
  function loadStats() {
    window.authFetch('/api/stats')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        updateStatWidgets(data);
      })
      .catch(function () {
        // Silent fail for stats
      });
  }

  function updateStatWidgets(data) {
    var mapping = {
      'statTotalVolunteers': data.total_volunteers || volunteers.length,
      'statPendingApprovals': data.pending_count || 0,
      'statAvgRetention': Math.round((data.avg_retention_score || 0) * 100) + '%',
      'statActiveCities': data.active_cities || 0
    };

    Object.keys(mapping).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = mapping[id];
    });
  }

  /* ==========================================================
     Filter, Search, Sort
     ========================================================== */
  function applyFilters() {
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var statusVal = statusFilter ? statusFilter.value : '';
    var riskVal = riskFilter ? riskFilter.value : '';

    filtered = volunteers.filter(function (v) {
      // Search
      if (searchTerm) {
        var searchable = [
          v.name || v.full_name || '',
          v.city || '',
          v.skills || (Array.isArray(v.skill) ? v.skill.join(' ') : (v.skill || ''))
        ].join(' ').toLowerCase();
        if (searchable.indexOf(searchTerm) === -1) return false;
      }

      // Status filter
      if (statusVal && (v.status || '').toLowerCase() !== statusVal.toLowerCase()) {
        return false;
      }

      // Risk filter
      if (riskVal) {
        var risk = (v.retention_risk || v.risk || '').toLowerCase();
        if (risk !== riskVal.toLowerCase()) return false;
      }

      return true;
    });

    // Sort
    if (sortColumn) {
      filtered.sort(function (a, b) {
        var aVal = a[sortColumn] || '';
        var bVal = b[sortColumn] || '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    currentPage = 1;
    renderTable();
    renderPagination();
  }

  /* ==========================================================
     Render Table
     ========================================================== */
  function renderTable() {
    if (!tableBody) return;

    var start = (currentPage - 1) * perPage;
    var end = start + perPage;
    var page = filtered.slice(start, end);

    if (page.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center">No volunteers found.</td></tr>';
      return;
    }

    var html = '';
    page.forEach(function (v) {
      var id = v.id || v._id || '';
      var name = v.name || '—';
      var city = v.city || '—';
      var state = v.state || '—';
      var skills = Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || '—');
      var status = v.status || 'pending';
      
      var risk = v.retention ? v.retention.risk_level : (v.retention_score >= 0.7 ? 'low' : v.retention_score >= 0.4 ? 'medium' : 'high');
      var retScore = v.retention_score != null ? (v.retention_score * 100).toFixed(1) + '%' : '—';

      var statusClass = 'status-badge ' + status.toLowerCase();
      var riskClass = 'status-badge risk-' + risk.toLowerCase();

      html +=
        '<tr data-id="' + id + '">' +
          '<td>' + name + '</td>' +
          '<td>' + city + '</td>' +
          '<td>' + state + '</td>' +
          '<td>' + skills + '</td>' +
          '<td><span class="' + statusClass + '">' + capitalize(status) + '</span></td>' +
          '<td>' + retScore + '</td>' +
          '<td><span class="' + riskClass + '">' + capitalize(risk) + ' Risk</span></td>' +
          '<td style="text-align: right;" class="actions-cell">' +
            (status.toLowerCase() === 'pending' ?
              '<button class="btn btn-sm btn-success" data-id="' + id + '" data-action="approve" title="Approve" style="margin-right:0.3rem; padding:0.2rem 0.5rem; font-size:0.8rem;">Approve</button>' +
              '<button class="btn btn-sm btn-danger" data-id="' + id + '" data-action="reject" title="Reject" style="padding:0.2rem 0.5rem; font-size:0.8rem;">Reject</button>'
            :
              '<span class="text-muted">—</span>'
            ) +
          '</td>' +
        '</tr>';
    });

    tableBody.innerHTML = html;
  }

  /* ==========================================================
     Pagination
     ========================================================== */
  function renderPagination() {
    if (!paginationContainer) return;

    var totalPages = Math.ceil(filtered.length / perPage);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    var html = '';

    // Prev
    html += '<button class="page-btn" data-page="prev" ' + (currentPage === 1 ? 'disabled' : '') + '>&laquo;</button>';

    // Pages
    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== totalPages) {
        if (i === currentPage - 3 || i === currentPage + 3) {
          html += '<span class="page-ellipsis">…</span>';
        }
        continue;
      }
      html += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }

    // Next
    html += '<button class="page-btn" data-page="next" ' + (currentPage === totalPages ? 'disabled' : '') + '>&raquo;</button>';

    paginationContainer.innerHTML = html;
  }

  /* ==========================================================
     Event Listeners
     ========================================================== */

  // Search
  if (searchInput) {
    var searchDebounce = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(applyFilters, 300);
    });
  }

  // Status filter
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  // Risk filter
  if (riskFilter) {
    riskFilter.addEventListener('change', applyFilters);
  }

  // Sort headers
  document.querySelectorAll('[data-sort]').forEach(function (header) {
    header.style.cursor = 'pointer';
    header.addEventListener('click', function () {
      var col = this.getAttribute('data-sort');
      if (sortColumn === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = col;
        sortDirection = 'asc';
      }

      // Update header indicators
      document.querySelectorAll('[data-sort]').forEach(function (h) {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      this.classList.add('sort-' + sortDirection);

      applyFilters();
    });
  });

  // Pagination clicks
  if (paginationContainer) {
    paginationContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;

      var page = btn.getAttribute('data-page');
      var totalPages = Math.ceil(filtered.length / perPage);

      if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
      } else if (page === 'next') {
        currentPage = Math.min(totalPages, currentPage + 1);
      } else {
        currentPage = parseInt(page, 10);
      }

      renderTable();
      renderPagination();
    });
  }

  /* ==========================================================
     Approve / Reject (with confirmation modal)
     ========================================================== */
  var pendingAction = null;

  // Delegate click on table
  if (tableBody) {
    tableBody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="approve"], [data-action="reject"]');
      if (!btn) return;

      var id = btn.getAttribute('data-id');
      var action = btn.getAttribute('data-action');

      if (confirmModal) {
        pendingAction = { id: id, action: action };
        if (confirmMessage) {
          confirmMessage.textContent = 'Are you sure you want to ' + action + ' this volunteer?';
        }
        confirmModal.classList.add('active');
      } else {
        executeAction(id, action);
      }
    });
  }

  // Confirm Yes
  if (confirmYes) {
    confirmYes.addEventListener('click', function () {
      if (pendingAction) {
        executeAction(pendingAction.id, pendingAction.action);
        pendingAction = null;
      }
      confirmModal.classList.remove('active');
    });
  }

  // Confirm No
  if (confirmNo) {
    confirmNo.addEventListener('click', function () {
      pendingAction = null;
      confirmModal.classList.remove('active');
    });
  }

  // Close modal on overlay click
  if (confirmModal) {
    confirmModal.addEventListener('click', function (e) {
      if (e.target === confirmModal) {
        pendingAction = null;
        confirmModal.classList.remove('active');
      }
    });
  }

  function executeAction(id, action) {
    var newStatus = action === 'approve' ? 'approved' : 'rejected';

    window.authFetch('/api/volunteers/' + id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) {
          showToastSafe(data.error, 'error');
          return;
        }

        showToastSafe('Volunteer ' + newStatus + ' successfully!', 'success');

        // Update local data
        volunteers.forEach(function (v) {
          if ((v.id || v._id) == id) {
            v.status = newStatus;
          }
        });
        applyFilters();
      })
      .catch(function () {
        showToastSafe('Action failed. Please try again.', 'error');
      });
  }

  /* ==========================================================
     PDF / CSV Downloads
     ========================================================== */
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function () {
      downloadFile('/api/report/pdf', 'nayepankh_report.pdf');
    });
  }

  if (csvBtn) {
    csvBtn.addEventListener('click', function () {
      downloadFile('/api/export/csv', 'volunteers_export.csv');
    });
  }

  function downloadFile(url, filename) {
    showToastSafe('Generating file…', 'info');

    window.authFetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(function (blob) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showToastSafe('Download started!', 'success');
      })
      .catch(function () {
        showToastSafe('Download failed. Please try again.', 'error');
      });
  }

  /* ==========================================================
     Refresh Button
     ========================================================== */
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      showToastSafe('Refreshing data…', 'info');
      loadVolunteers();

      if (typeof window.initDashboardCharts === 'function') {
        window.initDashboardCharts();
      }

      if (typeof window.refreshMap === 'function') {
        window.refreshMap();
      }
    });
  }

  /* ==========================================================
     Helpers
     ========================================================== */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showToastSafe(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    }
  }

  /* ==========================================================
     Init
     ========================================================== */
  loadVolunteers();

  // Init charts if available
  if (typeof window.initDashboardCharts === 'function') {
    window.initDashboardCharts();
  }
})();
