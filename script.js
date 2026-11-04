/**
 * VetFarm - Livestock Health & Treatment Tracker
 * Simple, vanilla JavaScript application using localStorage.
 */

// Storage Key
const STORAGE_KEY = 'vetfarm_livestock_data';

// Application State
let animals = [];
let deleteTargetId = null;

// DOM Element References
const addAnimalForm = document.getElementById('addAnimalForm');
const animalTypeInput = document.getElementById('animalType');
const vetNearbyInput = document.getElementById('vetNearby');
const symptomsInput = document.getElementById('symptoms');
const treatmentInput = document.getElementById('treatment');

const animalTypeError = document.getElementById('animalTypeError');
const vetNearbyError = document.getElementById('vetNearbyError');
const symptomsError = document.getElementById('symptomsError');
const treatmentError = document.getElementById('treatmentError');

const totalCountEl = document.getElementById('totalCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchFeedbackEl = document.getElementById('searchFeedback');

const animalsListEl = document.getElementById('animalsList');
const emptyStateEl = document.getElementById('emptyState');
const emptyTitleEl = document.getElementById('emptyTitle');
const emptyMessageEl = document.getElementById('emptyMessage');
const loadDemoBtn = document.getElementById('loadDemoBtn');

// Edit Modal Elements
const editModal = document.getElementById('editModal');
const editAnimalForm = document.getElementById('editAnimalForm');
const editAnimalIdInput = document.getElementById('editAnimalId');
const editAnimalTypeInput = document.getElementById('editAnimalType');
const editVetNearbyInput = document.getElementById('editVetNearby');
const editSymptomsInput = document.getElementById('editSymptoms');
const editTreatmentInput = document.getElementById('editTreatment');

const editAnimalTypeError = document.getElementById('editAnimalTypeError');
const editVetNearbyError = document.getElementById('editVetNearbyError');
const editSymptomsError = document.getElementById('editSymptomsError');
const editTreatmentError = document.getElementById('editTreatmentError');

const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteModalMessage = document.getElementById('deleteModalMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Toast Notification
const toastEl = document.getElementById('toast');
let toastTimer = null;

// Realistic sample records for demonstration / one-click test
const SAMPLE_ANIMALS = [
  {
    id: 'demo_1',
    animalType: 'Dairy Cattle (Friesian)',
    symptoms: 'Swollen left rear quarter, slight fever (39.5°C), and mild mastitis.',
    treatment: 'Intramammary antibiotic infusion once daily for 3 days; frequent stripping of affected quarter; warm compress.',
    vetNearby: 'Dr. Rachel Thorne (0803 555 0192) - Sunrise Farm Clinic',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'demo_2',
    animalType: 'Boer Goat',
    symptoms: 'Persistent dry cough, nasal discharge, reduced grazing activity.',
    treatment: 'Oxytetracycline 20% L.A. (1ml per 10kg body weight); multivitamins; isolate in dry, draft-free pen.',
    vetNearby: 'Dr. Adam Vance (0807 112 3344) - County Mobile Vet',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'demo_3',
    animalType: 'Poultry (Broiler Chickens)',
    symptoms: 'Ruffled feathers, lethargy, huddling, reddish watery droppings.',
    treatment: 'Amprolium anticoccidial in drinking water for 5 days; replace damp bedding with dry wood shavings.',
    vetNearby: 'AgroVet Supplies & Clinic (0802 999 8877)',
    createdAt: Date.now() - 3600000 * 5
  }
];

/* --------------------------------------------------------------------------
   Initialization & Storage Management
   -------------------------------------------------------------------------- */

function init() {
  loadFromStorage();
  attachEventListeners();
  render();
}

function loadFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        animals = parsed;
      } else {
        animals = [];
      }
    } else {
      animals = [];
    }
  } catch (err) {
    console.error('Error reading localStorage data:', err);
    animals = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
    showToast('Failed to save to browser storage. Check your storage limits.', 'danger');
  }
}

/* --------------------------------------------------------------------------
   Helper Functions (Security, Escaping, UI)
   -------------------------------------------------------------------------- */

// HTML Escaper to prevent Cross-Site Scripting (XSS)
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Generate unique ID
function generateId() {
  return 'vet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// Format relative/readable date
function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Display temporary feedback toast
function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer);

  toastEl.textContent = message;
  toastEl.className = 'toast show ' + (type === 'danger' ? 'toast-danger' : 'toast-success');

  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 3000);
}

/* --------------------------------------------------------------------------
   Rendering Functions
   -------------------------------------------------------------------------- */

