import express from 'express';
import { Property, Booking } from '../models/models.js';
import authMiddleware from '../middleware/auth_cookie.js'; 

const router=express.Router();

router.post('/register',authMiddleware, async(req,res) => {
    try{
      const {
        name,
        description,
        location,
        type,
        details,
        pricing,
        images,
        isActive
      } = req.body;
      const propertyData = {
        owner: req.user.id, 
        
        name,
        description,
        
        location: {
          city: location.city,
          county: location.county,
          country: location.country || 'Romania',
          street: location.street,
          number: location.number,
          building: location.building,
          entrance: location.entrance,
          apartment: location.apartment ? Number(location.apartment) : undefined
        },
        
        type,
        
        details: {
          maxGuests: Number(details.maxGuests),
          numberOfRooms: details.numberOfRooms ? Number(details.numberOfRooms) : undefined,
          surfaceArea: details.surfaceArea ? Number(details.surfaceArea) : undefined,
          amenities: details.amenities || []
        },
        
        pricing: {
          basePrice: Number(pricing.basePrice),
          weekendPrice: pricing.weekendPrice ? Number(pricing.weekendPrice) : undefined,
          seasonalPricing: pricing.seasonalPricing
            .filter(sp => sp.price)
            .map(sp => ({
              season: sp.season,
              price: Number(sp.price)
            }))
        },
        
        images: images, // URL-urile imaginilor încărcate pe Cloudinary
        
        availability: [], // Array gol pentru disponibilitate inițială
        reviews: [], // Array gol pentru recenzii inițiale
        rating: {
          average: 0,
          totalReviews: 0
        },
        
        isActive: isActive !== undefined ? isActive : true
      };
  
      
      const property = new Property(propertyData);
      const savedProperty = await property.save();
  
      
      res.status(201).json({ propertyId: savedProperty._id });
    } catch (error) {
      console.error('Eroare la adăugarea proprietății:', error);
      res.status(500).json({ message: 'Eroare server la adăugarea proprietății' });
    }
  
});

// Endpoint pentru căutarea proprietăților
router.get('/search', async (req, res) => {
  try {
    const { 
      destination, 
      checkIn, 
      checkOut, 
      adults = 1, 
      children = 0,
      rooms = 1
    } = req.query;

    let query = { isActive: true };

    if (destination) {
      query['location.city'] = { 
        $regex: new RegExp(destination, 'i') 
      };
    }

    const totalGuests = parseInt(adults) + parseInt(children);
    if (totalGuests > 0) {
      query['details.maxGuests'] = { $gte: totalGuests };
    }

    if (rooms) {
      query['details.numberOfRooms'] = { $gte: parseInt(rooms) };
    }

    const properties = await Property.find(query)
      .select('name type location.city images pricing.basePrice details.maxGuests details.numberOfRooms details.amenities rating owner');
    
    
    const { Proprietar } = await import('../models/models.js');
    
   
    const ownerIds = [...new Set(properties.map(property => property.owner))];
    const proprietari = await Proprietar.find({ _id: { $in: ownerIds } });
    
    const proprietariMap = {};
    proprietari.forEach(proprietar => {
      proprietariMap[proprietar._id.toString()] = proprietar.verificationStatus;
    });
    
    const filteredProperties = properties.filter(property => {
      const ownerId = property.owner.toString();
      const status = proprietariMap[ownerId];
      return status !== 'rejected';
    });
  
    const cleanProperties = filteredProperties.map(property => {
      const propertyObj = property.toObject();
      delete propertyObj.owner;
      return propertyObj;
    });
    
    res.json(cleanProperties);
  } catch (error) {
    console.error('Eroare la căutarea proprietăților:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.get('/proprietari/:id', async(req, res) => {
  try {
    const propertyId = req.params.id;
    console.log('Am ajuns aici');
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }
    
    const { Proprietar } = await import('../models/models.js');
    const proprietar = await Proprietar.findById(property.owner);
    
    
    if (proprietar && proprietar.verificationStatus === 'rejected') {
      return res.status(403).json({ message: 'Această proprietate nu este disponibilă' });
    }
    
    
    const fullProperty = await Property.findById(propertyId)
      .populate('reviews.userId', 'name');
    
    res.json(fullProperty);
  } catch (error) {
    console.error('Eroare la obținerea proprietății:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log('Am ajuns aici');
    
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }
    
    const { Proprietar } = await import('../models/models.js');
    const proprietar = await Proprietar.findById(property.owner);
   
    const path = req.originalUrl;
    const isInternalEndpoint = path.includes('/disponibilitate') || 
                               path.includes('/rezervari') || 
                               path.includes('/check-availability');
    
    if (!isInternalEndpoint && proprietar && proprietar.verificationStatus === 'rejected') {
      return res.status(403).json({ message: 'Această proprietate nu este disponibilă' });
    }
    
    const fullProperty = await Property.findById(propertyId)
      .populate('reviews.userId', 'firstName lastName');
    
    console.log('Property reviews after populate:', fullProperty.reviews);
    
    res.json(fullProperty);
  } catch (error) {
    console.error('Eroare la obținerea proprietății:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      type,
      details,
      pricing,
      images,
      isActive
    } = req.body;

    const propertyData = {
      name,
      description,
      location: {
        city: location.city,
        county: location.county,
        country: location.country || 'Romania',
        street: location.street,
        number: location.number,
        building: location.building,
        entrance: location.entrance,
        apartment: location.apartment ? Number(location.apartment) : undefined
      },
      type,
      details: {
        maxGuests: Number(details.maxGuests),
        numberOfRooms: details.numberOfRooms ? Number(details.numberOfRooms) : undefined,
        surfaceArea: details.surfaceArea ? Number(details.surfaceArea) : undefined,
        amenities: details.amenities || []
      },
      pricing: {
        basePrice: Number(pricing.basePrice),
        weekendPrice: pricing.weekendPrice ? Number(pricing.weekendPrice) : undefined,
        seasonalPricing: pricing.seasonalPricing
          .filter(sp => sp.price)
          .map(sp => ({
            season: sp.season,
            price: Number(sp.price)
          }))
      },
      images,
      isActive: isActive !== undefined ? isActive : true
    };

    
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a edita această proprietate' });
    }

   
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      propertyData,
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error('Eroare la actualizarea proprietății:', error);
    res.status(500).json({ message: 'Eroare server la actualizarea proprietății' });
  }
});


