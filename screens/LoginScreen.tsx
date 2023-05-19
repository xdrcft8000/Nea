import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
// eslint-disable-next-line prettier/prettier
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {firebase} from '@react-native-firebase/database';
// eslint-disable-next-line prettier/prettier
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
// eslint-disable-next-line prettier/prettier
import {AppleButton,appleAuth} from '@invertase/react-native-apple-authentication';
import {storeAsyncData} from '../storageFunctions';
// eslint-disable-next-line prettier/prettier
import {AppleSocialButton,GoogleSocialButton} from 'react-native-social-buttons';
import {BlurView} from '@react-native-community/blur';

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

async function onEmailButtonPress(email: string, password: string) {
  return (await auth().signInWithEmailAndPassword(email, password)).user;
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
  storeAsyncData([
    ['currentUser', user.uid],
    ['RandomGuy', randomGuy],
  ]);
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
      storeAsyncData([
        ['RandomGuy', snapshot.child(uid).child('randomGuy').val()],
        ['currentUser', uid],
      ]);
    }
    route.params.handleLogin(user);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginScreen = ({navigation, route}) => {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  const email = useRef('');
  const password = useRef('');

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{flex: 1}}>
      <View>
        <Image
          source={require('../assets/medhiCorner.png')}
          style={{
            position: 'absolute',
            alignItems: 'flex-start',
            width: 430,
            height: 470,
            top: -10,
            left: -20,
          }}
        />
      </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          top: '35%',
          left: '30%',
        }}>
        <Image
          source={require('../assets/neastarlogocropped.png')}
          style={{width: 200, height: 100}}
        />
        {/* <Text style={{fontFamily: 'Arial', fontSize: 80}}>nea</Text> */}
        <Text
          style={{
            fontFamily: 'Cuprum-Regular',
            fontSize: 15,
            paddingRight: 80,
            paddingTop: 13,
          }}>
          the smart pomodoro app blocker
        </Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          top: '55%',
        }}>
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
        <TouchableOpacity onPressIn={toggleLogin}>
          <Text
            style={{
              color: 'grey',
              fontSize: 12,
              paddingTop: 8,
            }}>
            login with email
          </Text>
        </TouchableOpacity>
      </View>

      <Modal transparent={true} visible={showLogin}>
        <BlurView style={{flex: 1}} blurType="light" blurAmount={5}>
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 'auto',
              paddingTop: '20%',
            }}>
            <TextInput
              autoCapitalize="none"
              placeholder=" email"
              placeholderTextColor="grey"
              onChangeText={em => (email.current = em)}
            />
            <TextInput
              style={{paddingTop: 3}}
              autoCapitalize="none"
              secureTextEntry={true}
              placeholder=" password"
              placeholderTextColor="grey"
              onChangeText={pass => (password.current = pass)}
            />
            {/* <Text style={{
              color: 'grey',
              fontSize: 12,
              paddingTop: 25,
            }}> </Text> */}
          </View>

          <View style={{paddingBottom: '80%'}}>
            
            <Button
              title="Login"
              onPress={() =>
                onEmailButtonPress(email.current, password.current).then(
                  user => {
                    loginHandler(user, route);
                    toggleLogin();
                  },
                )
              }
            />
            <TouchableOpacity
              style={{
                paddingLeft: 30,
                position: 'absolute',
                bottom: 300,
              }}
              onPress={toggleLogin}>
              <Image
                source={require('../assets/icons8-back-50.png')}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};
export default LoginScreen;