function render() {
  // 1. Update total count at the top
  const total = animals.length;
  totalCountEl.textContent = total;

  // 2. Filter list based on search term
  const query = searchInput.value.trim().toLowerCase();
  
  // Show / hide search clear button
  if (query.length > 0) {
    clearSearchBtn.style.display = 'block';
  } else {
    clearSearchBtn.style.display = 'none';
  }

  let filteredAnimals = animals;
  if (query.length > 0) {
    filteredAnimals = animals.filter(animal => {
      const typeMatch = (animal.animalType || '').toLowerCase().includes(query);
      const symptomsMatch = (animal.symptoms || '').toLowerCase().includes(query);
      const treatmentMatch = (animal.treatment || '').toLowerCase().includes(query);
      const vetMatch = (animal.vetNearby || '').toLowerCase().includes(query);
      return typeMatch || symptomsMatch || treatmentMatch || vetMatch;
    });

    searchFeedbackEl.textContent = `Found ${filteredAnimals.length} of ${total} animals matching "${searchInput.value.trim()}"`;
  } else {
    searchFeedbackEl.textContent = '';
  }

  // 3. Handle Empty States
  if (total === 0) {
    // Farm has no livestock records at all
    animalsListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    emptyTitleEl.textContent = 'No Livestock Animals Yet';
    emptyMessageEl.textContent = 'Your farm list is currently empty. Add your first livestock animal above to track health symptoms, prescribed treatments, and vet contacts safely.';
    loadDemoBtn.style.display = 'inline-flex';
    return;
  }

  if (filteredAnimals.length === 0 && query.length > 0) {
    // Search yielded no results
    animalsListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    emptyTitleEl.textContent = 'No Matching Animals Found';
    emptyMessageEl.textContent = `No livestock records matched "${searchInput.value.trim()}". Try searching by another symptom, treatment, or animal type.`;
    loadDemoBtn.style.display = 'none';
    return;
  }

  // Hide empty state when we have items to show
  emptyStateEl.style.display = 'none';

  // 4. Render Animal Cards
  animalsListEl.innerHTML = filteredAnimals.map(animal => `
    <article class="animal-card" data-id="${animal.id}">
      <header class="card-top">
        <div class="animal-type-badge">
          <span class="animal-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z"></path>
            </svg>
          </span>
          <span>${escapeHTML(animal.animalType)}</span>
        </div>
        ${animal.createdAt ? `<span style="font-size: 0.75rem; color: var(--text-light);">${formatDate(animal.createdAt)}</span>` : ''}
      </header>

      <div class="card-body">
        <!-- Symptoms -->
        <div class="detail-block">
          <span class="detail-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Symptoms Observed
          </span>
          <p class="detail-content">${escapeHTML(animal.symptoms)}</p>
        </div>

        <!-- Prescribed Treatment -->
        <div class="detail-block treatment-box">
          <span class="detail-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Prescribed Treatment
          </span>
          <p class="detail-content">${escapeHTML(animal.treatment)}</p>
        </div>

        <!-- Vet Nearby -->
        <div class="detail-block vet-box">
          <span class="detail-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Vet Nearby
          </span>
          <p class="detail-content">${escapeHTML(animal.vetNearby)}</p>
        </div>
      </div>

      <footer class="card-footer">
        <button type="button" class="btn btn-secondary btn-sm action-btn-edit" onclick="handleEditClick('${animal.id}')" aria-label="Edit this animal">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button type="button" class="btn btn-sm action-btn-delete" onclick="handleDeleteClick('${animal.id}')" aria-label="Delete this animal">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </footer>
    </article>
  `).join('');
}

/* --------------------------------------------------------------------------
   Form Validation & Add Livestock
   -------------------------------------------------------------------------- */

function clearFormErrors(isEdit = false) {
  if (isEdit) {
    editAnimalTypeError.textContent = '';
    editVetNearbyError.textContent = '';
    editSymptomsError.textContent = '';
    editTreatmentError.textContent = '';
    editAnimalTypeInput.classList.remove('input-error');
    editVetNearbyInput.classList.remove('input-error');
    editSymptomsInput.classList.remove('input-error');
    editTreatmentInput.classList.remove('input-error');
  } else {
    animalTypeError.textContent = '';
    vetNearbyError.textContent = '';
    symptomsError.textContent = '';
    treatmentError.textContent = '';
    animalTypeInput.classList.remove('input-error');
    vetNearbyInput.classList.remove('input-error');
    symptomsInput.classList.remove('input-error');
    treatmentInput.classList.remove('input-error');
  }
}

