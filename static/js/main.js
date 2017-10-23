var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(29.7604, -95.3698),
    mapTypeId: 'terrain'
  });

  map.addListener('bounds_changed', function() {
    initialViewPort = map.getBounds();
    minx = initialViewPort.b.b;
    maxx = initialViewPort.b.f;
    miny = initialViewPort.f.b;
    maxy = initialViewPort.f.f;

    axios.get(`/crimes?minx=${minx}&maxx=${maxx}&miny=${miny}&maxy=${maxy}`)
    .then(function (response) {
      load_geojson(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  });
}

// Loop through the results array and place a marker for each
// set of coordinates.
function load_geojson(results) {
  console.log(results);
  map.data.addGeoJson(results);
}

$(document).ready(function () {
  $('#sidebarCollapse').click(function () {
    console.log('sidebar toggle');
    $('#sidebar').toggleClass('active');

    $('a[href^="#"]').click(function() {
        // target element id
        var id = $(this).attr('href');

        // target element
        var $id = $(id);
        if ($id.length === 0) {
            return;
        }

        // prevent standard hash navigation (avoid blinking in IE)
        event.preventDefault();

        // top position relative to the document
        var pos = $id.offset().top;

        // animated top scrolling
        $('body, html').animate({scrollTop: pos});
    });
  });

});
