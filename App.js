import React, {useEffect, useState} from 'react';
import FlashMessage from 'react-native-flash-message';
import {LogBox, SafeAreaView, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AnimatedSplash from 'react-native-animated-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import './src/firebase/config';
import Colors from './src/theme/color';
import AuthStackScreen from './src/navigation';
import {setPhoneNum} from './src/helper/datahandler';

const Stack = createStackNavigator();

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const App = () => {
  const [isSplashLoaded, setSplashLoaded] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedLogin = await AsyncStorage.getItem('LOGIN');
        console.log(storedLogin, 'storedLogin');

        if (storedLogin) {
          setPhoneNum(storedLogin);
        }
      } catch (error) {
        console.error('AsyncStorage Error:', error);
      }
    };
    checkLogin();
  }, []);

  setTimeout(() => {
    setSplashLoaded(true);
  }, 3000);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <NavigationContainer>
        <AnimatedSplash
          preload={false}
          translucent={false}
          isLoaded={isSplashLoaded}
          backgroundColor={Colors.black}
          logoImage={require('./src/assets/Splash.png')}
          logoHeight={'120%'}
          logoWidth={'100%'}>
          <Stack.Navigator>
            <Stack.Screen
              name="home"
              component={AuthStackScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </AnimatedSplash>
        <FlashMessage
          titleStyle={{fontWeight: 'bold'}}
          animationDuration={500}
          position="bottom"
        />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;