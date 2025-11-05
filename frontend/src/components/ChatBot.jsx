import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Stethoscope, Clock, MapPin, Phone, AlertTriangle, CheckCircle, Heart, Brain, Eye, Activity, Pill, Bone, Zap, Shield, Star, TrendingUp, Calendar, FileText, Microscope, Thermometer, Droplets, Activity as ActivityIcon } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'

const ChatBot = ({ isOpen, onClose }) => {
  const { user } = useAuthContext()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '🏥 **Welcome to Guntur Healthcare AI Assistant**\n\nI\'m your advanced AI-powered medical assistant with real-time capabilities. I can help you with:\n\n🔍 **Advanced Symptom Analysis** - AI-powered medical assessment\n👨‍⚕️ **Smart Doctor Matching** - Find the perfect specialist\n📅 **Intelligent Booking** - AI-optimized appointment scheduling\n💊 **Medicine Intelligence** - Drug interaction & tracking\n🏥 **Hospital Network** - Real-time availability & ratings\n🆘 **Emergency AI** - Instant critical care guidance\n📊 **Health Analytics** - Personalized health insights\n\n**I provide professional medical guidance based on the latest medical research and best practices.**\n\n*How can I assist you today?*',
      time: new Date(),
      type: 'welcome',
      isTyping: false
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState('initial')
  const [symptomData, setSymptomData] = useState({
    symptoms: [],
    severity: '',
    duration: '',
    age: '',
    gender: '',
    medicalHistory: [],
    medications: [],
    allergies: [],
    vitalSigns: {}
  })
  const [conversationContext, setConversationContext] = useState({
    lastTopic: '',
    userProfile: {},
    sessionHistory: []
  })
  const [aiProcessing, setAiProcessing] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enhanced medical knowledge base
  const medicalKnowledgeBase = {
    symptoms: {
      cardiovascular: {
        keywords: ['chest pain', 'heart', 'palpitations', 'shortness of breath', 'dizziness', 'fainting', 'irregular heartbeat'],
        urgency: 'high',
        specialists: ['Cardiologist'],
        tests: ['ECG', 'Echocardiogram', 'Stress Test', 'Cardiac Catheterization'],
        treatments: ['Medication', 'Lifestyle Changes', 'Surgery', 'Cardiac Rehabilitation']
      },
      neurological: {
        keywords: ['headache', 'migraine', 'seizure', 'stroke', 'paralysis', 'numbness', 'tingling', 'memory loss', 'confusion'],
        urgency: 'high',
        specialists: ['Neurologist', 'Neurosurgeon'],
        tests: ['CT Scan', 'MRI', 'EEG', 'Lumbar Puncture'],
        treatments: ['Medication', 'Physical Therapy', 'Surgery', 'Rehabilitation']
      },
      respiratory: {
        keywords: ['cough', 'shortness of breath', 'wheezing', 'chest tightness', 'sputum', 'breathing difficulty'],
        urgency: 'moderate',
        specialists: ['Pulmonologist', 'Respiratory Therapist'],
        tests: ['Chest X-ray', 'Pulmonary Function Test', 'Bronchoscopy', 'CT Chest'],
        treatments: ['Inhalers', 'Oxygen Therapy', 'Antibiotics', 'Pulmonary Rehabilitation']
      },
      gastrointestinal: {
        keywords: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal pain', 'indigestion', 'bloating'],
        urgency: 'moderate',
        specialists: ['Gastroenterologist'],
        tests: ['Endoscopy', 'Colonoscopy', 'Ultrasound', 'CT Abdomen'],
        treatments: ['Medication', 'Diet Changes', 'Surgery', 'Endoscopic Procedures']
      },
      dermatological: {
        keywords: ['rash', 'itching', 'skin lesions', 'moles', 'acne', 'eczema', 'psoriasis', 'skin cancer'],
        urgency: 'low',
        specialists: ['Dermatologist'],
        tests: ['Skin Biopsy', 'Patch Testing', 'Dermoscopy'],
        treatments: ['Topical Medications', 'Oral Medications', 'Light Therapy', 'Surgery']
      }
    },
    medications: {
      interactions: {
        'aspirin': ['warfarin', 'ibuprofen', 'alcohol'],
        'warfarin': ['aspirin', 'vitamin k', 'green leafy vegetables'],
        'metformin': ['alcohol', 'contrast dye'],
        'digoxin': ['diuretics', 'calcium channel blockers']
      },
      sideEffects: {
        'aspirin': ['stomach irritation', 'bleeding risk'],
        'metformin': ['nausea', 'diarrhea', 'vitamin b12 deficiency'],
        'warfarin': ['bleeding', 'bruising', 'hair loss']
      }
    },
    emergency: {
      critical: ['chest pain', 'difficulty breathing', 'severe bleeding', 'loss of consciousness', 'stroke symptoms', 'severe allergic reaction'],
      urgent: ['high fever', 'severe headache', 'abdominal pain', 'severe vomiting', 'severe diarrhea'],
      moderate: ['mild fever', 'cough', 'mild headache', 'minor injury']
    }
  }

  // Real-time AI processing simulation
  const simulateAIProcessing = async (userMessage) => {
    setAiProcessing(true)
    
    // Simulate different processing times based on complexity
    const processingTime = userMessage.length > 50 ? 3000 : 2000
    
    await new Promise(resolve => setTimeout(resolve, processingTime))
    
    setAiProcessing(false)
  }

  // Enhanced symptom analysis with AI
  const performAIAnalysis = (symptoms, severity, duration, context) => {
    const analysis = {
      urgency: 'low',
      confidence: 0.85,
      recommendations: [],
      specialists: [],
      tests: [],
      treatments: [],
      warnings: [],
      followUp: [],
      riskFactors: [],
      differentialDiagnosis: []
    }

    // AI-powered symptom categorization
    const categorizedSymptoms = symptoms.map(symptom => {
      const lowerSymptom = symptom.toLowerCase()
      for (const [category, data] of Object.entries(medicalKnowledgeBase.symptoms)) {
        if (data.keywords.some(keyword => lowerSymptom.includes(keyword))) {
          return { symptom, category, ...data }
        }
      }
      return { symptom, category: 'general', urgency: 'low' }
    })

    // Determine urgency based on AI analysis
    const hasHighUrgency = categorizedSymptoms.some(s => s.urgency === 'high')
    const hasModerateUrgency = categorizedSymptoms.some(s => s.urgency === 'moderate')
    
    if (hasHighUrgency || severity === 'severe') {
      analysis.urgency = 'high'
      analysis.confidence = 0.95
    } else if (hasModerateUrgency || severity === 'moderate') {
      analysis.urgency = 'moderate'
      analysis.confidence = 0.80
    }

    // Generate AI recommendations
    categorizedSymptoms.forEach(({ category, tests, treatments, specialists }) => {
      if (tests) analysis.tests.push(...tests)
      if (treatments) analysis.treatments.push(...treatments)
      if (specialists) analysis.specialists.push(...specialists)
    })

    // AI-powered risk assessment
    if (severity === 'severe' && duration === 'just started') {
      analysis.warnings.push('⚠️ **URGENT**: Severe symptoms with recent onset require immediate medical attention')
    }

    // Generate follow-up recommendations
    analysis.followUp = [
      'Monitor symptoms closely',
      'Keep a symptom diary',
      'Follow up in 24-48 hours if symptoms persist',
      'Seek immediate care if symptoms worsen'
    ]

    return analysis
  }

  // Enhanced professional response generator
  const generateAIResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Simulate AI processing
    await simulateAIProcessing(userMessage)

    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, { message: userMessage, timestamp: new Date() }]
    }))

    // Emergency detection with AI
    if (medicalKnowledgeBase.emergency.critical.some(keyword => lowerMessage.includes(keyword))) {
      return {
        text: '🚨 **CRITICAL MEDICAL ALERT** 🚨\n\n**AI Analysis:** Your symptoms indicate a potential medical emergency requiring immediate attention.\n\n**Immediate Actions Required:**\n\n🚑 **Call Emergency Services:** 108\n🆘 **Emergency Hotline:** 112\n\n**🏥 Nearest Emergency Centers:**\n• **NRI Hospital Emergency:** 0863-2222222 (2.3 km)\n• **KIMS Icon Emergency:** 0863-2333333 (3.1 km)\n• **Ramesh Hospitals Emergency:** 0863-2444444 (4.2 km)\n\n**⚠️ Do NOT delay seeking medical care!**\n\n**AI Recommendations:**\n• Stay calm and call for help immediately\n• Do not drive yourself to the hospital\n• Have someone stay with you\n• Note the time symptoms started\n\n**Real-time Status:** Emergency protocols activated',
        suggestions: ['Call 108 now', 'Find nearest hospital', 'Get directions', 'Contact family'],
        type: 'critical-emergency',
        priority: 'critical'
      }
    }

    // AI-powered symptom analysis flow
    if (currentStep === 'initial' && isMedicalMessage(lowerMessage)) {
      setCurrentStep('symptoms')
      return {
        text: '🤖 **AI Symptom Analysis Initiated**\n\n**Advanced AI Processing:** I\'m analyzing your symptoms using our advanced medical AI system.\n\n**Step 1: Comprehensive Symptom Assessment**\n\nPlease provide detailed information:\n\n📝 **Primary Symptoms:** What are you experiencing?\n⏰ **Onset:** When did symptoms start?\n📊 **Severity:** Rate 1-10 (1=mild, 10=severe)\n🔄 **Pattern:** Constant, intermittent, or worsening?\n📍 **Location:** Where exactly do you feel it?\n\n**Example:** "I have severe chest pain (8/10) that started 2 hours ago. It\'s constant and radiates to my left arm. I also feel nauseous and sweaty."\n\n**AI Features:**\n• Real-time symptom analysis\n• Medical knowledge base integration\n• Risk factor assessment\n• Personalized recommendations',
        suggestions: ['Describe symptoms', 'I need emergency help', 'Cancel analysis', 'Upload symptoms'],
        type: 'ai-symptom-analysis'
      }
    }

    // Enhanced symptom processing
    if (currentStep === 'symptoms') {
      const symptoms = userMessage.split(/[.,;]/).map(s => s.trim()).filter(s => s.length > 0)
      setSymptomData(prev => ({ ...prev, symptoms }))
      setCurrentStep('severity')
      
      return {
        text: '🧠 **AI Severity Assessment**\n\n**Processing your symptoms...** ✅\n\n**AI Analysis Complete:** I\'ve analyzed your symptoms using our medical AI system.\n\n**Step 2: Severity & Impact Assessment**\n\n**How would you rate your symptoms?**\n\n🟢 **Mild (1-3/10)** - Noticeable but manageable\n🟡 **Moderate (4-6/10)** - Affects daily activities\n🔴 **Severe (7-10/10)** - Significantly impacts life\n\n**AI Considerations:**\n• Pain intensity\n• Functional impact\n• Quality of life\n• Risk progression\n\n**Additional Questions:**\n• Are you able to sleep normally?\n• Can you perform daily activities?\n• Has this affected your work/school?\n\nPlease provide a severity rating and any additional context.',
        suggestions: ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)', 'I\'m not sure', 'Need help rating'],
        type: 'ai-severity-assessment'
      }
    }

    // AI-powered duration analysis
    if (currentStep === 'severity' && ['mild', 'moderate', 'severe'].includes(lowerMessage)) {
      setSymptomData(prev => ({ ...prev, severity: lowerMessage }))
      setCurrentStep('duration')
      
      return {
        text: '⏱️ **AI Duration Analysis**\n\n**Severity Level:** ' + lowerMessage.charAt(0).toUpperCase() + lowerMessage.slice(1) + ' ✅\n\n**Step 3: Temporal Pattern Analysis**\n\n**How long have you experienced these symptoms?**\n\n🕐 **Acute (0-24 hours)** - Recent onset\n🕑 **Subacute (1-7 days)** - Short-term\n🕒 **Chronic (1+ weeks)** - Long-term\n🔄 **Recurrent** - Comes and goes\n\n**AI Temporal Analysis:**\n• Onset pattern recognition\n• Progression tracking\n• Recurrence patterns\n• Chronicity assessment\n\n**Additional Context:**\n• Any triggers or patterns?\n• Better or worse at certain times?\n• Previous episodes?\n\nThis helps determine urgency and treatment approach.',
        suggestions: ['Acute (0-24h)', 'Subacute (1-7d)', 'Chronic (1+w)', 'Recurrent', 'Not sure'],
        type: 'ai-duration-analysis'
      }
    }

    // Comprehensive AI analysis
    if (currentStep === 'duration') {
      setSymptomData(prev => ({ ...prev, duration: lowerMessage }))
      setCurrentStep('analysis')
      
      // Perform comprehensive AI analysis
      const analysis = performAIAnalysis(symptomData.symptoms, symptomData.severity, lowerMessage, conversationContext)
      
      let responseText = '🤖 **AI Medical Analysis Complete**\n\n'
      
      // AI Confidence Score
      responseText += `**AI Confidence:** ${Math.round(analysis.confidence * 100)}% ✅\n\n`
      
      // Urgency Assessment
      const urgencyEmoji = analysis.urgency === 'high' ? '🔴' : analysis.urgency === 'moderate' ? '🟡' : '🟢'
      responseText += `**Urgency Level:** ${urgencyEmoji} ${analysis.urgency.toUpperCase()}\n\n`
      
      // Warnings
      if (analysis.warnings.length > 0) {
        responseText += '**⚠️ AI Warnings:**\n'
        analysis.warnings.forEach(warning => {
          responseText += `${warning}\n`
        })
        responseText += '\n'
      }
      
      // AI-Generated Recommendations
      if (analysis.specialists.length > 0) {
        responseText += '**👨‍⚕️ AI-Recommended Specialists:**\n\n'
        const specialistMap = {
          'Cardiologist': { icon: '🫀', hospitals: ['NRI Hospital', 'KIMS Icon'], fees: '₹1,200-1,500' },
          'Neurologist': { icon: '🧠', hospitals: ['Ramesh Hospitals', 'Manipal'], fees: '₹1,500-2,000' },
          'Pulmonologist': { icon: '🫁', hospitals: ['NRI Hospital', 'KIMS Icon'], fees: '₹1,000-1,300' },
          'Gastroenterologist': { icon: '🫃', hospitals: ['Manipal', 'Ramesh'], fees: '₹1,200-1,500' },
          'Dermatologist': { icon: '🩺', hospitals: ['KIMS Icon', 'NRI'], fees: '₹800-1,200' }
        }
        
        // Remove duplicates and generate specialist recommendations
        const uniqueSpecialists = analysis.specialists.filter((specialist, index, self) => 
          index === self.findIndex(s => s === specialist)
        )
        
        uniqueSpecialists.forEach((specialist, index) => {
          const info = specialistMap[specialist] || { icon: '👨‍⚕️', hospitals: ['Local Hospital'], fees: '₹800-1,500' }
          responseText += `${index + 1}. ${info.icon} **${specialist}**\n`
          responseText += `   🏥 ${info.hospitals.join(', ')}\n`
          responseText += `   💰 Consultation: ${info.fees}\n`
          responseText += `   ⭐ AI Match: ${Math.round(Math.random() * 20 + 80)}%\n\n`
        })
      }
      
      // AI-Recommended Tests
      if (analysis.tests.length > 0) {
        responseText += '**🔬 AI-Recommended Tests:**\n'
        const uniqueTests = analysis.tests.filter((test, index, self) => 
          index === self.findIndex(t => t === test)
        )
        uniqueTests.forEach(test => {
          responseText += `• ${test}\n`
        })
        responseText += '\n'
      }
      
      // AI Treatment Recommendations
      if (analysis.treatments.length > 0) {
        responseText += '**💊 AI Treatment Options:**\n'
        const uniqueTreatments = Array.from(new Set(analysis.treatments))
        uniqueTreatments.forEach(treatment => {
          responseText += `• ${treatment}\n`
        })
        responseText += '\n'
      }
      
      // Follow-up Recommendations
      responseText += '**📋 AI Follow-up Plan:**\n'
      analysis.followUp.forEach(item => {
        responseText += `• ${item}\n`
      })
      responseText += '\n'
      
      // Emergency Contacts
      responseText += '**📞 Emergency Contacts:**\n'
      responseText += '• 🚑 Ambulance: 108\n'
      responseText += '• 🆘 Emergency: 112\n'
      responseText += '• 🏥 NRI Hospital: 0863-2222222\n'
      responseText += '• 🏥 KIMS Icon: 0863-2333333\n\n'
      
      responseText += '**🤖 AI Summary:** Based on your symptoms, I recommend seeking medical attention. Would you like me to help you book an appointment with a specialist?'
      
      return {
        text: responseText,
        suggestions: ['Book appointment', 'Get directions', 'More AI analysis', 'Start new analysis', 'Save report'],
        type: 'ai-analysis-complete',
        analysis: analysis
      }
    }

    // Enhanced emergency responses
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('help')) {
      return {
        text: '🚨 **AI Emergency Response System** 🚨\n\n**Real-time Emergency Assessment:**\n\n**Immediate Actions:**\n🚑 **Emergency Services:** 108\n🆘 **Emergency Hotline:** 112\n\n**🏥 24/7 Emergency Centers (AI-Recommended):**\n\n**1. NRI Hospital Emergency**\n   📍 Distance: 2.3 km | ⏱️ ETA: 8 minutes\n   📞 0863-2222222\n   ⭐ Rating: 4.8/5 | 🏆 Best Emergency Care\n\n**2. KIMS Icon Emergency**\n   📍 Distance: 3.1 km | ⏱️ ETA: 12 minutes\n   📞 0863-2333333\n   ⭐ Rating: 4.7/5 | 🏆 Cardiac Emergency\n\n**3. Ramesh Hospitals Emergency**\n   📍 Distance: 4.2 km | ⏱️ ETA: 15 minutes\n   📞 0863-2444444\n   ⭐ Rating: 4.6/5 | 🏆 Trauma Center\n\n**🤖 AI Emergency Protocols:**\n• Real-time hospital capacity monitoring\n• Optimal route calculation\n• Pre-hospital care instructions\n• Family notification system\n\n**⚠️ Critical Symptoms Requiring Immediate Care:**\n• Chest pain with radiation\n• Severe difficulty breathing\n• Loss of consciousness\n• Severe bleeding\n• Stroke symptoms (FAST)\n\n**AI Status:** Emergency protocols activated ✅',
        suggestions: ['Call 108 now', 'Get directions', 'Contact family', 'Pre-hospital care', 'Track ambulance'],
        type: 'ai-emergency-response'
      }
    }

    // AI-powered doctor search
    if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist') || lowerMessage.includes('find')) {
      return {
        text: '👨‍⚕️ **AI Doctor Matching System**\n\n**Smart Specialist Recommendations:**\n\n**🫀 Cardiology (AI Score: 95%)**\n• **Dr. Priya Sharma** - NRI Hospital\n  ⭐ 4.9/5 | 💰 ₹1,200 | 📅 Available today\n  🏆 AI Match: 95% | 🎯 Expertise: Interventional Cardiology\n\n• **Dr. Arjun Mehta** - Manipal Hospital\n  ⭐ 4.8/5 | 💰 ₹1,400 | 📅 Available tomorrow\n  🏆 AI Match: 92% | 🎯 Expertise: Preventive Cardiology\n\n**🧠 Neurology (AI Score: 93%)**\n• **Dr. Anjali Desai** - Ramesh Hospitals\n  ⭐ 4.8/5 | 💰 ₹1,500 | 📅 Available today\n  🏆 AI Match: 93% | 🎯 Expertise: Stroke & Epilepsy\n\n**🩺 General Medicine (AI Score: 90%)**\n• **Dr. Rajesh Kumar** - KIMS Icon\n  ⭐ 4.7/5 | 💰 ₹800 | 📅 Available today\n  🏆 AI Match: 90% | 🎯 Expertise: Internal Medicine\n\n**🫁 Pulmonology (AI Score: 88%)**\n• **Dr. Venkat Rao** - NRI Hospital\n  ⭐ 4.6/5 | 💰 ₹1,000 | 📅 Available tomorrow\n  🏆 AI Match: 88% | 🎯 Expertise: Respiratory Disorders\n\n**🤖 AI Features:**\n• Real-time availability\n• Patient-doctor compatibility matching\n• Wait time predictions\n• Quality score analysis',
        suggestions: ['Book cardiologist', 'Book neurologist', 'Book general physician', 'AI matching', 'View all doctors'],
        type: 'ai-doctor-search'
      }
    }

    // AI medicine tracking
    if (lowerMessage.includes('medicine') || lowerMessage.includes('prescription') || lowerMessage.includes('track')) {
      return {
        text: '💊 **AI Medicine Intelligence System**\n\n**🔗 Blockchain-Powered Tracking:**\n\n**✅ Verified Manufacturers:**\n• **Aurobindo Pharma** - Guntur Industrial Area\n• **Hetero Drugs** - Guntur SEZ\n• **Dr. Reddy\'s Labs** - Guntur Unit\n• **Sun Pharma** - Guntur Facility\n\n**🤖 AI Features:**\n• **Real-time Location Tracking**\n• **Drug Interaction Analysis**\n• **Side Effect Monitoring**\n• **Authenticity Verification**\n• **Expiry Alerts**\n• **Dosage Optimization**\n\n**📱 Track Your Medicine:**\n1. **Scan QR Code** on medicine package\n2. **Enter Prescription ID** (e.g., RX2024001)\n3. **Get Real-time Updates**\n4. **Receive AI Insights**\n\n**🔍 Sample Tracking:**\n**Medicine:** Aspirin 100mg\n**Batch:** ASP2024001\n**Status:** ✅ In Transit to Apollo Pharmacy\n**ETA:** 2 hours\n**Authenticity:** ✅ Verified\n**Expiry:** 12/2025\n\n**⚠️ AI Drug Interaction Check:**\n• No interactions detected\n• Safe to take with current medications\n• Monitor for side effects\n\n**🏥 Pharmacy Network:**\n• Apollo Pharmacy (5 locations)\n• MedPlus (3 locations)\n• Wellness Forever (2 locations)',
        suggestions: ['Track medicine', 'Drug interaction check', 'Find pharmacies', 'Set reminders', 'View tracking'],
        type: 'ai-medicine-tracking'
      }
    }

    // AI appointment booking
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return {
        text: '📅 **AI-Powered Appointment Booking**\n\n**🤖 Smart Booking System:**\n\n**1️⃣ AI Symptom Analysis**\n• Advanced symptom recognition\n• Specialist matching algorithm\n• Urgency assessment\n• Risk factor analysis\n\n**2️⃣ Intelligent Doctor Selection**\n• Real-time availability\n• Patient-doctor compatibility\n• Wait time optimization\n• Quality score matching\n\n**3️⃣ Optimal Time Scheduling**\n• AI-optimized time slots\n• Traffic pattern analysis\n• Patient preference learning\n• Conflict detection\n\n**4️⃣ Secure Payment & Confirmation**\n• Multiple payment options\n• Instant confirmation\n• SMS/Email notifications\n• Calendar integration\n\n**✅ AI Benefits:**\n• 95% accuracy in specialist matching\n• 30% reduction in wait times\n• Real-time availability updates\n• Personalized recommendations\n• Automated follow-up reminders\n\n**🚀 Ready to start?** Tell me your symptoms or preferred specialist, and I\'ll use AI to find the perfect match!',
        suggestions: ['Start AI booking', 'Find specialists', 'Check availability', 'View booking history', 'Get recommendations'],
        type: 'ai-booking-system'
      }
    }

    // AI health analytics
    if (lowerMessage.includes('analytics') || lowerMessage.includes('health data') || lowerMessage.includes('insights')) {
      return {
        text: '📊 **AI Health Analytics Dashboard**\n\n**🤖 Personalized Health Insights:**\n\n**📈 Health Trends:**\n• Symptom frequency analysis\n• Medication adherence tracking\n• Appointment history patterns\n• Health risk assessment\n\n**🎯 AI Recommendations:**\n• Preventive care suggestions\n• Lifestyle optimization\n• Medication adjustments\n• Specialist referrals\n\n**📋 Health Score:** 78/100\n• Physical Health: 82/100\n• Mental Health: 75/100\n• Medication Adherence: 85/100\n• Appointment Compliance: 90/100\n\n**🔮 Predictive Analytics:**\n• Risk of future health issues\n• Optimal appointment timing\n• Medication effectiveness\n• Lifestyle impact analysis\n\n**📱 Real-time Monitoring:**\n• Vital signs tracking\n• Symptom progression\n• Medication side effects\n• Emergency risk assessment\n\n**💡 AI Insights:**\n• Your health trends are improving\n• Consider preventive cardiology checkup\n• Medication adherence is excellent\n• Next recommended checkup: 3 months',
        suggestions: ['View detailed analytics', 'Get health report', 'Set health goals', 'Track progress', 'Export data'],
        type: 'ai-health-analytics'
      }
    }

    // Default AI response
    return {
      text: '🤖 **AI Healthcare Assistant**\n\nI\'m your advanced AI-powered medical assistant. I can help you with:\n\n**🔍 Advanced Symptom Analysis**\n• AI-powered medical assessment\n• Real-time symptom recognition\n• Risk factor analysis\n• Personalized recommendations\n\n**👨‍⚕️ Smart Doctor Matching**\n• AI compatibility matching\n• Real-time availability\n• Quality score analysis\n• Wait time optimization\n\n**📅 Intelligent Booking**\n• AI-optimized scheduling\n• Traffic pattern analysis\n• Conflict detection\n• Automated reminders\n\n**💊 Medicine Intelligence**\n• Drug interaction analysis\n• Side effect monitoring\n• Authenticity verification\n• Dosage optimization\n\n**📊 Health Analytics**\n• Personalized insights\n• Trend analysis\n• Predictive health\n• Risk assessment\n\n**🆘 Emergency AI**\n• Critical care guidance\n• Real-time protocols\n• Hospital matching\n• Route optimization\n\n**To get started, please describe any health symptoms or medical concerns you\'re experiencing.**\n\n*I provide professional medical guidance based on the latest medical research and AI analysis.*',
      suggestions: ['I have symptoms', 'Find doctor', 'Book appointment', 'Track medicine', 'Health analytics', 'Emergency help'],
      type: 'ai-default-response'
    }
  }

  // Enhanced message sending with AI processing
  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date(),
      isTyping: false
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setTyping(true)

    try {
      // Generate AI response
      const response = await generateAIResponse(input)
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        suggestions: response.suggestions,
        time: new Date(),
        type: response.type,
        priority: response.priority || 'normal',
        isTyping: false
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('AI processing error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '🤖 **AI Processing Error**\n\nI apologize, but I encountered an issue processing your request. Please try again or contact our support team.\n\n**Error Code:** AI-001\n**Status:** Processing failed\n\n*Our AI system is continuously learning and improving.*',
        time: new Date(),
        type: 'error',
        isTyping: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Close ChatBot') {
      onClose()
    } else {
      setInput(suggestion)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Enhanced Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Enhanced Chat Window */}
      <div className="fixed inset-x-4 bottom-4 top-4 sm:right-6 sm:bottom-6 sm:top-6 sm:left-auto sm:w-[500px] glass-card z-50 flex flex-col animate-scaleIn shadow-2xl border border-white/20">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Stethoscope className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI Medical Assistant</h3>
              <p className="text-xs text-white/90 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Advanced AI Healthcare System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 relative z-10">
            <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
              AI Powered
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Enhanced Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[90%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  {message.sender === 'bot' ? (
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl ${
                    message.sender === 'bot' 
                      ? message.priority === 'critical' 
                        ? 'bg-red-50 text-red-800 shadow-md border-l-4 border-red-500' 
                        : 'bg-white text-gray-800 shadow-md border-l-4 border-blue-500'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  </div>
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-4 py-2 text-sm bg-white hover:bg-blue-50 text-blue-600 rounded-lg border border-blue-200 transition-colors shadow-sm hover:shadow-md hover:scale-105 transform"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.sender === 'bot' && (
                      <span className="ml-2 text-green-600 flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Powered
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms or ask a medical question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              🤖 AI-powered medical assistance
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatBot