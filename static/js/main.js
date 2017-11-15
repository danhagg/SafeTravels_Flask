// var colors = require("./color.js")

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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
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
       map: map,
       radius: 20,
       opacity: .75
     });


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
     else if (feature.getProperty('color') == 'Blue') {
       return {
         strokeColor: '#0067FF',
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
     //
     //
     // else if (feature.getProperty('color') == 'Red') {
     //   return {
     //     strokeColor: '#FF0061',
     //     strokeOpacity: 1.0,
     //     strokeWeight: 2
     //   }
     // }
     // else if (feature.getProperty('color') == 'Green') {
     //   return {
     //     strokeColor: '#C7FF00',
     //     strokeOpacity: 1.0,
     //     strokeWeight: 2
     //   }
     // }
     // else if (feature.getProperty('color') == 'ParkAndRide') {
     //   return {
     //     strokeColor: '#FFA900',
     //     strokeOpacity: 1.0,
     //     strokeWeight: 2
     //   }
     // }

     return {};
   });

  map.data.addListener('addfeature', function (event) {
     event.feature.setProperty('type', FEATURE_TYPE);
  });

  map.data.addListener('click', function(event){
   var infoWindow = new google.maps.InfoWindow({
     content: (
       "<strong>Offense:</strong> " +
       event.feature.getProperty('offense') +
       "<br>" +
       "<strong>Location:</strong> " +
       event.feature.getProperty('premise_type')
      //  "<br>" +
      //  "<strong>Occurred:</strong> " +
      //  event.feature.getProperty('time_begun')
    ),
     pixelOffset: new google.maps.Size(0, -40)
   });
   console.log(event);

    infoWindow.open(map);
    infoWindow.setPosition(event.latLng);
  });

  map.addListener('bounds_changed', function() {
    initialViewPort = map.getBounds();
    minx = initialViewPort.b.b;
    maxx = initialViewPort.b.f;
    miny = initialViewPort.f.b;
    maxy = initialViewPort.f.f;

    if (crimes == 'on') {
      add_crimes();
    }
    if (bike == 'on') {
      add_bike();
    }
    if (busRoute == 'on') {
      add_busroutes();
    }
    // add_busstops();
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

// Loop through the results array and place a marker for each
// set of coordinates.

function load_geojson(results, type) {
  console.log(results);
  FEATURE_TYPE = type;
  map.data.addGeoJson(results);
}

function add_crimes () {
    axios.get(`/crimes?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
   .then(function (response) {
     crimeMapMarkers = load_geojson(response.data, 'crime');
   })
   .catch(function (error) {
     console.log(error);
   });
}

function add_bike() {
    axios.get(`/bike?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'bike');
    })
    .catch(function (error) {
      console.log(error);
    });
}

function add_busstops() {
    axios.get(`/busstops?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'busstops');
    })
    .catch(function (error) {
      console.log(error);
    });
}

function add_busroutes() {
    axios.get(`/busroutes?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data, 'busroutes');
    })
    .catch(function (error) {
      console.log(error);
    });
}

var toggle = function (a, b) {
    var togg = false;
    return function () {
        // passes return value back to caller
        return (togg = !togg) ? a() : b();
    };
};

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

function hideBusStops() {
    map.data.forEach(function (thing) {
        if (thing.getProperty('type') == 'busstops') {
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
  $('#bus_stops').on('click', toggle (function (){
      return add_busstops();
  }, function (){
      return hideBusStops();
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
