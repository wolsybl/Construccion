import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const MapComponent = () => {
  const mapStyles = {
    height: '400px',
    width: '100%',
  };

  const defaultCenter = {
    lat: 4.8133,
    lng: -75.6967,
  };

  return (
    <LoadScript googleMapsApiKey='AIzaSyDxWwPaA-_LKw_lGzEP4-f9lmWIhecP-Uw'>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
      />
    </LoadScript>
  );
};

export default MapComponent;