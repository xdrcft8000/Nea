import React, {useEffect} from 'react';
import {Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  SharedValue,
  withRepeat,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

interface SparkleAnimationProps {
  animationComplete: boolean;
}

const LottieAnimation = Animated.createAnimatedComponent(LottieView);

const SparkleAnimation: React.FC<SparkleAnimationProps> = ({
  animationComplete,
}) => {
  const sparkleProgress = useSharedValue(1);

  const playAnimation = () => {
    sparkleProgress.value = withTiming(0, {
      duration: 300,
      easing: Easing.cubic,
    });
  };

  useEffect(() => {
    if (animationComplete === true) {
      playAnimation();
    }
  }, [animationComplete]);

  const sparkleStyle = useAnimatedProps(() => {
    return {
      progress: sparkleProgress.value,
    };
  });

  return (
    <LottieAnimation
      style={{width: 500, height: 200, top: -64, left:-22}}
      pointer-events="none"
      source={require('../assets/sparkle.json')}
      progress={sparkleProgress.value}
    />
  );
};

export default SparkleAnimation;
