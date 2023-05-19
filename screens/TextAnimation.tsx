import React, {useEffect} from 'react';
import {Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  SharedValue,
  withRepeat,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface textAnimationProps {
  phaseState: string;
  loops: number;
  progress?: SharedValue<number>;
}
const AniText = Animated.createAnimatedComponent(Text);

const AnimatedText: React.FC<textAnimationProps> = ({phaseState, loops}) => {
  const progress = useSharedValue(0.15);

  const loopAnimation = () => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 750,
        easing: Easing.cubic,
      }),
      loops * 2 + 2,
      true,
    );
  };

  useEffect(() => {
    if (phaseState === 'spin') {
      loopAnimation();
    }
  }, [phaseState]);

  const bufferTextStyle = useAnimatedProps(() => {
    return {
      opacity: progress.value,
    };
  });

  return (
    <AniText style={[styles.text, bufferTextStyle]}>nea is thinking...</AniText>
  );
};

const styles = {
  text: {
    fontFamily: 'Cuprum-BoldItalic',
  },
};

export default AnimatedText;
