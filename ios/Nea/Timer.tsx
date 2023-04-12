import React, {useState, useEffect} from 'react';
import {Text} from 'react-native-svg';

interface TimerProps {
  duration: number;
  x?: number;
  y?: number;
  fontSize?: number;
  timerStatus?: Boolean;
  timerFinished: () => void;
}

const Timer: React.FC<TimerProps> = ({
  duration,
  x,
  y,
  fontSize,
  timerStatus,
  timerFinished,
}) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    let interval: any = null;
    if (timerStatus) {
      if (remainingTime >= 0) {
        interval = setInterval(() => {
          setRemainingTime(remainingTime - 1);
        }, 1000);
      } else {
        console.log('timer timer finished');
        timerFinished();
      }
      return () => clearInterval(interval);
    } else {
      setRemainingTime(5);
    }
  }, [remainingTime, timerStatus, timerFinished]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };
  let xcord = x;
  let ycord = y;
  let tsize = fontSize;
  return (
    <Text x={xcord} y={ycord} textAnchor="middle" fontSize={tsize}>
      {formatTime(remainingTime)}
    </Text>
  );
};

export default Timer;

