        let userMarker;
        let cafeMarkers = [];

        function findCafes(map, location, InfoWindow, AdvancedMarkerElement) {

            cafeMarkers.forEach(m => m.map = null);
            cafeMarkers = [];

            const service = new google.maps.places.PlacesService(map);

            const request = {
                location: location,
                radius: 5000,
                type: "cafe",
            };

            service.nearbySearch(request, (results, status) => {
                if(status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach((place) => {
                        const cafeDiv = document.createElement("div");
                        cafeDiv.innerHTML = "☕"; 
                        cafeDiv.style.fontSize = "22px"; 

                        const marker = new AdvancedMarkerElement({
                            map,
                            position: place.geometry.location,
                            title: place.name,
                            content: cafeDiv
                        });

                        marker.element.style.cursor = "pointer";

                        const info = new InfoWindow({
                            content: `<strong>${place.name}</strong><br>${place.vicinity || "Keine"}<br>⭐${place.rating} (${place.user_ratings_total || 0})`,
                        });

                        marker.element.addEventListener("mouseover", () => {
                            info.open(map, marker);
                        });
                        
                        marker.element.addEventListener("mouseout", () => {
                            info.close();
                        });
                        cafeMarkers.push(marker);
                    });
                }
            });
        }

        function setUserLocation(map, location, InfoWindow, AdvancedMarkerElement) {
            const markerDiv = document.createElement("div");
            markerDiv.innerHTML = "📍"; 
            markerDiv.style.fontSize = "28px";
            if (!userMarker) {
                userMarker = new AdvancedMarkerElement({
                    map,
                    position: location,
                    title: "Mein Standort",
                    content: markerDiv
                });
            } else {
                userMarker.position = location;
            }
            map.setCenter(location);
            map.setZoom(15);
            findCafes(map, location, InfoWindow, AdvancedMarkerElement)
        }

        function enableClick(map, InfoWindow, AdvancedMarkerElement) {
            map.addListener("click", (e) => {
                const newLocation = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                setUserLocation(map, newLocation, InfoWindow, AdvancedMarkerElement);
            });
        }

        async function initMap(){
            const { Map, InfoWindow } = await google.maps.importLibrary("maps");
            ({ AdvancedMarkerElement } = await google.maps.importLibrary("marker"));
            
            const fallback = {lat: 48.1374, lng: 11.5755};

            const map = new google.maps.Map(document.getElementById("map"), {
                center: fallback,
                zoom: 14,
                mapId: "97b96fe9e72c61a355a60330",
            });

            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation(map, {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }, InfoWindow, AdvancedMarkerElement);
                    },
                    () => {
                        alert("Konnte Standort nicht abrufen. Fallback: München");
                        setUserLocation(map, fallback, InfoWindow, AdvancedMarkerElement)
                    }
                );
            } else {
                setUserLocation(map, fallback, InfoWindow, AdvancedMarkerElement);
            }
            enableClick(map, InfoWindow, AdvancedMarkerElement);
        }
    
