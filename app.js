/* ==========================================================================
   OFFLINE DEVELOPER CAPSULE - CORE APPLICATION LOGIC
   ========================================================================== */

/* Lightweight Standalone Animation Engine (Offline Compatible) */
window.gsap = window.gsap || {
  from: function(target, opts) {
    const els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    els.forEach((el, index) => {
      if (!el) return;
      el.style.opacity = opts.opacity !== undefined ? opts.opacity : 0;
      el.style.transform = `translateY(${opts.y || 20}px)`;
      el.style.transition = `all ${opts.duration || 0.6}s cubic-bezier(0.16, 1, 0.3, 1) ${ (opts.stagger || 0) * index }s`;
      setTimeout(() => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      }, 50);
    });
  }
};

// Global Application State
let fileHandle = null;
let dashboardData = {
  snippets: [],
  network: []
};
let activeCategory = 'ALL';

// --------------------------------------------------------------------------
// 1. FILE SYSTEM ACCESS API & DATA DISK SYNC
// --------------------------------------------------------------------------
async function loadDefaultConfig() {
  try {
    const response = await fetch('config.json');
    if (response.ok) {
      dashboardData = await response.json();
      showToast("config.json yerel dosyadan yüklendi.");
    }
  } catch (e) {
    console.warn("Otomatik fetch engellendi. Dosya seçici kullanılabilir.", e);
  }
  renderAll();
}

async function selectConfigFile() {
  if (!('showOpenFilePicker' in window)) {
    showToast("Tarayıcınız File System Access API desteklemiyor. Manuel İndir modunu kullanabilirsiniz.", true);
    return;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Database',
        accept: { 'application/json': ['.json'] }
      }]
    });
    fileHandle = handle;
    const file = await fileHandle.getFile();
    const content = await file.text();
    dashboardData = JSON.parse(content);
    
    updateDiskStatusUI(true, fileHandle.name);
    renderAll();
    showToast(`Diskteki ${fileHandle.name} dosyası başarıyla bağlandı!`);
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      showToast("Dosya okuma hatası!", true);
    }
  }
}

async function saveToDisk() {
  if (!fileHandle) {
    updateDiskStatusUI(false);
    return;
  }
  try {
    const writable = await fileHandle.createWritable();
    dashboardData.lastUpdated = new Date().toISOString();
    await writable.write(JSON.stringify(dashboardData, null, 2));
    await writable.close();
    showToast("Değişiklikler anında diskteki config.json dosyasına yazıldı.");
  } catch (err) {
    console.error("Disk kayıt hatası:", err);
    showToast("Disk dosyasına yazma başarısız oldu!", true);
  }
}

function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dashboardData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "config.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("config.json indirildi.");
}

function updateDiskStatusUI(isConnected, filename = '') {
  const statusBox = document.getElementById('disk-status');
  const statusText = document.getElementById('disk-status-text');
  if (isConnected) {
    statusBox.classList.remove('disconnected');
    statusText.textContent = `Disk Bağlı (${filename})`;
  } else {
    statusBox.classList.add('disconnected');
    statusText.textContent = `config.json Bağlı Değil (Salt Okunur)`;
  }
}

