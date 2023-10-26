import './HotelSearch.css';
import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { getPriceRange } from './utils/PriceUtils';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

class HotelSearch extends Component {
  state = {
    hotels: [],
    map: null,
    numHotelsToShow: 5,
    mapCenter: this.props.initialCenter,
  };

  componentDidUpdate(prevProps) {
    if (this.props.google) {
      if (this.props.initialCenter !== prevProps.initialCenter) {
        this.updateMapCenter();
      } else {
        this.searchForHotels();
      }
    }
  }

  updateMapCenter() {
    if (this.state.map) {
      this.state.map.setCenter(this.props.initialCenter);
      this.setState({ mapCenter: this.props.initialCenter }, () => {
        this.searchForHotels();
      });
    }
  }

  searchForHotels() {
    const { google } = this.props;
    const service = new google.maps.places.PlacesService(this.state.map);

    const request = {
      location: this.state.mapCenter,
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

  loadMoreHotels() {
    this.setState((prevState) => ({ numHotelsToShow: prevState.numHotelsToShow + 5 }));
  }

  render() {
    const { hotels, numHotelsToShow } = this.state;
    const visibleHotels = hotels.slice(0, numHotelsToShow);

    return (
      <div className="container">
        <div className="hotelList">
          <h2>Hotels Near Your Location:</h2>
          {visibleHotels.map((hotel) => (
            <div key={hotel.place_id} className="hotelCard">
              <div className="hotelImageContainer">
                {hotel.photos && hotel.photos[0] ? (
                  <img
                    src={hotel.photos[0].getUrl()}
                    alt="Hotel"
                    className="hotelImage"
                  />
                ) : (
                  <p>No Photo Available</p>
                )}
              </div>
              <div className="hotelInfoContainer">
                <h3 className="hotelName">{hotel.name}</h3>
                <p className="hotelAddress">Address: {hotel.vicinity}</p>
                <p className="hotelRating">Rating: {hotel.rating}</p>
                <p className="hotelPrice">
                  Price Range: {getPriceRange(hotel.price_level) || 'Not available (VISIT HOTEL WEBSITE)'}
                </p>
              </div>
            </div>
          ))}
          {numHotelsToShow < hotels.length && (
            <div className="buttonContainer">
              <button className="seeMoreButton" onClick={this.loadMoreHotels}>
                See more
              </button>
            </div>
          )}
        </div>
        <div className="mapContainer">
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

export default GoogleApiWrapper({
  apiKey: apiKey,
})(HotelSearch);
