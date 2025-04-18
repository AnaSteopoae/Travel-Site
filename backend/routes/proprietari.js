import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Proprietar, Property } from '../models/models.js';
import auth_cookie from '../middleware/auth_cookie.js';
import admin_auth from '../middleware/admin_auth.js';


const router = express.Router();

router.post('/register', async(req, res) => {
    try{
        const {
            companyName,
            fiscalCode,
            email,
            phoneNumber,
            password
        }=req.body;
        let proprietar = await Proprietar.findOne({email});
        if(proprietar){
            return res.status(400).json({errors: [{message: 'Proprietarul deja este inregistrat'}]});
        }
        let proprietarByFiscalCode = await Proprietar.findOne({ fiscalCode });
        if(proprietarByFiscalCode){
            return res.status(400).json({errors: [{message: 'Acest cod fiscal este deja înregistrat'}]});
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newProprietar = new Proprietar({
            companyName,
            fiscalCode,
            email,
            phoneNumber,
            passwordHash
        });
        await newProprietar.save();
        const token = jwt.sign(
            { id: newProprietar._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
          );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });
        res.cookie('proprietarId', newProprietar._id.toString(), {
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

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const proprietar = await Proprietar.findOne({email});
        if(!proprietar)
        {
            return res.status(400).json({errors:[{message: 'Credentiale invalide'}]});
        }
        const isMatch = await bcrypt.compare(password,proprietar.passwordHash);
        if (!isMatch) {
        return res.status(400).json({ errors: [{ message: 'Credentiale invalide' }] });
        }
        const token = jwt.sign(
        { id: proprietar._id },
        process.env.JWT_SECRET,
        { expiresIn:"1h" }
        
        );
        res.cookie('token', token, {
            httpOnly: true,       
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',   
            maxAge: 3600000      
          });
          
          
          res.cookie('proprietarId', proprietar._id.toString(), {
            httpOnly: false,     
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
          });
          
          
          res.json({ message: 'Autentificare reușită' });
    }catch(err)
    {
        console.error(err.message);
        res.status(500).send('Eroare server');
    }
});



    // Ruta pentru obținerea detaliilor unui proprietar
router.get('/:proprietarId', auth_cookie, async (req, res) => {
  try {
    const proprietarId = req.params.proprietarId;
    const tokenId = req.user.id;
    
    console.log('ID proprietar din URL:', proprietarId);
    console.log('ID din token:', tokenId);
    
    if (tokenId !== proprietarId) {
      console.log('ID-uri nu corespund:', {
        proprietarId,
        tokenId
      });
      return res.status(403).json({ message: 'Nu aveți permisiunea de a accesa aceste date' });
    }
    
    
    const proprietar = await Proprietar.findById(proprietarId)
      .select('-passwordHash'); 
    
    if (!proprietar) {
      console.log('Proprietarul nu a fost găsit în baza de date');
      return res.status(404).json({ message: 'Proprietar negăsit' });
    }
    
    console.log('Proprietar găsit:', proprietar);
    
    const proprietati = await Property.find({ owner: proprietarId })
      .select('name location.city images pricing.basePrice details.numberOfRooms type details.maxGuests isActive rating.average rating.totalReviews');
    
    
    const response = {
      proprietar: {
        _id: proprietar._id,
        email: proprietar.email,
        companyName: proprietar.companyName,
        phoneNumber: proprietar.phoneNumber,
        fiscalCode: proprietar.fiscalCode,
        createdAt: proprietar.createdAt,
        verificationStatus: proprietar.verificationStatus
      },
      proprietati: proprietati || []
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Eroare la obținerea datelor proprietarului:', error);
    res.status(500).json({ message: 'Eroare de server', error: error.message });
  }
});

// Ruta pentru actualizarea profilului
router.put('/actualizeaza-profil', auth_cookie, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID din token:', req.user.id);

    const {
      companyName,
      fiscalCode,
      email,
      phoneNumber
    } = req.body;

    if (!companyName && !fiscalCode && !email && !phoneNumber) {
      return res.status(400).json({ 
        message: 'Trebuie să furnizați cel puțin un câmp pentru actualizare',
        fields: {
          companyName: !!companyName,
          fiscalCode: !!fiscalCode,
          email: !!email,
          phoneNumber: !!phoneNumber
        }
      });
    }

    const proprietar = await Proprietar.findById(req.user.id);
    if (!proprietar) {
      return res.status(404).json({ 
        message: 'Proprietarul nu a fost găsit',
        userId: req.user.id 
      });
    }

    if (email && email !== proprietar.email) {
      const existingProprietar = await Proprietar.findOne({ email });
      if (existingProprietar) {
        return res.status(400).json({ 
          message: 'Acest email este deja înregistrat',
          field: 'email'
        });
      }
    }

    if (fiscalCode && fiscalCode !== proprietar.fiscalCode) {
      const existingProprietar = await Proprietar.findOne({ fiscalCode });
      if (existingProprietar) {
        return res.status(400).json({ 
          message: 'Acest cod fiscal este deja înregistrat',
          field: 'fiscalCode'
        });
      }
    }

    const updates = {};
    if (companyName) updates.companyName = companyName;
    if (email) updates.email = email;
    if (fiscalCode) updates.fiscalCode = fiscalCode;
    
    if (phoneNumber) {
      // Validăm formatul numărului de telefon
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

    try {
      const updatedProprietar = await Proprietar.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      if (!updatedProprietar) {
        return res.status(404).json({ 
          message: 'Nu s-a putut actualiza proprietarul',
          userId: req.user.id
        });
      }

      console.log('Proprietar actualizat cu succes:', updatedProprietar);

      res.json({
        message: 'Profilul a fost actualizat cu succes',
        proprietar: {
          _id: updatedProprietar._id,
          companyName: updatedProprietar.companyName,
          fiscalCode: updatedProprietar.fiscalCode,
          email: updatedProprietar.email,
          phoneNumber: updatedProprietar.phoneNumber,
          verificationStatus: updatedProprietar.verificationStatus,
          createdAt: updatedProprietar.createdAt
        }
      });

    } catch (updateError) {
      console.error('Eroare la salvarea actualizărilor:', updateError);
      return res.status(500).json({ 
        message: 'Eroare la salvarea actualizărilor',
        error: updateError.message
      });
    }

  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea profilului',
      error: error.message
    });
  }
});

