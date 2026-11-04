/**
 * VetFarm - Livestock Health, Auto-Diagnosis & Vet Scout Tracker
 * Pure Vanilla JavaScript with browser localStorage persistence.
 */

// Storage Key
const STORAGE_KEY = 'vetfarm_livestock_data';

// Application State
let animals = [];
let deleteTargetId = null;
let activeScoutTarget = 'add'; // 'add' or 'edit'

/* --------------------------------------------------------------------------
   Scouted Nearby Veterinary Doctors Directory
   -------------------------------------------------------------------------- */
const SCOUTED_VETS = [
  {
    id: 'vet_1',
    name: 'Dr. Rachel Thorne, DVM',
    clinic: 'Sunrise Farm Veterinary Clinic',
    category: 'cattle',
    specialties: 'Dairy & Beef Cattle, Mastitis, Bovine Pneumonia, Herd Health',
    distance: '1.8 km away',
    status: 'On Call • 24/7 Emergency Line',
    phone: '+1 (555) 019-2834',
    formattedString: 'Dr. Rachel Thorne (0803 555 0192) - Sunrise Farm Clinic'
  },
  {
    id: 'vet_2',
    name: 'Dr. Adam Vance, DVM',
    clinic: 'County Mobile Livestock Vet Services',
    category: 'ruminant',
    specialties: 'Boer Goats, Sheep, Caprine/Ovine Surgery, Swine Care',
    distance: '3.2 km away',
    status: 'Mobile Clinic • Rapid Farm Visit',
    phone: '+1 (555) 014-9921',
    formattedString: 'Dr. Adam Vance (0807 112 3344) - County Mobile Vet'
  },
  {
    id: 'vet_3',
    name: 'Dr. Amina Bello, DVM',
    clinic: 'AgroVet Avian & Poultry Diagnostics',
    category: 'poultry',
    specialties: 'Broilers, Layers, Flock Immunity, Newcastle, Coccidiosis',
    distance: '4.5 km away',
    status: 'Diagnostic Lab & Farm Consults',
    phone: '+1 (555) 018-7744',
    formattedString: 'Dr. Amina Bello (0802 999 8877) - AgroVet Poultry Lab'
  },
  {
    id: 'vet_4',
    name: 'Dr. Chukwudi Okafor, DVM',
    clinic: 'Apex Livestock & Herd Center',
    category: 'emergency',
    specialties: 'Large Ruminants, Beef Cattle, Swine, Emergency Surgery',
    distance: '2.7 km away',
    status: '24/7 Emergency Ambulatory Unit',
    phone: '+1 (555) 017-6622',
    formattedString: 'Dr. Chukwudi Okafor (0814 223 9900) - Apex Livestock Center'
  },
  {
    id: 'vet_5',
    name: 'Dr. Marcus Lee, DVM',
    clinic: 'Equine & Large Animal Critical Care',
    category: 'emergency',
    specialties: 'Horses, Colic Management, Cattle Dystocia, Emergency Care',
    distance: '5.1 km away',
    status: 'Ambulatory Farm Unit',
    phone: '+1 (555) 013-4411',
    formattedString: 'Dr. Marcus Lee (0809 334 5566) - Equine & Large Animal Care'
  },
  {
    id: 'vet_6',
    name: 'Dr. Sarah Jenkins, DVM',
    clinic: 'Green Valley Small Livestock & Exotic Vet',
    category: 'ruminant',
    specialties: 'Rabbits, Goats, Sheep, Parasitology & Preventive Care',
    distance: '3.8 km away',
    status: 'Field Calls & Clinical Consults',
    phone: '+1 (555) 012-3399',
    formattedString: 'Dr. Sarah Jenkins (0816 778 1122) - Green Valley Vet'
  }
];

/* --------------------------------------------------------------------------
   Comprehensive Veterinary Diagnostic Knowledge Base
   -------------------------------------------------------------------------- */
const DIAGNOSTIC_KNOWLEDGE_BASE = [
  // --- BOVINE / CATTLE ---
  {
    condition: 'Bovine Mastitis',
    species: ['cattle', 'cow', 'dairy', 'beef', 'heifer', 'calf'],
    keywords: ['mastitis', 'udder', 'teat', 'swollen udder', 'clots in milk', 'bloody milk', 'hard quarter', 'reduced milk', 'hot udder'],
    diagnosis: 'Possible Bovine Mastitis (Intramammary bacterial infection / inflammation)',
    treatment: 'Infuse intramammary antibiotic (e.g. Cloxacillin or Cephapirin) once daily for 3 days after complete milking. Strip affected quarter 3-4 times daily. Apply warm compresses. Administer Flunixin meglumine for pain/fever. Adhere strictly to the milk withdrawal period.',
    suggestedVetCategory: 'cattle'
  },
  {
    condition: 'Bovine Respiratory Disease (Pneumonia / Shipping Fever)',
    species: ['cattle', 'cow', 'dairy', 'beef', 'calf'],
    keywords: ['cough', 'coughing', 'nasal discharge', 'labored breathing', 'rapid breathing', 'panting', 'pneumonia', 'fever', 'runny nose'],
    diagnosis: 'Possible Bovine Respiratory Disease Complex (Infectious Pneumonia / Shipping Fever)',
    treatment: 'Administer broad-spectrum injectable antibiotic (e.g. Florfenicol 20mg/kg or Oxytetracycline 20% L.A. 20mg/kg). Provide Flunixin meglumine (1.1-2.2 mg/kg) to control pulmonary inflammation. Isolate in a well-ventilated, dry pen with clean water.',
    suggestedVetCategory: 'cattle'
  },
  {
    condition: 'Ruminal Tympany (Bloat)',
    species: ['cattle', 'cow', 'dairy', 'beef', 'goat', 'sheep'],
    keywords: ['bloat', 'bloated', 'distended', 'left flank', 'kicking belly', 'swollen stomach', 'rumen', 'frothy'],
    diagnosis: 'Possible Ruminal Tympany (Acute Frothy or Free-Gas Bloat)',
    treatment: 'For frothy bloat: Drench with anti-foaming agent (Poloxalene / Bloat Guard) or 150-250ml mineral oil / vegetable oil via stomach tube. Keep animal standing with front quarters elevated. Emergency: If in extreme respiratory distress, veterinary trocharization of left paralumbar fossa is required.',
    suggestedVetCategory: 'emergency'
  },
  {
    condition: 'Foot Rot (Interdigital Necrobacillosis)',
    species: ['cattle', 'cow', 'dairy', 'beef', 'goat', 'sheep'],
    keywords: ['foot', 'hoof', 'limping', 'lame', 'lameness', 'foul odor', 'swollen foot', 'interdigital', 'claws'],
    diagnosis: 'Possible Foot Rot (Fusobacterium necrophorum interdigital infection)',
    treatment: 'Clean and debride foot thoroughly with antiseptic wash (10% copper sulfate or povidone-iodine). Apply topical oxytetracycline spray. Administer systemic Long-Acting Oxytetracycline (20mg/kg) or Procaine Penicillin for 3-5 days. Move herd to dry ground.',
    suggestedVetCategory: 'cattle'
  },
  {
    condition: 'Hypocalcemia (Milk Fever)',
    species: ['cattle', 'cow', 'dairy'],
    keywords: ['milk fever', 'downer', 'cannot stand', 'unable to stand', 'post calving', 'calved', 'cold ears', 's-shape neck', 'hypocalcemia'],
    diagnosis: 'Possible Hypocalcemia (Milk Fever / Parturient Paresis)',
    treatment: 'Administer 500ml Calcium Borogluconate 23% solution slowly by intravenous route (warmed to body temperature while monitoring heart rate). Follow with oral calcium paste once swallowing reflex returns. Provide deep, non-slip bedding.',
    suggestedVetCategory: 'emergency'
  },

  // --- GOATS & SHEEP (SMALL RUMINANTS) ---
  {
    condition: 'Peste des Petits Ruminants (PPR)',
    species: ['goat', 'sheep', 'caprine', 'ovine', 'lamb', 'kid'],
    keywords: ['ppr', 'mouth sore', 'sores in mouth', 'crusty eyes', 'crusty nose', 'fever', 'discharge', 'diarrhea', 'ulcers in mouth'],
    diagnosis: 'Suspected Peste des Petits Ruminants (PPR / Goat Plague)',
    treatment: 'Quarantine infected animals immediately. Provide supportive care: Oxytetracycline 20% L.A. injection to prevent secondary bacterial pneumonia; oral rehydration electrolyte fluids; multivitamins; clean sores with dilute potassium permanganate. Notify nearest veterinary authority.',
    suggestedVetCategory: 'ruminant'
  },
  {
    condition: 'Contagious Caprine Pleuropneumonia (CCPP)',
    species: ['goat', 'kid'],
    keywords: ['ccpp', 'goat cough', 'grunting', 'painful breathing', 'chest pain', 'nasal discharge', 'fever', 'pleuropneumonia'],
    diagnosis: 'Possible Contagious Caprine Pleuropneumonia (CCPP - Mycoplasma capricolum)',
    treatment: 'Administer Tylosin tartrate (10mg/kg IM) or Oxytetracycline 20% (20mg/kg IM) immediately. Administer Meloxicam for fever and pleuritic pain. Keep sick goats in a warm, dust-free enclosure.',
    suggestedVetCategory: 'ruminant'
  },
  {
    condition: 'Coccidiosis / Parasitic Gastroenteritis (Haemonchosis)',
    species: ['goat', 'sheep', 'lamb', 'kid'],
    keywords: ['pale eyelids', 'famacha', 'bottle jaw', 'severe diarrhea', 'pot belly', 'worms', 'watery stool', 'anemia', 'weakness'],
    diagnosis: 'Possible Parasitic Gastroenteritis (Barber’s Pole Worm) or Coccidiosis',
    treatment: 'Administer anthelmintic drench (Albendazole 7.5mg/kg or Ivermectin 0.2mg/kg). For coccidiosis, administer Toltrazuril (Baycox) 20mg/kg oral single dose or Amprolium for 5 days. Provide oral iron and Vitamin B Complex with electrolyte fluids.',
    suggestedVetCategory: 'ruminant'
  },
  {
    condition: 'Contagious Ecthyma (Orf / Sore Mouth)',
    species: ['goat', 'sheep', 'lamb', 'kid'],
    keywords: ['orf', 'sore mouth', 'scabs on lips', 'pustules', 'scabby muzzle', 'blisters on mouth', 'refusing to eat'],
    diagnosis: 'Possible Contagious Ecthyma (Orf / Sore Mouth viral infection)',
    treatment: 'Self-limiting viral disease. Clean lesions gently with mild antiseptic and apply petroleum jelly or topical antibiotic cream. Provide soft, palatable feed. Note: Zoonotic potential — wear protective gloves when handling.',
    suggestedVetCategory: 'ruminant'
  },

  // --- POULTRY / BIRDS ---
  {
    condition: 'Avian Coccidiosis',
    species: ['poultry', 'chicken', 'broiler', 'layer', 'turkey', 'chick', 'bird', 'duck'],
    keywords: ['bloody droppings', 'blood in stool', 'reddish droppings', 'coccidiosis', 'huddling', 'ruffled feathers', 'drooping wings', 'coccidia'],
    diagnosis: 'Possible Avian Coccidiosis (Eimeria intestinal protozoal infection)',
    treatment: 'Administer Amprolium (0.024% in drinking water) continuously for 5 to 7 days, or Toltrazuril (Baycox 2.5% at 7mg/kg) in drinking water for 2 consecutive days. Strip damp bedding and replace with fresh dry wood shavings. Add Vitamin K & electrolytes.',
    suggestedVetCategory: 'poultry'
  },
  {
    condition: 'Newcastle Disease (NDV) / Infectious Bronchitis',
    species: ['poultry', 'chicken', 'broiler', 'layer', 'turkey', 'bird'],
    keywords: ['twisted neck', 'torticollis', 'gasping', 'greenish diarrhea', 'green stool', 'drop in egg', 'paralysis of wings', 'newcastle'],
    diagnosis: 'Suspected Newcastle Disease (NDV) or Avian Viral Complex',
    treatment: 'Quarantine affected birds immediately. Viral etiology — no antiviral cure. Provide supportive care: broad-spectrum antibiotic (Tylosin or Doxycycline in drinking water) for 5 days to counter secondary bacterial infection; high-potency multivitamins and electrolytes.',
    suggestedVetCategory: 'poultry'
  },
  {
    condition: 'Chronic Respiratory Disease (CRD / Mycoplasmosis)',
    species: ['poultry', 'chicken', 'broiler', 'layer', 'turkey'],
    keywords: ['swollen eye', 'facial swelling', 'foamy eyes', 'sneezing', 'snicking', 'rattling', 'rales', 'crd', 'nasal discharge'],
    diagnosis: 'Possible Chronic Respiratory Disease (CRD - Mycoplasma gallisepticum)',
    treatment: 'Administer Tylosin tartrate or Enrofloxacin 10% in flock drinking water for 3 to 5 days. Improve coop cross-ventilation, clear ammonia fumes, and sanitize water drinkers daily.',
    suggestedVetCategory: 'poultry'
  },
  {
    condition: 'Fowl Pox (Avian Pox)',
    species: ['poultry', 'chicken', 'turkey', 'bird'],
    keywords: ['fowl pox', 'wart', 'nodules on comb', 'scabs on wattle', 'scabby eyelids', 'yellow lesions in mouth'],
    diagnosis: 'Possible Fowl Pox (Dry Cutaneous or Wet Diphtheritic Pox)',
    treatment: 'Isolate affected birds. Dab dry skin lesions with Lugol’s iodine or gentian violet. Administer broad-spectrum water antibiotics to prevent secondary skin infections; boost with Vitamin A and multivitamins. Control mosquitoes in the poultry house.',
    suggestedVetCategory: 'poultry'
  },

  // --- PIGS / SWINE ---
  {
    condition: 'Swine Erysipelas (Diamond Skin Disease)',
    species: ['pig', 'swine', 'piglet', 'hog', 'sow', 'boar'],
    keywords: ['diamond skin', 'red skin patches', 'erysipelas', 'stiff gait', 'squealing', 'swine fever', 'stiff walk', 'high fever'],
    diagnosis: 'Possible Swine Erysipelas (Erysipelothrix rhusiopathiae / Diamond Skin Disease)',
    treatment: 'Administer Procaine Penicillin G (20,000 IU/kg IM) twice daily for 3 to 5 days. For high fever, administer Flunixin meglumine or Meloxicam. Disinfect pen and isolate infected pigs.',
    suggestedVetCategory: 'cattle'
  },
  {
    condition: 'African Swine Fever (ASF)',
    species: ['pig', 'swine', 'piglet', 'hog', 'sow', 'boar'],
    keywords: ['purple ears', 'blue ears', 'hemorrhages on belly', 'asf', 'african swine fever', 'vomiting blood', 'sudden death in pigs'],
    diagnosis: 'CRITICAL ALERT: Suspected African Swine Fever (ASF Viral Hemorrhagic Disease)',
    treatment: 'IMMEDIATE BIOSECURITY ACTION: No specific treatment or vaccine exists. Strict quarantine of premises required. Do not transport pigs or feed. Disinfect footwear with 2% sodium hydroxide or Virkon S. Immediately report to the State Veterinary Office.',
    suggestedVetCategory: 'emergency'
  },
  {
    condition: 'Piglet Scours (Colibacillosis / E. coli Diarrhea)',
    species: ['pig', 'piglet', 'swine'],
    keywords: ['piglet diarrhea', 'yellow watery stool', 'scours', 'shivering piglets', 'piglet dehydration'],
    diagnosis: 'Possible Piglet Colibacillosis (Enterotoxigenic E. coli Neonatal Scours)',
    treatment: 'Administer oral electrolytes with glucose via dosing syringe. Dose with oral Spectinomycin or Enrofloxacin. Ensure warm creep area (30–32°C) with dry bedding to prevent hypothermia.',
    suggestedVetCategory: 'cattle'
  },

  // --- HORSES & EQUINE ---
  {
    condition: 'Equine Colic',
    species: ['horse', 'donkey', 'equine', 'pony', 'foal'],
    keywords: ['colic', 'rolling', 'pawing ground', 'looking at flank', 'kicking abdomen', 'sweating', 'no gut sounds', 'stretching out'],
    diagnosis: 'URGENT: Possible Equine Colic (Acute Gastrointestinal Disturbance)',
    treatment: 'CRITICAL EMERGENCY: Remove all feed immediately. Walk horse quietly to prevent violent rolling and gut twisting. Administer Flunixin meglumine (Banamine 1.1 mg/kg IV) under veterinary advice. Urgent veterinary call required for nasogastric decompression.',
    suggestedVetCategory: 'emergency'
  },
  {
    condition: 'Strangles (Streptococcus equi)',
    species: ['horse', 'donkey', 'equine'],
    keywords: ['strangles', 'swollen lymph nodes', 'thick yellow snot', 'swollen throat', 'abscess under jaw'],
    diagnosis: 'Possible Equine Strangles (Streptococcus equi subspecies equi)',
    treatment: 'Strict isolation of horse and equipment. If abscesses are maturing, apply hot compresses to encourage draining. Clean open abscesses with dilute povidone-iodine. Administer Procaine Penicillin under veterinary direction.',
    suggestedVetCategory: 'emergency'
  },

  // --- RABBITS ---
  {
    condition: 'Snuffles (Pasteurellosis)',
    species: ['rabbit', 'bunny'],
    keywords: ['snuffles', 'white nasal discharge', 'wet front paws', 'sneezing rabbit', 'rabbit cold'],
    diagnosis: 'Possible Rabbit Snuffles (Pasteurella multocida respiratory infection)',
    treatment: 'Administer Enrofloxacin (Baytril 10mg/kg orally) for 10-14 days. Flush eyes with sterile saline. Improve cage ventilation, eliminate wood shavings emitting aromatic phenols, and maintain dry hutch.',
    suggestedVetCategory: 'ruminant'
  },
  {
    condition: 'Rabbit Gastrointestinal Stasis (GI Stasis)',
    species: ['rabbit', 'bunny'],
    keywords: ['stopped eating', 'no droppings', 'tiny fecal pellets', 'grinding teeth', 'rabbit lethargy', 'gi stasis'],
    diagnosis: 'URGENT: Possible Rabbit Gastrointestinal Stasis (Gut Hypomotility)',
    treatment: 'Administer infant Simethicone drops (1ml orally) for gas relief. Syringe feed Recovery Critical Care mash. Administer subcutaneous fluid hydration and Meloxicam for pain under vet guidance. Provide unlimited timothy hay.',
    suggestedVetCategory: 'ruminant'
  },

  // --- GENERAL / SYSTEMIC FALLBACK ---
  {
    condition: 'Systemic Febrile Infection / Acute Bacterial Illness',
    species: ['all'],
    keywords: ['fever', 'high temperature', 'loss of appetite', 'not eating', 'off feed', 'lethargic', 'dull', 'weak', 'depressed'],
    diagnosis: 'Possible Acute Febrile Syndrome (Systemic Bacterial or Viral Infection)',
    treatment: 'Administer broad-spectrum Long-Acting Oxytetracycline 20% (20mg/kg IM) or Amoxicillin trihydrate. Provide supportive rehydration therapy (electrolytes in drinking water or oral drench). Administer Vitamin B Complex and isolate in quiet, shaded shelter.',
    suggestedVetCategory: 'emergency'
  }
];

