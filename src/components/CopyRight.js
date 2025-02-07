import React from 'react';
import Colors from '../theme/color';
import {COPY_RIGHT} from '../config';
import {Text, View} from 'react-native';

export const CopyRightView = () => (
  <View
    style={{
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    }}>
    <Text
      style={{
        fontWeight: '400 ',
        textAlign: 'center',
        opacity: 0.5,
      }}>
      {COPY_RIGHT}
    </Text>
  </View>
);
