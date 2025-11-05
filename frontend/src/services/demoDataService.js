export const demoDataService = {
  getDemoDoctors: () => {
    return {
      data: {
        doctors: [
          {
            _id: 'demo_doctor_1',
            name: 'Dr. Sarah Johnson',
            specialization: 'Cardiology',
            rating: 4.8,
            reviewCount: 156,
            experience: 10,
            location: 'Guntur',
            bio: 'Senior Cardiologist with expertise in interventional cardiology.',
            phone: '+91-863-1234567',
            email: 'sarah.johnson@hospital.com',
            consultationFee: 800,
            availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
          },
          {
            _id: 'demo_doctor_2',
            name: 'Dr. Rajesh Kumar',
            specialization: 'Neurology',
            rating: 4.7,
            reviewCount: 134,
            experience: 12,
            location: 'Guntur',
            bio: 'Expert in neurological disorders and stroke management.',
            phone: '+91-863-1234568',
            email: 'rajesh.kumar@hospital.com',
            consultationFee: 750,
            availableSlots: ['09:30', '10:30', '11:30', '14:30', '15:30']
          },
          {
            _id: 'demo_doctor_3',
            name: 'Dr. Priya Reddy',
            specialization: 'Dermatology',
            rating: 4.6,
            reviewCount: 98,
            experience: 8,
            location: 'Guntur',
            bio: 'Specialist in cosmetic dermatology and skin cancer treatment.',
            phone: '+91-863-1234569',
            email: 'priya.reddy@hospital.com',
            consultationFee: 600,
            availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00']
          },
          {
            _id: 'demo_doctor_4',
            name: 'Dr. Michael Chen',
            specialization: 'General Medicine',
            rating: 4.5,
            reviewCount: 89,
            experience: 6,
            location: 'Guntur',
            bio: 'General practitioner with expertise in primary care and preventive medicine.',
            phone: '+91-863-1234570',
            email: 'michael.chen@hospital.com',
            consultationFee: 500,
            availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
          }
        ]
      }
    }
  },

  // Demo appointments data
  getDemoAppointments: () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return {
      data: {
        appointments: [
          {
            _id: 'demo_appointment_1',
            patient: {
              _id: 'demo_patient_1',
              name: 'Krishna Bharghav',
              email: 'krishna.bharghav@gmail.com',
              phone: '+91-9876543210',
              age: 28,
              gender: 'Male'
            },
            doctor: {
              _id: 'demo_doctor_1',
              name: 'Dr. Swathi Sharma',
              specialization: 'Pediatrics'
            },
            date: today,
            time: '10:00',
            status: 'confirmed',
            reason: 'Fever and cough',
            symptoms: 'Fever, Cough, Headache',
            urgency: 'normal',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'demo_appointment_2',
            patient: {
              _id: 'demo_patient_2',
              name: 'Rajesh Kumar',
              email: 'rajesh.kumar@gmail.com',
              phone: '+91-9876543211',
              age: 35,
              gender: 'Male'
            },
            doctor: {
              _id: 'demo_doctor_2',
              name: 'Dr. Swathi Sharma',
              specialization: 'Pediatrics'
            },
            date: tomorrow,
            time: '14:00',
            status: 'pending',
            reason: 'Regular checkup',
            symptoms: 'General consultation',
            urgency: 'low',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'demo_appointment_3',
            patient: {
              _id: 'demo_patient_3',
              name: 'Priya Reddy',
              email: 'priya.reddy@gmail.com',
              phone: '+91-9876543212',
              age: 42,
              gender: 'Female'
            },
            doctor: {
              _id: 'demo_doctor_1',
              name: 'Dr. Swathi Sharma',
              specialization: 'Pediatrics'
            },
            date: today,
            time: '11:30',
            status: 'confirmed',
            reason: 'Follow-up consultation',
            symptoms: 'Follow-up for previous treatment',
            urgency: 'normal',
            createdAt: new Date().toISOString()
          }
        ]
      }
    }
  },

  // Demo notifications data
  getDemoNotifications: () => {
    return {
      data: {
        notifications: [
          {
            _id: 'demo_notification_1',
            title: 'Appointment Confirmed',
            message: 'Your appointment with Dr. Sarah Johnson has been confirmed for tomorrow at 10:00 AM.',
            type: 'appointment',
            priority: 'medium',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'demo_notification_2',
            title: 'New Message',
            message: 'You have a new message from your doctor regarding your recent consultation.',
            type: 'info',
            priority: 'low',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        unreadCount: 1
      }
    }
  },

  // Demo medicines data
  getDemoMedicines: () => {
    return {
      data: {
        medicines: [
          {
            _id: 'demo_medicine_1',
            name: 'Paracetamol 500mg',
            batchNumber: 'BATCH001',
            manufacturer: 'ABC Pharmaceuticals',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            currentStage: 'Manufacturing',
            stages: [
              {
                stage: 'Manufacturing',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Factory A',
                status: 'completed'
              },
              {
                stage: 'Quality Control',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'QC Lab',
                status: 'completed'
              },
              {
                stage: 'Packaging',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Packaging Unit',
                status: 'completed'
              },
              {
                stage: 'Distribution',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Distribution Center',
                status: 'in_progress'
              }
            ]
          }
        ]
      }
    }
  }
}

export default demoDataService