// Default sample farm records with diagnostic fields
const SAMPLE_ANIMALS = [
  {
    id: 'demo_1',
    animalType: 'Dairy Cattle (Friesian)',
    symptoms: 'Swollen left rear quarter, slight fever (39.5°C), clots in milk, and reduced yield.',
    diagnosis: 'Possible Bovine Mastitis (Intramammary bacterial infection / inflammation)',
    treatment: 'Intramammary antibiotic infusion once daily for 3 days after complete milking; frequent stripping of affected quarter; warm compress; Flunixin meglumine for fever. Respect milk withdrawal.',
    vetNearby: 'Dr. Rachel Thorne (0803 555 0192) - Sunrise Farm Clinic',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'demo_2',
    animalType: 'Boer Goat',
    symptoms: 'Persistent dry cough, labored breathing, nasal discharge, reduced grazing activity.',
    diagnosis: 'Possible Contagious Caprine Pleuropneumonia (CCPP) or Caprine Pneumonia',
    treatment: 'Oxytetracycline 20% L.A. (20mg/kg body weight IM); multivitamins; Meloxicam for chest pain; isolate in dry, draft-free pen.',
    vetNearby: 'Dr. Adam Vance (0807 112 3344) - County Mobile Vet',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'demo_3',
    animalType: 'Poultry (Broiler Chickens)',
    symptoms: 'Ruffled feathers, lethargy, huddling near heat, reddish bloody droppings.',
    diagnosis: 'Possible Avian Coccidiosis (Eimeria intestinal protozoal infection)',
    treatment: 'Amprolium (0.024% in drinking water) for 5-7 days; replace damp bedding with clean wood shavings; provide Vitamin K and electrolytes.',
    vetNearby: 'Dr. Amina Bello (0802 999 8877) - AgroVet Poultry Lab',
    createdAt: Date.now() - 3600000 * 5
  }
];

