import { apiKey, HotelSearch } from './HotelSearch';

import { GoogleApiWrapper } from 'google-maps-react';


export function getPriceRange(priceLevel) {
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
      return 'Not available. visit hotel website';
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
}
