var map, heatmap, infoWindow;
var ws_address;
var ws_wsid = 'g66cb3dc63cb74226ac55ac06fa465f1f';
// var ws_address = '3302 Canal St., Houston, TX';
var ws_format = 'tall';
var ws_width = '300';
var ws_height = '350';
var FEATURE_TYPE;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(29.7604, -95.3698),
    mapTypeId: 'terrain',
    styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
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
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);

            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=AIzaSyA0fEoOYqyHqCn0k7w0IhQGjW27eFXhfvc`)
                .then(function(response){
                    console.log(response)
                     ws_address = response.data.results[0].formatted_address

                    // call walk score api here
                    $.getScript( "http://www.walkscore.com/tile/show-walkscore-tile.php" );
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
       opacity: 1
     });

  map.addListener('bounds_changed', function() {
    initialViewPort = map.getBounds();
    minx = initialViewPort.b.b;
    maxx = initialViewPort.b.f;
    miny = initialViewPort.f.b;
    maxy = initialViewPort.f.f;

    // add_crimes();
    // add_bike();
    // add_busstops();
    // add_busroutes();
  });


map.data.setStyle(function (feature) {
    //console.log(feature);

    if (feature.getProperty('offense') == 'Theft') {
      return {icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'};
    }

    return {};
  });

  map.data.addListener('addfeature', function (event) {
      event.feature.setProperty('type', FEATURE_TYPE);
  });


  map.data.addListener('click', function(event){
    var infoWindow = new google.maps.InfoWindow({
      content: event.feature.getProperty('offense')
    });
    console.log(event);

    infoWindow.open(map);
    infoWindow.setPosition(event.latLng);
  });
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
  $('#all_crime').on('click', toggle (function (){
      return add_crimes();
  }, function (){
      return hideCrimes();
  }));
  $('#').on('click', toggle (function (){
      return add_bike();
  }, function (){
      return hideBike();
  }));
  $('#').on('click', toggle (function (){
      return add_busstops();
  }, function (){
      return hideBusStops();
  }));
  $('#').on('click', toggle (function (){
      return add_busroutes();
  }, function (){
      return hideBusRoutes();
  }));
});
