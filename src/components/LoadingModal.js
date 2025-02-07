import React from 'react';
import LottieView from 'lottie-react-native';
import {Modal, View, Text} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

import Colors from '../theme/color';

const LoadingModal = ({visible, message = 'Loading, please wait...'}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Lottie Animation */}
          <LottieView
            source={require('../assets/loader_yellow.json')}
            autoPlay={true}
            loop={true}
            style={styles.loader}
          />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '200@ms',
    padding: '20@ms',
    backgroundColor: Colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    width: '100@ms',
    height: '100@ms',
  },
  loadingText: {
    marginTop: '10@ms',
    fontSize: '16@ms',
    color: '#333',
    letterSpacing: 1,
  },
});

export default LoadingModal;