/* --------------------------------------------------------------------------
   DOM Element References
   -------------------------------------------------------------------------- */
const addAnimalForm = document.getElementById('addAnimalForm');
const animalTypeInput = document.getElementById('animalType');
const vetNearbyInput = document.getElementById('vetNearby');
const symptomsInput = document.getElementById('symptoms');
const diagnosisInput = document.getElementById('diagnosis');
const treatmentInput = document.getElementById('treatment');

const animalTypeError = document.getElementById('animalTypeError');
const vetNearbyError = document.getElementById('vetNearbyError');
const symptomsError = document.getElementById('symptomsError');
const diagnosisError = document.getElementById('diagnosisError');
const treatmentError = document.getElementById('treatmentError');

const autoGenerateBtn = document.getElementById('autoGenerateBtn');
const scoutVetsAddBtn = document.getElementById('scoutVetsAddBtn');

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
const editDiagnosisInput = document.getElementById('editDiagnosis');
const editTreatmentInput = document.getElementById('editTreatment');

const editAnimalTypeError = document.getElementById('editAnimalTypeError');
const editVetNearbyError = document.getElementById('editVetNearbyError');
const editSymptomsError = document.getElementById('editSymptomsError');
const editDiagnosisError = document.getElementById('editDiagnosisError');
const editTreatmentError = document.getElementById('editTreatmentError');

