import { GoogleMap, Marker, useLoadScript, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import "./App.css";

const libraries = ["places"];

const NewApp = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
        },
        error => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  
  const customMarker = {
    path: "M10,0A10,10 0 1,0 0,-10A10,10 0 0,0 10,0Z",
    fillColor: "red",
    fillOpacity: 1,
    strokeWeight: 1,
    rotation: 0,
    scale: 1,
  };

  const calculateRoute = async () => {
    if (!map || !myLocation) {
      return;
    }
    //eslint-disable-next-line no-undef 
    const directionService = new window.google.maps.DirectionsService();
    const results = await directionService.route({
      origin: myLocation,
      destination: destinationRef.current.value,
      //eslint-disable-next-line no-undef 
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    if (results.status === "OK") {
      setDirectionResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } else {
      console.error("Error calculating route:", results.status);
    }
  };

  const clearRoute = () => {
    setDirectionResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  };

  const onMapClick = (event) => {
    const clickedLocation = { lat: event.latLng.lat(), lng: event.latLng.lng(), color: "blue" };
    const newMarkers = [...markers, clickedLocation];
    setMarkers(newMarkers);
  };

  const destinationRef = useRef();
  const originRef = useRef();

  if (loadError) {
    return <div>Error loading Google Maps...</div>;
  }

  return (
    <div className="App">
      <div>
        {/* Autocomplete inputs for origin and destination */}
        <Autocomplete onLoad={originRef.onLoad}>
          <input type="text" ref={originRef} placeholder="Origin" />
        </Autocomplete>
        <Autocomplete onLoad={destinationRef.onLoad}>
          <input type="text" ref={destinationRef} placeholder="Destination" />
        </Autocomplete>
        <button type="submit" onClick={calculateRoute}>
          Search
        </button>
      </div>
      <div>
        <span>Distance: {distance}</span>
        <span>Duration: {duration}</span>
      </div>
      <div>
        <button onClick={() => map.panTo(myLocation)}>Origin</button>
        <button onClick={clearRoute}>Clear</button>
      </div>
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap
          mapContainerClassName="map-container"
          center={myLocation}
          zoom={10}
          onClick={onMapClick}
          onLoad={mapInstance => setMap(mapInstance)}
        >
          {myLocation && <Marker position={myLocation} icon={{ url: "your-location-icon-url.png" }} />}
          {directionResponse && <DirectionsRenderer directions={directionResponse} />}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={{ fillColor: marker.color, fillOpacity: 1, ...customMarker }}
            />
          ))}
        </GoogleMap>
      )}
    </div>
  );
};

export default NewApp;
