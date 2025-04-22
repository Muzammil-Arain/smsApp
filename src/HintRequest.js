import {NativeModules} from 'react-native';
const {HintRequestModule} = NativeModules;

export const getPhoneNumberHint = async () => {
  try {
    const phoneNumber = await HintRequestModule.showHint();
    console.log('Phone number retrieved:', phoneNumber);
    return phoneNumber;
  } catch (error) {
    console.error('Error retrieving phone number:', error);
    throw error;
  }
};