const editAutoGenerateBtn = document.getElementById('editAutoGenerateBtn');
const scoutVetsEditBtn = document.getElementById('scoutVetsEditBtn');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteModalMessage = document.getElementById('deleteModalMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Scout Modal Elements
const scoutModal = document.getElementById('scoutModal');
const closeScoutModalBtn = document.getElementById('closeScoutModalBtn');
const closeScoutFooterBtn = document.getElementById('closeScoutFooterBtn');
const scoutedVetsListEl = document.getElementById('scoutedVetsList');
const scoutCategoryFilters = document.getElementById('scoutCategoryFilters');
const scoutedVetsDatalist = document.getElementById('scoutedVetsDatalist');

// Toast Notification
const toastEl = document.getElementById('toast');
let toastTimer = null;

/* --------------------------------------------------------------------------
   Initialization & Storage Management
   -------------------------------------------------------------------------- */

function init() {
  loadFromStorage();
  populateScoutedVetsDatalist();
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
    showToast('Failed to save to browser storage. Check storage limits.', 'danger');
  }
}

// Populate datalist with scouted vets for easy typing
function populateScoutedVetsDatalist() {
  if (!scoutedVetsDatalist) return;
  scoutedVetsDatalist.innerHTML = SCOUTED_VETS.map(vet => 
    `<option value="${escapeHTML(vet.formattedString)}">${escapeHTML(vet.name)} (${escapeHTML(vet.distance)})</option>`
  ).join('');
}

