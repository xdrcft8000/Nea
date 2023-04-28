/* eslint-disable radix */
import React, {useState, useEffect} from 'react';
import {Text} from 'react-native-svg';
import {storeAsyncData, readAsyncStore} from './storageFunctions';
import {AppState, AppStateStatus} from 'react-native';

interface TimerProps {
  duration: number;
  breakDuration: number;
  x?: number;
  y?: number;
  fontSize?: number;
  timerStatus: React.MutableRefObject<string>;
  setPhaseState: React.Dispatch<React.SetStateAction<string>>;
  timeOnClock: React.MutableRefObject<number>;
  resumeFocus: (dur: number) => void;
  resumeBreak: (dur: number) => void;
}

const Timer: React.FC<TimerProps> = ({
  duration,
  breakDuration,
  x,
  y,
  fontSize,
  timerStatus,
  setPhaseState,
  timeOnClock,
  resumeFocus,
  resumeBreak,
}) => {
  const [remainingTime, setRemainingTime] = useState(duration);
  const [phase, setPhase] = useState('inital');
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    readAsyncStore('sessionEnd').then(endTime => {
      if (endTime != null) {
        const dateNow = Math.floor(Date.now() / 1000);
        if (dateNow < parseInt(endTime)) {
          readAsyncStore('currentPhase').then(phaseP => {
            readAsyncStore('currentPhaseStart').then(phaseStart => {
              if (phaseP != null && phaseStart != null) {
                if (phaseP === '"focus"' || phaseP === '"break"') {
                  readAsyncStore('currentPhaseDuration').then(dur => {
                    if (dur != null) {
                      if (parseInt(phaseStart) + parseInt(dur) < dateNow) {
                        if (phaseP === '"focus"') {
                          setPhaseState('focusOT');
                          timerStatus.current = 'focusOT';
                          setRemainingTime(
                            parseInt(phaseStart) + parseInt(dur) - dateNow,
                          );
                        } else if (phaseP === '"break"') {
                          setPhaseState('breakOT');
                          timerStatus.current = 'breakOT';
                          setRemainingTime(
                            parseInt(phaseStart) + parseInt(dur) - dateNow,
                          );
                        }
                      } else {
                        if (phaseP === '"focus"') {
                          resumeFocus(
                            parseInt(dur) - (dateNow - parseInt(phaseStart)),
                          );
                        } else if (phaseP === '"break"') {
                          resumeBreak(
                            parseInt(dur) - (dateNow - parseInt(phaseStart)),
                          );
                        }
                      }
                    }
                  });
                } else {
                  setPhase(phaseP);
                  setRemainingTime(parseInt(phaseStart) - dateNow);
                }
              }
            });
          });
        }
      }
    });
  }, []);
  if (!(phase === timerStatus.current)) {

    setPhase(timerStatus.current);
    if (timerStatus.current === 'focus') {
      setVisible(true);
      timeOnClock.current = remainingTime;
      setRemainingTime(duration);
    } else if (timerStatus.current === 'break') {
      setVisible(true);
      timeOnClock.current = remainingTime;
      setRemainingTime(breakDuration);
    } else if (timerStatus.current === 'initial') {
      setVisible(false);
      timeOnClock.current = 0;
    }
  }

  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        readAsyncStore('sessionEnd').then(endTime => {
          if (endTime != null) {
            const dateNow = Math.floor(Date.now() / 1000);
            if (dateNow < parseInt(endTime)) {
              readAsyncStore('currentPhase').then(phaseP => {
                readAsyncStore('currentPhaseStart').then(phaseStart => {
                  if (phaseP != null && phaseStart != null) {
                    if (phaseP === '"focus"' || phaseP === '"break"') {
                      readAsyncStore('currentPhaseDuration').then(dur => {
                        if (dur != null) {
                          if (parseInt(phaseStart) + parseInt(dur) < dateNow) {
                            if (phaseP === '"focus"') {
                              timerStatus.current = 'focusOT';
                              setRemainingTime(
                                parseInt(phaseStart) + parseInt(dur) - dateNow,
                              );
                            } else if (phaseP === '"break"') {
                              setPhaseState('breakOT');
                              timerStatus.current = 'breakOT';
                              setRemainingTime(
                                parseInt(phaseStart) + parseInt(dur) - dateNow,
                              );
                            }
                          } else {
                            setPhase(phaseP);
                            setRemainingTime(
                              parseInt(dur) - (dateNow - parseInt(phaseStart)),
                            );
                          }
                        }
                      });
                    } else {
                      setPhase(phaseP);
                      setRemainingTime(parseInt(phaseStart) - dateNow);
                    }
                  }
                });
              });
            }
          }
        });
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {
    let interval: any = null;
    if (phase === 'focus' || phase === 'focusOT') {
      interval = setInterval(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      if (remainingTime === 0) {
        timerStatus.current = 'focusOT';
        setVisible(true);
        setPhaseState('focusOT');
        storeAsyncData([
          ['currentPhase', 'focusOT'],
          ['currentPhaseStart', Math.floor(Date.now() / 1000)],
        ]);
      }
      return () => clearInterval(interval);
    } else if (phase === 'break' || phase === 'breakOT') {
      interval = setInterval(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      if (remainingTime === 0) {
        timerStatus.current = 'breakOT';
        setVisible(false);
        setPhaseState('breakOT');
        storeAsyncData([
          ['currentPhase', 'breakOT'],
          ['currentPhaseStart', Math.floor(Date.now() / 1000)],
        ]);
      }
      return () => clearInterval(interval);
    }
  }, [remainingTime, phase, timerStatus, setPhaseState]);

  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const minutes = Math.floor(absTime / 60);
    const seconds = absTime % 60;
    var sign = time < 0 ? '+' : '   ';
    if (phase === 'breakOT') {
      sign = time < 0 ? '-' : '   ';
    }
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  let xcord = x;
  let ycord = y;
  let tsize = fontSize;
  return (
    <Text x={xcord} y={ycord} fontSize={tsize} opacity={isVisible ? 1 : 0}>
      {formatTime(remainingTime)}
    </Text>
  );
};

export default Timer;
