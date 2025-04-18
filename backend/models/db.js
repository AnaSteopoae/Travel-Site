import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Configurare pentru conexiune MongoDB
    // Această conexiune va funcționa atât local cât și după restaurarea backupului
    const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelsite_db';
    
    await mongoose.connect(connectionString, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
export default connectDB;