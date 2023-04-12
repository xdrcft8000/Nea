/* eslint-disable prettier/prettier */
import React, {FC, useEffect, useState, Component, useRef, useCallback} from 'react';
import type {PropsWithChildren} from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,useColorScheme,View,Button,TouchableOpacity,PanResponder, Dimensions, Text as NormalText} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {FirebaseDatabaseTypes, firebase} from '@react-native-firebase/database';
import CircleSlider from 'react-native-circle-slider';
import Svg,{Path,Circle,G,Text} from 'react-native-svg';
// import Timer from 'react-native-svg'
import Timer from '../ios/Nea/Timer';

interface Props {
    btnRadius?: number;
    dialRadius?: number;
    dialWidth?: number;
    meterColor?: string;
    btnColor?: string;
    textColor?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    textSize?: number;
    value?: number;
    min?: number;
    max?: number;
    xCenter?: number;
    yCenter?: number;
    onValueChange?: (x: number) => number;
}
const handleLogOut = async () => {
    try {
    await firebase.auth().signOut();
    } catch (error) {
    console.log(error);
    }
};


const HomeScreen : FC<Props> = ({

    btnRadius = 12,
    dialRadius = 130,
    dialWidth = 20,
    meterColor = "#0055b3",
    btnColor = "#fff",
    textColor = "#fff",
    fillColor = "none",
    strokeColor = "#D3D3D3",
    strokeWidth = 20,
    textSize = 50,
    value = 10,
    min = 0,
    max = 358,
    xCenter = Dimensions.get("window").width / 2,
    yCenter = Dimensions.get("window").height / 2,
    onValueChange = (x) => x,
}) => {
    const [angle, setAngle] = useState(value);
    const refAngle = useRef(value);
    const timerStatus = useRef(false);
    const timerFinished = () => {
        console.log('Time finished');
        timerStatus.current = false;
        setAngle(0);
        refAngle.current = 0;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (e, gs) => true,
            onStartShouldSetPanResponderCapture: (e, gs) => true,
            onMoveShouldSetPanResponder: (e, gs) => true,
            onMoveShouldSetPanResponderCapture: (e, gs) => true,
            onPanResponderMove: (e, gs) => {
                let xOrigin = xCenter - (dialRadius + btnRadius);
                let yOrigin = yCenter - (dialRadius + btnRadius);
                let a = cartesianToPolar(gs.moveX - xOrigin, gs.moveY - yOrigin);
                console.log(a + " a");
                console.log(refAngle.current+ " Angle")
                if (!timerStatus.current){
                    if ((a < min)||(a>285 && refAngle.current < 75)) {
                        setAngle(min);
                        refAngle.current = min;
                    } else if (a >= max) {
                        setAngle(max);
                        refAngle.current = max;
                        console.log('MAX');
                        timerStatus.current = true;
                    } else if (a < 90 && refAngle.current > 270){
                        setAngle(max);
                        refAngle.current = max;
                        console.log('MAX');
                        timerStatus.current = true;
                    } else if (a>280 && refAngle.current <80){
                        setAngle(min);
                        refAngle.current = min;
                    }
                    else {
                        setAngle(a);
                        refAngle.current = a;
                    }
                }
            },
        })
    ).current;

    
    const polarToCartesian = useCallback(
        (angle) => {
            let r = dialRadius;
            let hC = dialRadius + btnRadius;
            let a = ((angle - 90) * Math.PI) / 180.0;

            let x = hC + r * Math.cos(a);
            let y = hC + r * Math.sin(a);
            return { x, y };
        },
        [dialRadius, btnRadius]
    );

    const cartesianToPolar = useCallback(
        (x, y) => {
            let hC = dialRadius + btnRadius;

            if (x === 0) {
                return y > hC ? 0 : 180;
            } else if (y === 0) {
                return x > hC ? 90 : 270;
            } else {
                return (
                    Math.round((Math.atan((y - hC) / (x - hC)) * 180) / Math.PI) +
                    (x > hC ? 90 : 270)
                );
            }
        },
        [dialRadius, btnRadius]
    );

    const width = (dialRadius + btnRadius) * 2;
    const bR = btnRadius;
    const dR = dialRadius;
    const startCoord = polarToCartesian(0);
    var endCoord = polarToCartesian(angle);

    

    return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Welcome to BEA</Text>

        <Svg id ="slider" width={width} height={width}>
            <G x = {width/2} 
                 y = {width/2}>
            <Circle
                r={dR}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill={fillColor}
            />
               <Timer duration={5} 
               y = {textSize/2.5}
               fontSize={textSize}
               timerStatus={timerStatus.current}
               timerFinished={timerFinished}
               />
            </G>
            <Path
                stroke={meterColor}
                strokeWidth={dialWidth}
                fill="none"
                d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${
                    angle > 180 ? 1 : 0
                } 1 ${endCoord.x} ${endCoord.y}`}
            />
            <G x={endCoord.x - bR} y={endCoord.y - bR}>
                <Circle
                    r={bR}
                    cx={bR}
                    cy={bR}
                    fill={btnColor}
                    {...panResponder.panHandlers}
                />
                <Text
                    x={bR}
                    y={bR + textSize / 2}
                    fontSize={textSize}
                    fill={textColor}
                    textAnchor="middle"
                >
                    {/* {onValueChange(angle) + ""} */}
                </Text>
            </G>
        </Svg>
        <TouchableOpacity
            style={{position: 'absolute', top: 10, right: 10}}
            onPress={handleLogOut}>
            <NormalText>Log out</NormalText>
        </TouchableOpacity>
    </View>
  );
};


export default HomeScreen;

