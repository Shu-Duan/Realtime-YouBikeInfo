//======parameter======
var map;
var myPosition;
var myPositionCycle;
var infowindow;
var markerMap = new Map();
var infowindowMap = new Map();
// ======functions======
function initMap() {
	var dfd = jQuery.Deferred();
	map = new google.maps.Map(document.getElementById('map'), {
		center : {
			lat : 25.0329694,
			lng : 121.5654177
		},
		fullscreenControl : false,
		mapTypeControlOptions : false,
		streetViewControl: false,
		zoom : 15
	});
	getData();
}
function getData() {
	$.ajax({
		url : 'youBike/getYouBikeData',
		type : 'POST',
		success : function(res) {
			if (!res.success) {
				console.log("ajax success, status failed.");
				return;
			}
			console.log(new Date());
			console.log(res);
			createMarkers(res.data);
		},
		error : function(qXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	})
}
function createMarkers(data) {
	for (i in data) {
		var marker = new google.maps.Marker({
			icon : {
				url : 'images/bike.png',
				scaledSize : new google.maps.Size(32, 32)
			},
			position : {
				lat : data[i].lat,
				lng : data[i].lng
			},
			map : map,
			site : data[i].sna,
			ar : data[i].ar,
			tot : data[i].tot,
			sbi : data[i].sbi,
			bemp : data[i].bemp,
			mday : data[i].mday,
			bStatus : Number(data[i].sbi) < 0 ? 0 : 1,
			rStatus :Number(data[i].bemp) < 0 ? 0 : 1
		});
		//change icon by status
		for (var [key, value] of markerMap) {
			if(value.bStatus == 0 || value.rStatus == 0) {
				value.setIcon({
					url : 'images/bike_org.png',
					scaledSize : new google.maps.Size(32, 32)
				});
			}
		}
		// listener
		google.maps.event.addListener(marker, 'mouseover', function() {
			infowindow = new google.maps.InfoWindow();
			infowindow.setContent("<div>場站名稱 : " + this.site + "</div>"
					+ "<div>地址 : " + this.ar + "</div>"
					+ "<div>可借車數 : " + this.sbi + "/" + this.tot + "</div>"
					+ "<div>可停空位 : " + this.bemp + "/" + this.tot + "</div>"
					+ "<div>更新時間 : " + convertDate(this.mday) + "</div>"
					);
			infowindow.open(map, this);
		});
		google.maps.event.addListener(marker, 'mouseout', function() {
			infowindow.close(map, this);
		});
		markerMap.set(data[i].sno, marker);
		infowindowMap.set(data[i].sno, infowindow);
	}
}
function toMyPosition() {
	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			myPosition = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
			};
			map.setCenter(myPosition);
			map.setZoom(17);
		}, function() {
			alert("Does not support.");
		});
	} else {
		// Browser doesn't support Geolocation
		alert("Does not support.");
	}
}
function nearMyPosition() {
	toMyPosition();
	if(myPositionCycle) {
		myPositionCycle.setMap(null);
	}
	myPositionCycle = new google.maps.Circle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		center: myPosition,
		radius: 500,
		map: map
	});
}
function convertDate(date) {
	var year = date.substring(0, 4);
	var month = date.substring(4, 6);
	var day = date.substring(6, 8);
	var hour = date.substring(8, 10);
	var min = date.substring(10, 12);
	var sec = date.substring(12, 14);
	return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}
// update data every 5 minute.
setInterval(function() {
	var d = new Date();
	var minute = d.getMinutes();
	var second = d.getSeconds();
	if (minute % 5 == "0" && second == "0") {
		getData();
	}
}, 1000);