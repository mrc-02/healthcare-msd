// Centralized medical data configuration
// This file contains standardized disease names and doctor specializations
// Easy to modify and maintain for both doctors and patients

export const DOCTOR_SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Neurology', 
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'Psychiatry',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
  'Gastroenterology',
  'Endocrinology',
  'Rheumatology',
  'Pulmonology',
  'Urology',
  'Oncology',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Internal Medicine',
  'Family Medicine',
  'Sports Medicine',
  'Geriatrics',
  'Infectious Diseases'
]

export const DISEASE_CATEGORIES = {
  'General': [
    { id: 'fever', name: 'Fever', severity: 'medium' },
    { id: 'fatigue', name: 'Fatigue', severity: 'low' },
    { id: 'weight_loss', name: 'Weight Loss', severity: 'medium' },
    { id: 'night_sweats', name: 'Night Sweats', severity: 'medium' },
    { id: 'weakness', name: 'General Weakness', severity: 'low' },
    { id: 'loss_of_appetite', name: 'Loss of Appetite', severity: 'medium' }
  ],
  'Cardiovascular': [
    { id: 'chest_pain', name: 'Chest Pain', severity: 'high' },
    { id: 'shortness_breath', name: 'Shortness of Breath', severity: 'high' },
    { id: 'palpitations', name: 'Heart Palpitations', severity: 'medium' },
    { id: 'swelling_legs', name: 'Swelling in Legs', severity: 'medium' },
    { id: 'high_blood_pressure', name: 'High Blood Pressure', severity: 'high' },
    { id: 'irregular_heartbeat', name: 'Irregular Heartbeat', severity: 'high' }
  ],
  'Neurological': [
    { id: 'headache', name: 'Headache', severity: 'medium' },
    { id: 'dizziness', name: 'Dizziness', severity: 'medium' },
    { id: 'memory_loss', name: 'Memory Loss', severity: 'high' },
    { id: 'seizures', name: 'Seizures', severity: 'high' },
    { id: 'numbness', name: 'Numbness/Tingling', severity: 'medium' },
    { id: 'confusion', name: 'Confusion', severity: 'high' }
  ],
  'Respiratory': [
    { id: 'cough', name: 'Cough', severity: 'medium' },
    { id: 'sore_throat', name: 'Sore Throat', severity: 'medium' },
    { id: 'runny_nose', name: 'Runny Nose', severity: 'low' },
    { id: 'congestion', name: 'Nasal Congestion', severity: 'low' },
    { id: 'wheezing', name: 'Wheezing', severity: 'high' },
    { id: 'breathing_difficulty', name: 'Breathing Difficulty', severity: 'high' }
  ],
  'Digestive': [
    { id: 'nausea', name: 'Nausea', severity: 'medium' },
    { id: 'vomiting', name: 'Vomiting', severity: 'medium' },
    { id: 'diarrhea', name: 'Diarrhea', severity: 'medium' },
    { id: 'abdominal_pain', name: 'Abdominal Pain', severity: 'medium' },
    { id: 'constipation', name: 'Constipation', severity: 'low' },
    { id: 'heartburn', name: 'Heartburn', severity: 'low' }
  ],
  'Visual': [
    { id: 'blurred_vision', name: 'Blurred Vision', severity: 'high' },
    { id: 'eye_pain', name: 'Eye Pain', severity: 'medium' },
    { id: 'light_sensitivity', name: 'Light Sensitivity', severity: 'medium' },
    { id: 'double_vision', name: 'Double Vision', severity: 'high' },
    { id: 'dry_eyes', name: 'Dry Eyes', severity: 'low' },
    { id: 'red_eyes', name: 'Red Eyes', severity: 'medium' }
  ],
  'Musculoskeletal': [
    { id: 'joint_pain', name: 'Joint Pain', severity: 'medium' },
    { id: 'back_pain', name: 'Back Pain', severity: 'medium' },
    { id: 'muscle_pain', name: 'Muscle Pain', severity: 'low' },
    { id: 'stiffness', name: 'Joint Stiffness', severity: 'medium' },
    { id: 'swelling_joints', name: 'Swelling in Joints', severity: 'medium' },
    { id: 'limited_movement', name: 'Limited Movement', severity: 'medium' }
  ],
  'Skin': [
    { id: 'rash', name: 'Skin Rash', severity: 'medium' },
    { id: 'itching', name: 'Itching', severity: 'low' },
    { id: 'dry_skin', name: 'Dry Skin', severity: 'low' },
    { id: 'skin_discoloration', name: 'Skin Discoloration', severity: 'medium' },
    { id: 'moles_changes', name: 'Changes in Moles', severity: 'high' },
    { id: 'skin_bumps', name: 'Skin Bumps', severity: 'medium' }
  ],
  'Mental Health': [
    { id: 'anxiety', name: 'Anxiety', severity: 'medium' },
    { id: 'depression', name: 'Depression', severity: 'high' },
    { id: 'mood_swings', name: 'Mood Swings', severity: 'medium' },
    { id: 'sleep_problems', name: 'Sleep Problems', severity: 'medium' },
    { id: 'panic_attacks', name: 'Panic Attacks', severity: 'high' },
    { id: 'stress', name: 'Stress', severity: 'low' }
  ]
}

