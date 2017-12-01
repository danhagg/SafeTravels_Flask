// var colors = require("./color.js")

// Function to generate gradient of colors for each bus route
function makeColor (id) {
  var r = 255;
  var g = 0;
  var b = 0;
  // var rgb = '';
  if (id > 127) {
    return 'rgb(255, 0, 0)';
  }
  r = r - id * 2;
  g = 0;
  b = b + id * 2;
  return `rgb(${r}, ${g}, ${b})`;
}

// Declare variables
var map, heatmap, infoWindow;
var ws_address;
var ws_wsid = 'g66cb3dc63cb74226ac55ac06fa465f1f';
// var ws_address = '3302 Canal St., Houston, TX';
var ws_format = 'tall';
var ws_width = '300';
var ws_height = '350';
var FEATURE_TYPE;
var crimes = 'off';
var bike = 'off';
var busRoute = 'off';

// Google map api
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: new google.maps.LatLng(29.7604, -95.3698),
    mapTypeId: 'terrain',
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#bdbdbd"
          }
        ]
      },
      {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#bce4d5"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#cee7d3"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dadada"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#b6ddde"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      }
    ]
  });


  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('You are here.');
      infoWindow.open(map);
      map.setCenter(pos);

      axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=AIzaSyA0fEoOYqyHqCn0k7w0IhQGjW27eFXhfvc`)
        .then(function(response){
          console.log(response)
           ws_address = response.data.results[0].formatted_address

          // call walk score api here
          $.getScript( "https://www.walkscore.com/tile/show-walkscore-tile.php" );
        })
        .catch(function(err){
            console.error(err)
        })

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
  }

  heatmap = new google.maps.visualization.HeatmapLayer({
       data: getPoints(),
       gradient: [
         'rgba(253, 253, 253, 0)',
         'rgba(45, 184, 186, 1)',
         'rgba(169, 234, 77, 1)',
         'rgba(247, 199, 73, 1)',
         'rgba(234, 155, 43, 1)',
         'rgba(243, 104, 81, 1)',
         'rgba(230, 87, 58, 1)'
       ],
       map: map,
       radius: 20,
       opacity: .75
     });

  // Setting markers to differentiate between different data types visually
  map.data.setStyle(function (feature) {
     if (feature.getProperty('offense') == 'Theft' || feature.getProperty('offense') == 'Burglary' || feature.getProperty('offense') == 'Auto Theft') {
       return {
         icon: '/static/images/map-pin-blue.png'
       }
     }
     else if (feature.getProperty('offense') == 'Aggravated Assault' || feature.getProperty('offense') == 'Murder' || feature.getProperty('offense') == 'Robbery' || feature.getProperty('offense') == 'Rape') {
       return {
         icon: '/static/images/map-pin-red.png'
       }
     }
     else if (feature.getProperty('type') == 'bike') {
       return {
         strokeColor: '#00C7FF',
         strokeOpacity: 1.0,
         strokeWeight: 2
       }
     }
     else if (feature.getProperty('routenum')) {
       let strokeCol = makeColor(feature.getProperty('id'));
       console.log(strokeCol);
       console.log(feature.getProperty('id'));
       return {
         strokeColor: strokeCol,
         strokeOpacity: 1.0,
         strokeWeight: 2
       }
     }
     return {};
   });

  // Enables toggling of data
  map.data.addListener('addfeature', function (event) {
     event.feature.setProperty('type', FEATURE_TYPE);
  });

  // Triggers infoWindow on click
  map.data.addListener('click', function(event){
   var infoWindow = new google.maps.InfoWindow({
     content: (
       "<strong>Offense:</strong> " +
       event.feature.getProperty('offense') +
       "<br>" +
       "<strong>Location:</strong> " +
       event.feature.getProperty('premise_type')
    ),
     pixelOffset: new google.maps.Size(0, -40)
   });
   console.log(event);

    infoWindow.open(map);
    infoWindow.setPosition(event.latLng);
  });

  // Used Google API functionality to create listeners for when map is moved
  // When map is moved, minx, maxx, miny, maxy are updated
  map.addListener('bounds_changed', function() {
    initialViewPort = map.getBounds();
    minx = initialViewPort.b.b;
    maxx = initialViewPort.b.f;
    miny = initialViewPort.f.b;
    maxy = initialViewPort.f.f;

    // loads data inside current bounds
    if (crimes == 'on') {
      add_crimes();
    }
    if (bike == 'on') {
      add_bike();
    }
    if (busRoute == 'on') {
      add_busroutes();
    }
  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// loading data into map
function load_geojson(results, type) {
  FEATURE_TYPE = type;
  map.data.addGeoJson(results);
}

// Filters data for type: crime
function add_crimes () {
  axios.get(`/crimes?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'crime');
   })
  .catch(function (error) {
     console.log(error);
   });
}

// Filters data for type: bike
function add_bike() {
  axios.get(`/bike?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'bike');
    })
    .catch(function (error) {
      console.log(error);
    });
}

// Filters data for type: bus routes
function add_busroutes() {
    axios.get(`/busroutes?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'busroutes');
    })
    .catch(function (error) {
      console.log(error);
    });
}

function hideCrimes() {
  map.data.forEach(function (thing) {
    if (thing.getProperty('type') == 'crime') {
      map.data.remove(thing);
    }
  })
}

function hideBike() {
  map.data.forEach(function (thing) {
    if (thing.getProperty('type') == 'bike') {
      map.data.remove(thing);
    }
  })
}

function hideBusRoutes() {
  map.data.forEach(function (thing) {
    if (thing.getProperty('type') == 'busroutes') {
      map.data.remove(thing);
    }
  })
}

var toggle = function (a, b) {
  var togg = false;
  return function () {
    // passes return value back to caller
    return (togg = !togg) ? a() : b();
  };
};


$(document).ready(function () {
  $('#sidebarCollapse').click(function () {
    console.log('sidebar toggle');
    $('#sidebar').toggleClass('active');
  });

  $('#crime').on('click', toggle (function (){
      crimes = 'on';
      return add_crimes();
  }, function (){
      crimes = 'off';
      return hideCrimes();
  }));

  $('#bikeways').on('click', toggle (function (){
      bike = 'on';
      return add_bike();
  }, function (){
      bike = 'off';
      return hideBike();
  }));

  $('#bus_routes').on('click', toggle (function (){
      busRoute = 'on';
      return add_busroutes();
  }, function (){
      busRoute = 'off';
      return hideBusRoutes();
  }));

  $('#walkscore_button').click(function () {
      console.log('walkscore toggle');
      $('#walkscore_container').toggleClass('active');
   });
   
});
