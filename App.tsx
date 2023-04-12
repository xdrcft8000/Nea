/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {AppleButton,appleAuth,} from '@invertase/react-native-apple-authentication';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,useColorScheme,View,Button,TouchableOpacity} from 'react-native';
import {Colors,DebugInstructions,Header,LearnMoreLinks,ReloadInstructions} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GoogleSignin, User, GoogleSigninButton} from '@react-native-google-signin/google-signin';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {FirebaseDatabaseTypes, firebase} from '@react-native-firebase/database';
import LoginScreen from './screens/LoginScreen.tsx';
import HomeScreen from './screens/HomeScreen.tsx';


GoogleSignin.configure({
  webClientId:
    '561140060034-4fbfqvpljl4ddadui444g0drgg3cn1r3.apps.googleusercontent.com',
});

type SectionProps = PropsWithChildren<{
  title: string;
}>;


function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}


const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;

  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
      {user ? (
          <Stack.Screen name="Home" component={HomeScreen}/>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
    </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

