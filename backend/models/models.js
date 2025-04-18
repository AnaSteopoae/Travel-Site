import mongoose from 'mongoose';

// Schema Utilizatori
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: { 
    type: String, 
    validate: {
      validator: function(v) {
        return /^(\+4|0)[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} nu este un număr de telefon valid!`
    }
  },
  phoneNumber: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String, default: 'România' },
  paymentInfo: {
    lastFourDigits: String , // stocăm doar ultimele 4 cifre
    cardType: String ,
    expiryMonth: String ,
    expiryYear: String ,
    isDefault: { type: Boolean, default: true }
  },
  passwordHash: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: Date,
  isVerified: { type: Boolean, default: false },
  role: { 
    type: String, 
    enum: ['client', 'admin'], 
    default: 'client' 
  },
  profile: {
    preferences: mongoose.Schema.Types.Mixed,
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
  }
});

//Schema Proprietar
const proprietarSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  fiscalCode:{
    type:String,
    required:true,
    unique:true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: { 
    type: String, 
    validate: {
      validator: function(v) {
        return /^(\+4|0)[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} nu este un număr de telefon valid!`
    }
  },
  passwordHash: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Schema Proprietăți
const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proprietar',
    required: true
  },
  name: { type: String, required: true },
  description: String,
  location: {
    city: { type: String, required: true },
    county: String,
    country: { type: String, default: 'Romania' },
    street: String,
    number: String, 
    building: String, 
    entrance: String,
    apartment: Number
    
  },
  type: { 
    type: String, 
    enum: ['apartament', 'casă', 'vilă', 'cameră de hotel', 'bungalow'],
    required: true
  },
  details: {
    maxGuests: { type: Number, required: true },
    numberOfRooms: Number,
    surfaceArea: Number,
    amenities: [String]
  },
  pricing: {
    basePrice: { type: Number, required: true },
    weekendPrice: Number,
    seasonalPricing: [{
      season: String,
      price: Number
    }]
  },
  description: String,
  images: [{
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  availability: [{
    date: Date,
    isAvailable: { type: Boolean, default: true },
    specialPrice: Number
  }],
  blockedDates: [Date],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  rating: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
});

// Schema Rezervări
const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dates: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true }
  },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  pricing: {
    basePrice: Number,
    totalPrice: Number,
    taxes: Number
  },
  status: { 
    type: String, 
    enum: ['confirmată', 'în așteptare', 'anulată', 'finalizată'],
    default: 'în așteptare'
  },
  specialRequests: String,
  payment: {
    method: { 
      type: String, 
      enum: ['card', 'transfer bancar', 'cash', 'online'] 
    },
    status: { 
      type: String, 
      enum: ['reușită', 'eșuată', 'în așteptare'] 
    },
    transactionId: String
  }
}, { 
  timestamps: true 
});

// Schema Plăți
const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  method: { 
    type: String, 
    enum: ['card', 'transfer bancar', 'cash', 'online'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['reușită', 'eșuată', 'în așteptare'],
    default: 'în așteptare'
  },
  details: {
    cardLast4: String,
    processor: String
  }
}, { 
  timestamps: true 
});

// Creare modele
const User = mongoose.model('User', userSchema);
const Proprietar = mongoose.model('Proprietar', proprietarSchema);
const Property = mongoose.model('Property', propertySchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Export modele
export { User, Proprietar, Property, Booking, Payment };