function handleAddAnimal(e) {
  e.preventDefault();
  clearFormErrors(false);

  const animalType = animalTypeInput.value.trim();
  const vetNearby = vetNearbyInput.value.trim();
  const symptoms = symptomsInput.value.trim();
  const treatment = treatmentInput.value.trim();

  let hasError = false;

  if (!animalType) {
    animalTypeError.textContent = 'Please enter an animal type.';
    animalTypeInput.classList.add('input-error');
    hasError = true;
  }

  if (!vetNearby) {
    vetNearbyError.textContent = 'Please provide nearby vet information or clinic.';
    vetNearbyInput.classList.add('input-error');
    hasError = true;
  }

  if (!symptoms) {
    symptomsError.textContent = 'Please describe the observed symptoms.';
    symptomsInput.classList.add('input-error');
    hasError = true;
  }

  if (!treatment) {
    treatmentError.textContent = 'Please enter the prescribed treatment or medication.';
    treatmentInput.classList.add('input-error');
    hasError = true;
  }

  if (hasError) return;

  const newAnimal = {
    id: generateId(),
    animalType,
    symptoms,
    treatment,
    vetNearby,
    createdAt: Date.now()
  };

  // Prepend to list (newest first)
  animals.unshift(newAnimal);
  saveToStorage();

  // Reset form and render
  addAnimalForm.reset();
  render();
  showToast(`Added ${animalType} to your livestock list!`, 'success');

  // If user was searching, clear search so they immediately see the new item
  if (searchInput.value.trim()) {
    searchInput.value = '';
    render();
  }
}

/* --------------------------------------------------------------------------
   Edit Animal Feature
   -------------------------------------------------------------------------- */

window.handleEditClick = function(id) {
  const target = animals.find(a => a.id === id);
  if (!target) return;

  clearFormErrors(true);

  editAnimalIdInput.value = target.id;
  editAnimalTypeInput.value = target.animalType || '';
  editVetNearbyInput.value = target.vetNearby || '';
  editSymptomsInput.value = target.symptoms || '';
  editTreatmentInput.value = target.treatment || '';

  // Open modal
  editModal.style.display = 'flex';
  editAnimalTypeInput.focus();
};

function handleSaveEdit(e) {
  e.preventDefault();
  clearFormErrors(true);

  const id = editAnimalIdInput.value;
  const animalType = editAnimalTypeInput.value.trim();
  const vetNearby = editVetNearbyInput.value.trim();
  const symptoms = editSymptomsInput.value.trim();
  const treatment = editTreatmentInput.value.trim();

  let hasError = false;

  if (!animalType) {
    editAnimalTypeError.textContent = 'Please enter an animal type.';
    editAnimalTypeInput.classList.add('input-error');
    hasError = true;
  }

  if (!vetNearby) {
    editVetNearbyError.textContent = 'Please enter nearby vet details.';
    editVetNearbyInput.classList.add('input-error');
    hasError = true;
  }

  if (!symptoms) {
    editSymptomsError.textContent = 'Please describe the symptoms.';
    editSymptomsInput.classList.add('input-error');
    hasError = true;
  }

  if (!treatment) {
    editTreatmentError.textContent = 'Please enter the prescribed treatment.';
    editTreatmentInput.classList.add('input-error');
    hasError = true;
  }

  if (hasError) return;

  const index = animals.findIndex(a => a.id === id);
  if (index !== -1) {
    animals[index] = {
      ...animals[index],
      animalType,
      vetNearby,
      symptoms,
      treatment,
      updatedAt: Date.now()
    };

    saveToStorage();
    closeEditModal();
    render();
    showToast(`Updated ${animalType} record successfully!`, 'success');
  }
}

function closeEditModal() {
  editModal.style.display = 'none';
  clearFormErrors(true);
}

/* --------------------------------------------------------------------------
   Delete Animal Feature (with Confirmation)
   -------------------------------------------------------------------------- */

window.handleDeleteClick = function(id) {
  const target = animals.find(a => a.id === id);
  if (!target) return;

  deleteTargetId = id;
  deleteModalMessage.textContent = `Are you sure you want to delete this record for "${target.animalType}"? This cannot be undone.`;
  deleteModal.style.display = 'flex';
};

function handleConfirmDelete() {
  if (!deleteTargetId) return;

  const target = animals.find(a => a.id === deleteTargetId);
  const typeName = target ? target.animalType : 'Animal';

  animals = animals.filter(a => a.id !== deleteTargetId);
  saveToStorage();

  closeDeleteModal();
  render();
  showToast(`Deleted ${typeName} from records.`, 'danger');
}

function closeDeleteModal() {
  deleteTargetId = null;
  deleteModal.style.display = 'none';
}

/* --------------------------------------------------------------------------
   Event Listeners & Setup
   -------------------------------------------------------------------------- */

function attachEventListeners() {
  // Add form submit
  addAnimalForm.addEventListener('submit', handleAddAnimal);

  // Edit form submit & close buttons
  editAnimalForm.addEventListener('submit', handleSaveEdit);
  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);

  // Delete modal buttons
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Search input & clear
  searchInput.addEventListener('input', () => {
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    render();
  });

  // Load sample demo data button
  loadDemoBtn.addEventListener('click', () => {
    animals = [...SAMPLE_ANIMALS];
    saveToStorage();
    render();
    showToast('Sample livestock records loaded!', 'success');
  });

  // Close modals when clicking on background backdrop
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Close modals with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editModal.style.display === 'flex') closeEditModal();
      if (deleteModal.style.display === 'flex') closeDeleteModal();
    }
  });
}

// Start application once DOM is ready
document.addEventListener('DOMContentLoaded', init);

