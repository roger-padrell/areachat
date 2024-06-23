async function initMap(){
    window.markers = await google.maps.importLibrary("marker");
    if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
        centerMap(position.coords.latitude, position.coords.longitude);
      });
  }
    else{
        alert("AreaChat needs geolocation permisions.")
    }
}
window.blanks = []
function blank(...arg){
    window.blanks.push(arg);
}
function BuildMap() {
    var mapProp= {
      center:new google.maps.LatLng(position.lt,position.lg),
      zoom:15,
      mapId: "5d374d95dce2c316",
      mapTypeId: google.maps.MapTypeId.SATELLITE,
    };
    try{
        var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
        window.map = map;
    }
    finally{

        setStyle()
    
        document.body.onmousemove = function(){rmbButtons()}
        addTexts()
        setInterval(addTexts, 60000)
    
        const marker = new markers.AdvancedMarkerElement({
            map,
            position: map.center,
          });
    }

}
function centerMap(lt, lg){
    window.position = {};
    position.lt = lt;
    position.lg = lg;
    BuildMap()
}

function setStyle(){
    const styles = [
        {
          "featureType": "administrative",
          "stylers": [
            {
              "visibility": "simplified"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.neighborhood",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ]
    map.setOptions({"styles": styles})
}
function rmbButtons(){
    //remove buttons
    let arr = Array.from(document.getElementsByClassName("gmnoprint"));
    for(let a in arr){
        arr[a].remove();
    }
    arr = [
        document.getElementsByClassName("gm-style-cc")[1],
        document.getElementsByClassName("gm-fullscreen-control")[0],
        document.querySelector("[rel=noopener]"),
    ]
    for(let b in arr){
        try{
            arr[b].remove();
        }
        catch(e){}
    }
}

function addTag(text, pos, dt){
    let tag = document.createElement("div");
    tag.className = "TextTag"
    tag.textContent = text;
    let position = pos;
    if(position.lt){
        position.lat = position.lt;
        position.lng = position.lg;
    }
    let marker = new markers.AdvancedMarkerElement({
        map,
        position: position,
        content: tag
    })
}

let db = {};
db.key = "$2b$10$i3qJgSD.qkNJRnyjAWq0ZePymTTWgzaBSJzm2nEJn4KpSb6S3/T7K";
db.id = "66783dd7acd3cb34a85bf98a";
db.data = {};
db.read = function(callback){
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
      if (req.readyState == XMLHttpRequest.DONE) {
        db.data = JSON.parse(req.responseText);
        callback(db.data);
      }
    };
    
    req.open("GET", "https://api.jsonbin.io/v3/b/" + db.id + "/?meta=false", true);
    req.setRequestHeader("X-Master-Key", db.key);
    req.send();
}
db.update = function(callback){
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            callback(req.responseText);
        }
    };

    req.open("PUT", "https://api.jsonbin.io/v3/b/" + db.id, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", db.key);
    req.send(JSON.stringify(db.data));
}

function addTexts(){
    //get the data from JSONBin
    db.read(function(r){
        //check for passed texts
        let anyPassed = false;
        let time = new Date().getTime();
        db.data.messages.forEach(message => {
            if((time - message.time) >= 86400000){
                db.data.messages.splice(db.data.messages.indexOf(message),1);
                anyPassed = true;
            }
        });
        //update JSONBin if passed texts
        if(anyPassed){
            db.update(blank)
        }

        //create Tags
        for(m in db.data.messages){
            addTag(db.data.messages[m].content,db.data.messages[m].position, {time: db.data.messages[m].time})
        }
    })
}
let canSendText = true;
function sendText(text){
    if(canSendText){
        db.data.messages.push({
            'content':text,
            'time':new Date().getTime(),
            'position':position
        })
        db.update(blank);
        canSendText = false;
        setTimeout(function(){canSendText=true},60000)
        document.getElementById("in").value = "";
        addTexts()
    }
    else{
        alert("You have to wait a minute before sending another text")
    }
}
