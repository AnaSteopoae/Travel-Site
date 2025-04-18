import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB4r7MBKgs3VeklQfF7ZYVqjIxlb3BK8nM';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 44.4268,
  lng: 26.1025 // București
};

// Componenta Map 
const PropertyMap = React.memo(({ coordinates, propertyName }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  
  // Verifică dacă avem coordonate valide
  const validCoordinates = coordinates && 
    typeof coordinates.lat === 'number' && 
    typeof coordinates.lng === 'number' &&
    !isNaN(coordinates.lat) && 
    !isNaN(coordinates.lng);
  
  // Folosește coordonate default dacă cele primite sunt invalide
  const mapCenter = validCoordinates ? coordinates : defaultCenter;
  
  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);
  
  
  if (loadError) {
    return (
      <div 
        style={mapContainerStyle} 
        className="d-flex align-items-center justify-content-center bg-light border"
      >
        <p className="text-danger text-center mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Nu s-a putut încărca harta. Vă rugăm încercați mai târziu.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        style={mapContainerStyle} 
        className="d-flex align-items-center justify-content-center bg-light"
      >
        <p className="text-muted mb-0">Se încarcă harta...</p>
      </div>
    );
  }
  
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        gestureHandling: "cooperative"
      }}
    >
      {validCoordinates && (
        <Marker
          position={mapCenter}
          title={propertyName || "Proprietate"}
        />
      )}
    </GoogleMap>
  );
});

// Expune cheia API static pentru a putea fi folosită în alte componente
PropertyMap.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;

export default PropertyMap