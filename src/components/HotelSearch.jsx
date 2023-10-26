import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

class HotelSearch extends Component {
  state = {
    hotels: [],
    map: null,
    numHotelsToShow: 5,
  };

  componentDidMount() {
    if (this.props.google) {
      this.setState({ isGoogleApiLoaded: true }, this.searchForHotels);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.google && this.props.initialCenter !== prevProps.initialCenter) {
      this.searchForHotels();
    }
  }

  searchForHotels = () => {
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
  };

  loadMoreHotels = () => {
    this.setState((prevState) => ({ numHotelsToShow: prevState.numHotelsToShow + 5 }));
  };

  render() {
    const { hotels, numHotelsToShow } = this.state;
    const visibleHotels = hotels.slice(0, numHotelsToShow);

    return (
      <div style={styles.container}>
        <div style={styles.hotelList}>
          <h2>Hotels Near Your Location:</h2>
          {visibleHotels.map((hotel) => (
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
                  Price Range: {getPriceRange(hotel.price_level) || 'Not available (VISIT HOTEL WEBSITE)'}
                </p>
              </div>
            </div>
          ))}
          {numHotelsToShow < hotels.length && (
            <div style={styles.buttonContainer}>
              <button style={styles.seeMoreButton} onClick={this.loadMoreHotels}>
                See more
              </button>
            </div>
          )}
        </div>
        <div style={styles.mapContainer}>
          <Map
            google={this.props.google}
            zoom={14}
            initialCenter={this.props.initialCenter}
            onReady={(mapProps, map) => this.setState({ map })}
            style={{ width: '50%', height: '50vh' }}
          >
            {visibleHotels.map((hotel) => {
              const position = {
                lat: hotel.geometry.location.lat(),
                lng: hotel.geometry.location.lng(),
              };

              return (
                <Marker
                  key={hotel.place_id}
                  name={hotel.name}
                  position={position}
                />
              );
            })}
          </Map>
        </div>
      </div>
    );
  }
}

function getPriceRange(priceLevel) {
  switch (priceLevel) {
    case 0:
      return '$';
    case 1:
      return '$$';
    case 2:
      return '$$$';
    case 3:
      return '$$$$';
    default:
      return 'Not available. Visit hotel website';
  }
}

const styles = {
  container: {
    display: 'flex',
  },
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
  mapContainer: {
    flex: 2,
    height: '80vh',
    marginTop: '20px',
    paddingTop: '60px',
  },
  seeMoreButton: {
    background: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
};

export default GoogleApiWrapper({
  apiKey: apiKey,
})(HotelSearch);
