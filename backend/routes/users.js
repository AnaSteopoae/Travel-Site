import express from 'express';
import bcrypt from 'bcrypt';
import { User, Booking } from '../models/models.js';
import jwt from 'jsonwebtoken';
import auth_cookie from '../middleware/auth_cookie.js';
import admin_auth from '../middleware/admin_auth.js';
import { Property } from '../models/models.js';

const router = express.Router();

// Funcție pentru actualizarea statusului rezervărilor
const updateBookingsStatus = async (userId) => {
  try {
    const currentDate = new Date();
    const updatedBookings = await Booking.updateMany(
      {
        user: userId,
        status: { $in: ['confirmată', 'în așteptare'] },
        'dates.checkOut': { $lt: currentDate }
      },
      {
        $set: { status: 'finalizată' }
      }
    );
  } catch (error) {
    console.error('Eroare la actualizarea statusului rezervărilor:', error);
  }
};

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ message: 'Utilizatorul există deja' }] });
      }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      passwordHash,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
  });
  res.cookie('userId', newUser._id.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
  });
  res.status(201).json({ message: 'Utilizator creat cu succes!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la crearea utilizatorului' });
  }
});

router.post('/login', async(req, res) => {
  try{ 
    const {email, password} =req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({errors:[{message: 'Credentiale invalide'}]});
    }
    const isMatch = await bcrypt.compare(password,user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ message: 'Credentiale invalide' }] });
    }
    await updateBookingsStatus(user._id);
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn:"1h" }
      
    );
    res.cookie('token', token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',  
      maxAge: 3600000       
    });
    
    
    res.cookie('userId', user._id.toString(), {
      httpOnly: false,     
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
   
    res.json({ 
      message: 'Autentificare reușită',
      role: user.role
    });
  }catch(err){
    console.error(err.message);
    res.status(500).send('Eroare server');
  }
});

// Rută pentru autentificarea administratorului
router.post('/admin/login', async(req, res) => {
  try{ 
    const {email, password} = req.body;
    const user = await User.findOne({email});
    
    if(!user){
      return res.status(400).json({errors:[{message: 'Credentiale invalide'}]});
    }
    
    if(user.role !== 'admin') {
      return res.status(403).json({errors:[{message: 'Acces interzis. Doar administratorii pot accesa această rută.'}]});
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ message: 'Credentiale invalide' }] });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn:"1h" }
    );
    
    res.cookie('adminToken', token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',  
      maxAge: 3600000       
    });
    
    res.cookie('adminId', user._id.toString(), {
      httpOnly: false,     
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
   
    res.json({ 
      message: 'Autentificare administrator reușită',
      role: user.role
    });
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Eroare server');
  }
});

router.put('/change-password', auth_cookie, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Ambele parole sunt necesare' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Parola curentă este incorectă' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});


router.get('/:userId', auth_cookie, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('ID din URL:', userId);
    console.log('ID din cookie:', req.cookies.userId);
    console.log('ID din req.user:', req.user.id);
    
    if (req.user.id !== userId) {
      console.log('ID-uri nu corespund:', {
        userIdFromURL: userId,
        userIdFromAuth: req.user.id
      });
      return res.status(403).json({ message: 'Nu aveți permisiunea de a accesa aceste date' });
    }
    
    const user = await User.findById(userId)
      .select('-passwordHash'); 
    
    if (!user) {
      console.log('Utilizatorul nu a fost găsit în baza de date');
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    console.log('Utilizator găsit:', user);
    
    const response = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      isVerified: user.isVerified,
      role: user.role,
      profile: user.profile,
      address: user.address,
      city: user.city,
      country: user.country,
      paymentInfo: user.paymentInfo
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Eroare la obținerea datelor utilizatorului:', error);
    res.status(500).json({ message: 'Eroare de server', error: error.message });
  }
});

router.put('/update-profile', auth_cookie, async(req, res) => {
  try{
    const {
      firstName,
      lastName,
      email,
      phoneNumber
    }=req.body;
    if(!firstName && !lastName && !email && !phoneNumber)
    {
      return res.status(400).json({ 
        message: 'Trebuie să furnizați cel puțin un câmp pentru actualizare',
        fields: {
          firstName: !!firstName,
          lastName: !!lastName,
          email: !!email,
          phoneNumber: !!phoneNumber
        }
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        message: 'Userul nu a fost găsit',
        userId: req.user.id 
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Acest email este deja înregistrat',
          field: 'email'
        });
      }
    }

    const updates = {};
    if(firstName) updates.firstName = firstName;
    if(lastName) updates.lastName = lastName;
    if(email) updates.email = email;
    if (phoneNumber) {
      const phoneRegex = /^(\+4|0)[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ 
          message: 'Numărul de telefon nu este valid',
          field: 'phoneNumber',
          format: 'Formatul corect: 0712345678'
        });
      }
      updates.phoneNumber = phoneNumber;
    }


    try{
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      if (!updatedUser) {
        return res.status(404).json({ 
          message: 'Nu s-a putut actualiza userul',
          userId: req.user.id
        });
      }

      console.log('Proprietar actualizat cu succes:', updatedUser);

      res.json({
        message: 'Profilul a fost actualizat cu succes',
        user: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
        }
      });
    }catch (updateError) {
      console.error('Eroare la salvarea actualizărilor:', updateError);
      return res.status(500).json({ 
        message: 'Eroare la salvarea actualizărilor',
        error: updateError.message
      });
    }
  }catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea profilului',
      error: error.message
    });
  }
});

