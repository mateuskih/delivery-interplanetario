import React, { useState, useEffect, useRef } from 'react';
import './AddressForm.css';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

const AddressForm = ({ onSave, address, onCancel }) => {
  const [formState, setFormState] = useState({
    id: null,
    label: '',
    fullName: '',
    mobilePhone: '',
    addressLine: '',
    country: 'Earth',
    state: '',
    city: '',
    zipCode: '',
    latitude: '',
    longitude: ''
  });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });
  const center = useMemo(() => ({ lat: 18.52043, lng: 73.856743 }), []);
  const mapRef = useRef(null);

  useEffect(() => {
    if (address) {
      setFormState(address);
    } else {
      setFormState({
        id: null,
        label: '',
        fullName: '',
        mobilePhone: '',
        addressLine: '',
        country: 'Earth',
        state: '',
        city: '',
        zipCode: '',
        latitude: '',
        longitude: ''
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormState(prevState => ({
      ...prevState,
      latitude: lat.toString(),
      longitude: lng.toString(),
      city: '', // Reset city
      zipCode: '' // Reset zip code
    }));

    // Reverse geocode to get address components
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const components = results[0].address_components;
          components.forEach(component => {
            if (component.types.includes("postal_code")) {
              setFormState(prevState => ({
                ...prevState,
                zipCode: component.long_name
              }));
            } else if (component.types.includes("locality")) {
              setFormState(prevState => ({
                ...prevState,
                city: component.long_name
              }));
            }
          });
        }
      } else {
        console.error("Geocoder failed due to: ", status);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formState,
      id: formState.id || Date.now()
    });
    onCancel();
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <h2>{formState.id ? 'Edit Address' : 'Add Address'}</h2>
      <select
        name="label"
        value={formState.label}
        onChange={handleChange}
        placeholder="Label (e.g., Main house)"
        required
      >
        <option value="Main House">Main House</option>
        <option value="Office">Office</option>
      </select>
      <div className="form-row">
        <input
          name="fullName"
          value={formState.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          name="mobilePhone"
          value={formState.mobilePhone}
          onChange={handleChange}
          placeholder="Mobile Phone"
          required
        />
      </div>
      <input
        name="addressLine"
        value={formState.addressLine}
        onChange={handleChange}
        placeholder="Address Line"
        required
      />
      <div className="form-row">
        <select
          name="country"
          value={formState.country}
          onChange={handleChange}
          required
        >
          <option value="Earth">Earth</option>
          <option value="Mars">Mars</option>
        </select>
        {formState.country === 'Earth' ? (
          <>
            <input
              name="state"
              value={formState.state}
              onChange={handleChange}
              placeholder="State"
              required
            />
            <input
              name="city"
              value={formState.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
            <input
              name="zipCode"
              value={formState.zipCode}
              onChange={handleChange}
              placeholder="Zip Code"
              required
            />
          </>
        ) : (
          <input
            name="zipCode"
            value={formState.zipCode}
            onChange={handleChange}
            placeholder="Lot Number (e.g., 1234)"
            required
          />
        )}
      </div>
      <GoogleMap
        ref={mapRef}
        mapContainerClassName="map"
        center={center}
        zoom={10}
        onClick={handleMapClick}
      >
        {formState.latitude && formState.longitude && (
          <Marker
            position={{ lat: parseFloat(formState.latitude), lng: parseFloat(formState.longitude) }}
          />
        )}
      </GoogleMap>
      <div className="form-actions">
        <button className="btn primary" type="submit">Save</button>
        <button className="btn secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default AddressForm;
