import express from 'express';
import connectDB from './models/db.js';
import cors from 'cors';
import userRoutes from './routes/users.js';
import propertyRoutes from './routes/proprietati.js';
import proprietariRoutes from './routes/proprietari.js';
import imgRoutes from './routes/uploadImg.js';
import bookingRoutes from './routes/bookings.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use('/api/users', userRoutes);
app.use('/api/proprietati', propertyRoutes);
app.use('/api/proprietari', proprietariRoutes);
app.use('/api/images', imgRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('Hello from the server!');

});

connectDB().then(() => {
    app.listen(port, () =>{
        console.log(`Server running on port ${port}`);
    });
}).catch(err => {
    console.error('Eroare la conectarea la baza de date:', err);
});