// Ruta pentru obținerea listei de favorite
router.get('/:userId/favorites', auth_cookie, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('profile.savedProperties', 'name location.city images pricing.basePrice details.maxGuests rating')
      .select('profile.savedProperties');

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    res.json(user.profile.savedProperties);
  } catch (error) {
    console.error('Eroare la obținerea favoritelor:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Ruta pentru adăugarea unei proprietăți la favorite
router.post('/:userId/favorites/add', auth_cookie, async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: 'ID-ul proprietății este necesar' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }

    if (user.profile.savedProperties.includes(propertyId)) {
      return res.status(400).json({ message: 'Proprietatea este deja în lista de favorite' });
    }

    user.profile.savedProperties.push(propertyId);
    await user.save();

    res.json({ message: 'Proprietatea a fost adăugată la favorite' });
  } catch (error) {
    console.error('Eroare la adăugarea la favorite:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Ruta pentru eliminarea unei proprietăți din favorite
router.post('/:userId/favorites/remove', auth_cookie, async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: 'ID-ul proprietății este necesar' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const propertyIndex = user.profile.savedProperties.indexOf(propertyId);
    if (propertyIndex === -1) {
      return res.status(400).json({ message: 'Proprietatea nu este în lista de favorite' });
    }

    user.profile.savedProperties.splice(propertyIndex, 1);
    await user.save();

    res.json({ message: 'Proprietatea a fost eliminată din favorite' });
  } catch (error) {
    console.error('Eroare la eliminarea din favorite:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.get('/:userId/bookings', auth_cookie, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a accesa aceste date' });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'property',
        select: 'name location images pricing' 
      })
      .sort({ 'dates.checkIn': -1 }); 

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Eroare la obținerea rezervărilor:', error);
    res.status(500).json({ message: 'Eroare de server', error: error.message });
  }
});

router.post('/logout', auth_cookie, async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('userId', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: 'Deconectare reușită' });
  } catch (error) {
    console.error('Eroare la deconectare:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});


router.put('/save-booking-info', auth_cookie, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, city, country, paymentInfo } = req.body;
    
    const updateData = {};
    
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    
   
    if (paymentInfo) {
      if (paymentInfo.cardNumber) {
        const cardNumber = paymentInfo.cardNumber.replace(/\D/g, '');
        const lastFourDigits = cardNumber.slice(-4);
        
        
        const cardInfo = {
          lastFourDigits: lastFourDigits,
          isDefault: true
        };
        
        
        if (paymentInfo.expiryDate && paymentInfo.expiryDate.includes('/')) {
          const [month, year] = paymentInfo.expiryDate.split('/');
          cardInfo.expiryMonth = month;
          cardInfo.expiryYear = year;
        }
        
        updateData.paymentInfo = cardInfo;
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Informațiile pentru rezervare au fost salvate cu succes'
    });
    
  } catch (error) {
    console.error('Eroare la salvarea informațiilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la salvarea informațiilor',
      error: error.message
    });
  }
});

// Rută pentru verificarea autentificării administratorului
router.get('/admin/check-auth', admin_auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id)
      .select('-passwordHash');
    
    if (!admin) {
      return res.status(404).json({ message: 'Administrator negăsit' });
    }
    
    res.status(200).json({
      isAdmin: true,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Eroare la verificarea autentificării administratorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Rută pentru obținerea tuturor utilizatorilor (doar pentru admin)
router.get('/admin/all-users', admin_auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ registrationDate: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Eroare la obținerea listei de utilizatori:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Rută pentru administratori pentru a obține detaliile unui utilizator specific
router.get('/admin/user/:userId', admin_auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Eroare la obținerea detaliilor utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Rută pentru administratori pentru a actualiza un utilizator
router.put('/admin/update-user/:userId', admin_auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, role } = req.body;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Acest email este deja înregistrat de alt utilizator' });
      }
    }
    
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (role && ['client', 'admin'].includes(role)) updates.role = role;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    res.status(200).json({
      message: 'Utilizator actualizat cu succes',
      user: updatedUser
    });
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Rută pentru administratori pentru a șterge un utilizator
router.delete('/admin/delete-user/:userId', admin_auth, async (req, res) => {
  try {
    const { userId } = req.params;
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    if (user.role === 'admin' && userId === req.user.id) {
      return res.status(400).json({ message: 'Nu puteți șterge propriul cont de administrator' });
    }
    
    await User.findByIdAndDelete(userId);
    await Booking.updateMany(
      { user: userId },
      { $set: { status: 'anulată' } }
    );
    
    res.status(200).json({ message: 'Utilizator șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

export default router;