// Mapping of symptoms to recommended specializations
export const SYMPTOM_TO_SPECIALIZATION = {
  'General': ['General Medicine', 'Internal Medicine', 'Family Medicine'],
  'Cardiovascular': ['Cardiology', 'General Medicine'],
  'Neurological': ['Neurology', 'General Medicine'],
  'Respiratory': ['Pulmonology', 'ENT (Ear, Nose, Throat)', 'General Medicine'],
  'Digestive': ['Gastroenterology', 'General Medicine'],
  'Visual': ['Ophthalmology'],
  'Musculoskeletal': ['Orthopedics', 'Rheumatology', 'Sports Medicine'],
  'Skin': ['Dermatology', 'General Medicine'],
  'Mental Health': ['Psychiatry', 'General Medicine']
}

// Common diseases/conditions for easy reference
export const COMMON_CONDITIONS = [
  'Common Cold',
  'Flu (Influenza)',
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Migraine',
  'Arthritis',
  'Depression',
  'Anxiety',
  'Allergies',
  'Acid Reflux',
  'Bronchitis',
  'Pneumonia',
  'Urinary Tract Infection',
  'Skin Infection',
  'Conjunctivitis',
  'Sinusitis',
  'Gastritis',
  'Insomnia',
  'Back Pain'
]

// Severity levels with descriptions
export const SEVERITY_LEVELS = {
  'low': {
    label: 'Low',
    description: 'Mild symptoms, can wait for routine appointment',
    color: 'green',
    urgency: 'routine'
  },
  'medium': {
    label: 'Medium', 
    description: 'Moderate symptoms, should see doctor within 24-48 hours',
    color: 'yellow',
    urgency: 'soon'
  },
  'high': {
    label: 'High',
    description: 'Severe symptoms, seek immediate medical attention',
    color: 'red',
    urgency: 'urgent'
  }
}

// Helper functions
export const getSymptomsByCategory = (category) => {
  return DISEASE_CATEGORIES[category] || []
}

export const getRecommendedSpecializations = (symptoms) => {
  const specializations = new Set()
  
  symptoms.forEach(symptom => {
    const category = Object.keys(DISEASE_CATEGORIES).find(cat => 
      DISEASE_CATEGORIES[cat].some(s => s.id === symptom.id)
    )
    
    if (category && SYMPTOM_TO_SPECIALIZATION[category]) {
      SYMPTOM_TO_SPECIALIZATION[category].forEach(spec => specializations.add(spec))
    }
  })
  
  return Array.from(specializations)
}

export const getSeverityInfo = (severity) => {
  return SEVERITY_LEVELS[severity] || SEVERITY_LEVELS['low']
}

export const getAllSymptoms = () => {
  const allSymptoms = []
  Object.entries(DISEASE_CATEGORIES).forEach(([category, symptoms]) => {
    symptoms.forEach(symptom => {
      allSymptoms.push({
        ...symptom,
        category
      })
    })
  })
  return allSymptoms
}

// Export default configuration
export default {
  DOCTOR_SPECIALIZATIONS,
  DISEASE_CATEGORIES,
  SYMPTOM_TO_SPECIALIZATION,
  COMMON_CONDITIONS,
  SEVERITY_LEVELS,
  getSymptomsByCategory,
  getRecommendedSpecializations,
  getSeverityInfo,
  getAllSymptoms
}
