import React from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import {Text, TouchableOpacity, ActivityIndicator} from 'react-native';

import Colors from '../theme/color';

const ButtonView = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style = {},
  textStyle = {},
  variant = 'primary',
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={
            disabled
              ? [Colors.gray, Colors.lightGray]
              : [Colors.primary, Colors.secondary]
          }
          style={styles.gradient}>
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={[styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      ) : isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.white}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  buttonContainer: {
    borderRadius: 25,
    height: '50@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: '10@ms',
    overflow: 'hidden',
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: Colors.primary,
    width: '100%',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: Colors.white,
    fontSize: '18@ms',
    fontWeight: 'bold',
  },
  outlineText: {
    color: Colors.primary,
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
});

export default ButtonView;
