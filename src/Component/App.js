import { GoogleMap, Marker, Polyline, useLoadScript, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useRef, useEffect } from "react";
import "./App.css";
import icon from './Images/icon.PNG';

const App = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries: ["places"],
  });


  const [map, setMap] = useState(/**@type google.maps.Map */(null));
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const [myLocation, setMyLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [linePaths, setLinePaths] = useState([]);

  useEffect(() => {
    <script src="https://maps.googleapis.com/maps/api/js?key=process.env.REACT_APP_GOOGLE_MAP_API_KEY&libraries=places"></script>

    console.log("Google Maps API is loading:", isLoaded);
    console.log("Google Maps API load error:", loadError);

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
  


  
  const center = myLocation;
  const customMarker = {
    path: "M10,0A10,10 0 1,0 0,-10A10,10 0 0,0 10,0Z",
    fillColor: "blue",
    fillOpacity: 1,
    strokeWeight: 1,
    rotation: 0,
    scale: 1,
  };
  

  // const calculateRoute = async () => {
    
  //   if(originRef.current.value === '' || destinationRef.current.value === ''){
  //     return
  //   }
  //   //eslint-disable-next-line no-undef 
  //   const directionService = new google.maps.DirectionsService();
  //   const results = await directionService.route({
  //     origin: originRef.current.value,
  //     destination: destinationRef.current.value,
  //     //eslint-disable-next-line no-undef 
  //     travelMode: google.maps.TravelMode.DRIVING
  //   })
  //   setDirectionResponse(results)
  //   setDistance(results.routes[0].legs[0].distance.text);
  //   setDuration(results.routes[0].legs[0].duration.text);
  // };

  // function clearRoute() {
  //   setDirectionResponse(null);
  //   setDistance('');
  //   setDuration('');
  //   originRef.current.value = '';
  //   destinationRef.current.value = '';
  // }

  const onMapClick = (event) => {
    const clickedLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    const newMarkers = [...markers, { ...clickedLocation, color: 'blue' }];
    setMarkers(newMarkers);

    if (markers.length > 0) {
      const newLinePath = [
        ...linePaths,
        [markers[markers.length - 1], clickedLocation],
      ];
      setLinePaths(newLinePath);
    }
  };

  
  /**@type React.MutableRefObject<HTMLInputElement> */ 
  const originRef = useRef();
  /**@type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();

  if (loadError) {
    return <div>Error loading Google Maps...</div>;
  }
  return (
    <div className="App">
      
      <div>
        <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-around', marginTop:'2px'}}>
          <Autocomplete>
            <input type="text" ref={originRef} placeholder="Origin"/>
          </Autocomplete>
          <Autocomplete>
            <input type="text" ref={destinationRef} placeholder="Destination"/>
          </Autocomplete>
            {/* <button type="submit" onClick={calculateRoute}>Search</button> */}
            <button type="submit" >Search</button>
        </div>
        <div style={{display: 'flex', justifyContent:'space-around', marginTop:'2px'}}>
            <span>Distance : {distance}</span>
            <span>Duration : {duration}</span>
        </div>
        <div style={{display: 'flex', justifyContent:'space-around', marginTop:'2px'}}>
            <button  onClick={() => map.panTo(myLocation)}> Origin </button>
            <button   > X </button>
            {/* <button  onClick={clearRoute} > X </button> */}
        </div>
      </div>
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap
          mapContainerClassName="map-container"
          center={center}
          zoom={10}
          onClick={onMapClick}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
          onLoad={(map) => {
            setMap(map);
            map.addListener("click", onMapClick);
          }}
        >
          {myLocation && <Marker position={myLocation} icon={icon.png} />}
          {directionResponse && <DirectionsRenderer directions={directionResponse} />}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={{  fillOpacity: 1, ...customMarker }}
            />
          ))}
          {linePaths.map((path, index) => (
            <Polyline key={index} path={path} options={{ strokeColor: "orange" }} />
          ))}
        </GoogleMap>

      )}
      
    </div>
  );
};

export default App;