// --------------------------------------------------------------------------
// 2. SNIPPET VAULT MODULE LOGIC
// --------------------------------------------------------------------------
function renderSnippets() {
  const container = document.getElementById('snippets-list');
  const searchQuery = document.getElementById('snippet-search').value.toLowerCase();
  
  const filtered = (dashboardData.snippets || []).filter(s => {
    const matchesCat = (activeCategory === 'ALL') || (s.category === activeCategory);
    const matchesSearch = s.title.toLowerCase().includes(searchQuery) ||
                          s.command.toLowerCase().includes(searchQuery) ||
                          (s.description && s.description.toLowerCase().includes(searchQuery)) ||
                          (s.shortcut && s.shortcut.toLowerCase().includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">Eşleşen komut bulunamadı.</div>`;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="snippet-item">
      <div class="snippet-info">
        <div class="snippet-meta">
          <span class="snippet-title">${escapeHTML(s.title)}</span>
          ${s.shortcut ? `<span class="shortcut-tag">${escapeHTML(s.shortcut)}</span>` : ''}
          <span class="net-badge">${escapeHTML(s.category)}</span>
        </div>
        ${s.description ? `<div class="snippet-desc">${escapeHTML(s.description)}</div>` : ''}
        <div class="snippet-code-box">${escapeHTML(s.command)}</div>
      </div>
      <div class="snippet-actions">
        <button class="btn-icon" title="Panoya Kopyala" onclick="copyToClipboard('${escapeJsString(s.command)}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
        </button>
        <button class="btn-icon" title="Düzenle" onclick="editSnippet('${s.id}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="btn-icon" title="Sil" onclick="deleteSnippet('${s.id}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Komut panoya kopyalandı!");
  }).catch(err => {
    console.error('Kopyalama hatası:', err);
  });
}

function saveSnippetForm(e) {
  e.preventDefault();
  const id = document.getElementById('snippet-id').value || 'snp-' + Date.now();
  const title = document.getElementById('snippet-input-title').value;
  const command = document.getElementById('snippet-input-command').value;
  const category = document.getElementById('snippet-input-category').value;
  const description = document.getElementById('snippet-input-desc').value;
  const shortcut = document.getElementById('snippet-input-shortcut').value;

  if (!dashboardData.snippets) dashboardData.snippets = [];
  const existingIndex = dashboardData.snippets.findIndex(s => s.id === id);
  const snippetObj = { id, title, command, category, description, shortcut };

  if (existingIndex >= 0) {
    dashboardData.snippets[existingIndex] = snippetObj;
  } else {
    dashboardData.snippets.push(snippetObj);
  }

  closeModal('modal-snippet');
  renderSnippets();
  saveToDisk();
}

function editSnippet(id) {
  const s = (dashboardData.snippets || []).find(item => item.id === id);
  if (!s) return;
  document.getElementById('snippet-id').value = s.id;
  document.getElementById('snippet-input-title').value = s.title;
  document.getElementById('snippet-input-command').value = s.command;
  document.getElementById('snippet-input-category').value = s.category;
  document.getElementById('snippet-input-desc').value = s.description || '';
  document.getElementById('snippet-input-shortcut').value = s.shortcut || '';
  document.getElementById('modal-snippet-title').textContent = "Komutu Düzenle";
  openModal('modal-snippet');
}

function deleteSnippet(id) {
  if (confirm("Bu komutu silmek istediğinize emin misiniz?")) {
    dashboardData.snippets = (dashboardData.snippets || []).filter(s => s.id !== id);
    renderSnippets();
    saveToDisk();
  }
}

// Keyboard Shortcuts Listener (Ctrl+1, Ctrl+2, etc.)
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && !e.shiftKey && !e.altKey) {
    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= 9) {
      const matched = (dashboardData.snippets || []).find(s => s.shortcut === `Ctrl+${keyNum}`);
      if (matched) {
        e.preventDefault();
        copyToClipboard(matched.command);
        showToast(`[Kısayol Ctrl+${keyNum}] "${matched.title}" kopyalandı!`);
      }
    }
  }
});

