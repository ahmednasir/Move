const DOMStrings = {
  requestContainers: $(".requests"),
  from: $("#from"),
  to: $("#to"),
  userName: $("#userName"),
  accept: $(".accept-btn"),
  reject: $(".reject-btn"),
  requestCard: $(".request-card")
};
const socket = io();
let requests = [];

const methods = {
  // initialize the page
  init: () => {
    DOMStrings.requestCard.hide();
    socket.on("connect", () => {
      socket.emit("myevent", { data: "User connected!" });
    });

    methods.sendPos();
  },

  // add requests to main container
  addRequest: request => {
    if (!document.getElementById(request.Id)) {
      console.log(request.Id)
      let element = `<div class="card request-card" id="request-${request.Id}"> <div class="row"> <div class="col-md-6"> <p id="userName">${
        request.Name
      }</p></div><div class="col-md-6"> ETA : 5mins </div></div><div class="row"> <div class="col-md-6"> <button type="button" class="btn btn-primary accept-btn" id="${
        request.Id
      }" onclick="methods.acceptRequest(this.id)" > Accept </button> </div><div class="col-md-6"> <button type="button" class="btn btn-danger reject-btn"> Reject </button> </div></div></div>`;
      DOMStrings.requestContainers.append(element);
      methods.setTimeOutRequest(request.Id)
    }
  },

  setTimeOutRequest: (id)=>{
    setTimeout(()=>{
      $("#request-"+id).hide()
    },9000)

  },

  // on accepting a paricular request
  acceptRequest: id => {
    id = parseInt(id);
    console.log(id);

    let req = requests[0];
    if (requests.length > 1) {
      for (let i = 0; i < requests.length; i++) {
        if (id == requests[i].Id) {
          req = requests[i];
          break;
        }
      }
    }
    console.log(req);
    req.DriverId = window.sessionStorage.getItem("id");
    methods.initMap(req.PickUpInfo);
    socket.emit("accepted", { Request: req });
  },

  // on booking request receive
  onBookRequestReceived: req => {
    DOMStrings.requestCard.show();
    console.log(req);
    req = req.data;
    requests.push(req);
    methods.addRequest(req);
  },

  initMap: destination => {
    window.open(
      `https://maps.google.com/?saddr=Current+Location&daddr=${
        destination.lat
      },${destination.lng}`,
      "_blank"
    );
  },

  // send current position to user
  sendPos: () => {
    // let positionInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      p => {
        console.log(p.coords, p.timestamp);
      },
      err => {
        console.log(err);
      }
    );
    // },1000);
  }
};

// on booking request receive
socket.on("bookRequest", req => {
  methods.onBookRequestReceived(req);
});

methods.init();
