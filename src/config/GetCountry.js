import axios from 'axios';

export const getReaCountrylUserIP = async () => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    const userIP = response.data.ip;

    // Use the IP to get the country info (example using ipstack)
    const geoResponse = await axios.get(`http://api.ipstack.com/${userIP}?access_key=fc795769dcf5c80acbc426d99d98e51d`);
    const country = geoResponse.data.country_name; // This will give you the country name
    console.log('Country:', country);
    return country;
  } catch (error) {
    console.error('Error fetching IP or country:', error);
    return 'Unknown'; // Fallback
  }
};