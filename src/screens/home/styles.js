import {ScaledSheet} from 'react-native-size-matters';
import Colors from '../../theme/color';

export const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: '20@ms',
    borderBottomLeftRadius: '20@ms',
    borderBottomRightRadius: '20@ms',
    marginBottom: '20@ms',
    justifyContent: 'center',
    minHeight: '170@ms',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '10@ms',
  },
  heroText: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: Colors.white,
  },
  subText: {
    fontSize: '13@ms',
    color: Colors.white,
    marginTop: '5@ms',
    textAlign: 'center',
  },
  userImage: {
    width: '70@ms',
    height: '70@ms',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '15@ms',
    paddingBottom: '20@ms',
  },
  card: {
    margin: '10@ms',
    height: '120@ms',
    borderRadius: '15@ms',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: '150@ms',
  },
  cardText: {
    color: Colors.white,
    fontSize: '16@ms',
    fontWeight: 'bold',
    marginTop: '8@ms',
    textAlign: 'center',
  },
  buttonView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    width: '40@ms',
    height: '40@ms',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: '20@ms',
    backgroundColor: Colors.white,
    borderRadius: '10@ms',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    marginBottom: '15@ms',
    color: Colors.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: '10@ms',
    paddingVertical: '5@ms',
    backgroundColor: Colors.white,
    marginBottom: '10@ms',
  },
  Phoneicon: {
    marginRight: '5@ms',
    width: '27@ms',
    height: '27@ms',
  },
  modalInput: {
    flex: 1,
    fontSize: '16@ms',
    color: Colors.black,
  },
  loader: {
    marginTop: '-100@ms',
    width: '100@ms',
    height: '100@ms',
  },
  loadingTextStyle: {
    color: Colors.black,
    fontWeight: '500',
    fontSize: '15@ms',
  },
  serverViewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: '0.5%',
    marginTop: '-100@ms',
  },
  serverTextStyle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: '32@ms',
    textAlign: 'center',
  },
  serverImage: {
    width: '150@ms',
    height: '150@ms',
    alignSelf: 'center',
  },
  halfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '300@ms',
    height: '700@ms',
    marginBottom: '10@ms',
  },
  linearGradient: {
    flex: 1,
    paddingLeft: '15@ms',
    paddingRight: '15@ms',
    borderRadius: 5,
  },
  phoneInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.secondary_light,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingLeft: '5@ms',
    paddingVertical: '3@ms',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10@ms',
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 0,
  },
  phoneInputText: {
    fontSize: '16@ms',
    color: Colors.black,
  },
  codeText: {
    color: Colors.primary,
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  flagButton: {
    width: '60@ms',
  },
  countryPicker: {
    borderRightWidth: 1,
    borderColor: Colors.secondary_light,
    paddingRight: '10@ms',
  },
});