/* --------------------------------------------------------------------------
   Auto-Diagnosis & Treatment Generator Engine
   -------------------------------------------------------------------------- */

/**
 * Intelligent symptom matching against veterinary knowledge base
 */
function analyzeSymptoms(symptomsText, animalType = '') {
  if (!symptomsText || !symptomsText.trim()) {
    return null;
  }

  const cleanSymptoms = symptomsText.toLowerCase();
  const cleanAnimalType = (animalType || '').toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of DIAGNOSTIC_KNOWLEDGE_BASE) {
    let score = 0;

    // Check species affinity
    const matchesSpecies = entry.species.includes('all') || 
      entry.species.some(sp => cleanAnimalType.includes(sp));

    if (matchesSpecies) {
      score += 2;
    }

    // Check keywords in symptoms
    for (const kw of entry.keywords) {
      if (cleanSymptoms.includes(kw.toLowerCase())) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // If no high-confidence disease matched, return intelligent generalized fallback
  if (!bestMatch || highestScore <= 2) {
    bestMatch = DIAGNOSTIC_KNOWLEDGE_BASE.find(e => e.condition.includes('Systemic Febrile Infection'));
  }

  // Find recommended scouted vet for this category
  let matchedVet = SCOUTED_VETS.find(v => v.category === bestMatch.suggestedVetCategory);
  if (!matchedVet) {
    matchedVet = SCOUTED_VETS[0];
  }

  return {
    conditionName: bestMatch.condition,
    diagnosis: bestMatch.diagnosis,
    treatment: bestMatch.treatment,
    suggestedVet: matchedVet.formattedString
  };
}

/**
 * Handle Auto-Generate trigger for Add Form
 */
function handleAutoGenerateAdd() {
  const symptoms = symptomsInput.value.trim();
  const animalType = animalTypeInput.value.trim();

  if (!symptoms) {
    symptomsError.textContent = 'Please enter symptoms first to auto-generate diagnosis and treatment.';
    symptomsInput.classList.add('input-error');
    symptomsInput.focus();
    return;
  }

  symptomsError.textContent = '';
  symptomsInput.classList.remove('input-error');

  const result = analyzeSymptoms(symptoms, animalType);
  if (result) {
    diagnosisInput.value = result.diagnosis;
    treatmentInput.value = result.treatment;
    
    // If vet nearby is empty, auto-scout and fill the closest specialist
    if (!vetNearbyInput.value.trim()) {
      vetNearbyInput.value = result.suggestedVet;
    }

    showToast(`Auto-generated diagnosis: ${result.conditionName}!`, 'success');
  }
}

/**
 * Handle Auto-Generate trigger for Edit Form
 */
function handleAutoGenerateEdit() {
  const symptoms = editSymptomsInput.value.trim();
  const animalType = editAnimalTypeInput.value.trim();

  if (!symptoms) {
    editSymptomsError.textContent = 'Please enter symptoms first.';
    editSymptomsInput.classList.add('input-error');
    editSymptomsInput.focus();
    return;
  }

  editSymptomsError.textContent = '';
  editSymptomsInput.classList.remove('input-error');

  const result = analyzeSymptoms(symptoms, animalType);
  if (result) {
    editDiagnosisInput.value = result.diagnosis;
    editTreatmentInput.value = result.treatment;
    
    if (!editVetNearbyInput.value.trim()) {
      editVetNearbyInput.value = result.suggestedVet;
    }

    showToast(`Updated diagnosis to: ${result.conditionName}!`, 'success');
  }
}

/* --------------------------------------------------------------------------
   Scout Nearby Vets Feature
   -------------------------------------------------------------------------- */

function openScoutModal(target = 'add') {
  activeScoutTarget = target;
  renderScoutedVets('all');
  scoutModal.style.display = 'flex';
}

function closeScoutModal() {
  scoutModal.style.display = 'none';
}

function renderScoutedVets(filterCategory = 'all') {
  let list = SCOUTED_VETS;
  if (filterCategory !== 'all') {
    list = SCOUTED_VETS.filter(v => v.category === filterCategory);
  }

  scoutedVetsListEl.innerHTML = list.map(vet => `
    <div class="scout-card">
      <div class="scout-card-top">
        <div class="scout-doctor-name">
          <span>${escapeHTML(vet.name)}</span>
          <span class="verified-badge" title="Verified Licensed Farm Veterinarian">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
        </div>
        <span class="scout-distance">${escapeHTML(vet.distance)}</span>
      </div>

      <div class="scout-clinic">${escapeHTML(vet.clinic)}</div>
      <div class="scout-specialties"><strong>Specialties:</strong> ${escapeHTML(vet.specialties)}</div>
      <div style="font-size: 0.78rem; color: #15803d; font-weight: 600;">${escapeHTML(vet.status)}</div>

      <div class="scout-actions">
        <a href="tel:${escapeHTML(vet.phone.replace(/[^0-9+]/g, ''))}" class="scout-phone-link">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          ${escapeHTML(vet.phone)}
        </a>
        <button type="button" class="btn-select-vet" onclick="selectScoutedVet('${vet.id}')">
          Select This Vet
        </button>
      </div>
    </div>
  `).join('');
}

window.selectScoutedVet = function(vetId) {
  const vet = SCOUTED_VETS.find(v => v.id === vetId);
  if (!vet) return;

  if (activeScoutTarget === 'edit') {
    editVetNearbyInput.value = vet.formattedString;
    editVetNearbyError.textContent = '';
    editVetNearbyInput.classList.remove('input-error');
  } else {
    vetNearbyInput.value = vet.formattedString;
    vetNearbyError.textContent = '';
    vetNearbyInput.classList.remove('input-error');
  }

  closeScoutModal();
  showToast(`Selected ${vet.name} as nearby vet!`, 'success');
};

/* --------------------------------------------------------------------------
   Helper Functions (Security, Escaping, UI)
   -------------------------------------------------------------------------- */

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateId() {
  return 'vet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer);

  toastEl.textContent = message;
  toastEl.className = 'toast show ' + (type === 'danger' ? 'toast-danger' : 'toast-success');

  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 3200);
}