// Ruta pentru schimbarea parolei
router.put('/schimba-parola', auth_cookie, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Trebuie să furnizați atât parola curentă cât și noua parolă' });
    }

    const proprietar = await Proprietar.findById(req.user.id);
    if (!proprietar) {
      return res.status(404).json({ message: 'Proprietarul nu a fost găsit' });
    }

    const isMatch = await bcrypt.compare(currentPassword, proprietar.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Parola curentă este incorectă' });
    }

    const salt = await bcrypt.genSalt(10);
    proprietar.passwordHash = await bcrypt.hash(newPassword, salt);

    await proprietar.save();

    res.json({ message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({ message: 'Eroare la schimbarea parolei' });
  }
});

// Ruta pentru administratori pentru a obține toți proprietarii
router.get('/admin/all', admin_auth, async (req, res) => {
  try {
    const proprietari = await Proprietar.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    
    
    const proprietariCuProprietati = await Promise.all(
      proprietari.map(async (proprietar) => {
        const proprietati = await Property.find({ owner: proprietar._id })
          .select('name location.city type isActive');
        
        return {
          _id: proprietar._id,
          companyName: proprietar.companyName,
          fiscalCode: proprietar.fiscalCode,
          email: proprietar.email,
          phoneNumber: proprietar.phoneNumber,
          verificationStatus: proprietar.verificationStatus,
          createdAt: proprietar.createdAt,
          proprietati: proprietati || []
        };
      })
    );
    
    res.status(200).json(proprietariCuProprietati);
  } catch (error) {
    console.error('Eroare la obținerea listei de proprietari:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Rută pentru actualizarea statusului de verificare a unui proprietar (doar pentru admin)
router.patch('/admin/update-status/:proprietarId', admin_auth, async (req, res) => {
  try {
    const { proprietarId } = req.params;
    const { verificationStatus } = req.body;
    
    if (!verificationStatus || !['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ 
        message: 'Status invalid. Statusul trebuie să fie: pending, verified sau rejected' 
      });
    }
    
    const updatedProprietar = await Proprietar.findByIdAndUpdate(
      proprietarId,
      { $set: { verificationStatus } },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedProprietar) {
      return res.status(404).json({ message: 'Proprietar negăsit' });
    }
    
    res.status(200).json({
      message: 'Status actualizat cu succes',
      proprietar: {
        _id: updatedProprietar._id,
        companyName: updatedProprietar.companyName,
        verificationStatus: updatedProprietar.verificationStatus
      }
    });
  } catch (error) {
    console.error('Eroare la actualizarea statusului proprietarului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.post('/logout', auth_cookie, async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('proprietarId', {
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

export default router;