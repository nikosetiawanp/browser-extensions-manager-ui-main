const themeToggleButton = document.getElementById('theme-toggle-button');
const filterButtonContainer = document.getElementById('filter-button-container');
const extensionsContainer = document.getElementById("extensions-container");
const filterButtonAll = document.getElementById("filter-button-all");
const filterButtonActive = document.getElementById("filter-button-active");
const filterButtonInactive = document.getElementById("filter-button-inactive");
const logo = document.getElementById("logo");
const removeModalBackdrop = document.getElementById("remove-modal-backdrop");
const removeModalTitle = document.getElementById("remove-modal-title");
const removeCancelButton = document.getElementById("remove-cancel-button");
const removeConfirmButton = document.getElementById("remove-confirm-button");
let activeFilter =  null;
let extensions = [];
let filteredExtensions = [];

// CONVERT IMG ALT
const extractFileName = (path) => {
  return path
  .split('/')
  .pop()
  .replace('.svg', ''); 
}

// HANDLE THEMES
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  document.documentElement.dataset.theme = savedTheme || 'dark';
  themeToggleButton.innerHTML = `<img src="./assets/images/icon-${savedTheme === 'dark' ? 'sun' : 'moon'}.svg" alt="icon-sun">`;
  if (savedTheme == 'dark') {
    logo.src = './assets/images/logo-light.svg'
  } else {
    logo.src = './assets/images/logo.svg'
  }
}
const toggleTheme = () => {
  const root = document.documentElement;
  const newTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeToggleButton.innerHTML = `<img src="./assets/images/icon-${newTheme === 'dark' ? 'sun' : 'moon'}.svg" alt="icon-sun">`;
  if (newTheme == 'dark') {
    logo.src = './assets/images/logo-light.svg'
  } else {
    logo.src = './assets/images/logo.svg'
  }
}
initTheme();

// TOGGLE EXTENSION ACTIVE STATUS
function toggleActive(id) {
  const updated = extensions.map((extension) => extension.id === id ? {...extension, isActive : !extension.isActive} : extension);
  extensions = updated;
  renderExtensions();
}

const renderFilters = () => {
  filterButtonAll.classList.remove('active');
  filterButtonAll.classList.add('inactive');

  filterButtonActive.classList.remove('active');
  filterButtonActive.classList.add('inactive');

  filterButtonInactive.classList.remove('active');
  filterButtonInactive.classList.add('inactive');

  if (activeFilter == null) {
    filterButtonAll.className = 'filter-button active'
  } else if (activeFilter == true) {
    filterButtonActive.className = 'filter-button active';
  } else {
    filterButtonInactive.className = 'filter-button active';
  } 
}

// FILTER DATA
const applyFilter = (parameter) => {
  activeFilter = parameter;
  renderExtensions();
  renderFilters();
}

// GET DATA ON INITIAL LOAD
const getExtensions = () => {
  if (extensions.length !== 0) return;
  fetch('data.json')
  .then(response => response.json())
  .then(array => {
    extensions = array.map((obj, index) =>  ({id: index, ...obj}));
    renderExtensions();
    renderFilters();
  })
  .catch(error => {
    extensionsContainer.innerHTML = `<p>Error loading data</p>`;
    console.error('Fetch error:', error);
  });
}

// RENDER DATA
const renderExtensions = () => {  
  const filtered = extensions.filter((extension) => typeof activeFilter === 'boolean' ? extension.isActive == activeFilter : true);
  extensionsContainer.innerHTML = filtered
  .map((extension) => {
    return `
    <div class="extension-card">
      <div class="extension-card-info">
        <img src="${extension.logo}" alt="${extractFileName(extension.logo)}">
        <div class="extension-card-text-container">
          <span class="extension-card-title">${extension.name}</span>
          <p class="extension-card-paragraph">${extension.description}</p>
        </div>
      </div>
      <div class="extension-card-menu">
        <button class="extension-card-remove-button" onclick="openRemoveModal(${extension.id})">Remove</button>
        <button class="extension-card-switch ${extension.isActive ? 'active' : 'inactive'}" onclick="toggleActive(${extension.id})">
          <div class="extension-card-switch-circle"></div>
        </button>
      </div>
    </div>
    `
  }).join('');
  };

//RENDER MODAL
const openRemoveModal = (id) => {
  const extension = extensions.find((extension) => extension.id == id);  
  removeModalTitle.innerHTML = `Remove ${extension.name}?`
  removeModalBackdrop.classList.remove('hidden');
  removeConfirmButton.addEventListener('click', () => removeExtension(id));
}
const closeRemoveModal = () => {
  removeModalBackdrop.classList.add('hidden');
}
const removeExtension = (id) => {
  filtered = extensions.filter((extension) => extension.id !== id)
  extensions = filtered;
  renderExtensions();
  closeRemoveModal();
}

getExtensions();
  themeToggleButton.addEventListener('click', toggleTheme);
  filterButtonAll.addEventListener('click', () => applyFilter(null));
  filterButtonActive.addEventListener('click', () => applyFilter(true));
  filterButtonInactive.addEventListener('click', () => applyFilter(false));
  removeCancelButton.addEventListener('click', () => closeRemoveModal());