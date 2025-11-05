import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Calendar, Clock, User, Stethoscope, Brain, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Search, Filter, Star, MapPin, Phone, Mail, Award, Activity, Heart, Thermometer, Eye, Headphones, UserCircle, Droplet } from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentService, userService } from '../../services'
import { useApp } from '../../context/AppContext'
import { useAuthContext } from '../../context/AuthContext'
import { DISEASE_CATEGORIES, DOCTOR_SPECIALIZATIONS, SYMPTOM_TO_SPECIALIZATION, getRecommendedSpecializations, getSeverityInfo } from '../../config/medicalData'

const BookAppointment = () => {
  const { addAppointment } = useApp()
  const { user } = useAuthContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [symptoms, setSymptoms] = useState([])
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendedDoctors, setRecommendedDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm()
  const patientDetailsForm = useForm()

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // AI Symptom Checker Data - Now using centralized medical data
  const symptomCategories = DISEASE_CATEGORIES
  const specializations = DOCTOR_SPECIALIZATIONS

  // Static doctors data from Andhra Pradesh, Guntur
  const staticDoctors = [
    // Cardiology
    { _id: '1', name: 'Dr. Rajesh Kumar', specialization: 'Cardiology', rating: 4.8, reviewCount: 156, experience: 15, location: 'Guntur', bio: 'Senior Cardiologist with expertise in interventional cardiology and heart disease management.', phone: '+91-863-1234567', email: 'rajesh.kumar@hospital.com', consultationFee: 800, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '2', name: 'Dr. Priya Reddy', specialization: 'Cardiology', rating: 4.7, reviewCount: 134, experience: 12, location: 'Guntur', bio: 'Expert in cardiac surgery and preventive cardiology with focus on lifestyle modifications.', phone: '+91-863-1234568', email: 'priya.reddy@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '3', name: 'Dr. Venkata Rao', specialization: 'Cardiology', rating: 4.9, reviewCount: 189, experience: 18, location: 'Guntur', bio: 'Renowned cardiologist specializing in complex cardiac procedures and emergency care.', phone: '+91-863-1234569', email: 'venkata.rao@hospital.com', consultationFee: 900, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Neurology
    { _id: '4', name: 'Dr. Anitha Sharma', specialization: 'Neurology', rating: 4.6, reviewCount: 142, experience: 14, location: 'Guntur', bio: 'Specialist in neurological disorders, epilepsy, and stroke management.', phone: '+91-863-1234570', email: 'anitha.sharma@hospital.com', consultationFee: 850, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '5', name: 'Dr. Suresh Babu', specialization: 'Neurology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Expert in movement disorders, Parkinson\'s disease, and neuro-rehabilitation.', phone: '+91-863-1234571', email: 'suresh.babu@hospital.com', consultationFee: 800, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '6', name: 'Dr. Lakshmi Devi', specialization: 'Neurology', rating: 4.7, reviewCount: 123, experience: 13, location: 'Guntur', bio: 'Specialist in pediatric neurology and developmental disorders.', phone: '+91-863-1234572', email: 'lakshmi.devi@hospital.com', consultationFee: 750, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Dermatology
    { _id: '7', name: 'Dr. Ravi Kumar', specialization: 'Dermatology', rating: 4.5, reviewCount: 98, experience: 11, location: 'Guntur', bio: 'Expert in cosmetic dermatology, skin cancer treatment, and aesthetic procedures.', phone: '+91-863-1234573', email: 'ravi.kumar@hospital.com', consultationFee: 600, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '8', name: 'Dr. Sunitha Reddy', specialization: 'Dermatology', rating: 4.6, reviewCount: 112, experience: 10, location: 'Guntur', bio: 'Specialist in pediatric dermatology and allergic skin conditions.', phone: '+91-863-1234574', email: 'sunitha.reddy@hospital.com', consultationFee: 650, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '9', name: 'Dr. Krishna Mohan', specialization: 'Dermatology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in hair and nail disorders, psoriasis, and eczema treatment.', phone: '+91-863-1234575', email: 'krishna.mohan@hospital.com', consultationFee: 700, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Orthopedics
    { _id: '10', name: 'Dr. Srinivas Rao', specialization: 'Orthopedics', rating: 4.8, reviewCount: 178, experience: 17, location: 'Guntur', bio: 'Senior orthopedic surgeon specializing in joint replacement and sports medicine.', phone: '+91-863-1234576', email: 'srinivas.rao@hospital.com', consultationFee: 800, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '11', name: 'Dr. Padma Kumari', specialization: 'Orthopedics', rating: 4.6, reviewCount: 134, experience: 12, location: 'Guntur', bio: 'Expert in pediatric orthopedics and bone fracture treatment.', phone: '+91-863-1234577', email: 'padma.kumari@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '12', name: 'Dr. Ramesh Kumar', specialization: 'Orthopedics', rating: 4.9, reviewCount: 201, experience: 20, location: 'Guntur', bio: 'Renowned spine surgeon and expert in minimally invasive procedures.', phone: '+91-863-1234578', email: 'ramesh.kumar@hospital.com', consultationFee: 950, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Pediatrics
    { _id: '13', name: 'Dr. Geetha Devi', specialization: 'Pediatrics', rating: 4.7, reviewCount: 189, experience: 15, location: 'Guntur', bio: 'Senior pediatrician with expertise in neonatal care and child development.', phone: '+91-863-1234579', email: 'geetha.devi@hospital.com', consultationFee: 600, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '14', name: 'Dr. Mohan Reddy', specialization: 'Pediatrics', rating: 4.8, reviewCount: 156, experience: 13, location: 'Guntur', bio: 'Expert in pediatric emergency care and infectious diseases.', phone: '+91-863-1234580', email: 'mohan.reddy@hospital.com', consultationFee: 650, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '15', name: 'Dr. Swathi Sharma', specialization: 'Pediatrics', rating: 4.6, reviewCount: 142, experience: 11, location: 'Guntur', bio: 'Specialist in pediatric cardiology and congenital heart diseases.', phone: '+91-863-1234581', email: 'swathi.sharma@hospital.com', consultationFee: 700, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Gynecology
    { _id: '16', name: 'Dr. Radha Kumari', specialization: 'Gynecology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Senior gynecologist specializing in high-risk pregnancies and fertility treatment.', phone: '+91-863-1234582', email: 'radha.kumari@hospital.com', consultationFee: 750, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '17', name: 'Dr. Vijay Kumar', specialization: 'Gynecology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in laparoscopic surgery and gynecological oncology.', phone: '+91-863-1234583', email: 'vijay.kumar@hospital.com', consultationFee: 800, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '18', name: 'Dr. Meera Devi', specialization: 'Gynecology', rating: 4.9, reviewCount: 198, experience: 18, location: 'Guntur', bio: 'Renowned obstetrician and expert in maternal-fetal medicine.', phone: '+91-863-1234584', email: 'meera.devi@hospital.com', consultationFee: 850, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Psychiatry
    { _id: '19', name: 'Dr. Surya Prakash', specialization: 'Psychiatry', rating: 4.6, reviewCount: 123, experience: 12, location: 'Guntur', bio: 'Expert in adult psychiatry, anxiety disorders, and depression treatment.', phone: '+91-863-1234585', email: 'surya.prakash@hospital.com', consultationFee: 700, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '20', name: 'Dr. Kavitha Reddy', specialization: 'Psychiatry', rating: 4.7, reviewCount: 134, experience: 13, location: 'Guntur', bio: 'Specialist in child and adolescent psychiatry and behavioral disorders.', phone: '+91-863-1234586', email: 'kavitha.reddy@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '21', name: 'Dr. Nagesh Rao', specialization: 'Psychiatry', rating: 4.8, reviewCount: 156, experience: 15, location: 'Guntur', bio: 'Expert in addiction psychiatry and forensic psychiatry.', phone: '+91-863-1234587', email: 'nagesh.rao@hospital.com', consultationFee: 800, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Ophthalmology
    { _id: '22', name: 'Dr. Rajani Kumari', specialization: 'Ophthalmology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in cataract surgery and refractive procedures.', phone: '+91-863-1234588', email: 'rajani.kumari@hospital.com', consultationFee: 650, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '23', name: 'Dr. Satish Kumar', specialization: 'Ophthalmology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Specialist in retinal diseases and diabetic eye care.', phone: '+91-863-1234589', email: 'satish.kumar@hospital.com', consultationFee: 700, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '24', name: 'Dr. Uma Devi', specialization: 'Ophthalmology', rating: 4.6, reviewCount: 132, experience: 12, location: 'Guntur', bio: 'Expert in pediatric ophthalmology and strabismus treatment.', phone: '+91-863-1234590', email: 'uma.devi@hospital.com', consultationFee: 600, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // ENT
    { _id: '25', name: 'Dr. Prasad Rao', specialization: 'ENT', rating: 4.7, reviewCount: 134, experience: 13, location: 'Guntur', bio: 'Expert in ear, nose, and throat surgery with focus on hearing disorders.', phone: '+91-863-1234591', email: 'prasad.rao@hospital.com', consultationFee: 650, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '26', name: 'Dr. Jyothi Reddy', specialization: 'ENT', rating: 4.8, reviewCount: 156, experience: 15, location: 'Guntur', bio: 'Specialist in sinus surgery and allergy treatment.', phone: '+91-863-1234592', email: 'jyothi.reddy@hospital.com', consultationFee: 700, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '27', name: 'Dr. Ravi Shankar', specialization: 'ENT', rating: 4.6, reviewCount: 123, experience: 11, location: 'Guntur', bio: 'Expert in voice disorders and laryngeal surgery.', phone: '+91-863-1234593', email: 'ravi.shankar@hospital.com', consultationFee: 650, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Gastroenterology
    { _id: '28', name: 'Dr. Venkatesh Kumar', specialization: 'Gastroenterology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Senior gastroenterologist specializing in liver diseases and endoscopy.', phone: '+91-863-1234594', email: 'venkatesh.kumar@hospital.com', consultationFee: 800, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '29', name: 'Dr. Lakshmi Priya', specialization: 'Gastroenterology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in inflammatory bowel disease and digestive disorders.', phone: '+91-863-1234595', email: 'lakshmi.priya@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '30', name: 'Dr. Suresh Reddy', specialization: 'Gastroenterology', rating: 4.9, reviewCount: 189, experience: 18, location: 'Guntur', bio: 'Renowned hepatologist and expert in liver transplantation.', phone: '+91-863-1234596', email: 'suresh.reddy@hospital.com', consultationFee: 900, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Endocrinology
    { _id: '31', name: 'Dr. Anjali Sharma', specialization: 'Endocrinology', rating: 4.7, reviewCount: 134, experience: 13, location: 'Guntur', bio: 'Expert in diabetes management and thyroid disorders.', phone: '+91-863-1234597', email: 'anjali.sharma@hospital.com', consultationFee: 700, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '32', name: 'Dr. Krishna Rao', specialization: 'Endocrinology', rating: 4.8, reviewCount: 156, experience: 15, location: 'Guntur', bio: 'Specialist in pediatric endocrinology and growth disorders.', phone: '+91-863-1234598', email: 'krishna.rao@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '33', name: 'Dr. Meera Kumari', specialization: 'Endocrinology', rating: 4.6, reviewCount: 123, experience: 12, location: 'Guntur', bio: 'Expert in metabolic disorders and obesity management.', phone: '+91-863-1234599', email: 'meera.kumari@hospital.com', consultationFee: 650, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Rheumatology
    { _id: '34', name: 'Dr. Ramesh Kumar', specialization: 'Rheumatology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in arthritis treatment and autoimmune diseases.', phone: '+91-863-1234600', email: 'ramesh.kumar@hospital.com', consultationFee: 750, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '35', name: 'Dr. Sunitha Devi', specialization: 'Rheumatology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Specialist in lupus and connective tissue disorders.', phone: '+91-863-1234601', email: 'sunitha.devi@hospital.com', consultationFee: 800, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '36', name: 'Dr. Prasad Kumar', specialization: 'Rheumatology', rating: 4.6, reviewCount: 132, experience: 12, location: 'Guntur', bio: 'Expert in pediatric rheumatology and juvenile arthritis.', phone: '+91-863-1234602', email: 'prasad.kumar@hospital.com', consultationFee: 700, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Pulmonology
    { _id: '37', name: 'Dr. Venkata Reddy', specialization: 'Pulmonology', rating: 4.8, reviewCount: 178, experience: 17, location: 'Guntur', bio: 'Senior pulmonologist specializing in asthma and COPD management.', phone: '+91-863-1234603', email: 'venkata.reddy@hospital.com', consultationFee: 800, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '38', name: 'Dr. Geetha Kumari', specialization: 'Pulmonology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in sleep medicine and respiratory infections.', phone: '+91-863-1234604', email: 'geetha.kumari@hospital.com', consultationFee: 750, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '39', name: 'Dr. Mohan Kumar', specialization: 'Pulmonology', rating: 4.9, reviewCount: 201, experience: 19, location: 'Guntur', bio: 'Renowned interventional pulmonologist and lung cancer specialist.', phone: '+91-863-1234605', email: 'mohan.kumar@hospital.com', consultationFee: 900, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // Urology
    { _id: '40', name: 'Dr. Rajesh Reddy', specialization: 'Urology', rating: 4.7, reviewCount: 134, experience: 13, location: 'Guntur', bio: 'Expert in kidney stone treatment and minimally invasive urology.', phone: '+91-863-1234606', email: 'rajesh.reddy@hospital.com', consultationFee: 750, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '41', name: 'Dr. Priya Kumari', specialization: 'Urology', rating: 4.8, reviewCount: 156, experience: 15, location: 'Guntur', bio: 'Specialist in female urology and urinary incontinence treatment.', phone: '+91-863-1234607', email: 'priya.kumari@hospital.com', consultationFee: 800, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '42', name: 'Dr. Suresh Rao', specialization: 'Urology', rating: 4.6, reviewCount: 123, experience: 12, location: 'Guntur', bio: 'Expert in pediatric urology and congenital urological disorders.', phone: '+91-863-1234608', email: 'suresh.rao@hospital.com', consultationFee: 700, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },

    // Oncology
    { _id: '43', name: 'Dr. Anitha Reddy', specialization: 'Oncology', rating: 4.8, reviewCount: 167, experience: 16, location: 'Guntur', bio: 'Senior medical oncologist specializing in breast and lung cancer treatment.', phone: '+91-863-1234609', email: 'anitha.reddy@hospital.com', consultationFee: 850, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '44', name: 'Dr. Krishna Kumar', specialization: 'Oncology', rating: 4.7, reviewCount: 145, experience: 14, location: 'Guntur', bio: 'Expert in surgical oncology and cancer prevention strategies.', phone: '+91-863-1234610', email: 'krishna.kumar@hospital.com', consultationFee: 800, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '45', name: 'Dr. Lakshmi Devi', specialization: 'Oncology', rating: 4.9, reviewCount: 189, experience: 18, location: 'Guntur', bio: 'Renowned radiation oncologist and cancer research specialist.', phone: '+91-863-1234611', email: 'lakshmi.devi@hospital.com', consultationFee: 900, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },

    // General Medicine
    { _id: '46', name: 'Dr. Ravi Kumar', specialization: 'General Medicine', rating: 4.6, reviewCount: 198, experience: 20, location: 'Guntur', bio: 'Senior general physician with expertise in internal medicine and preventive care.', phone: '+91-863-1234612', email: 'ravi.kumar@hospital.com', consultationFee: 500, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { _id: '47', name: 'Dr. Sunitha Reddy', specialization: 'General Medicine', rating: 4.7, reviewCount: 167, experience: 15, location: 'Guntur', bio: 'Expert in chronic disease management and geriatric care.', phone: '+91-863-1234613', email: 'sunitha.reddy@hospital.com', consultationFee: 550, availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'] },
    { _id: '48', name: 'Dr. Prasad Rao', specialization: 'General Medicine', rating: 4.8, reviewCount: 189, experience: 17, location: 'Guntur', bio: 'Specialist in infectious diseases and travel medicine.', phone: '+91-863-1234614', email: 'prasad.rao@hospital.com', consultationFee: 600, availableSlots: ['08:30', '09:30', '10:30', '13:30', '14:30'] },
    { _id: '49', name: 'Dr. Meera Kumari', specialization: 'General Medicine', rating: 4.5, reviewCount: 134, experience: 12, location: 'Guntur', bio: 'Expert in family medicine and community health programs.', phone: '+91-863-1234615', email: 'meera.kumari@hospital.com', consultationFee: 500, availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00'] },
    { _id: '50', name: 'Dr. Venkatesh Kumar', specialization: 'General Medicine', rating: 4.6, reviewCount: 145, experience: 13, location: 'Guntur', bio: 'Specialist in emergency medicine and acute care management.', phone: '+91-863-1234616', email: 'venkatesh.kumar@hospital.com', consultationFee: 550, availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
  ]

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      // Try to load from API first
      const response = await userService.getDoctors()
      const apiDoctors = response.data?.doctors || []
      
      console.log('API Response:', response)
      console.log('API Doctors:', apiDoctors)
      
      // Always use API doctors if available, even if empty array
      setDoctors(apiDoctors)
      console.log('Loaded doctors from API:', apiDoctors.length)
      
      // If API returns empty array, also add static doctors as fallback
      if (apiDoctors.length === 0) {
        console.log('API returned no doctors, adding static data as fallback')
        setDoctors(prevDoctors => [...prevDoctors, ...staticDoctors])
      }
    } catch (error) {
      console.error('Network error loading doctors from API:', error.message)
      console.error('Error details:', error)
      
      // Fallback to static data if API fails
      setDoctors(staticDoctors)
      console.log('Using static doctors data as fallback:', staticDoctors.length)
    }
  }

  const handleSymptomToggle = (symptom) => {
    setSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id)
      if (exists) {
        return prev.filter(s => s.id !== symptom.id)
      } else {
        return [...prev, { ...symptom, severity: symptom.severity, duration: '', intensity: 'medium' }]
      }
    })
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error('Please select at least one symptom')
      return
    }

    setIsAnalyzing(true)
    
    // Simulate AI analysis (in real app, this would call an AI service)
    setTimeout(() => {
      const analysis = generateAIAnalysis(symptoms)
      setAiAnalysis(analysis)
      setRecommendedDoctors(getRecommendedDoctors(analysis))
      setIsAnalyzing(false)
      setCurrentStep(2)
    }, 2000)
  }

  const generateAIAnalysis = (selectedSymptoms) => {
    const highSeveritySymptoms = selectedSymptoms.filter(s => s.severity === 'high')
    const mediumSeveritySymptoms = selectedSymptoms.filter(s => s.severity === 'medium')
    
    let urgency = 'low'
    let suggestedSpecializations = []
    let preliminaryDiagnosis = []
    let recommendations = []

    // Analyze symptom patterns using centralized severity data
    if (highSeveritySymptoms.length > 0) {
      urgency = 'high'
    } else if (mediumSeveritySymptoms.length > 2) {
      urgency = 'medium'
    }

    // Use centralized function to get recommended specializations
    suggestedSpecializations = getRecommendedSpecializations(selectedSymptoms)

    // Generate preliminary diagnosis based on symptom categories
    const categories = [...new Set(selectedSymptoms.map(s => s.category))]
    categories.forEach(category => {
      switch (category) {
        case 'Cardiovascular':
          preliminaryDiagnosis.push('Possible cardiovascular condition')
          break
        case 'Neurological':
          preliminaryDiagnosis.push('Possible neurological condition')
          break
        case 'Respiratory':
          preliminaryDiagnosis.push('Possible respiratory condition')
          break
        case 'Digestive':
          preliminaryDiagnosis.push('Possible digestive condition')
          break
        case 'Visual':
          preliminaryDiagnosis.push('Possible eye condition')
          break
        case 'Musculoskeletal':
          preliminaryDiagnosis.push('Possible musculoskeletal condition')
          break
        case 'Skin':
          preliminaryDiagnosis.push('Possible skin condition')
          break
        case 'Mental Health':
          preliminaryDiagnosis.push('Possible mental health concern')
          break
        default:
          preliminaryDiagnosis.push('General health concern')
      }
    })

    // Generate recommendations based on severity
    const severityInfo = getSeverityInfo(urgency)
    if (urgency === 'high') {
      recommendations.push('Seek immediate medical attention')
      recommendations.push('Consider emergency care if symptoms worsen')
      recommendations.push('Do not delay seeking medical help')
    } else if (urgency === 'medium') {
      recommendations.push('Schedule appointment within 24-48 hours')
      recommendations.push('Monitor symptoms closely')
      recommendations.push('Avoid strenuous activities')
    } else {
      recommendations.push('Schedule routine appointment')
      recommendations.push('Continue monitoring symptoms')
      recommendations.push('Maintain healthy lifestyle')
    }

    return {
      urgency,
      suggestedSpecializations,
      preliminaryDiagnosis: [...new Set(preliminaryDiagnosis)],
      recommendations,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      analysisTime: new Date().toISOString(),
      severityInfo
    }
  }

  const getRecommendedDoctors = (analysis) => {
    return doctors.filter(doctor => 
      analysis.suggestedSpecializations.includes(doctor.specialization)
    ).sort((a, b) => b.rating - a.rating).slice(0, 5)
  }

  const getFilteredDoctorsBySymptoms = () => {
    if (symptoms.length === 0) {
      return []
    }

    // Use centralized function to get recommended specializations
    const relevantSpecializations = getRecommendedSpecializations(symptoms)

    // If no specific symptoms, show general medicine doctors
    if (relevantSpecializations.length === 0) {
      relevantSpecializations.push('General Medicine')
    }

    return doctors.filter(doctor => 
      relevantSpecializations.includes(doctor.specialization)
    ).sort((a, b) => b.rating - a.rating)
  }

  // Helper function to check if a doctor ID is from static data (not a MongoDB ObjectId)
  const isStaticDoctor = (doctorId) => {
    // MongoDB ObjectIds are 24-character hex strings
    // Static doctor IDs are simple strings like '1', '2', etc.
    if (!doctorId) return true
    const objectIdPattern = /^[0-9a-fA-F]{24}$/
    return !objectIdPattern.test(doctorId.toString())
  }

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor)
    setValue('doctor', doctor._id)
    
    // Load available slots for selected doctor
    // Skip API call for static doctors (they don't have valid MongoDB ObjectIds)
    if (isStaticDoctor(doctor._id)) {
      // Use static available slots from doctor data
      const fallbackSlots = doctor.availableSlots || generateDefaultTimeSlots()
      setAvailableSlots(fallbackSlots)
      console.log('Using static availability slots for doctor:', doctor.name, 'Slots:', fallbackSlots.length)
    } else {
      // Try to load from API for real doctors
      try {
        const today = new Date()
        const response = await appointmentService.getDoctorAvailability(doctor._id, today.toISOString().split('T')[0])
        setAvailableSlots(response.data?.availableSlots || [])
        console.log('Loaded availability from API for doctor:', doctor.name)
      } catch (error) {
        console.error('Network error loading availability from API, using static data:', error.message)
        // Use static available slots from doctor data as fallback
        const fallbackSlots = doctor.availableSlots || generateDefaultTimeSlots()
        setAvailableSlots(fallbackSlots)
        console.log('Using static availability slots for doctor:', doctor.name, 'Slots:', fallbackSlots.length)
      }
    }
    
    setCurrentStep(4)
  }

  const generateDefaultTimeSlots = () => {
    // Generate default time slots (9 AM to 5 PM, 30-minute intervals)
    const slots = []
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const onSubmit = async (data) => {
    // Store appointment data and proceed to patient details step
    setAppointmentData({
      ...data,
      symptoms: symptoms.map(s => ({
        name: s.name,
        severity: s.severity,
        duration: s.duration,
        intensity: s.intensity
      })),
      aiAnalysis: aiAnalysis,
      status: 'pending'
    })
    setCurrentStep(5) // Go to patient details step
  }

  const onSubmitPatientDetails = async (data) => {
    // Store patient details and proceed to payment
    setAppointmentData(prev => ({
      ...prev,
      patientDetails: data
    }))
    setCurrentStep(6) // Go to payment step
  }

  const handlePayment = async (paymentMethod) => {
    setIsProcessingPayment(true)
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Prepare symptoms string - ensure it's at least 10 characters
        const symptomsText = symptoms.map(symptom => symptom.name).join(', ')
        const symptomsDescription = symptomsText.length >= 10 
          ? symptomsText 
          : `Symptoms: ${symptomsText}. Consultation needed.` // Pad if too short
        
        // Get patient details from form or user data
        const patientDetails = appointmentData.patientDetails || {}
        
        // Create full appointment data for local storage (includes all details)
        const fullAppointmentData = {
          ...appointmentData,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
          status: 'confirmed',
          id: Date.now().toString(), // Generate local ID
          createdAt: new Date().toISOString(),
          // Add complete patient information from form or user data
          patient: {
            _id: user?.id || user?._id,
            name: patientDetails.patientName || user?.name || 'Unknown Patient',
            email: patientDetails.patientEmail || user?.email || '',
            phone: patientDetails.patientPhone || user?.phone || '',
            age: patientDetails.patientAge || user?.age || '',
            gender: patientDetails.patientGender || user?.gender || '',
            address: patientDetails.patientAddress || user?.address || '',
            bloodGroup: patientDetails.bloodGroup || '',
            medicalHistory: patientDetails.medicalHistory || '',
            emergencyContactName: patientDetails.emergencyContactName || '',
            emergencyContactPhone: patientDetails.emergencyContactPhone || ''
          },
          // Add complete doctor information
          doctor: {
            _id: selectedDoctor._id,
            name: selectedDoctor.name,
            specialization: selectedDoctor.specialization,
            phone: selectedDoctor.phone,
            email: selectedDoctor.email
          },
          // Add actual symptoms selected by patient during booking
          symptoms: symptomsText,
          symptomDetails: symptoms, // Keep detailed symptom information
          aiAnalysis: aiAnalysis,
          urgency: aiAnalysis?.urgency || 'normal',
          reason: symptomsText // Use selected symptoms as reason
        }

        // Check if doctor is static (not a real MongoDB ObjectId)
        const isStatic = isStaticDoctor(selectedDoctor._id)
        
        if (!isStatic) {
          // Try to save to API for real doctors
          try {
            // Convert date to ISO8601 format (YYYY-MM-DD to full ISO string)
            let appointmentDate = appointmentData.date
            if (typeof appointmentDate === 'string' && appointmentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Date is in YYYY-MM-DD format from HTML input, convert to ISO8601
              appointmentDate = new Date(appointmentDate + 'T00:00:00').toISOString()
            }
            
            // Prepare API payload (only send fields the API expects)
            const apiPayload = {
              doctor: selectedDoctor._id, // Must be MongoDB ObjectId
              date: appointmentDate, // Must be ISO8601 format
              time: appointmentData.time, // Must be HH:MM format
              symptoms: symptomsDescription, // Must be 10-500 characters
              duration: appointmentData.duration || 30 // Optional, default 30
            }
            
            await addAppointment(apiPayload)
            toast.success('Appointment booked successfully!')
          } catch (apiError) {
            console.error('API Error, saving locally:', apiError)
            // Save to local storage as fallback
            const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
            localAppointments.push(fullAppointmentData)
            localStorage.setItem('localAppointments', JSON.stringify(localAppointments))
            toast.success('Appointment booked successfully! (Saved locally - will sync when online)')
          }
        } else {
          // Static doctors - save locally only (no API call needed)
          console.log('Static doctor selected, saving locally only')
          const localAppointments = JSON.parse(localStorage.getItem('localAppointments') || '[]')
          localAppointments.push(fullAppointmentData)
          localStorage.setItem('localAppointments', JSON.stringify(localAppointments))
          toast.success('Appointment booked successfully! (Saved locally)')
        }
        
        // Reset form
        reset()
        setCurrentStep(1)
        setSymptoms([])
        setAiAnalysis(null)
        setSelectedDoctor(null)
        setAppointmentData(null)
        setSelectedPaymentMethod('')
      } catch (error) {
        console.error('Error booking appointment:', error)
        toast.error('Failed to book appointment')
      } finally {
        setIsProcessingPayment(false)
      }
    }, 2000)
  }

  const getDoctorsForSelection = () => {
    // Get doctors filtered by symptoms first
    const symptomFilteredDoctors = getFilteredDoctorsBySymptoms()
    
    // If no symptoms selected, show all doctors
    const doctorsToShow = symptoms.length > 0 ? symptomFilteredDoctors : doctors
    
    // Apply search and specialization filters
    return doctorsToShow.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter
      return matchesSearch && matchesSpecialization
    })
  }

  const filteredDoctors = getDoctorsForSelection()

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-gray-600">AI-powered symptom checker and doctor booking</p>
          
          {/* Network Status Indicator */}
          <div className="mt-4 flex items-center justify-center">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              {isOnline ? 'Online - Real-time sync' : 'Offline - Local mode'}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 1, title: 'AI Symptom Checker', icon: Brain },
              { step: 2, title: 'Analysis Results', icon: Stethoscope },
              { step: 3, title: 'Select Doctor', icon: User },
              { step: 4, title: 'Book Appointment', icon: Calendar },
              { step: 5, title: 'Patient Details', icon: UserCircle },
              { step: 6, title: 'Payment', icon: Activity }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {step < 6 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: AI Symptom Checker */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Symptom Checker</h2>
              <p className="text-gray-600">Select your symptoms to get AI-powered analysis and doctor recommendations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(symptomCategories).map(([category, categorySymptoms]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {categorySymptoms.map((symptom) => {
                      // Get appropriate icon based on category
                      const getCategoryIcon = (category) => {
                        switch (category) {
                          case 'Cardiovascular': return Heart
                          case 'Neurological': return Brain
                          case 'Respiratory': return Activity
                          case 'Digestive': return Activity
                          case 'Visual': return Eye
                          case 'Musculoskeletal': return Activity
                          case 'Skin': return Activity
                          case 'Mental Health': return Brain
                          default: return Activity
                        }
                      }
                      const Icon = getCategoryIcon(category)
                      const isSelected = symptoms.find(s => s.id === symptom.id)
                      return (
                        <button
                          key={symptom.id}
                          onClick={() => handleSymptomToggle({ ...symptom, category })}
                          className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          <span className="flex-1 text-left text-sm font-medium">{symptom.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                            {symptom.severity}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {symptoms.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Selected Symptoms ({symptoms.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <span key={symptom.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {symptom.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={analyzeSymptoms}
                disabled={symptoms.length === 0 || isAnalyzing}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    Analyze Symptoms
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Results */}
        {currentStep === 2 && aiAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <Stethoscope className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis Complete</h2>
              <p className="text-gray-600">Based on your symptoms, here's our analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Urgency Level */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Urgency Level
                </h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${getUrgencyColor(aiAnalysis.urgency)}`}>
                  {aiAnalysis.urgency.toUpperCase()}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Confidence: {aiAnalysis.confidence}%
                </p>
              </div>

              {/* Suggested Specializations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recommended Specializations</h3>
                <div className="space-y-2">
                  {aiAnalysis.suggestedSpecializations.map((spec, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preliminary Diagnosis */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Preliminary Analysis</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                {aiAnalysis.preliminaryDiagnosis.map((diagnosis, index) => (
                  <li key={index}>• {diagnosis}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Doctors */}
            {recommendedDoctors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recommended Doctors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedDoctors.map((doctor) => (
                    <div key={doctor._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({doctor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {doctor.location}
                      </div>
                      <button
                        onClick={() => handleDoctorSelect(doctor)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select Doctor
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Symptoms
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Browse All Doctors
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Doctor Selection */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Doctor</h2>
              <p className="text-gray-600">
                {symptoms.length > 0 
                  ? `Showing doctors relevant to your symptoms (${getFilteredDoctorsBySymptoms().length} doctors)`
                  : 'Choose from our qualified medical professionals'
                }
              </p>
            </div>

            {/* Symptoms Summary */}
            {symptoms.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Your Selected Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <span key={symptom.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {symptom.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Showing doctors specialized in: {Array.from(new Set(symptoms.map(s => {
                    switch (s.category) {
                      case 'Cardiovascular': return 'Cardiology'
                      case 'Neurological': return 'Neurology'
                      case 'Respiratory': return 'Pulmonology'
                      case 'Digestive': return 'Gastroenterology'
                      case 'Visual': return 'Ophthalmology'
                      case 'General': return 'General Medicine'
                      default: return 'General Medicine'
                    }
                  }))).join(', ')}
                </p>
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="font-medium">{doctor.rating}</span>
                      <span className="ml-1">({doctor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                  </div>

                  <button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Select Doctor
                  </button>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {symptoms.length > 0 ? (
                  <div>
                    <p className="text-gray-500 mb-2">No doctors found for your specific symptoms</p>
                    <p className="text-sm text-gray-400 mb-4">Try selecting different symptoms or browse all doctors</p>
                    <button
                      onClick={() => {
                        setSymptoms([])
                        setSearchTerm('')
                        setSpecializationFilter('')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Clear Symptoms & Show All Doctors
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No doctors found matching your search criteria</p>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Book Appointment */}
        {currentStep === 4 && selectedDoctor && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h2>
              <p className="text-gray-600">Complete your appointment booking</p>
            </div>

            {/* Selected Doctor Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Doctor</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedDoctor.name}</h4>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <label key={slot} className="flex items-center">
                      <input
                        type="radio"
                        value={slot}
                        {...register('time', { required: 'Time is required' })}
                        className="sr-only"
                      />
                      <div className="w-full p-3 text-center border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-sm font-medium">{slot}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                )}
              </div>

              {/* Hidden fields */}
              <input type="hidden" {...register('doctor')} value={selectedDoctor._id} />
              <input type="hidden" {...register('duration')} value="30" />
              <input type="hidden" {...register('reason')} value={symptoms.map(s => s.name).join(', ')} />

              {/* Submit Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Doctors
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-medium"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 5: Patient Details */}
        {currentStep === 5 && appointmentData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <UserCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Details</h2>
              <p className="text-gray-600">Please provide your details for the appointment</p>
            </div>

            <form onSubmit={patientDetailsForm.handleSubmit(onSubmitPatientDetails)} className="space-y-6">
              {/* Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...patientDetailsForm.register('patientName', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  defaultValue={user?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {patientDetailsForm.formState.errors.patientName && (
                  <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Number - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...patientDetailsForm.register('patientPhone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    defaultValue={user?.phone || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                  {patientDetailsForm.formState.errors.patientPhone && (
                    <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientPhone.message}</p>
                  )}
                </div>

                {/* Gender - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...patientDetailsForm.register('patientGender', { required: 'Gender is required' })}
                    defaultValue={user?.gender || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {patientDetailsForm.formState.errors.patientGender && (
                    <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientGender.message}</p>
                  )}
                </div>
              </div>

              {/* Address - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...patientDetailsForm.register('patientAddress', { 
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Address must be at least 10 characters' }
                  })}
                  defaultValue={user?.address || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your complete address"
                />
                {patientDetailsForm.formState.errors.patientAddress && (
                  <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Group - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    {...patientDetailsForm.register('bloodGroup')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Age - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    {...patientDetailsForm.register('patientAge', { 
                      min: { value: 0, message: 'Age must be positive' },
                      max: { value: 150, message: 'Please enter a valid age' }
                    })}
                    defaultValue={user?.age || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your age"
                  />
                  {patientDetailsForm.formState.errors.patientAge && (
                    <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientAge.message}</p>
                  )}
                </div>
              </div>

              {/* Email - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...patientDetailsForm.register('patientEmail', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  defaultValue={user?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                {patientDetailsForm.formState.errors.patientEmail && (
                  <p className="text-red-500 text-sm mt-1">{patientDetailsForm.formState.errors.patientEmail.message}</p>
                )}
              </div>

              {/* Medical History - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History (if any)
                </label>
                <textarea
                  {...patientDetailsForm.register('medicalHistory')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any previous medical conditions, allergies, or ongoing medications..."
                />
              </div>

              {/* Emergency Contact - Optional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    {...patientDetailsForm.register('emergencyContactName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    {...patientDetailsForm.register('emergencyContactPhone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Appointment
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 6: Payment */}
        {currentStep === 6 && appointmentData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <Activity className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
              <p className="text-gray-600">Choose your preferred payment method</p>
            </div>

            {/* Appointment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-medium">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(appointmentData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{appointmentData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">30 minutes</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-bold text-lg">₹{selectedDoctor.consultationFee}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
              
              {/* Net Banking */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={selectedPaymentMethod === 'netbanking'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Net Banking</h4>
                    <p className="text-sm text-gray-600">Pay securely through your bank account</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">Instant</span>
                  </div>
                </div>
              </label>

              {/* UPI */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedPaymentMethod === 'upi'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">UPI Payment</h4>
                    <p className="text-sm text-gray-600">Pay using PhonePe, Google Pay, Paytm, etc.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">Instant</span>
                  </div>
                </div>
              </label>

              {/* Cash on Visit */}
              <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={selectedPaymentMethod === 'cash'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Cash on Visit</h4>
                    <p className="text-sm text-gray-600">Pay in cash when you visit the doctor</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-orange-600">On Visit</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </button>
              <button
                onClick={() => handlePayment(selectedPaymentMethod)}
                disabled={!selectedPaymentMethod || isProcessingPayment}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    {selectedPaymentMethod === 'cash' ? 'Confirm Appointment' : 'Pay Now'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookAppointment
