import React, {useState, useEffect} from 'react';
import {Button, View, TouchableOpacity, Text, Image} from 'react-native';
import {readAsyncStore, storeAsyncData} from '../storageFunctions';
import {firebase} from '@react-native-firebase/database';
import SwiftUIButton from './ABViewHelper';
import {NativeModules} from 'react-native';

const handleLogOut = async () => {
  try {
    await firebase.auth().signOut();
  } catch (error) {
    console.log(error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SetupScreen = ({navigation, route}) => {

  useEffect(() => {
    readAsyncStore('currentUser').then(user => {
      if (user === '"DoQpnoxqsucYrq3pJbJKfoMVS4k2"') {
        console.log('Test guy acknowledged');
        setAuthGranted(true);
      } else {
        console.log('not test guy' + user);
      }
    });
  }, []);

  const getAuth = () => {
    NativeModules.AuthAndBlock.reqAuth().then(value => {
      if (value == 'Auth granted') {
        setAuthGranted(true);
      }
    });
  };

  const logoutButton = () => {
    handleLogOut();
    route.params.logout();
  };

  const checkAuth = () => {
    NativeModules.AuthAndBlock.checkAuth(value => {
      if (value) {
        setAuthGranted(true);
      }
    });
  };

  const [authGranted, setAuthGranted] = useState(false);

  const completeSetup = (selection: string) => {
    storeAsyncData([['selection', selection]]);
    storeAsyncData([['setupComplete', 1]]);
    route.params.setupComplete();
  };

  //   const reqAuth = () => {
  //     NativeModules.AppBlocker.reqAuth();
  //   };
  checkAuth();
  if (!authGranted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Image source={require('../assets/neastarlogocropped.png')}
        style={{width:100,height:50, position:'absolute', top:45, left:20}}/>
        <Text
          style={{
            textAlign: 'center',
            paddingHorizontal: 70,
            paddingTop: 70,
            paddingBottom: 20,
            fontFamily: 'Arial',
          }}>
          {' '}
          nea blocks your distracting apps for short focus periods.
        </Text>
        <Text
          style={{
            textAlign: 'center',
            paddingHorizontal: 70,
            paddingVertical: 20,
            fontFamily: 'Arial',
          }}>
          {' '}
          You can end the block at any time, unless you turn on Hard Mode.
        </Text>
        <Text
          style={{
            textAlign: 'center',
            paddingHorizontal: 70,
            paddingVertical: 20,
            fontFamily: 'Arial',
          }}>
          {' '}
          To get started, nea needs permission to access Screen Time:
        </Text>
        <View style={{paddingTop: 20}}>
          <Button onPress={getAuth} title="Grant Permission" />
        </View>
        <TouchableOpacity
          style={{position: 'absolute', top: 70, right: 10}}
          onPressIn={logoutButton}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <SwiftUIButton
        style={styles.container}
        onCountChange={e => completeSetup(e.nativeEvent.count)}
      />
    );
  }
  // // <Button onPress={reqAuth} title="Request Authorisation" />
};
const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default SetupScreen;
