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
  setCircleAnimationComplete:React.Dispatch<React.SetStateAction<boolean>>;
  loops: number;
  colorProgress?: SharedValue<number>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircleAnimation: React.FC<circleProps> = ({
  phaseState,
  setCircleAnimationComplete,
  loops,
}) => {
  const colorProgress = useSharedValue(1);
  const progress = useSharedValue(0);
  const radius = 130;

  const circleAnimationComplete = () => {
    setCircleAnimationComplete(true);
  };

  const loopAnimation = () => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      loops + 1,
      false,
      () => {
        runOnJS(circleAnimationComplete)();
      },
    );
  };

  const resumeAnimation = () => {
    progress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.linear,
    });
    colorProgress.value = withTiming(0, {
      duration: 1000,
      easing: Easing.linear,
    });
  };

  const loopColorAnimation = () => {
    colorProgress.value = withRepeat(
      withTiming(0, {
        duration: 750,
        easing: Easing.linear,
      }),
      loops * 2 + 1,
      true,
    );
  };

  const resetAnimation = () => {
    colorProgress.value = withTiming(1, {
      duration: 750,
      easing: Easing.linear,
    });
  };

  useEffect(() => {
    if (phaseState === 'spin') {
      loopAnimation();
      loopColorAnimation();
    } else if (phaseState === 'initial' || phaseState === 'break') {
      resetAnimation();
      setCircleAnimationComplete(false);
    } else if (phaseState === 'focus' || phaseState === 'focusOT') {
      resumeAnimation();
    }
  }, [phaseState]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = 2 * Math.PI * radius * (1 - progress.value);
    const rotation = '-90deg';
    const strokeColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#bebebe', '#F2F2F2'],
    );
    return {
      strokeDashoffset,
      transform: [{rotate: rotation}],
      stroke: strokeColor,
    };
  });

  return (
    <G>
      <AnimatedCircle
        style={{transform: [{rotate: '-90deg'}]}}
        cx={0}
        cy={0}
        r={radius}
        stroke="white"
        strokeWidth={1}
        fill="none"
        strokeDasharray={`${2 * Math.PI * radius}`}
        animatedProps={animatedProps}
      />
      <AnimatedCircle
        style={{transform: [{rotate: '-90deg'}]}}
        cx={0}
        cy={0}
        r={radius}
        stroke="white"
        strokeWidth={1}
        fill="none"
        strokeDasharray={`${2 * Math.PI * radius}`}
        animatedProps={animatedProps}
      />
    </G>
  );
};

export default CircleAnimation;
