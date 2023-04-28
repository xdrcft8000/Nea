import Realm from 'realm';

// interface Period {
//     focus: number;
//     break: number;
//     focusOT: number;
//     breakOT: number;
//   }
  
//   interface User {
//     uid: string;
//     email: string;
//     dateCreated: number;
//     sessions: Session;
//   }
  
//   interface Session {
//     periods: Period[];
//     endDate: number;
//     startDate: number;
//   }
  
class UserModel extends Realm.Object<UserModel> {
  uid: string;
  email: string;
  dateCreated: number;
  sessions: Realm.List<SessionModel>;
  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: 'uid',
    properties: {
      uid: 'string',
      email: 'string',
      dateCreated: {type: 'int', default: new Date().getTime()},
      sessions: {type: 'list', objectType: 'Session'},
    },
  };
}

class SessionModel extends Realm.Object<SessionModel> {
  periods: Realm.List<PeriodModel>;
  endDate: number;
  startDate: number;
  static schema: Realm.ObjectSchema = {
    name: 'Session',
    primaryKey: 'startDate',
    properties: {
      startDate: 'int',
      endDate: 'int',
      periods: {type: 'list', objectType: 'Period'},
    },
  };
}

class PeriodModel extends Realm.Object<PeriodModel> {
  focus: number;
  break: number;
  focusOT: number;
  breakOT: number;
  static schema: Realm.ObjectSchema = {
    name: 'Period',
    properties: {
      focus: 'int',
      break: 'int',
      focusOT: 'int',
      breakOT: 'int',
    },
  };
}

export {UserModel, SessionModel, PeriodModel};
