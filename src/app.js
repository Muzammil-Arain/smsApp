import React, {useEffect, useState} from 'react';
import {
  Alert,
  NativeModules,
  PermissionsAndroid,
  Text,
  View,
} from 'react-native';
import {getPhoneNumberHint} from './src/HintRequest';
import { getOtpMessages, startSmsRetriever } from './src/OtpService';

const App = () => {
  const { SmsReader } = NativeModules;
  const [phonenum, setPhoneNum] = useState('LOADING...');


  useEffect(() => {
    handleGetPhoneNumber()
    // Start SMS Retriever
    startSmsRetriever();
  }, []);

  async function requestSMSPermissions() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  const handleGetPhoneNumber = async () => {
    try {
      const phoneNumber = await getPhoneNumberHint();
      setPhoneNum(phoneNumber);
      // setTimeout(() => {
      //   getOtpMessages();
      // }, 9000);
    } catch (error) {
      Alert.alert(`Failed to retrieve phone number: ${error.message}`);
      Alert.prompt(
        'Enter Phone Number',
        'We couldn’t retrieve your phone number. Please enter it manually.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: manualPhoneNumber => {
              console.log('Manual Phone Number:', manualPhoneNumber);
              setPhoneNum(manualPhoneNumber); // Update state with manual entry
            },
          },
        ],
      );
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{fontSize: 22, fontWeight: 'bold'}}>{phonenum}</Text>
    </View>
  );
};

export default App;
