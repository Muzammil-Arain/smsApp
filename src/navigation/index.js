import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

//screens
import Home from '../screens/home/index';
import Browser from '../screens/browser';

const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Home">
      <AuthStack.Screen name="Home" component={Home} />
      <AuthStack.Screen name="Browser" component={Browser} />
    </AuthStack.Navigator>
  );
};

export default AuthStackScreen;
