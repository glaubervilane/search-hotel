import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class HotelSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hotels: [],
      map: null,
    };
  }

  componentDidMount() {
    if (this.props.google) {
      this.setState({ isGoogleApiLoaded: true }, () => {
        this.searchForHotels();
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.google && this.props.initialCenter !== prevProps.initialCenter) {
      this.searchForHotels();
    }
  }

  searchForHotels() {
    const { google } = this.props;
    const service = new google.maps.places.PlacesService(this.state.map);
  
    const request = {
      location: this.props.initialCenter,
      radius: 5000, // 5 kilometers
      type: ['lodging'],
    };
  
    // Send a nearby search request to get a list of places
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const hotelsWithDetailsPromises = results.map((hotel) => {
          // Get additional details for each place
          return new Promise((resolve) => {
            service.getDetails({ placeId: hotel.place_id }, (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                // Combine basic information with additional details
                const hotelWithDetails = {
                  ...hotel,
                  price_level: place.price_level,
                  photos: place.photos,
                };
                resolve(hotelWithDetails);
              } else {
                resolve(hotel); // Use basic information if details are not available
              }
            });
          });
        });
  
        // Wait for all promises to resolve before updating state
        Promise.all(hotelsWithDetailsPromises).then((hotelsWithDetails) => {
          this.setState({ hotels: hotelsWithDetails });
        });
      }
    });
  }  

  render() {
    const { hotels } = this.state;

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '1rem' }}>
          <h2>Hotels Near Your Location:</h2>
          <ul>
          {hotels.map((hotel) => (
            <li key={hotel.place_id}>
              <strong>{hotel.name}</strong>
              <p>Address: {hotel.vicinity}</p>
              <p>Rating: {hotel.rating}</p>
              <p>Price Level: {hotel.price_level}</p>
              <div>
                {hotel.photos && hotel.photos[0] ? (
                  <img src={hotel.photos[0].getUrl()} alt="Hotel" width="100" />
                ) : (
                  <p>No Photo Available</p>
                )}
              </div>
              <hr />
            </li>
          ))}
        </ul>
        </div>
        <div style={{ flex: 2 }}>
          <Map
            google={this.props.google}
            style={{ width: '100%', height: '100%' }} // Adjust the width and height
            zoom={14}
            initialCenter={this.props.initialCenter}
            onReady={(mapProps, map) => this.setState({ map })}
          >
            {hotels.map((hotel) => (
              <Marker
                key={hotel.place_id}
                name={hotel.name}
                position={{
                  lat: hotel.geometry.location.lat(),
                  lng: hotel.geometry.location.lng(),
                }}
              />
            ))}
          </Map>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBp_VsTfGns4FsY3ty-OPVDYnsRV8j4wio',
})(HotelSearch);
