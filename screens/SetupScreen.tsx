import React, {useState} from 'react';
import {Button, View, TouchableOpacity, Text} from 'react-native';
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
  const getAuth = () => {
    NativeModules.AuthAndBlock.reqAuth().then(value => {
      if (value == 'Auth granted') {
        setAuthGranted(true);
      }
    });
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
        <Text style={{textAlign:'center', paddingHorizontal:30, paddingVertical:20}}> nea blocks distracting apps to help you focus.</Text>
        <Text style={{textAlign:'center', paddingHorizontal:30, paddingVertical:20}}>
          {' '}
          To do this, nea needs access to Screen Time.
        </Text>
        <Text style={{textAlign:'center', paddingHorizontal:30, paddingVertical:20}}>
          {' '}
          You will be able to end the block by opening nea and ending the study
          session (unless Hard Mode is enabled in the settings).
        </Text>
        <Text style={{textAlign:'center', paddingHorizontal:30, paddingVertical:20}}>
          {' '}
          Please press 'Allow' on the next screen to give nea the power to block
          apps.
        </Text>
        <View style={{position: 'absolute', bottom:75}}>
        <Button onPress={getAuth} title="Next" />
        </View>
        <TouchableOpacity
          style={{position: 'absolute', top: 70, right: 10}}
          onPressIn={handleLogOut}>
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
