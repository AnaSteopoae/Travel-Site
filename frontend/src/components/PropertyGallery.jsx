import React, { useState } from 'react';

// Component principal pentru galeria de imagini
const PropertyGallery = ({ property }) => {
  const [modalImage, setModalImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Funcție pentru deschiderea modalului cu o anumită imagine
  const openImageModal = (index) => {
    setModalImage(index);
    setShowModal(true);
  };

  // Funcție pentru închiderea modalului
  const closeModal = () => {
    setShowModal(false);
  };

  // Funcții pentru navigarea între imagini în modal
  const goToPrevImage = () => {
    setModalImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setModalImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  // Verificăm dacă există imagini
  if (!property.images || property.images.length === 0) {
    return (
      <div className="w-100 bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '350px' }}>
        <span>Nu există imagini</span>
      </div>
    );
  }

  return (
    <>
      {/* Galeria principală */}
      <div className="mb-4">
        {/* Container principal pentru galeria de imagini */}
        <div className="d-flex flex-column flex-md-row gap-2 mb-2">
          {/* Imagine principală (stânga) - mereu prima imagine */}
          <div className="position-relative" style={{ flex: '2' }}>
            {property.images.length > 0 && (
              <img 
                src={property.images[0]} 
                alt={`${property.name} imagine principală`} 
                className="w-100 rounded cursor-pointer"
                style={{ height: '350px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openImageModal(0)}
              />
            )}
          </div>
          
          {/* Două imagini secundare (dreapta) - stivuite vertical */}
          <div className="d-flex flex-column gap-2" style={{ flex: '1' }}>
            {property.images.length > 1 && (
              <img 
                src={property.images[1]} 
                alt={`${property.name} imagine secundară 1`} 
                className="w-100 rounded cursor-pointer"
                style={{ height: '170px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openImageModal(1)}
              />
            )}
            
            {property.images.length > 2 && (
              <img 
                src={property.images[2]} 
                alt={`${property.name} imagine secundară 2`} 
                className="w-100 rounded cursor-pointer"
                style={{ height: '170px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openImageModal(2)}
              />
            )}
          </div>
        </div>
        
        {/* Galeria de miniaturi în partea de jos */}
        <div className="d-flex overflow-auto gap-2 pb-2">
          {property.images.map((img, index) => (
            <div 
              key={index} 
              className={`border ${index === modalImage ? 'border-primary border-2' : 'border-secondary'}`}
              onClick={() => setModalImage(index)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={img} 
                alt={`Miniatură ${index + 1}`} 
                style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                onClick={() => openImageModal(index)}
              />
            </div>
          ))}
          
          {property.images.length > 5 && (
            <div 
              className="d-flex align-items-center justify-content-center bg-light border border-secondary rounded"
              style={{ width: '120px', height: '80px', cursor: 'pointer' }}
              onClick={() => openImageModal(0)}
            >
              <span>+{property.images.length - 5} fotografii</span>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column" style={{ 
          backgroundColor: 'rgba(0,0,0,0.9)', 
          zIndex: 1050
        }}>
          {/* Header modal */}
          <div className="d-flex justify-content-between align-items-center p-3 text-white">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-link text-white p-0 me-3" 
                onClick={closeModal}
                style={{ textDecoration: 'none' }}
              >
                <i className="bi bi-arrow-left"></i> Galerie
              </button>
              <h5 className="m-0">{property.name || 'Galerie'}</h5>
            </div>
            <div className="d-flex align-items-center">
              <span className="me-3">{modalImage + 1} / {property.images.length}</span>
              <button className="btn btn-link text-white p-0" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          
          <div className="flex-grow-1 d-flex align-items-center justify-content-center position-relative">
            <button 
              className="btn position-absolute start-0 top-50 translate-middle-y bg-light bg-opacity-25 rounded-circle p-2 m-3"
              onClick={goToPrevImage}
              style={{ zIndex: 1060 }}
            >
              <i className="bi bi-chevron-left fs-4"></i>
            </button>
           
            <img 
              src={property.images[modalImage]} 
              alt={`${property.name || 'Proprietate'} imagine ${modalImage + 1}`} 
              className="mw-100 mh-100 p-3"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            
            <button 
              className="btn position-absolute end-0 top-50 translate-middle-y bg-light bg-opacity-25 rounded-circle p-2 m-3"
              onClick={goToNextImage}
              style={{ zIndex: 1060 }}
            >
              <i className="bi bi-chevron-right fs-4"></i>
            </button>
          </div>
          
          
          <div className="bg-dark p-3">
            <div className="d-flex overflow-auto gap-2">
              {property.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`${index === modalImage ? 'border border-white border-2' : ''}`}
                  onClick={() => setModalImage(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={img} 
                    alt={`Miniatură ${index + 1}`} 
                    style={{ width: '80px', height: '60px', objectFit: 'cover', opacity: index === modalImage ? 1 : 0.6 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;