router.post('/:id/check-availability', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { checkIn, checkOut, excludeBookingId } = req.body;

    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }

    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        message: 'Data de check-out trebuie să fie după data de check-in',
        available: false 
      });
    }

    
    const overlappingBookings = await Booking.find({
      property: propertyId,
      status: { $ne: 'anulată' }, 
      $or: [
        {
          'dates.checkIn': { $lt: checkOutDate },
          'dates.checkOut': { $gt: checkInDate }
        }
      ]
    });

    
    const conflictingBookings = excludeBookingId 
      ? overlappingBookings.filter(booking => booking._id.toString() !== excludeBookingId)
      : overlappingBookings;

      const hasConflictingBookings = conflictingBookings.length > 0;
    
      
      let hasBlockedDates = false;
      
      if (property.blockedDates && property.blockedDates.length > 0) {
       
        const daysToCheck = [];
        const currentDate = new Date(checkInDate);
        
        while (currentDate < checkOutDate) {
          daysToCheck.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        
        hasBlockedDates = daysToCheck.some(day => 
          property.blockedDates.some(blockedDate => {
            const blocked = new Date(blockedDate);
            return (
              day.getFullYear() === blocked.getFullYear() &&
              day.getMonth() === blocked.getMonth() &&
              day.getDate() === blocked.getDate()
            );
          })
        );
      }
  
      const isAvailable = !hasConflictingBookings && !hasBlockedDates;

    res.json({
      available: isAvailable,
      message: isAvailable 
        ? 'Proprietatea este disponibilă în perioada selectată'
        : 'Proprietatea nu este disponibilă în perioada selectată'
    });

  } catch (error) {
    console.error('Eroare la verificarea disponibilității:', error);
    res.status(500).json({ 
      message: 'Eroare la verificarea disponibilității', 
      error: error.message,
      available: false
    });
  }
});

// Verifică dacă un utilizator poate lăsa o recenzie
router.get('/:id/can-review', authMiddleware, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      $or: [
        { property: propertyId },
        { propertyId: propertyId }
      ],
      user: userId,
      $or: [
        { status: 'finalizată' },
        { 'dates.checkOut': { $lt: new Date() } }
      ]
    });

    if (booking) {
      console.log(`Status booking: ${booking.status}`);
      console.log(`Data check-out: ${booking.dates.checkOut}`);
    }

    // Verifică dacă utilizatorul a lăsat deja o recenzie
    const property = await Property.findById(propertyId);
    const hasReviewed = property.reviews.some(review => 
      review.userId && review.userId.toString() === userId.toString()
    );

    res.json({
      canReview: booking !== null && !hasReviewed
    });
  } catch (error) {
    console.error('Eroare la verificarea eligibilității pentru recenzie:', error);
    res.status(500).json({ error: 'Eroare la verificarea eligibilității pentru recenzie' });
  }
});