/* --------------------------------------------------------------------------
   Rendering Functions
   -------------------------------------------------------------------------- */

function render() {
  const total = animals.length;
  totalCountEl.textContent = total;

  const query = searchInput.value.trim().toLowerCase();
  
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
      const diagnosisMatch = (animal.diagnosis || '').toLowerCase().includes(query);
      const treatmentMatch = (animal.treatment || '').toLowerCase().includes(query);
      const vetMatch = (animal.vetNearby || '').toLowerCase().includes(query);
      return typeMatch || symptomsMatch || diagnosisMatch || treatmentMatch || vetMatch;
    });

    searchFeedbackEl.textContent = `Found ${filteredAnimals.length} of ${total} animals matching "${searchInput.value.trim()}"`;
  } else {
    searchFeedbackEl.textContent = '';
  }

  // Handle Empty States
  if (total === 0) {
    animalsListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    emptyTitleEl.textContent = 'No Livestock Animals Yet';
    emptyMessageEl.textContent = 'Your farm list is currently empty. Add your first livestock animal above to track health symptoms, auto-generate diagnoses, prescribed treatments, and scout nearby vets.';
    loadDemoBtn.style.display = 'inline-flex';
    return;
  }

  if (filteredAnimals.length === 0 && query.length > 0) {
    animalsListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    emptyTitleEl.textContent = 'No Matching Animals Found';
    emptyMessageEl.textContent = `No livestock records matched "${searchInput.value.trim()}". Try searching by animal, symptom, diagnosis, or vet.`;
    loadDemoBtn.style.display = 'none';
    return;
  }

  emptyStateEl.style.display = 'none';

  // Render Animal Cards
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

        <!-- Possible Diagnosis -->
        <div class="detail-block diagnosis-box">
          <span class="detail-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Possible Diagnosis
          </span>
          <p class="detail-content">${escapeHTML(animal.diagnosis || 'Diagnosis pending / unassigned')}</p>
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
   Form Validation & Add Livestock Record
   -------------------------------------------------------------------------- */

function clearFormErrors(isEdit = false) {
  if (isEdit) {
    editAnimalTypeError.textContent = '';
    editVetNearbyError.textContent = '';
    editSymptomsError.textContent = '';
    editDiagnosisError.textContent = '';
    editTreatmentError.textContent = '';
    editAnimalTypeInput.classList.remove('input-error');
    editVetNearbyInput.classList.remove('input-error');
    editSymptomsInput.classList.remove('input-error');
    editDiagnosisInput.classList.remove('input-error');
    editTreatmentInput.classList.remove('input-error');
  } else {
    animalTypeError.textContent = '';
    vetNearbyError.textContent = '';
    symptomsError.textContent = '';
    diagnosisError.textContent = '';
    treatmentError.textContent = '';
    animalTypeInput.classList.remove('input-error');
    vetNearbyInput.classList.remove('input-error');
    symptomsInput.classList.remove('input-error');
    diagnosisInput.classList.remove('input-error');
    treatmentInput.classList.remove('input-error');
  }
}

