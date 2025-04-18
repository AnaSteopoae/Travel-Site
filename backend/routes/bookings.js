import express from 'express';
import { Booking, Property } from '../models/models.js';
import authMiddleware from '../middleware/auth_cookie.js';

const router = express.Router();

// Creare rezervare nouă
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      rooms,
      totalPrice,
      basePrice,
      guestDetails,
      specialRequests,
      arrivalTime,
      paymentMethod
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Proprietatea nu a fost găsită' });
    }

    const paymentStatus = paymentMethod === 'card' ? 'reușită' : 'în așteptare';

    const booking = new Booking({
      property: propertyId,
      user: req.user.id,
      dates: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut)
      },
      guests: {
        adults: guests,
        children: 0
      },
      rooms: rooms,
      pricing: {
        basePrice: basePrice,
        totalPrice: totalPrice
      },
      guestDetails: {
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        address: guestDetails.address,
        city: guestDetails.city,
        country: guestDetails.country
      },
      specialRequests,
      arrivalTime,
      status: 'confirmată',
      payment: {
        method: paymentMethod,
        status: paymentStatus
      }
    });

    const savedBooking = await booking.save();
    res.status(201).json({ 
      message: 'Rezervare creată cu succes',
      bookingId: savedBooking._id 
    });

  } catch (error) {
    console.error('Eroare la crearea rezervării:', error);
    res.status(500).json({ 
      message: 'Eroare la crearea rezervării', 
      error: error.message 
    });
  }
});

// Obține detaliile unei rezervări
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'name location images')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ message: 'Rezervarea nu a fost găsită' });
    }

    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți acces la această rezervare' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Eroare la obținerea rezervării:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea rezervării', 
      error: error.message 
    });
  }
});

// Actualizare rezervare
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { dates, guests } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Rezervarea nu a fost găsită' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să modificați această rezervare' });
    }

    if (booking.status === 'anulată') {
      return res.status(400).json({ message: 'Nu puteți modifica o rezervare anulată' });
    }

    if (new Date(booking.dates.checkIn) < new Date()) {
      return res.status(400).json({ message: 'Nu puteți modifica o rezervare care a început deja' });
    }

    booking.dates = dates;
    booking.guests = guests;

    const updatedBooking = await booking.save();

    res.json({
      message: 'Rezervare actualizată cu succes',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Eroare la actualizarea rezervării:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea rezervării', 
      error: error.message 
    });
  }
});

// Anulare rezervare
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Rezervarea nu a fost găsită' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să anulați această rezervare' });
    }

    if (new Date(booking.dates.checkIn) < new Date()) {
      return res.status(400).json({ message: 'Nu puteți anula o rezervare care a început deja' });
    }

    booking.status = 'anulată';
    await booking.save();

    res.json({
      message: 'Rezervare anulată cu succes'
    });

  } catch (error) {
    console.error('Eroare la anularea rezervării:', error);
    res.status(500).json({ 
      message: 'Eroare la anularea rezervării', 
      error: error.message 
    });
  }
});

// Actualizare status rezervare de către proprietar
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['confirmată', 'în așteptare', 'anulată', 'finalizată'].includes(status)) {
      return res.status(400).json({ error: 'Status invalid' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Rezervarea nu a fost găsită' });
    }

    const property = await Property.findById(booking.property);
    if (!property) {
      return res.status(404).json({ error: 'Proprietatea asociată rezervării nu a fost găsită' });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nu aveți permisiunea să modificați această rezervare' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Statusul rezervării a fost actualizat la "${status}"`,
      status: status
    });

  } catch (error) {
    console.error('Eroare la actualizarea statusului rezervării:', error);
    res.status(500).json({ error: 'Eroare la actualizarea statusului rezervării' });
  }
});

export default router; 