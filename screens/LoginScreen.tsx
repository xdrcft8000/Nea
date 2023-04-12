import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {FirebaseDatabaseTypes, firebase} from '@react-native-firebase/database';
// eslint-disable-next-line prettier/prettier
import {GoogleSignin, User, GoogleSigninButton} from '@react-native-google-signin/google-signin';
// eslint-disable-next-line prettier/prettier
import {AppleButton,appleAuth} from '@invertase/react-native-apple-authentication';


async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  // Get the users ID token
  const {idToken} = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return (await auth().signInWithCredential(googleCredential)).user;
}

async function onAppleButtonPress() {
  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    // Note: it appears putting FULL_NAME first is important, see issue #293
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  // get current authentication state for user
  // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
  // const credentialState = await appleAuth.getCredentialStateForUser(
  //   appleAuthRequestResponse.user,
  // );

  // // use credentialState response to ensure the user is authenticated
  // if (credentialState === appleAuth.State.AUTHORIZED) {
  //   // user is authenticated

  //METHODS FROM FBRN:
  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }

  // Create a Firebase credential from the response
  const {identityToken, nonce} = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken,
    nonce,
  );

  // Sign the user in with the credential
  return (await auth().signInWithCredential(appleCredential)).user;
}

function saveUser(
  user: FirebaseAuthTypes.User,
  userRef: FirebaseDatabaseTypes.Reference,
) {
  userRef.set({
    email: user.email,
    uid: user.uid,
  });
  console.log('New user saved: Email:' + user.email + ' UID: ' + user.uid);
}

const LoginScreen = ({navigation}) => {
  const db = firebase
    .app()
    .database(
      'https://nea2-4c301-default-rtdb.europe-west1.firebasedatabase.app/',
    );
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Login to Nea</Text>
      <AppleButton
        buttonStyle={AppleButton.Style.WHITE}
        buttonType={AppleButton.Type.SIGN_IN}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          width: 165, // You must specify a width
          height: 40, // You must specify a height
        }}
        onPress={() => {
          onAppleButtonPress().then(user => {
            const userRef = db.ref('users/' + user.uid);
            userRef.once('value').then(snapshot => {
              if (!snapshot.exists()) {
                saveUser(user, userRef);
              } else {
                console.log(user.uid + ' already exists.');
              }
            });
          });
        }}
      />
      <GoogleSigninButton
        style={{width: 180, height: 45}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={() => {
          onGoogleButtonPress().then(user => {
            const userRef = db.ref('users/' + user.uid);
            userRef.once('value').then(snapshot => {
              if (!snapshot.exists()) {
                saveUser(user, userRef);
              } else {
                console.log(user.uid + ' already exists.');
              }
            });
          });
        }}
      />
    </View>
  );
};
export default LoginScreen;

