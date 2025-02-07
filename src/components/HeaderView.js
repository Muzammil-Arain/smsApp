import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import VectorIcon from 'react-native-vector-icons/Ionicons';

import Colors from '../theme/color';

const HeaderView = ({title, showBack = false, rightIcon, onRightPress}) => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.gradient}>
        {/* Back Button */}
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}>
            <VectorIcon name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Right Icon */}
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            <VectorIcon name={rightIcon} size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  container: {
    width: '100%',
    elevation: 10,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60@ms',
    paddingHorizontal: '15@ms',
    borderBottomLeftRadius: '20@ms',
    borderBottomRightRadius: '20@ms',
  },
  iconButton: {
    padding: '8@ms',
  },
  title: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    color: Colors.white,
  },
  spacer: {
    width: '30@ms',
  },
});

export default HeaderView;
