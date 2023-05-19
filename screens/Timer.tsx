/* eslint-disable radix */
import React, {useState, useEffect, useRef} from 'react';
import {G, Text} from 'react-native-svg';
import {storeAsyncData, readAsyncStore} from '../storageFunctions';
import {AppState, AppStateStatus, Animated, Easing} from 'react-native';

interface TimerProps {
  duration: number;
  breakDuration: number;
  x?: number;
  y?: number;
  fontSize: number;
  timerStatus: React.MutableRefObject<string>;
  setPhaseState: React.Dispatch<React.SetStateAction<string>>;
  timeOnClock: React.MutableRefObject<number>;
  resumeFocus: (dur: number) => void;
  resumeBreak: (dur: number) => void;
  resumeFocusOT: () => void;
  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
}

const AniG = Animated.createAnimatedComponent(G);

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
  remainingTime,
  setRemainingTime,
  resumeFocusOT,
}) => {
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
                          resumeFocusOT();
                          setPhase('focusOT');
                          timerStatus.current = 'focusOT';
                          setRemainingTime(
                            parseInt(phaseStart) + parseInt(dur) - dateNow,
                          );
                        } else if (phaseP === '"break"') {
                          setPhaseState('breakOT');
                          setPhase('breakOT');
                          timerStatus.current = 'breakOT';
                          setRemainingTime(
                            parseInt(phaseStart) + parseInt(dur) - dateNow,
                          );
                        }
                      } else {
                        if (phaseP === '"focus"') {
                          console.log('resuming focus');
                          let timeLeft =
                            parseInt(dur) - (dateNow - parseInt(phaseStart));
                          resumeFocus(timeLeft);
                          setRemainingTime(timeLeft);
                        } else if (phaseP === '"break"') {
                          console.log('resuming break');
                          let timeLeft =
                            parseInt(dur) - (dateNow - parseInt(phaseStart));
                          resumeBreak(timeLeft);
                          setRemainingTime(timeLeft);
                        }
                      }
                    }
                  });
                } else {
                  console.log('is this happeninging?')
                  setPhase(phaseP);
                  setRemainingTime(parseInt(phaseStart) - dateNow);
                }
              }
            });
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                              setPhase('focusOT');
                              setRemainingTime(
                                parseInt(phaseStart) + parseInt(dur) - dateNow,
                              );
                              resumeFocusOT();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const timerFadeIn = useRef(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      Animated.timing(timerFadeIn.current, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <AniG opacity={timerFadeIn.current} x={x} y={y}>
      {phase === 'breakOT' ? (
        <Text fontFamily="Cuprum-Italic" fontSize={fontSize - 10}>
          break finished
        </Text>
      ) : phase === 'focus' || phase === 'focusOT' || phase === 'break' ? (
        <Text fontSize={fontSize}>{formatTime(remainingTime)}</Text>
      ) : (
        <Text></Text>
      )}
    </AniG>
  );
};

export default Timer;
