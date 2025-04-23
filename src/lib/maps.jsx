import React from 'react';
import { GoogleMap, LoadScript } from '@vis.gl/react-google-maps';

const MapComponent = () => {
  const mapStyles = {
    height: '400px',
    width: '100%',
  };

  const defaultCenter = {
    lat: -3.43722,
    lng: -76.5225,
  };

  return (
    <LoadScript googleMapsApiKey='AIzaSyDxWwPaA-_LKw_lGzEP4-f9lmWIhecP-Uw'>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={10}
        center={defaultCenter}
      />
    </LoadScript>
  );
};

export default MapComponent;