import React, {useEffect} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {Circle, G, Line} from 'react-native-svg';

interface lineProps {
  phaseState: string;
  lengthHeight: number;
}
const AnimatedLine = Animated.createAnimatedComponent(Line);

const LineAnimation: React.FC<lineProps> = ({lengthHeight, phaseState}) => {
  const bottom = useSharedValue(0);
  const top = useSharedValue(lengthHeight);

  useEffect(() => {
    if (
      phaseState === 'spin' ||
      phaseState === 'focus' ||
      phaseState === 'focusOT' ||
      phaseState === 'break' ||
      phaseState === 'breakOT'
    ) {
      top.value = withTiming(175, {
        duration: 700, // Animation duration in milliseconds
        easing: Easing.linear, // Animation easing function
      });
      bottom.value = withTiming(75, {
        duration: 700, // Animation duration in milliseconds
        easing: Easing.linear, // Animation easing function
      });
    } else if (phaseState === 'initial') {
      top.value = withTiming(lengthHeight, {
        duration: 300, // Animation duration in milliseconds
        easing: Easing.linear, // Animation easing function
      });
      bottom.value = withTiming(0, {
        duration: 300, // Animation duration in milliseconds
        easing: Easing.linear, // Animation easing function
      });
    }
  }, [phaseState]);

  const animatedProps = useAnimatedProps(() => {
    return {

      y2: top.value,
      y1: bottom.value,
      transform: [{rotate: '180deg'}],
    };
  });

  return (
    <AnimatedLine
      x1={2}
      y1={0}
      x2={2}
      y2={200}
      stroke="#d3d3d3"
      strokeWidth={1}
      animatedProps={animatedProps}
    />
  );
};

export default LineAnimation;
