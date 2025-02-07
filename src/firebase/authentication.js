// import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const signUpUser = async phone => {
  const password = '12345678';
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      phone,
      password,
    );
    const userId = userCredential.user.uid;
    const name = `${('user_', userId)}`;
    // **Firestore mein user ka data manually save karna**
    await firestore().collection('users').doc(userId).set({
      uid: userId,
      name: name,
      email: phone,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('User created & saved to Firestore!');
  } catch (error) {
    console.error('Error signing up:', error);
  }
};
