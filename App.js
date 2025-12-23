import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, Star, Coffee, Heart, Zap, DollarSign } from 'lucide-react';

// 1. Dark Mode Map Style
const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

// 2. Mood Configuration
const MOODS = {
  Work: { type: 'cafe', keyword: 'wifi quiet', icon: <Coffee size={18} /> },
  Date: { type: 'restaurant', keyword: 'romantic', icon: <Heart size={18} /> },
  Quick: { type: 'bakery', keyword: 'fast food', icon: <Zap size={18} /> },
  Cheap: { type: 'restaurant', maxPrice: 1, icon: <DollarSign size={18} /> }
};

export default function SmartNearbyApp() {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markersRef = useRef([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  // Initialize Map & User Location
  useEffect(() => {
    if (window.google && mapRef.current) {
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 14,
        styles: mapDarkStyle,
        disableDefaultUI: true,
      });

      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        googleMap.current.setCenter(coords);
      });
    }
  }, []);

  const searchPlaces = (moodKey) => {
    setLoading(true);
    const config = MOODS[moodKey];
    const service = new window.google.maps.places.PlacesService(googleMap.current);

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const request = {
      location: location,
      radius: '2000',
      type: [config.type],
      keyword: config.keyword,
      maxPriceLevel: config.maxPrice || 4
    };

    service.nearbySearch(request, (results, status) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
        results.forEach(place => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: googleMap.current,
            animation: window.google.maps.Animation.DROP,
            title: place.name
          });
          markersRef.current.push(marker);
        });
      }
    });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <header style={styles.header}>
          <h1 style={styles.title}>Smart Nearby</h1>
          <p style={styles.subtitle}>What's the vibe today?</p>
        </header>

        <div style={styles.moodGrid}>
          {Object.entries(MOODS).map(([key, value]) => (
            <button key={key} onClick={() => searchPlaces(key)} style={styles.moodButton}>
              {value.icon} <span style={{ marginLeft: '8px' }}>{key}</span>
            </button>
          ))}
        </div>

        {loading && <p style={styles.loading}>Searching nearby...</p>}

        <div style={styles.resultsList}>
          {places.map(place => (
            <div key={place.place_id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.placeName}>{place.name}</h3>
                <div style={styles.rating}><Star size={14} fill="#FFD700" color="#FFD700" /> {place.rating || 'N/A'}</div>
              </div>
              <p style={styles.address}><MapPin size={12} /> {place.vicinity}</p>
              <div style={styles.statusRow}>
                <Clock size={12} color={place.opening_hours?.open_now ? "#4caf50" : "#f44336"} />
                <span style={{ color: place.opening_hours?.open_now ? "#4caf50" : "#f44336", fontSize: '12px', marginLeft: '5px' }}>
                  {place.opening_hours?.open_now ? "Open Now" : "Closed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div ref={mapRef} style={styles.map} />
    </div>
  );
}

// 3. Modern Dark Theme Styles
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0f0f0f', color: '#fff', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '400px', padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #222', zIndex: 10, backgroundColor: '#121212' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  subtitle: { color: '#888', fontSize: '14px' },
  moodGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' },
  moodButton: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', 
    backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff', 
    cursor: 'pointer', transition: '0.2s', fontWeight: '500' 
  },
  resultsList: { overflowY: 'auto', flex: 1 },
  card: { padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '12px', marginBottom: '12px', border: '1px solid #222' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  placeName: { fontSize: '16px', margin: 0, color: '#fff' },
  rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#FFD700' },
  address: { fontSize: '13px', color: '#aaa', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '4px' },
  statusRow: { display: 'flex', alignItems: 'center', marginTop: '10px' },
  map: { flex: 1 },
  loading: { textAlign: 'center', color: '#888', fontSize: '14px' }
};