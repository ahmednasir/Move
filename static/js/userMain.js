// ------------------------ declarables start------------------------------------

let socket = io();

const DOMStrings = {
  loadIcon: $("#loader-icon"),
  bookBtn: $(".book-btn"),
  progressBar: $(".progress"),
  bottomCard: $(".bottom-card"),
  pickupLoc: $("#pickupLoc"),
  dropLoc: $("#dropLoc"),
  progressBarInner: document.getElementById("progress-bar")
};

var currentCoords = {
  lat: 0,
  lng: 0
};

var pickUpInfo = {
  lat: 0,
  lng: 0,
  Address: ""
};

var dropInfo = {
  lat: 0,
  lng: 0,
  Address: ""
};

let geoCoder = "";

let acceptedFlag = false;
// ------------------------ declarables end------------------------------------

var methods = {
  init: () => {
    socket.on("connect", () => {
      socket.emit("myevent", { data: "User connected!" });
    });
    DOMStrings.loadIcon.hide();
    DOMStrings.bottomCard.hide();
    DOMStrings.pickupLoc.val("");
    DOMStrings.dropLoc.val("");
    methods.initMap();
  },
  // initilize the map
  initMap: () => {
    // navigator.geolocation.getCurrentPosition(
    //   p => {
        // console.log(p.coords);
        // currentCoords.lat = p.coords.latitude;
        // currentCoords.lng = p.coords.longitude;
        currentCoords.lat = 12.922737;
        currentCoords.lng = 77.636051;
        map = new google.maps.Map(document.getElementById("map"), {
          center: currentCoords,
          zoom: 15
        });
        //init geocoder
        geoCoder = new google.maps.Geocoder();

        // set initial address
        methods.geoCodeMethod(currentCoords, "start");

        // set the markers to current geocoordinates
        let startMarker = new google.maps.Marker({
          position: currentCoords,
          map: map,
          draggable: true,
          icon:
            "/static/images/startMarker.png"
        });
        let endMarker = new google.maps.Marker({
          position: currentCoords,
          map: map,
          draggable: true,
          icon:
            "/static/images/endMarker.png"
        });

        // addlisteners to markers
        startMarker.addListener("dragend", () => {
          methods.geoCodeMethod(startMarker.getPosition(), "start");
        });

        endMarker.addListener("dragend", () => {
          methods.geoCodeMethod(endMarker.getPosition(), "end");
        });
      // },
      // err => {
      //   console.log(err);
      // }
    // );
  },
  // geocode the marker positions
  geoCodeMethod: (position, destination) => {
    geoCoder.geocode(
      {
        latLng: position
      },
      responses => {
        if (responses && responses.length > 0) {
          console.log(
            responses[0].formatted_address,
            responses[0].geometry.location.lat()
          );
          if (destination.toLowerCase() == "start") {
            DOMStrings.pickupLoc.val(responses[0].formatted_address);
            pickUpInfo.Address = responses[0].formatted_address;
            pickUpInfo.lat = responses[0].geometry.location.lat();
            pickUpInfo.lng = responses[0].geometry.location.lng();
          } else {
            DOMStrings.dropLoc.val(responses[0].formatted_address);
            dropInfo.Address = responses[0].formatted_address;
            dropInfo.lat = responses[0].geometry.location.lat();
            dropInfo.lng = responses[0].geometry.location.lng();
            // methods.calculateAndDisplayRoute(
            //   { lat: pickUpInfo.lat, lng: pickUpInfo.lng },
            //   { lat: dropInfo.lat, lng: dropInfo.lng }
            // );
          }
        } else {
          console.log(responses);
        }
      }
    );
  },
  calculateAndDisplayRoute: (origin, dest) => {
    var directionsRenderer = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: dest,
        travelMode: "DRIVING"
      },
      function(response, status) {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  },

  // send book reques
  sendBookRequest: () => {
    let bookBody = {
      Id: window.sessionStorage.getItem("pId"),
      PickUpInfo: pickUpInfo,
      DropInfo: dropInfo,
      Name: "Nasir"
    };
    DOMStrings.loadIcon.show();
    DOMStrings.bookBtn.hide();
    console.log(JSON.stringify(bookBody));
    DOMStrings.bottomCard.show();
    socket.emit("bookRequest", { data: bookBody });
    let counter = 0;
    let progressIntervals = setInterval(() => {
      counter += 10;
      DOMStrings.progressBarInner.style.width = `${counter}%`;
      console.log(counter);
    }, 1000);
    setTimeout(() => {
      DOMStrings.loadIcon.hide();
      DOMStrings.bookBtn.show();
      clearInterval(progressIntervals);
      DOMStrings.bottomCard.hide();
      alert("No cabs found!!!");
    }, 10000);
  }
};

socket.on("acceptedRequest", data => {
  console.log(data);
});

DOMStrings.bookBtn.click(() => {
  if (DOMStrings.dropLoc.val() && DOMStrings.pickupLoc.val()) {
    methods.sendBookRequest();
  }
});

methods.init();
