import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required']
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops'],
    required: [true, 'Medicine form is required']
  },
  strength: {
    type: String,
    required: [true, 'Medicine strength is required']
  },
  currentStage: {
    type: String,
    enum: ['manufactured', 'quality-check', 'wholesaler', 'in-transit', 'pharmacy', 'delivered'],
    default: 'manufactured'
  },
  stages: [{
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    temperature: {
      type: Number,
      min: -20,
      max: 40
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String
  }],
  blockchainHash: {
    type: String,
    unique: true,
    sparse: true
  },
  price: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    min: 0,
    default: 0
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  storageConditions: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    lightSensitive: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

medicineSchema.index({ name: 1 })
medicineSchema.index({ batchNumber: 1 })
medicineSchema.index({ currentStage: 1 })
medicineSchema.index({ expiryDate: 1 })

const Medicine = mongoose.model('Medicine', medicineSchema)

export default Medicine
