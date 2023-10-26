import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

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
      radius: 5000,
      type: ['lodging'],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const hotelsWithDetailsPromises = results.map((hotel) => {
          return new Promise((resolve) => {
            service.getDetails({ placeId: hotel.place_id }, (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const hotelWithDetails = {
                  ...hotel,
                  price_level: place.price_level,
                  photos: place.photos,
                };
                resolve(hotelWithDetails);
              } else {
                resolve(hotel);
              }
            });
          });
        });

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
        <div style={styles.hotelList}>
          <h2>Hotels Near Your Location:</h2>
          {hotels.map((hotel) => (
            <div key={hotel.place_id} style={styles.hotelCard}>
              <div style={styles.hotelImageContainer}>
                {hotel.photos && hotel.photos[0] ? (
                  <img
                    src={hotel.photos[0].getUrl()}
                    alt="Hotel"
                    style={styles.hotelImage}
                  />
                ) : (
                  <p>No Photo Available</p>
                )}
              </div>
              <div style={styles.hotelInfoContainer}>
                <h3 style={styles.hotelName}>{hotel.name}</h3>
                <p style={styles.hotelAddress}>Address: {hotel.vicinity}</p>
                <p style={styles.hotelRating}>Rating: {hotel.rating}</p>
                <p style={styles.hotelPrice}>
                  Price Level: {hotel.price_level || 'Not available'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.map}>
          <Map
            google={this.props.google}
            zoom={14}
            initialCenter={this.props.initialCenter}
            onReady={(mapProps, map) => this.setState({ map })}
            style={{ width: '100%', height: '100%' }}
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

const styles = {
  hotelList: {
    flex: 1,
    padding: '1rem',
    height: '100%',
    overflowY: 'auto',
  },
  hotelCard: {
    display: 'flex',
    margin: '1rem 0',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
    padding: '1rem',
  },
  hotelImageContainer: {
    flex: 1,
    marginRight: '1rem',
  },
  hotelImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
  },
  hotelInfoContainer: {
    flex: 2,
  },
  hotelName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  hotelAddress: {
    fontSize: '1rem',
  },
  hotelRating: {
    fontSize: '1rem',
  },
  hotelPrice: {
    fontSize: '1rem',
  },
  map: {
    flex: 2,
    height: '80vh',
  },
};

export default GoogleApiWrapper({
  apiKey: apiKey,
})(HotelSearch);
