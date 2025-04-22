import axios from 'axios';
import {TELECOM_PROVIDERS} from './data';
import {fetchCountry} from '../../networking';

export const getRealUserIP = async () => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    return response.data.ip;
  } catch {
    return '192.168.1.1';
  }
};

export const fetchCountryAndData = async (
  setCountry,
  setWebURl,
  setIsConnected,
  setLoading,
) => {
  try {
    const country = await fetchCountry();

    setCountry(country);
    console.log(`Detected Country: ${country?.country_code}`);

    // ✅ Find the country from COUNTRIES list
    const matchedCountry = TELECOM_PROVIDERS.find(
      item => item.provider === country?.country_code,
    );

    console.log(matchedCountry,'matchedCountry matchedCountry');
    
    if (matchedCountry) {
      setWebURl(matchedCountry.url);
    }

    // Test the API separately
    const testResponse = await fetch(
      'https://smsappadmin-default-rtdb.firebaseio.com/data.json',
    );

    if (!testResponse.ok) {
      throw new Error(`API error: ${testResponse.status}`);
    }

    const [response, adminApi] = await Promise.all([
      fetch('https://smsappadmin-default-rtdb.firebaseio.com/data.json'),
      fetch('https://smsappadmin-default-rtdb.firebaseio.com/admin.json'),
    ]);

    const [data, adminData] = await Promise.all([
      response.json(),
      adminApi.json(),
    ]);

    const adminSettings = Object.values(adminData)?.[0];
    if (adminSettings) {
      setIsConnected(adminSettings.enable);
    }

    if (data) {
      const formattedData = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));

      const filteredData = formattedData.find(
        item =>
          item.county?.toLowerCase() === country?.country_code?.toLowerCase(),
      );

      return filteredData || null;
    }
  } catch (error) {
    console.error('Error in fetchCountryAndData:', error.message);
  } finally {
    setLoading(false);
  }
};

export const removeCountryCode = phoneNumber => {
  for (let country of TELECOM_PROVIDERS) {
    if (phoneNumber.startsWith(country.dialCode)) {
      return phoneNumber.replace(country.dialCode, '');
    }
  }
  return phoneNumber;
};

// Function to extract OTP from SMS body
export const extractOtpFromSms = sms => {
  const otpRegex = /Your verification code is:\s*(\d{4,6})/;
  const match = sms.body.match(otpRegex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
};
