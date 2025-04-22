import axios from 'axios';
import {Alert} from 'react-native';

export const fetchCountry = async () => {
  try {
    const response = await axios.get('http://ip-api.com/json');

    const data = response.data;
    const country = data.country;
    const code = data.countryCode;
    // Alert.alert('Location', `Country: ${country}\nCode: ${code}`);
    return {country_code: code, country: country};
  } catch (error) {
    console.error('Error fetching country:', error);
  }
};