// --------------------------------------------------------------------------
// 3. NETWORK & PORT MAP MODULE LOGIC
// --------------------------------------------------------------------------
function renderNetwork() {
  const container = document.getElementById('network-list');
  const networkItems = dashboardData.network || [];

  if (networkItems.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">Kayıtlı ağ servisi bulunamadı.</div>`;
    return;
  }

  container.innerHTML = networkItems.map(net => {
    const fullUrl = `${net.protocol}://${net.ipHost}:${net.port}`;
    return `
      <div class="network-card">
        <div>
          <div class="network-header">
            <div class="network-title">${escapeHTML(net.name)}</div>
            <span class="net-badge">${escapeHTML(net.category || 'Servis')}</span>
          </div>
          <div class="network-desc">${escapeHTML(net.description || '')}</div>
          <div class="network-url">${escapeHTML(fullUrl)}</div>
        </div>
        <div class="network-footer">
          <div class="snippet-actions">
            <button class="btn-icon" title="Düzenle" onclick="editNetwork('${net.id}')">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-icon" title="Sil" onclick="deleteNetwork('${net.id}')">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
          <a href="${escapeHTML(fullUrl)}" target="_blank" class="btn-launch">
            <span>Aç</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function saveNetworkForm(e) {
  e.preventDefault();
  const id = document.getElementById('network-id').value || 'net-' + Date.now();
  const name = document.getElementById('net-input-name').value;
  const description = document.getElementById('net-input-desc').value;
  const ipHost = document.getElementById('net-input-host').value;
  const port = document.getElementById('net-input-port').value;
  const protocol = document.getElementById('net-input-protocol').value;
  const category = document.getElementById('net-input-category').value;

  if (!dashboardData.network) dashboardData.network = [];
  const existingIndex = dashboardData.network.findIndex(n => n.id === id);
  const netObj = { id, name, description, ipHost, port: parseInt(port), protocol, category };

  if (existingIndex >= 0) {
    dashboardData.network[existingIndex] = netObj;
  } else {
    dashboardData.network.push(netObj);
  }

  closeModal('modal-network');
  renderNetwork();
  saveToDisk();
}

function editNetwork(id) {
  const net = (dashboardData.network || []).find(item => item.id === id);
  if (!net) return;
  document.getElementById('network-id').value = net.id;
  document.getElementById('net-input-name').value = net.name;
  document.getElementById('net-input-desc').value = net.description || '';
  document.getElementById('net-input-host').value = net.ipHost;
  document.getElementById('net-input-port').value = net.port;
  document.getElementById('net-input-protocol').value = net.protocol;
  document.getElementById('net-input-category').value = net.category || '';
  openModal('modal-network');
}

function deleteNetwork(id) {
  if (confirm("Bu yerel ağ servisini silmek istediğinize emin misiniz?")) {
    dashboardData.network = (dashboardData.network || []).filter(n => n.id !== id);
    renderNetwork();
    saveToDisk();
  }
}

// --------------------------------------------------------------------------
// 4. GENERAL UI & UTILITIES
// --------------------------------------------------------------------------
function renderAll() {
  renderSnippets();
  renderNetwork();
  animateCardsEntrance();
}

function animateCardsEntrance() {
  if (window.gsap && window.gsap.from) {
    window.gsap.from('.bento-card', { opacity: 0, y: 25, stagger: 0.08, duration: 0.7 });
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(msg, isError = false) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.borderColor = 'var(--accent-rose)';
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="${isError ? 'var(--accent-rose)' : 'var(--accent-gold)'}" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    <span>${escapeHTML(msg)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

function escapeJsString(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadDefaultConfig();

  // Top Actions
  document.getElementById('btn-select-file').addEventListener('click', selectConfigFile);
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);

  // Search & Filters
  document.getElementById('snippet-search').addEventListener('input', renderSnippets);
  document.getElementById('snippet-category-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('pill')) {
      document.querySelectorAll('#snippet-category-filters .pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-cat');
      renderSnippets();
    }
  });

  // Modals Trigger
  document.getElementById('btn-add-snippet').addEventListener('click', () => {
    document.getElementById('snippet-id').value = '';
    document.getElementById('form-snippet').reset();
    document.getElementById('modal-snippet-title').textContent = "Yeni Komut Ekle";
    openModal('modal-snippet');
  });

  document.getElementById('btn-add-network').addEventListener('click', () => {
    document.getElementById('network-id').value = '';
    document.getElementById('form-network').reset();
    openModal('modal-network');
  });

  document.getElementById('form-snippet').addEventListener('submit', saveSnippetForm);
  document.getElementById('form-network').addEventListener('submit', saveNetworkForm);
});
