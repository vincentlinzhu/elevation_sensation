import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { LngLat } from 'mapbox-gl';


function App() {
  mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmllLXRoZS16aHUiLCJhIjoiY2w0bHVmcWJjMHF6bTNrb3Z1N2FodXhhNCJ9.ElnrnDn7jHCaYS9isGfmYw';
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-104.9903);
  const [lat, setLat] = useState(39.7392);
  const [zoom, setZoom] = useState(11);
  const [elevation, setElevation] = useState(832.1);

  var currentMarkers = [];

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [lng, lat],
      zoom: zoom,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      zoom: 14, // Set the zoom level for geocoding results
      // placeholder: 'Enter an address or place name', // This placeholder text will display in the search bar
      // bbox: [-105.116, 39.679, -104.898, 39.837], // Set a bounding box
      marker: false,
    });
    map.current.addControl(geocoder);

    const marker = new mapboxgl.Marker({ color: "#DC143C" });
    geocoder.on("result", async (event) => {
      if (currentMarkers !== null) {
        for (var i = currentMarkers.length - 1; i >= 0; i--) {
          currentMarkers[i].remove();
        }
      }
      const point = event.result.center; // Capture the result coordinates
      marker.setLngLat(point).addTo(map.current); // Add the marker to the map at the result coordinates
      currentMarkers.push(marker);
      getElevation();
    });

    map.current.on("click", async (event) => {
      if (currentMarkers !== null) {
        for (var i = currentMarkers.length - 1; i >= 0; i--) {
          currentMarkers[i].remove();
        }
      }
      var coordinates = event.lngLat;
      const marker2 = new mapboxgl.Marker({
        color: "#DC143C",
      });
      marker2.setLngLat(coordinates).addTo(map.current);
      currentMarkers.push(marker2);

      setLat(coordinates.lat.toFixed(4));
      setLng(coordinates.lng.toFixed(4));
      getElevation();
      // console.log(`${lng}, ${lat}`)
    });

    // map.current.on('click', (event) => {
    //   // When the map is clicked, set the lng and lat constants
    //   // equal to the lng and lat properties in the returned lngLat object.
    //   console.log(event.lngLat.lng);
    //   console.log(event.lngLat.lat);
    //   setLng(event.lngLat.lng);
    //   setLat(event.lngLat.lat);
    //   // getElevation();
    //   console.log(`${lng}, ${lat}`);
    //   const point = new LngLat(lng, lat);
    //   marker.setLngLat(point).addTo(map.current);
    // });

    const getElevation = async () => {
      // Construct the API request
      const query = await fetch(
        `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
        { method: "GET" }
      );
      if (query.status !== 200) return;
      const data = await query.json();
      // Display the longitude and latitude values
      // lngDisplay.textContent = lng.toFixed(2);
      // latDisplay.textContent = lat.toFixed(2);
      // Get all the returned features
      const allFeatures = data.features;
      // For each returned feature, add elevation data to the elevations array
      const elevations = allFeatures.map((feature) => feature.properties.ele);
      // In the elevations array, find the largest value
      const highestElevation = Math.max(...elevations);
      // Display the largest elevation value
      // eleDisplay.textContent = `${highestElevation} meters`;
      setElevation(highestElevation);
      console.log(...elevations)
    }
    map.current.addControl(new mapboxgl.NavigationControl());
  });

  // useEffect(() => {
  //   map.current.on('click', async (event) => {
  //     if (currentMarkers !== null) {
  //       for (var i = currentMarkers.length - 1; i >= 0; i--) {
  //         currentMarkers[i].remove();
  //       }
  //     }
  //     var coordinates = event.lngLat;
  //     const marker2 = new mapboxgl.Marker({
  //       color: "#DC143C",
  //     });
  //     marker2.setLngLat(coordinates).addTo(map.current);
  //     currentMarkers.push(marker2);

  //     setLat(coordinates.lat.toFixed(4));
  //     setLng(coordinates.lng.toFixed(4));
  //     // console.log(`${lng}, ${lat}`)
  //   });
  // })

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  

  return (
    <div className="App">
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Elevation: {elevation} meters | Zoom: {zoom}
      </div>
      <div>
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}

export default App;
