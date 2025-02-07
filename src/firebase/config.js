import {  initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCx0G71EUw1hEYq6v4Gj8aQ_HVHR7yBpiM',
  authDomain: 'smsappadmin.firebaseapp.com',
  databaseURL: 'https://smsappadmin-default-rtdb.firebaseio.com',
  projectId: 'smsappadmin',
  storageBucket: 'smsappadmin.firebasestorage.app',
  messagingSenderId: '101134654316',
  appId: '1:101134654316:web:390c8bc73cd72c43a87149',
  measurementId: 'G-239YZBMJBE',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
