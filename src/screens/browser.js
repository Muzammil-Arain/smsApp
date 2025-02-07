import {WebView} from 'react-native-webview';
import React, {useRef, useEffect} from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import VectorIcon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {View, Text, StatusBar, Animated, TouchableOpacity} from 'react-native';

import Colors from '../theme/color';

const Browser = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {url, title} = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeInAnimation();
  }, []);

  const fadeInAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />

      <LinearGradient colors={[Colors.secondary, Colors.primary]} style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <VectorIcon name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Loading...'}</Text>
      </LinearGradient>

      <Animated.View style={[styles.webContainer, {opacity: fadeAnim}]}>
        <WebView source={{uri: url}} />
      </Animated.View>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: '20@ms',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: '20@ms',
    borderBottomRightRadius: '20@ms',
    marginBottom: '10@ms',
    height: '120@ms',
  },
  backButton: {
    position: 'absolute',
    left: '15@ms',
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: '20@ms',
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: '-10@ms',
  },
  webContainer: {
    flex: 1,
    marginHorizontal: '10@ms',
    marginBottom: '10@ms',
    borderRadius: '15@ms',
    overflow: 'hidden',
  },
});

export default Browser;