// Adaugă o recenzie nouă
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;
    
    console.log('Adaugă recenzie - Datele utilizatorului:', {
      userId: userId,
      userObject: req.user,
      propertyId: propertyId
    });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating invalid' });
    }

    const booking = await Booking.findOne({
      $or: [
        { property: propertyId },
        { propertyId: propertyId }
      ],
      user: userId,
      $or: [
        { status: 'finalizată' },
        { 'dates.checkOut': { $lt: new Date() } }
      ]
    });

    if (!booking) {
      return res.status(403).json({ 
        error: 'Trebuie să ai o rezervare finalizată pentru a lăsa o recenzie' 
      });
    }

    const property = await Property.findById(propertyId);
    
    if (property.reviews.some(review => review.userId && review.userId.toString() === userId)) {
      return res.status(403).json({ error: 'Ai lăsat deja o recenzie pentru această proprietate' });
    }


    const { User } = await import('../models/models.js');
    const userDetails = await User.findById(userId);
    console.log('User details găsit:', userDetails);

   
    const newReview = {
      userId,
      rating,
      comment,
      date: new Date()
    };

    property.reviews.push(newReview);

    const totalRating = property.reviews.reduce((sum, review) => sum + review.rating, 0);
    property.rating.average = totalRating / property.reviews.length;
    property.rating.totalReviews = property.reviews.length;

    await property.save();

    const userName = userDetails ? 
      `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Utilizator' : 
      'Utilizator';

    res.json({
      ...newReview,
      newAverageRating: property.rating.average,
      user: userName,
      date: new Date().toLocaleDateString('ro-RO')
    });
  } catch (error) {
    console.error('Eroare la adăugarea recenziei:', error);
    res.status(500).json({ error: 'Eroare la adăugarea recenziei' });
  }
});

// Endpoint pentru obținerea disponibilității proprietății
router.get('/:id/disponibilitate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea nu a fost găsită' });
    }
    
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nu aveți permisiunea de a accesa această proprietate' });
    }
    
    const bookings = await Booking.find({
      $or: [
        { property: id },
        { propertyId: id }
      ]
    });
    

    const bookedDates = [];
    bookings.forEach(booking => {
      const start = new Date(booking.dates?.checkIn || booking.checkIn);
      const end = new Date(booking.dates?.checkOut || booking.checkOut);
      
      //console.log(`Procesez rezervarea de la ${start.toISOString()} până la ${end.toISOString()}`);
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        bookedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    //console.log(`Total date rezervate generate: ${bookedDates.length}`);
    
    res.json({
      blockedDates: (property.blockedDates || []).map(date => date.toISOString()),
      bookedDates: bookedDates.map(date => date.toISOString())
    });
  } catch (error) {
    console.error('Eroare la obținerea disponibilității:', error);
    res.status(500).json({ error: 'Eroare la obținerea disponibilității' });
  }
});

// Endpoint pentru actualizarea disponibilității proprietății
router.post('/:id/disponibilitate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, dates } = req.body;
    
    if (!action || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Date invalide. Este necesară o acțiune și o listă de date.' });
    }
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea nu a fost găsită' });
    }
    
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nu aveți permisiunea de a modifica această proprietate' });
    }
    
    
    if (!property.blockedDates) {
      property.blockedDates = [];
    }
    
    if (action === 'block') {
      property.blockedDates = [...property.blockedDates, ...dates];
    } else if (action === 'unblock') {
      property.blockedDates = property.blockedDates.filter(
        blockedDate => !dates.includes(blockedDate.toISOString())
      );
    } else {
      return res.status(400).json({ error: 'Acțiune invalidă. Folosiți "block" sau "unblock".' });
    }
    
    await property.save();
    
    res.json({ 
      success: true, 
      message: action === 'block' ? 'Datele au fost blocate cu succes' : 'Datele au fost deblocate cu succes',
      blockedDates: property.blockedDates
    });
  } catch (error) {
    console.error('Eroare la actualizarea disponibilității:', error);
    res.status(500).json({ error: 'Eroare la actualizarea disponibilității' });
  }
});

// Endpoint pentru a obține toate rezervările pentru o proprietate
router.get('/:id/rezervari', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea nu a fost găsită' });
    }
    
    const bookings = await Booking.find({ 
      $or: [
        { property: id },
        { propertyId: id }
      ] 
    }).populate('user', 'firstName lastName email phoneNumber country');

    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      user: booking.user,
      dates: {
        checkIn: booking.dates?.checkIn || booking.checkIn,
        checkOut: booking.dates?.checkOut || booking.checkOut
      },
      guests: booking.guests,
      pricing: booking.pricing,
      status: booking.status || 'în așteptare',
      specialRequests: booking.specialRequests,
      payment: booking.payment
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Eroare la obținerea rezervărilor:', error);
    res.status(500).json({ error: 'Eroare la obținerea rezervărilor', details: error.message });
  }
});

router.put('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea nu a fost găsită' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nu aveți permisiunea de a dezactiva această proprietate' });
    }
    
    property.isActive = false;
    await property.save();
    
    res.json({ 
      success: true, 
      message: 'Proprietatea a fost dezactivată cu succes' 
    });
  } catch (error) {
    console.error('Eroare la dezactivarea proprietății:', error);
    res.status(500).json({ error: 'Eroare la dezactivarea proprietății', details: error.message });
  }
});

// Rută pentru activarea unei proprietăți
router.put('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea nu a fost găsită' });
    }
    
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nu aveți permisiunea de a activa această proprietate' });
    }
    
    property.isActive = true;
    await property.save();
    
    res.json({ 
      success: true, 
      message: 'Proprietatea a fost activată cu succes' 
    });
  } catch (error) {
    console.error('Eroare la activarea proprietății:', error);
    res.status(500).json({ error: 'Eroare la activarea proprietății', details: error.message });
  }
});

export default router;