import { NativeModules, PermissionsAndroid } from 'react-native';
const { SmsReader } = NativeModules;

// Start SMS Retriever (No READ_SMS permission needed)
export const startSmsRetriever = async () => {
  try {
    const response = await SmsReader.startSmsRetriever();
    console.log("SMS Retriever started:", response);
  } catch (error) {
    console.error("Error starting SMS Retriever:", error);
  }
};

// Fetch OTP Messages (Requires READ_SMS permission)
export const getOtpRequest = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "SMS Permission",
        message: "App needs access to your SMS messages to retrieve OTPs.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const otpMessages = await SmsReader.getOtpMessages();
            const SMSData = JSON.parse(otpMessages);
            resolve(SMSData);
          } catch (error) {
            console.error("Error fetching OTP messages:", error);
            reject(error);
          }
        }, 5000);
      });
    } else {
      console.log("READ_SMS permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error fetching OTP messages:", error);
    return null;
  }
};
