import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, InputGroup, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'bootstrap-icons/font/bootstrap-icons.css';


const colors = {
  primary: '#8075ff',
  secondary: '#c16ecf',
  text: '#6a11cb',
  accentColor: '#9370DB',
  lightPurple: '#f5f0ff',
  darkPurple: '#5b42a5',
  gradientPrimary: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 100%)',
  gradientSecondary: 'linear-gradient(135deg, #8075ff 25%, #c16ecf 100%)',
  buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)',
};

const PropertyRegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [proprietarId, setProprietarID] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [property, setProperty] = useState({
    name: '',
    description: '',
    location: {
      city: '',
      county: '',
      country: 'Romania',
      street: '', 
      number: '', 
      building: '', 
      entrance: '',
      apartment: ''
    },
    type: '',
    details: {
      maxGuests: '',
      numberOfRooms: '',
      surfaceArea: '',
      amenities: []
    },
    pricing: {
      basePrice: '',
      weekendPrice: '',
      seasonalPricing: [
        { season: 'Vară', price: '' },
        { season: 'Iarnă', price: '' }
      ]
    },
    images: [
      { data: '', isPrimary: true, name: '', type: '', preview: '' }
    ],
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);

 
  const romanianCounties = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila',
    'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța',
    'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
    'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova',
    'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea',
    'Vaslui', 'Vrancea'
  ];

  
  const citiesByCounty = {
    'Alba': ['Alba Iulia', 'Aiud'],
    'Arad': ['Arad'],
    'Argeș': ['Pitești', 'Curtea de Argeș'],
    'Bacău': ['Bacău'],
    'Bihor': ['Oradea'],
    'Bistrița-Năsăud': ['Bistrița'],
    'Botoșani': ['Botoșani'],
    'Brăila': ['Brăila'],
    'Brașov': ['Brașov', 'Râșnov'],
    'București': ['București'],
    'Buzău': ['Buzău'],
    'Călărași': ['Călărași'],
    'Caraș-Severin': ['Reșița', 'Caransebeș'],
    'Cluj': ['Cluj-Napoca', 'Turda'],
    'Constanța': ['Constanța', 'Mangalia'],
    'Covasna': ['Sfântu Gheorghe'],
    'Dâmbovița': ['Târgoviște', 'Moreni'],
    'Dolj': ['Craiova'],
    'Galați': ['Galați', 'Tecuci'],
    'Giurgiu': ['Giurgiu'],
    'Gorj': ['Târgu Jiu'],
    'Harghita': ['Miercurea Ciuc', 'Odorheiu Secuiesc'],
    'Hunedoara': ['Deva', 'Hunedoara'],
    'Ialomița': ['Slobozia'],
    'Iași': ['Iași', 'Pașcani'],
    'Ilfov': ['Buftea'],
    'Maramureș': ['Baia Mare', 'Sighetu Marmației'],
    'Mehedinți': ['Drobeta-Turnu Severin'],
    'Mureș': ['Târgu Mureș', 'Reghin'],
    'Neamț': ['Piatra Neamț', 'Roman'],
    'Olt': ['Slatina'],
    'Prahova': ['Ploiești', 'Câmpina'],
    'Sălaj': ['Zalău'],
    'Satu Mare': ['Satu Mare', 'Carei'],
    'Sibiu': ['Sibiu', 'Mediaș'],
    'Suceava': ['Suceava', 'Fălticeni'],
    'Teleorman': ['Alexandria', 'Roșiorii de Vede'],
    'Timiș': ['Timișoara', 'Lugoj'],
    'Tulcea': ['Tulcea'],
    'Vâlcea': ['Râmnicu Vâlcea'],
    'Vaslui': ['Vaslui'],
    'Vrancea': ['Focșani']
  };
  
  
  const propertyTypes = ['apartament', 'casă', 'vilă', 'cameră de hotel', 'bungalow'];
  
  const amenityOptions = [
    'Wi-Fi',
    'Parcare',
    'Aer condiționat',
    'Încălzire',
    'TV',
    'Bucătărie',
    'Mașină de spălat',
    'Uscător',
    'Piscină',
    'Grătar',
    'Terasă',
    'Vedere la mare/munte',
    'Mic dejun inclus',
    'Animale de companie permise',
    'Recepție 24/7',
    'Room service',
    'Saună',
    'Jacuzzi',
    'Sală de fitness',
    'Acces pentru persoane cu dizabilități',
    'Serviciu de curățenie',
    'Balcon',
    'Bar',
    'Restaurant',
    'Loc de joacă pentru copii',
    'Șemineu',
    'Seif',
    'Mini-frigider',
    'Espressor / aparat de cafea'
  ];

  const amenityIcons = {
    'Wi-Fi': 'bi-wifi',
    'Parcare': 'bi-p-square-fill',
    'Aer condiționat': 'bi-thermometer-snow',
    'Încălzire': 'bi-thermometer-high',
    'TV': 'bi-tv',
    'Bucătărie': 'bi-cup-hot',
    'Mașină de spălat': 'bi-water',
    'Uscător': 'bi-tornado',
    'Piscină': 'bi-water',
    'Grătar': 'bi-fire',
    'Terasă': 'bi-house',
    'Vedere la mare/munte': 'bi-binoculars-fill',
    'Mic dejun inclus': 'bi-egg-fried',
    'Animale de companie permise': 'bi-emoji-smile',
    'Recepție 24/7': 'bi-clock',
    'Room service': 'bi-bell',
    'Saună': 'bi-droplet-half',
    'Jacuzzi': 'bi-water',
    'Sală de fitness': 'bi-bicycle',
    'Acces pentru persoane cu dizabilități': 'bi-person-badge',
    'Serviciu de curățenie': 'bi-brush',
    'Balcon': 'bi-door-open',
    'Bar': 'bi-cup-straw',
    'Restaurant': 'bi-shop',
    'Loc de joacă pentru copii': 'bi-emoji-laughing',
    'Șemineu': 'bi-fire',
    'Seif': 'bi-safe',
    'Mini-frigider': 'bi-archive',
    'Espressor / aparat de cafea': 'bi-cup'
  };

  const cardStyle = {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)',
    marginBottom: '24px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };
  
  const cardHeaderStyle = {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold',
    border: 'none',
    padding: '15px 20px'
  };

  useEffect(() => {
    const proprietarId = getCookie('proprietarId');
    if(proprietarId) {
      setProprietarID(proprietarId);
    } else {
      setSubmissionError('Nu s-a putut găsi ID-ul proprietarului. Te rugăm să te autentifici din nou.');
    }
  }, []);

  useEffect(() => {
    if (property.location.county && citiesByCounty[property.location.county]) {
      setFilteredCities(citiesByCounty[property.location.county]);
      if (property.location.city && !citiesByCounty[property.location.county].includes(property.location.city)) {
        setProperty(prevState => ({
          ...prevState,
          location: {
            ...prevState.location,
            city: ''  
          }
        }));
      }
    } else {
      setFilteredCities([]);
    }
  }, [property.location.county]);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setProperty(prevState => {
        const newState = { ...prevState };
        
        if (keys.length === 2) {
          newState[keys[0]] = {
            ...newState[keys[0]],
            [keys[1]]: value
          };
        } else if (keys.length === 3) {
          newState[keys[0]] = {
            ...newState[keys[0]],
            [keys[1]]: {
              ...newState[keys[0]][keys[1]],
              [keys[2]]: value
            }
          };
        }
        
        return newState;
      });
    } else {
      setProperty({ ...property, [name]: value });
    }
  };

  const handleAmenityChange = (e, amenity) => {
    setProperty(prevState => {
      const updatedAmenities = prevState.details.amenities.includes(amenity)
        ? prevState.details.amenities.filter(a => a !== amenity)
        : [...prevState.details.amenities, amenity];
      
      return {
        ...prevState,
        details: {
          ...prevState.details,
          amenities: updatedAmenities
        }
      };
    });
  };

  
  const handleSeasonalPriceChange = (index, value) => {
    setProperty(prevState => {
      const seasonalPricing = [...prevState.pricing.seasonalPricing];
      seasonalPricing[index] = {
        ...seasonalPricing[index],
        price: value
      };
      
      return {
        ...prevState,
        pricing: {
          ...prevState.pricing,
          seasonalPricing
        }
      };
    });
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.type.match('image.*')) {
      setSubmissionError('Vă rugăm să selectați doar fișiere imagine (JPG, PNG, etc.)');
      return;
    }
  
    // Limita de mărime a fișierului (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB în bytes
    if (file.size > maxSize) {
      setSubmissionError('Imaginea este prea mare. Vă rugăm să selectați o imagine mai mică de 5MB.');
      return;
    }
  
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageData = e.target.result; // Aceasta este imaginea în format base64
      
      setProperty(prevState => {
        const images = [...prevState.images];
        images[index] = {
          ...images[index],
          data: imageData,
          name: file.name,
          type: file.type,
          preview: URL.createObjectURL(file)
        };
        
        return {
          ...prevState,
          images
        };
      });
    };
    
    reader.readAsDataURL(file); // Convertește imaginea în base64
  };

  // Handler pentru adăugarea unei imagini noi
  const handleAddImage = () => {
    if (property.images.length >= 5) {
      setSubmissionError('Nu puteți adăuga mai mult de 5 imagini.');
      return;
    }
    
    setProperty(prevState => ({
      ...prevState,
      images: [...prevState.images, { data: '', isPrimary: false, name: '', type: '', preview: '' }]
    }));
  };

  // Handler pentru setarea imaginii primare
  const handlePrimaryImageChange = (index) => {
    setProperty(prevState => {
      const images = prevState.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
      
      return {
        ...prevState,
        images
      };
    });
  };

  const handleRemoveImage = (index) => {
    setProperty(prevState => {
      const images = prevState.images.filter((_, i) => i !== index);
     
      if (index === prevState.images.findIndex(img => img.isPrimary) && images.length > 0) {
        images[0].isPrimary = true;
      }
      
      return {
        ...prevState,
        images
      };
    });
  };

  const showApartmentFields = () => {
    return property.type === 'apartament' || property.type === 'cameră de hotel';
  };

  const resetForm = () => {
    setProperty({
      name: '',
      description: '',
      location: {
        city: '',
        county: '',
        country: 'Romania',
        street: '', 
        number: '', 
        building: '', 
        entrance: '',
        apartment: ''
      },
      type: '',
      details: {
        maxGuests: '',
        numberOfRooms: '',
        surfaceArea: '',
        amenities: []
      },
      pricing: {
        basePrice: '',
        weekendPrice: '',
        seasonalPricing: [
          { season: 'Vară', price: '' },
          { season: 'Iarnă', price: '' }
        ]
      },
      images: [
        { data: '', isPrimary: true, name: '', type: '', preview: '' }
      ],
      isActive: true
    });
    setSubmissionSuccess(false);
    setSubmittedData(null);
  };

  
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    
    if (file.data.startsWith('data:')) {
      const byteString = atob(file.data.split(',')[1]);
      const mimeString = file.data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      formData.append('image', blob, file.name || `image.${mimeString.split('/')[1]}`);
    } else {
      const response = await fetch(file.data);
      const blob = await response.blob();
      formData.append('image', blob, file.name || 'image.jpg');
    }
    
    try {
      const res = await fetch('/api/images/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Eroare la încărcarea imaginii');
      }
      
      const data = await res.json();
      return data.url; // URL-ul securizat al imaginii
    } catch (error) {
      console.error('Eroare:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!property.name || !property.type || !property.location.county || 
      !property.location.city || !property.location.street || 
      !property.location.number || !property.pricing.basePrice) {
      setSubmissionError('Completați toate câmpurile obligatorii marcate cu *');
      return;
    }
    if(!proprietarId) {
      setSubmissionError('Nu s-a putut identifica proprietarul');
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);
    try{
      const uploadPromises = property.images
      .filter(img => img.data)
      .map(async (img) => {
        const url = await uploadImageToCloudinary(img);
        return {
          url,
          isPrimary: img.isPrimary
        };
      });
      
      const uploadedImages = await Promise.all(uploadPromises);

      const propertyToSubmit = {
        owner: proprietarId, 
        name: property.name,
        description: property.description,
        location: {
          city: property.location.city,
          county: property.location.county,
          country: property.location.country || 'Romania',
          street: property.location.street,
          number: property.location.number,
          building: property.location.building || undefined,
          entrance: property.location.entrance || undefined,
          apartment: property.location.apartment ? Number(property.location.apartment) : undefined
        },
        type: property.type,
        details: {
          maxGuests: Number(property.details.maxGuests),
          numberOfRooms: property.details.numberOfRooms ? Number(property.details.numberOfRooms) : undefined,
          surfaceArea: property.details.surfaceArea ? Number(property.details.surfaceArea) : undefined,
          amenities: property.details.amenities || []
        },
        pricing: {
          basePrice: Number(property.pricing.basePrice),
          weekendPrice: property.pricing.weekendPrice ? Number(property.pricing.weekendPrice) : undefined,
          seasonalPricing: property.pricing.seasonalPricing
            .filter(sp => sp.price)
            .map(sp => ({
              season: sp.season,
              price: Number(sp.price)
            }))
        },
        images: uploadedImages, 
        availability: [], 
        reviews: [], 
        rating: {
          average: 0,
          totalReviews: 0
        },
        isActive: property.isActive
      };
      const response = await fetch('/api/proprietati/register', {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(propertyToSubmit)
      });
      if(!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch (e) {
          errorDetails = { message: 'Eroare necunoscută' };
        }
        
        throw new Error(`Eroare server: ${response.status} - ${errorDetails.message || response.statusText}`);
      }
      const data = await response.json();
      
     
      setSubmissionSuccess(true);
      setSubmittedData(data);

      setTimeout(() => {
        if(data && data.propertyId){
          console.log('Id ul trimis: ', data.propertyId);
          navigate(`/proprietati/${data.propertyId}`);
        }
        else{
          console.error('Nu s-a putut obtine ID-ul proprietatii');
        }
      }, 2000);
    }catch (error) {
      console.error('Eroare la trimiterea datelor:', error);
      setSubmissionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  return (
    <div style={{ background: colors.lightPurple, minHeight: '100vh', paddingBottom: '40px' }}>
      <div 
        style={{ 
          background: colors.gradientPrimary,
          padding: '15px 0',
          marginBottom: '30px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Înregistrare proprietate nouă</h2>
            <div>
              <Link 
                to={`/proprietar/${proprietarId}`}
                className="btn rounded-pill me-2"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <i className="bi bi-house me-2"></i>
                Dashboard
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-3">
        {submissionSuccess && (
          <Alert 
            variant="success" 
            onClose={() => setSubmissionSuccess(false)} 
            dismissible
            style={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
              color: 'white',
              marginBottom: '20px'
            }}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2 fs-4"></i>
              <div>
                <Alert.Heading>Proprietate înregistrată cu succes!</Alert.Heading>
                <p className="mb-0">Proprietatea a fost adăugată în baza de date.</p>
                {submittedData && submittedData.id && (
                  <p className="mb-0">ID-ul proprietății: {submittedData.id}</p>
                )}
              </div>
            </div>
          </Alert>
        )}
          
        {submissionError && (
          <Alert 
            variant="danger" 
            onClose={() => setSubmissionError(null)} 
            dismissible
            style={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px'
            }}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
              <div>
                <Alert.Heading>Eroare la înregistrare</Alert.Heading>
                <p className="mb-0">{submissionError}</p>
              </div>
            </div>
          </Alert>
        )}

        
        <Card style={cardStyle}>
          <Card.Body className="p-0">
            <div className="position-relative">
              {property.images[0].preview ? (
                <>
                  <div style={{ height: '400px', overflow: 'hidden' }}>
                    <img
                      src={property.images[0].preview}
                      alt={property.name || "Imagine proprietate"}
                      className="w-100"
                      style={{ objectFit: 'cover', cursor: 'pointer', minHeight: '100%' }}
                      onClick={() => openImageModal(property.images[0])}
                    />
                  </div>
                  <div 
                    className="position-absolute bottom-0 start-0 p-4 w-100" 
                    style={{ 
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '40px 20px 20px 20px'
                    }}
                  >
                    <div className="container">
                      <h1 className="text-white mb-0 display-5 fw-bold">{property.name || "Numele proprietății"}</h1>
                      {property.location.city && property.location.county && (
                        <p className="text-white mb-0 fs-5">
                          <FaMapMarkerAlt className="me-2" /> {property.location.city}, {property.location.county}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div 
                  style={{ 
                    height: '300px', 
                    background: colors.lightPurple,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  <i className="bi bi-image" style={{ fontSize: '4rem', color: colors.secondary, opacity: 0.5 }}></i>
                  <h3 style={{ color: colors.text, marginTop: '16px' }}>Încărcați imagini pentru proprietatea dvs.</h3>
                  <p className="text-muted">Adăugați imagini reprezentative pentru a atrage mai mulți clienți</p>
                </div>
              )}
            </div>

            
            <div className="p-4">
              <h4 style={{ color: colors.text, marginBottom: '20px' }}>
                <i className="bi bi-images me-2"></i>
                Galerie imagini
              </h4>
              <Row className="g-3">
                {property.images.map((image, index) => (
                  <Col key={index} xs={6} md={3} className="mb-2">
                    <div className="position-relative">
                      <div 
                        className="image-container"
                        style={{
                          width: '100%',
                          height: '140px',
                          border: image.preview ? 'none' : `2px dashed ${colors.secondary}40`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: image.preview ? '0 3px 10px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                      >
                        {image.preview ? (
                          <img
                            src={image.preview}
                            alt={`Imagine ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center h-100"
                            style={{ 
                              backgroundColor: colors.lightPurple,
                              color: colors.secondary
                            }}
                          >
                            <i className="bi bi-plus-lg fs-2"></i>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <div className="mt-2 d-flex justify-content-between align-items-center">
                        <Form.Check
                          type="radio"
                          id={`primary-${index}`}
                          name="primaryImage"
                          label="Principal"
                          checked={image.isPrimary}
                          onChange={() => handlePrimaryImageChange(index)}
                          style={{
                            color: colors.text
                          }}
                        />
                        {index > 0 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
                {property.images.length < 5 && (
                  <Col xs={6} md={3}>
                    <Button
                      className="w-100 h-100 rounded-3 d-flex flex-column align-items-center justify-content-center"
                      style={{ 
                        minHeight: '140px',
                        background: 'transparent',
                        color: colors.primary,
                        border: `2px dashed ${colors.primary}40`,
                        boxShadow: 'none'
                      }}
                      onClick={handleAddImage}
                    >
                      <i className="bi bi-plus-lg fs-1 mb-2"></i>
                      <span>Adaugă imagine</span>
                    </Button>
                  </Col>
                )}
              </Row>
              <div className="mt-3 text-muted small">
                <i className="bi bi-info-circle me-2"></i>
                <span>Puteți adăuga maximum 5 imagini. Prima imagine sau cea marcată ca "Principal" va fi imaginea principală a proprietății.</span>
              </div>
            </div>
          </Card.Body>
        </Card>

       
        <Row>
          <Col md={8}>
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">
                  <i className="bi bi-house-door me-2"></i> 
                  Informații de bază
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Nume proprietate <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={property.name}
                    onChange={handleChange}
                    required
                    style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Descriere
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={property.description}
                    onChange={handleChange}
                    style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}
                    placeholder="Descrieți proprietatea dvs. cu cât mai multe detalii pentru a atrage potențiali clienți..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

           
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Locație
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                        Județ <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="location.county"
                        value={property.location.county}
                        onChange={handleChange}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      >
                        <option value="">Selectează județul</option>
                        {romanianCounties.map((county, index) => (
                          <option key={index} value={county}>{county}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                        Oraș <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="location.city"
                        value={property.location.city}
                        onChange={handleChange}
                        required
                        disabled={!property.location.county}
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      >
                        <option value="">
                          {property.location.county 
                            ? "Selectează orașul" 
                            : "Selectează mai întâi județul"}
                        </option>
                        {filteredCities.map((city, index) => (
                          <option key={index} value={city}>{city}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                        Stradă <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="location.street"
                        value={property.location.street}
                        onChange={handleChange}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                        Număr <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="location.number"
                        value={property.location.number}
                        onChange={handleChange}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {showApartmentFields() && (
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '500', color: colors.text }}>Bloc</Form.Label>
                        <Form.Control
                          type="text"
                          name="location.building"
                          value={property.location.building}
                          onChange={handleChange}
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            border: `1px solid ${colors.primary}30`,
                            padding: '12px 16px',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '500', color: colors.text }}>Scară</Form.Label>
                        <Form.Control
                          type="text"
                          name="location.entrance"
                          value={property.location.entrance}
                          onChange={handleChange}
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            border: `1px solid ${colors.primary}30`,
                            padding: '12px 16px',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '500', color: colors.text }}>Apartament</Form.Label>
                        <Form.Control
                          type="text"
                          name="location.apartment"
                          value={property.location.apartment}
                          onChange={handleChange}
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            border: `1px solid ${colors.primary}30`,
                            padding: '12px 16px',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">
                  <i className="bi bi-stars me-2"></i>
                  Facilități
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  {amenityOptions.map((amenity, index) => (
                    <Col md={4} key={index}>
                      <div 
                        className={`p-3 rounded-3 mb-2 d-flex align-items-center ${property.details.amenities.includes(amenity) ? 'selected-amenity' : ''}`}
                        style={{
                          backgroundColor: property.details.amenities.includes(amenity) ? `${colors.primary}15` : '#f8f9fa',
                          border: property.details.amenities.includes(amenity) ? `1px solid ${colors.primary}30` : '1px solid #e9ecef',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => handleAmenityChange(e, amenity)}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`amenity-${index}`}
                          checked={property.details.amenities.includes(amenity)}
                          onChange={(e) => handleAmenityChange(e, amenity)}
                          className="me-2"
                        />
                        <div className="d-flex align-items-center">
                          <i className={`bi ${amenityIcons[amenity] || 'bi-check-circle'} me-2`} style={{ color: colors.primary }}></i>
                          <span>{amenity}</span>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">
                  <i className="bi bi-cash-coin me-2"></i>
                  Prețuri
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Preț de bază pe noapte (RON) <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderRight: 'none'
                    }}>
                      <i className="bi bi-currency-exchange" style={{ color: colors.primary }}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="pricing.basePrice"
                      value={property.pricing.basePrice}
                      onChange={handleChange}
                      required
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    />
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderLeft: 'none'
                    }}>RON</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Preț de weekend (RON)
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderRight: 'none'
                    }}>
                      <i className="bi bi-calendar-weekend" style={{ color: colors.primary }}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="pricing.weekendPrice"
                      value={property.pricing.weekendPrice}
                      onChange={handleChange}
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    />
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderLeft: 'none'
                    }}>RON</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {property.pricing.seasonalPricing.map((season, index) => (
                  <Form.Group key={index} className="mb-4">
                    <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                      Preț {season.season} (RON)
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderRight: 'none'
                      }}>
                        <i className={`bi ${season.season === 'Vară' ? 'bi-sun' : 'bi-snow'}`} style={{ color: colors.primary }}></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={season.price}
                        onChange={(e) => handleSeasonalPriceChange(index, e.target.value)}
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          borderLeft: 'none',
                          borderRight: 'none'
                        }}
                      />
                      <InputGroup.Text style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none'
                      }}>RON</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>

            
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Detalii cazare
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Tip proprietate <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="type"
                    value={property.type}
                    onChange={handleChange}
                    required
                    style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Selectează tipul</option>
                    {propertyTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Număr maxim de oaspeți <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderRight: 'none'
                    }}>
                      <i className="bi bi-people-fill" style={{ color: colors.primary }}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="details.maxGuests"
                      value={property.details.maxGuests}
                      onChange={handleChange}
                      required
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none'
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Număr de camere
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderRight: 'none'
                    }}>
                      <i className="bi bi-door-closed" style={{ color: colors.primary }}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="details.numberOfRooms"
                      value={property.details.numberOfRooms}
                      onChange={handleChange}
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none'
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                    Suprafață (m²)
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderRight: 'none'
                    }}>
                      <i className="bi bi-rulers" style={{ color: colors.primary }}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="details.surfaceArea"
                      value={property.details.surfaceArea}
                      onChange={handleChange}
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    />
                    <InputGroup.Text style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      borderLeft: 'none'
                    }}>m²</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                
                <Form.Group className="mt-4">
                  <div 
                    className="d-flex align-items-center p-3 rounded"
                    style={{ 
                      backgroundColor: property.isActive ? `rgba(76, 175, 80, 0.1)` : 'rgba(220, 53, 69, 0.1)',
                      border: `1px solid ${property.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`,
                    }}
                  >
                    <Form.Check
                      type="switch"
                      id="propertyActive"
                      checked={property.isActive}
                      onChange={(e) => setProperty({...property, isActive: e.target.checked})}
                      className="me-3"
                    />
                    <div>
                      <div style={{ fontWeight: '500', color: property.isActive ? '#2e7d32' : '#c62828' }}>
                        {property.isActive ? 'Proprietate activă' : 'Proprietate inactivă'}
                      </div>
                      <small className="text-muted">
                        {property.isActive 
                          ? 'Proprietatea va fi disponibilă pentru rezervări' 
                          : 'Proprietatea nu va apărea în lista de proprietăți disponibile'}
                      </small>
                    </div>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

           
            <div className="d-grid gap-3">
              <Button 
                className="py-3 rounded-pill fw-bold"
                style={{ 
                  background: colors.buttonGradient,
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                }} 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i>
                    Înregistrează proprietatea
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                className="py-3 rounded-pill"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                {submissionSuccess ? 'Formular nou' : 'Resetează formularul'}
              </Button>
            </div>
          </Col>
        </Row>

       
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          size="lg"
          centered
          dialogClassName="modal-90w"
        >
          <Modal.Header 
            closeButton
            style={{ 
              background: colors.gradientPrimary,
              color: 'white',
              border: 'none'
            }}
          >
            <Modal.Title>
              <i className="bi bi-image me-2"></i>
              Previzualizare imagine
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {selectedImage && selectedImage.preview && (
              <img
                src={selectedImage.preview}
                alt="Previzualizare"
                className="w-100"
                style={{ objectFit: 'contain', maxHeight: '80vh' }}
              />
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default PropertyRegistrationForm;