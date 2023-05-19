import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';

export const db = firebase
  .app()
  .database(
    'https://nea2-4c301-default-rtdb.europe-west1.firebasedatabase.app/',
  );

export const readAsyncStore = async (key: string): Promise<string | null> => {
  try {
    const tempValue = await AsyncStorage.getItem(key);
    return tempValue as string;
  } catch (error) {
    console.log(`Error checking if value exists: ${error}`);
    return null;
  }
};

export const getStoredUserID = async (): Promise<string | null> => {
  let curUser = await readAsyncStore('currentUser');
  return curUser ? curUser.replace(/"/g, '') : null;
};

export const storeAsyncData = async (data: [string, any][]) => {
  try {
    await AsyncStorage.multiSet(
      data.map(([key, value]) => [key, JSON.stringify(value)]),
    );
  } catch (error) {
    console.log(`Error storing data: ${error}`);
  }
};

export const createNewSession = async (
  startTime: number,
  endTime: number,
  currentFocusTime: number,
  currentBreakTime: number,
) => {
  getStoredUserID().then(async userId => {
    // Get a reference to the user's sessions node in the database
    const sessionsRef = db.ref(`users/${userId}/sessions`);
    // Generate a new session ID based on the current timestamp
    const sessionId = String(startTime);
    // Create the new session object
    const session = {
      [sessionId]: {
        endDate: endTime,
        1: {
          focus: currentFocusTime,
          focusOT: 0,
          break: currentBreakTime,
          breakOT: 0,
        },
      },
    };
    await sessionsRef
      .update(session)
      .then(() => {})
      .catch(error => {
        console.log(error);
      });
  });
};

export const addPeriodToSession = async (
  sessionId: string,
  endTime: number,
  currentFocusTime: number,
  currentBreakTime: number,
) => {
  getStoredUserID().then(userId => {
    const sessionRef = db.ref(`users/${userId}/sessions/${sessionId}`);
    readAsyncStore('currentPeriod').then(key => {
      //   sessionRef
      //     .orderByKey()
      //     .limitToLast(2)
      //     .once('value')
      //     .then(snapshot => {
      //     //   const key = snapshot.exists() ? Object.keys(snapshot.val())[0] : null;
      const keyInt = parseInt(key as string) + 1;
      const period = {
        [keyInt]: {
          focus: currentFocusTime,
          break: currentBreakTime,
        },
        ['endDate']: endTime,
      };
      storeAsyncData([['currentPeriod', keyInt]]);
      sessionRef.update(period);
    });
  });
};

export const writeToPeriod = async (phaseString: string, valueNum: number) => {
  readAsyncStore('currentPeriod').then(period => {
    readAsyncStore('sessionStart').then(sessionKey => {
      getStoredUserID().then(userId => {
        const periodRef = db.ref(
          `users/${userId}/sessions/${sessionKey}/${period}`,
        );
        const data = {
          [phaseString]: valueNum,
        };
        periodRef.update(data);
      });
    });
  });
};

export const syncRandomGuy = async () => {
  getStoredUserID().then(userId => {
    const userRef = db.ref('users/' + userId);
    userRef.once('value').then(snapshot => {
      storeAsyncData([['RandomGuy', snapshot.child('randomGuy').val()]]);
    });
  });
};
