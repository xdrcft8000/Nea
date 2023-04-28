import React from 'react';
import {View, Text, Image} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {firebase} from '@react-native-firebase/database';
// eslint-disable-next-line prettier/prettier
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
// eslint-disable-next-line prettier/prettier
import {AppleButton,appleAuth} from '@invertase/react-native-apple-authentication';
import {storeAsyncData} from '../storageFunctions';
// eslint-disable-next-line prettier/prettier
import {AppleSocialButton,GoogleSocialButton} from 'react-native-social-buttons';

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
const db = firebase
  .app()
  .database(
    'https://nea2-4c301-default-rtdb.europe-west1.firebasedatabase.app/',
  );

function saveUser(user: FirebaseAuthTypes.User, randomGuy: boolean) {
  const userRef = db.ref('users/' + user.uid);
  userRef.set({
    email: user.email,
    uid: user.uid,
    randomGuy: randomGuy,
    created: Math.floor(Date.now() / 1000),
  });
  storeAsyncData([['RandomGuy', randomGuy]]);
}

function loginHandler(user: FirebaseAuthTypes.User, route: any) {
  const userRef = db.ref('users/');
  var randomGuy = false;
  const uid = user.uid;
  userRef.once('value').then(snapshot => {
    if (!snapshot.hasChild(uid)) {
      if (snapshot.numChildren() % 2 === 0) {
        randomGuy = true;
      }
      saveUser(user, randomGuy);
    } else {
      console.log(uid + ' existing user: Logging in');
      storeAsyncData([
        ['RandomGuy', snapshot.child(uid).child('randomGuy').val()],
      ]);
    }
    route.params.handleLogin(user);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginScreen = ({navigation, route}) => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{flex: 1}}>
      <View>
        <Image
          source={require('../assets/medhiCorner.png')}
          style={{position: 'absolute', alignItems: 'flex-start', width: 430, height: 470, top:-10, left:-20}}
        />
      </View>

      <View style={{ alignItems: 'center', justifyContent:'center', postion:'absolute', top:'35%', left:'25%'}}>
        <Text style={{fontFamily: 'Cuprum-Bold', fontSize:80}}>nea</Text>
      </View>

      <View style={{alignItems: 'center', justifyContent:'center', postion:'absolute', top:'60%'}}>
        <AppleSocialButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: 165,
            height: 40,
          }}
          onPress={() => {
            onAppleButtonPress().then(user => {
              loginHandler(user, route);
            });
          }}
        />
        <GoogleSocialButton
          // eslint-disable-next-line react-native/no-inline-styles
          style={{width: 180, height: 45}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={() => {
            onGoogleButtonPress().then(user => {
              loginHandler(user, route);
            });
          }}
        />
      </View>
    </View>
  );
};
export default LoginScreen;
