import React, {useEffect} from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  interpolateColor,
  withRepeat,
  SharedValue,
} from 'react-native-reanimated';
import {Circle, G} from 'react-native-svg';

interface circleProps {
  phaseState: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BreakCircleAnimation: React.FC<circleProps> = ({phaseState}) => {
  const progress = useSharedValue(0);
  const radius = 130;

  const loopAnimation = () => {
    progress.value = withTiming(1, {
      duration: 500,
      easing: Easing.linear,
    });
  };

  const resetAnimation = () => {
    progress.value = withTiming(0, {
      duration: 500,
      easing: Easing.linear,
    });
  };

  useEffect(() => {
    if (phaseState === 'break') {
      loopAnimation();
    } else if (phaseState === 'initial' || phaseState === 'focus' || phaseState === 'spin') {
      resetAnimation();
    }
  }, [phaseState]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = 2 * Math.PI * radius * 0;
    const rotation = '-90deg';
    return {
      strokeDashoffset,
      transform: [{rotate: rotation}],
      opacity: progress.value,
    };
  });

  return (
    <G>
      <AnimatedCircle
        style={{transform: [{rotate: '-90deg'}]}}
        cx={0}
        cy={0}
        r={radius}
        stroke="#F2F2F2"
        strokeWidth={30}
        fill="none"
        strokeDasharray={`${2 * Math.PI * radius}`}
        animatedProps={animatedProps}
      />
    </G>
  );
};

export default BreakCircleAnimation;