function handleAddAnimal(e) {
  e.preventDefault();
  clearFormErrors(false);

  const animalType = animalTypeInput.value.trim();
  const vetNearby = vetNearbyInput.value.trim();
  const symptoms = symptomsInput.value.trim();
  let diagnosis = diagnosisInput.value.trim();
  let treatment = treatmentInput.value.trim();

  // If symptoms are provided but diagnosis or treatment was left blank, auto-generate them
  if (symptoms && (!diagnosis || !treatment)) {
    const autoResult = analyzeSymptoms(symptoms, animalType);
    if (autoResult) {
      if (!diagnosis) diagnosis = autoResult.diagnosis;
      if (!treatment) treatment = autoResult.treatment;
    }
  }

  let hasError = false;

  if (!animalType) {
    animalTypeError.textContent = 'Please enter an animal type.';
    animalTypeInput.classList.add('input-error');
    hasError = true;
  }

  if (!vetNearby) {
    vetNearbyError.textContent = 'Please specify a nearby vet doctor or click "Auto-Scout Vets".';
    vetNearbyInput.classList.add('input-error');
    hasError = true;
  }

  if (!symptoms) {
    symptomsError.textContent = 'Please describe the observed symptoms.';
    symptomsInput.classList.add('input-error');
    hasError = true;
  }

  if (!diagnosis) {
    diagnosisError.textContent = 'Please enter or auto-generate a possible diagnosis.';
    diagnosisInput.classList.add('input-error');
    hasError = true;
  }

  if (!treatment) {
    treatmentError.textContent = 'Please enter or auto-generate the prescribed treatment.';
    treatmentInput.classList.add('input-error');
    hasError = true;
  }

  if (hasError) return;

  const newAnimal = {
    id: generateId(),
    animalType,
    symptoms,
    diagnosis,
    treatment,
    vetNearby,
    createdAt: Date.now()
  };

  animals.unshift(newAnimal);
  saveToStorage();

  addAnimalForm.reset();
  render();
  showToast(`Recorded ${animalType} with diagnosis & treatment!`, 'success');

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
  editDiagnosisInput.value = target.diagnosis || '';
  editTreatmentInput.value = target.treatment || '';

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
  let diagnosis = editDiagnosisInput.value.trim();
  let treatment = editTreatmentInput.value.trim();

  if (symptoms && (!diagnosis || !treatment)) {
    const autoResult = analyzeSymptoms(symptoms, animalType);
    if (autoResult) {
      if (!diagnosis) diagnosis = autoResult.diagnosis;
      if (!treatment) treatment = autoResult.treatment;
    }
  }

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

  if (!diagnosis) {
    editDiagnosisError.textContent = 'Please provide or generate a possible diagnosis.';
    editDiagnosisInput.classList.add('input-error');
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
      diagnosis,
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

  // Auto-generate buttons
  autoGenerateBtn.addEventListener('click', handleAutoGenerateAdd);
  editAutoGenerateBtn.addEventListener('click', handleAutoGenerateEdit);

  // Auto-suggest when user finishes typing symptoms (blur event) if diagnosis is empty
  symptomsInput.addEventListener('blur', () => {
    if (symptomsInput.value.trim() && !diagnosisInput.value.trim()) {
      handleAutoGenerateAdd();
    }
  });

  // Scout Nearby Vets Triggers
  scoutVetsAddBtn.addEventListener('click', () => openScoutModal('add'));
  scoutVetsEditBtn.addEventListener('click', () => openScoutModal('edit'));
  closeScoutModalBtn.addEventListener('click', closeScoutModal);
  closeScoutFooterBtn.addEventListener('click', closeScoutModal);

  // Scout Category Filter Chips
  scoutCategoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
      scoutCategoryFilters.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderScoutedVets(filter);
    }
  });

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
    showToast('Loaded sample livestock records with diagnoses!', 'success');
  });

  // Close modals when clicking on background backdrop
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === scoutModal) closeScoutModal();
  });

  // Close modals with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editModal.style.display === 'flex') closeEditModal();
      if (deleteModal.style.display === 'flex') closeDeleteModal();
      if (scoutModal.style.display === 'flex') closeScoutModal();
    }
  });
}

// Start application once DOM is loaded
document.addEventListener('DOMContentLoaded', init);
