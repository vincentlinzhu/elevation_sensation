import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import pieChart from './components/pieChart';
import { getUserPosition } from './utils/user-position';
// import Compare from mapbox-gl-Compare;

function App() {
  // let initialLng = 0;
  // let initialLat = 0;
  // getUserPosition(({ coords: { longitude, latitude } }) =>
  //   {initialLng = longitude} 
  // );
  // getUserPosition(({ coords: { longitude, latitude } }) =>
  //   {initialLat = latitude} 
  // );

  mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmllLXRoZS16aHUiLCJhIjoiY2w0bHVmcWJjMHF6bTNrb3Z1N2FodXhhNCJ9.ElnrnDn7jHCaYS9isGfmYw';
  const mapContainer = useRef(null);
  // const comparisonMap = useRef(null);
  // const comparisonContainer = useRef(null);
  // const before = useRef(null);
  // const after = useRef(null);
  const map = useRef(null);
  // const mapSecond = useRef(null);
  const [lng, setLng] = useState(-104.9903);
  const [lat, setLat] = useState(39.7392);
  const [zoom, setZoom] = useState(11);
  const [elevation, setElevation] = useState(832.1);

  var currentMarkers = [];

  const getElevation = async (coord) => {
    // Construct the API request
    // console.log(coord);
    const query = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coord.lng},${coord.lat}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    if (query.status !== 200) return;
    const data = await query.json();

    // console.log(data);

    // Get all the returned features
    const allFeatures = data.features;
    // console.log(allFeatures);

    // For each returned feature, add elevation data to the elevations array
    const elevations = allFeatures.map((feature) => feature.properties.ele);
    
    // In the elevations array, find the largest value
    // console.log(...elevations);
    const highestElevation = Math.max(...elevations);
    setElevation(highestElevation);
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [lng, lat],
      zoom: zoom,
      projection: 'globe',
    });

    map.current.on('style.load', () => {
      map.current.setFog({}); // Set the default atmosphere style
    });

    // if (mapSecond.current) return; // initialize map only once
    // mapSecond.current = new mapboxgl.Map({
    //   container: after.current,
    //   style: "mapbox://styles/mapbox/light-v10",
    //   center: [lng, lat],
    //   zoom: zoom,
    // });

    // const container = '#comparisonContainer';
    // // const container = comparisonContainer.current;
 
    // comparisonMap.current = new mapboxgl.Compare(map.current, mapSecond.current, container, {
    //   // Set this to enable comparing two maps by mouse movement:
    //   // mousemove: true
    // });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      zoom: 14, // Set the zoom level for geocoding results
      // placeholder: 'Enter an address or place name', // This placeholder text will display in the search bar
      // bbox: [-105.116, 39.679, -104.898, 39.837], // Set a bounding box
      marker: false,
      // position: "top-left",
    });
    map.current.addControl(geocoder, "top-left");

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
      const lngLatObj = {lng: point[0], lat: point[1]};

      // console.log(lngLatObj);
      setLat(point.lat);
      setLng(point.lng);
      getElevation(lngLatObj);
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
      getElevation(coordinates);
      // console.log(`${lng}, ${lat}`)
    });

    map.current.addControl(
      new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
      })
    );

    map.current.addControl(new mapboxgl.NavigationControl());
  });

  // useEffect(() => {
  //   const coords = {lng, lat};
  //   const newElevation = map.queryTerrainElevation(coords, { exaggerated: false });
  //   setElevation(newElevation);
  // }, [setLng, setLat, lng, lat])

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
        <p>Stats:</p>
        <hr/>
        <p>Longitude: {lng}</p>
        <p>Latitude: {lat}</p>
        <p>Elevation: {elevation} meters</p>
        <p>Zoom: {zoom}</p>
      </div>
      <div>
        <div ref={mapContainer} className="map-container" />
        {/* <div ref={comparisonContainer} id='comparisonContainer' className="map-container">
          <div ref={before} className="map"></div>
          <div ref={after} className="map"></div>
        </div> */}
      </div>
      {/* <pieChart/> */}
    </div>
  );
}

export default App;
