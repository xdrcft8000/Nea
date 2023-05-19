/* eslint-disable prettier/prettier */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';
import LoginScreen from './screens/LoginScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen2 from './screens/HomeScreen2';
import { readAsyncStore, storeAsyncData } from './storageFunctions';


GoogleSignin.configure({
  webClientId:
    '561140060034-4fbfqvpljl4ddadui444g0drgg3cn1r3.apps.googleusercontent.com',
});


const Stack = createNativeStackNavigator();

const unsubscribe = async (): Promise<FirebaseAuthTypes.User | null> => {
  return new Promise((resolve) => {
    const unsub = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser){
        resolve(null);
      } else {
      resolve(firebaseUser);
      }
    });
  });
};

const checkPrevUse = async ():Promise<number> =>{
  let returnValue = 0;
  await readAsyncStore('usedAppBefore').then((usedAppBefore) => {
    if (!usedAppBefore){
      firebase.auth().signOut();
      storeAsyncData([['usedAppBefore',true]]);
      returnValue =  1;
    }
  });
  return returnValue;
};

function App(): JSX.Element {


  // const isDarkMode = useColorScheme() === 'dark';
  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  useEffect(() => {
    checkPrevUse().then((used)=>{
      if (used === 0){
      // Check if user is logged in
      unsubscribe().then((newUser =>{
        if (newUser) {
          loginHandler(newUser);
          } else {
          setUser(null);
        }
      }));
      } else {
        setUser(null);
      }
  });
  }, []);



  const loginHandler = (newUser : FirebaseAuthTypes.User) => {
    readAsyncStore('setupComplete').then((complete)=>{
    if (complete === '1'){
      setHasCompletedSetup(true);
    }
    setUser(newUser);});
  };


  const loginUnhandler = () => {
    setUser(null);
  };

  const completeHandler = () => {
    setHasCompletedSetup(true);
  };
  const completeUnHandler = () => {
    setHasCompletedSetup(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      {user ? (
          hasCompletedSetup ? (
            <Stack.Screen
              name="Home"
              component={HomeScreen2}
              options={{ headerShown: false }}
              initialParams = {{setupComplete:completeUnHandler
              ,logout:loginUnhandler}}
            />
          ) : (
            <Stack.Screen
              name="Setup"
              component={SetupScreen}
              options={{ headerShown: false }}
              initialParams = {{setupComplete:completeHandler, logout:loginUnhandler}}
            />
          )
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
            initialParams = {{handleLogin:loginHandler}}

          />
        )}
    </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;

