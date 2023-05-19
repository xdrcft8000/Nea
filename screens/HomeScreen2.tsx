/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {AppState, AppStateStatus,View,Button,TouchableOpacity,PanResponder, Dimensions, Text as NormalText, Animated, NativeModules, Modal, Easing, Switch, Image as NormalImage} from 'react-native';
import {firebase} from '@react-native-firebase/database';
import Svg,{Path,Circle,G,Text, Image, SvgXml, ForeignObject, Stop, LinearGradient, Defs, TSpan} from 'react-native-svg';
import { createNewSession, addPeriodToSession, writeToPeriod, storeAsyncData, readAsyncStore, syncRandomGuy, getStoredUserID } from '../storageFunctions';
import Timer from './Timer';
import { BlurView } from '@react-native-community/blur';
import { blankHandle, rightHandle, leftHandle } from './xmlStringHelper';
import KeepAwake from 'react-native-keep-awake';
import CircleAnimation from './CircleAnimation';
import BreakCircleAnimation from './BreakCircleAnimation';
import LineAnimation from './LineAnimation';
import AnimatedText from './TextAnimation';
import SparkleAnimation from './SparkleAnimation';
import LottieView from 'lottie-react-native';




const handleLogOut = async () => {
    try {
    await firebase.auth().signOut();
    } catch (error) {
    console.log(error);
    }
};

const getCurrentUserId = (): string | null => {
    const user = firebase.auth().currentUser;
    return user ? user.uid : null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HomeScreen2 = ({navigation,route}) =>
 {
    const btnRadius = 60;
    const dialRadius = 130;
    const dialWidth = 20;
    const meterColor = '#000000';
    const btnColor = '#fff';
    const fillColor = '#000000';
    const strokeColor = '#D3D3D3';
    const strokeWidth = 20;
    const textSize = 40;
    const value = 0;
    const min = 0;
    const max = 359;
    const xCenter = Dimensions.get('window').width / 2;
    const yCenter = Dimensions.get('window').height / 2;
    const handleSize = 70;
    const handleStartPosition = 80;
    const handleEndPosition = 170;
    const handleLength = handleEndPosition - handleStartPosition;
    const focusTime = useRef(1500);
    const breakTime = useRef(300);
    const [angle, setAngle] = useState(value);
    const refAngle = useRef(value);
    const phase = useRef('initial');
    const [phaseState,setPhaseState] = useState('initial');
    const [showOptions, setShowOptions] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
    const [hardMode, setHardMode] = useState(false);
    const [handleHeight, setHandleHeight] = useState(handleStartPosition);
    const handleHeightRef = useRef(handleStartPosition);
    const [CircleAnimationComplete, setCircleAnimationComplete] = useState(false);
    const loops = useRef(0);
    const [remainingTime, setRemainingTime] = useState(focusTime.current);
    const buttonsFade = useRef(new Animated.Value(0));
    const [refreshTimer, setRefreshTimer] = useState(false);




    useEffect(()=> {
        if (phaseState === 'break'){
            writeToPeriod('focusOT', timeOnClock.current);
            Animated.timing(buttonsFade.current, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: false,
              }).start();
        } else if (phaseState === 'focus' || phaseState === 'focusOT' || phaseState === 'break' || phaseState === 'breakOT'){
            Animated.timing(buttonsFade.current, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: false,
              }).start();
        } else if (phaseState === 'focusOT'){
            starAnimationProgress.current.setValue(0);
            Animated.timing(starAnimationProgress.current, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: false,
              }).start();
        } else if (phaseState === 'initial'){
            Animated.timing(buttonsFade.current, {
                toValue: 0,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: false,
              }).start();
        }

    },[phaseState]);

    const timeOnClock = useRef(0);
	const springFlag = useRef(0);
    const handleSpringFlag = useRef(0);

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
    const height = width * 1.618;
    const bR = btnRadius;
    const dR = dialRadius;
    const startCoord = polarToCartesian(0);
    var endCoord = polarToCartesian(angle % 360);
    var inverseCoord = polarToCartesian(360 - (angle % 360));
    var handleEndCoord = handleHeight;

    useEffect(() => {
        getStoredUserID().then((user) => {
            if (!user){
                logOutButton();
            } else {
                syncRandomGuy();
                readAsyncStore('seenHelp').then((seen) =>{
                    if (seen == null){
                        setShowHelp(true);
                        storeAsyncData([['seenHelp','true']]);
                    }
                });
            }
        });
    }, []);

    useEffect(() =>{
        if (phaseState === 'focus' || phaseState === 'focusOT'){
        let newAngle = (360 / focusTime.current) * (focusTime.current - remainingTime);
        setAngle(newAngle);
        refAngle.current = newAngle;
        }
    },[remainingTime]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (e, gs) => true,
            onStartShouldSetPanResponderCapture: (e, gs) => true,
            onMoveShouldSetPanResponder: (e, gs) => true,
            onMoveShouldSetPanResponderCapture: (e, gs) => true,
            onPanResponderGrant: (e, gs) => {
                clearInterval(handleIntervalId);
             },
            onPanResponderEnd: (e, gs) => {
            handleSpringFlag.current = 0;
            startHandleInterval();
            },
            onPanResponderMove: (e, gs) => {
                if (phase.current === 'initial'){
                    if (gs.dy > 0 && gs.dy < handleLength){
                        setHandleHeight(gs.dy + handleStartPosition);
                        handleHeightRef.current = gs.dy + handleStartPosition;
                    }
                    else if (gs.dy >= handleLength) {
                        setHandleHeight(handleEndPosition);
                        handleHeightRef.current = handleEndPosition;
                        startSpin();
                    } else {
                        setHandleHeight(handleStartPosition);
                        handleHeightRef.current = handleStartPosition;
                    }
                }
            },
        })
    ).current;

	let handleIntervalId;

    const handleIntervalCallback = () => {

        if (phase.current === 'initial'){
            if (handleHeightRef.current > handleStartPosition + 20) {
                    handleHeightRef.current = handleHeightRef.current - 20;
                    setHandleHeight(handleHeightRef.current);
                } else if (handleHeightRef.current >= handleEndPosition){
                    clearInterval(handleIntervalId);
                }
                 else {
                    handleHeightRef.current = handleStartPosition;
                    setHandleHeight(handleStartPosition);
                    clearInterval(handleIntervalId);
                }
        } else {
            clearInterval(handleIntervalId);
        }
    };

    const startHandleInterval = () => {
        clearInterval(handleIntervalId);
        if ((handleSpringFlag.current === 0) && (phase.current === 'initial')){
			handleIntervalId = setInterval(handleIntervalCallback, 10);
			handleSpringFlag.current = 1;
		}
	};

    const startFocus = () => {
        storeSession();
        phase.current = 'focus';
        setPhaseState('focus');
        storeAsyncData([
            ['currentPhase','focus'],
            ['currentPhaseDuration',focusTime.current],
            ['currentPhaseStart',Math.floor(Date.now() / 1000)],
         ]);
        startBlock();
    };

    const resumeFocus = (dur:number) => {
        focusTime.current = dur;
        setHandleHeight(handleEndPosition);
        handleHeightRef.current = handleEndPosition;
        phase.current = 'focus';
        setPhaseState('focus');
    };

    const resumeFocusOT = () => {
        setHandleHeight(handleEndPosition);
        phase.current = 'focusOT';
        setPhaseState('focusOT');
    };

    const startBreak = () => {
        NativeModules.BlockUnblock.endBlock();
        phase.current = 'break';
        setPhaseState('break');
        storeAsyncData([
            ['currentPhase','break'],
            ['currentPhaseDuration',breakTime.current],
            ['currentPhaseStart',Math.floor(Date.now() / 1000)],
        ]);
    };

    const startSpin = () => {
        randomiseTimes().then(()=>{
            console.log('randomised');
            setAngle(0);
            refAngle.current = 0;
            phase.current = 'spin';
            setPhaseState('spin');
        });
    };

    const resumeBreak = (dur:number) => {
        console.log('DUR: ' + dur);
        focusTime.current = dur;
        setHandleHeight(handleEndPosition);
        handleHeightRef.current = handleEndPosition;
        phase.current = 'break';
        setPhaseState('break');
    };




    const randomiseTimes = async ()=> {
        readAsyncStore('RandomGuy').then((randomGuy) => {
            if (randomGuy != null){
                if (randomGuy.toString() === 'true'){
                    const minF = 900;
                    const maxF = 1800;
                    const randomNumber = Math.floor(Math.random() * (maxF - minF + 1) + minF);
                    const minB = 300;
                    const maxB = 900;
                    const randomNumber2 = Math.floor(Math.random() * (maxB - minB + 1) + minB);
                    focusTime.current = Math.round(randomNumber);
                    breakTime.current = Math.round(randomNumber2);
                    loops.current = Math.floor(Math.random() * 6) + 1;
                } else {
                    console.log('resetting times');
                    focusTime.current = 1500;
                    breakTime.current = 300;
                }}
           });};

    const storeSession = () => {
        readAsyncStore('sessionEnd').then((session) => {
            if (session !== null){
                if (Math.floor(Date.now() / 1000) < parseInt(session)) {
                    const sessionEnd = Math.floor(Date.now() / 1000) + (60 * 60);
                    storeAsyncData([['sessionEnd', sessionEnd]]);
                    readAsyncStore('sessionStart').then((sessionKey) => {
                        writeToPeriod('breakOT', timeOnClock.current);
                        addPeriodToSession(sessionKey as string, sessionEnd, focusTime.current, breakTime.current);
                        });
                    }
                else if (Math.floor(Date.now() / 1000) >= parseInt(session)){
                    newSessionHandler();
                }

                } else {
                    newSessionHandler();
                }
          }).catch((error) => {
            console.log(`Error checking if value exists: ${error}`);
          });
    };

    const newSessionHandler = () => {
        const startTime = Math.floor(Date.now() / 1000);
        const endTime = startTime + (60 * 60);
        storeAsyncData([['sessionStart', startTime ] , ['sessionEnd', endTime], ['currentPeriod', 1]]);
        createNewSession(startTime,endTime, focusTime.current, breakTime.current);
    };


    const endSession = () => {
        const oldPhase = phaseState;
        const oldTime = timeOnClock.current;
        phase.current = 'initial';
        setPhaseState('initial');
        resetAngle();
        NativeModules.BlockUnblock.endBlock();
		storeAsyncData([['sessionEnd',Math.floor(Date.now() / 1000 )]]);
        if (oldPhase === 'focus'){
            writeToPeriod('focusEnd',oldTime);
        }
    };

    let angleInterval;

    const resetAngleInterval = () => {
        if (refAngle.current > 5){
            setAngle(refAngle.current - 5);
            refAngle.current = refAngle.current - 5;
        } else if (refAngle.current <= 5 && refAngle.current > 0){
            setAngle(0);
            refAngle.current = 0;

        }
        else if (refAngle.current === 0){
            startHandleInterval();
            clearInterval(angleInterval);
        }
    }
    const resetAngle = () =>{
        angleInterval = setInterval(resetAngleInterval, 10);
    }



    const setupButton = () => {
        setShowOptions(false);
        storeAsyncData([['setupComplete', 0]]).then( ()=>{
        readAsyncStore('setupComplete').then((complete) =>{
            route.params.setupComplete();});});
    };

    const startBlock = () => {
        readAsyncStore('selection').then(data =>{
            if (data == null){ return (console.log('Error, no selection data'));}
            else {
                NativeModules.BlockUnblock.createBlock(data, focusTime.current);
            }
            });
    };

    const logOutButton = () => {
        hideOptionsPopup();
		endSession();
        handleLogOut().then( ()=>{
            route.params.logout();
            ;});
    };


	const toggleHelpPopup = () =>{
        setShowHelp(!showHelp);
    };

    const showOptionsPopup = () =>{
        setShowOptions(true);
    };

    const hideOptionsPopup = () => {
        setShowOptions(false);
    };

    const toggleHardMode = () => {
        setHardMode(!hardMode);
    };

	let xmlSwitch = rightHandle;
;	let xmlBlank = blankHandle;
	if ((phase.current === 'initial') || (phase.current === 'break') || (phase.current === 'breakOT' || phase.current === 'spin')){
           xmlSwitch = xmlBlank;
    }



const starAnimationProgress = useRef(new Animated.Value(0));

useEffect(() => {
	if (CircleAnimationComplete){
		starAnimationProgress.current.setValue(0);
  Animated.timing(starAnimationProgress.current, {
	toValue: 1,
	duration: 500,
	easing: Easing.linear,
	useNativeDriver: false,
  }).start();
    startFocus();
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [CircleAnimationComplete]);






	const renderStatusText = () => {
		if (phase.current === 'focus'){
			return (<Text
				fill={'#000000'}
				fontFamily='Cuprum-BoldItalic'
				y = {50}
				x = {-20}
				fontSize={20}>focus</Text>);
		} else if (phase.current === 'break'){
			return (<Text
				fill={'#000000'}
				fontFamily='Cuprum-BoldItalic'
				y = {50}
				x = {-20}
				fontSize={20}>break</Text>);
		} else if (phase.current === 'focusOT'){
			return (<Text
				fill={'#368132'}
				fontFamily='Cuprum-BoldItalic'
				y = {50}
				x = {-30}
				fontSize={20}>overtime</Text>);
		}
	};
    const rainbowDecider = () => {
        if (angle > 359 && angle <= 360){
            return "black"
        }
        else return "url(#rainbow-gradient)"
    };

    return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <NormalText></NormalText>
        <KeepAwake />
		<View style={{}}>

        <Svg id ="slider" width={width} height={height}>

                <G x ={(width / 2) + 2} y={handleStartPosition + bR + handleLength}>
                    <LineAnimation
                    lengthHeight={handleLength}
                    phaseState={phaseState}
                    />
                </G>

                <G style={{transform: [{rotate: '-90deg'}]}} x={width / 2} y={handleEndPosition + dialRadius + bR}>
                    <CircleAnimation
                    phaseState={phaseState}
                    setCircleAnimationComplete = {setCircleAnimationComplete}
                    loops = {loops.current}
                    />
                    <Defs>
                        <LinearGradient id="rainbow-gradient" gradientTransform="rotate(90)">
                            <Stop offset="0%" stopColor={meterColor} />
                            <Stop offset="3%" stopColor="red" />
                            <Stop offset="14%" stopColor="orange" />
                            <Stop offset="33%" stopColor="yellow" />
                            <Stop offset="60%" stopColor="green" />
                            <Stop offset="75%" stopColor="blue" />
                            <Stop offset="90%" stopColor="indigo" />
                            <Stop offset="97%" stopColor="violet" />
                        </LinearGradient>
                    </Defs>

                    {(angle > 359) ? (
                        <G>
                        <Circle
                            r={dR}
                            stroke={rainbowDecider()}
                            strokeWidth={3}
                            fill='none'
                            z-index = {1}
                        />
                        {(angle < 720) ? (<Path
                            x = {-width / 2}
                            y = {-width / 2}
                            stroke="black"
                            strokeWidth={3}
                            fill='none'
                            d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${
                                angle % 360 > 180 ? 0 : 1
                            } 0 ${endCoord.x} ${endCoord.y}`}
                            z-index = {2}
                        />) : (<></>)}
                        </G>
                    ) : (<Path
                        x = {-width / 2}
                        y = {-width / 2}
                        stroke="black"
                        strokeWidth={3}
                        fill='none'
                        d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${
                            angle % 360 > 180 ? 1 : 0
                        } 1 ${endCoord.x} ${endCoord.y}`}
                        z-index = {2}
                    />)
                    }

                        {(phaseState === 'spin') ? (
                    <ForeignObject x = {-40} y = {-10} >
                        <AnimatedText
                            loops = {loops.current}
                            phaseState={phaseState}
                        />
                    </ForeignObject>) : (<ForeignObject/>)}
                        <Timer duration={focusTime.current}
                            breakDuration={breakTime.current}
                            y = {textSize / 2.5}
                            x = {-textSize * 1.9}
                            fontSize={textSize}
                            timerStatus={phase}
                            setPhaseState={setPhaseState}
                            timeOnClock={timeOnClock}
                            resumeFocus ={resumeFocus}
                            resumeBreak={resumeBreak}
                            remainingTime={remainingTime}
                            setRemainingTime={setRemainingTime}
                            resumeFocusOT={resumeFocusOT}
                        />
                </G>

                <LottieView
                    style = {{height: 500, width: 200, left:-20.5, top:-7}}
                    pointer-events= "none"
                    source={require('../assets/sparkle.json')}
                    progress={starAnimationProgress.current}
                />
                <G x={width / 2 - bR} y={handleHeight}>
                    <Circle
                        r={bR}
                        cx={bR}
                        cy={bR}
                        fill={btnColor}
                        {...panResponder.panHandlers}
                        z-index = {3}
                        opacity={0}
                    />

                    <G x={endCoord.x - 190 } y={endCoord.y -  60}>
                    <G x={bR - (handleSize / 2)} y={bR - (handleSize / 2)}>
                        <SvgXml
                        xml={xmlBlank} width={handleSize} height={handleSize}
                        transform={'rotate(' + angle + ' 1250 1250)'}
                        z-index = {4}
                        pointer-events="none"
                        />
                    </G>
                    <G x={bR - (handleSize / 2)} y={bR - (handleSize / 2)}
                    >
                        <SvgXml
                        xml={xmlSwitch} width={handleSize} height={handleSize}
                        transform={'rotate(' + angle + ' 1250 1250)'}
                        z-index = {5}
                        pointer-events="none"
                        />
                    </G>
                    </G>
                </G>
            <G style={{transform: [{rotate: '-90deg'}]}} x={width / 2} y={handleEndPosition + dialRadius + bR}>
                <BreakCircleAnimation
                    phaseState={phaseState}
                />
            </G>
        </Svg>

        
        
        {(hardMode && phaseState=== 'focus') ? (
        <Animated.View style= {{position:'absolute', left:width/4 -30, top:handleStartPosition, opacity:buttonsFade.current}}>
            <TouchableOpacity>
                <NormalText style= {{textAlign: 'center', fontSize: 16, color:'grey'}}>
                    End{'\n'}Session
                </NormalText>
            </TouchableOpacity>
        </Animated.View>
        ):(

        <Animated.View style= {{position:'absolute', left:width/4 -30, top:handleStartPosition, opacity:buttonsFade.current}}>
            <TouchableOpacity onPressIn={endSession}>
                <NormalText style= {{textAlign: 'center', fontSize: 16}}>
                    End{'\n'}Session
                </NormalText>
            </TouchableOpacity>
        </Animated.View>
        )}

{(hardMode && phaseState=== 'focus') ? (
    <Animated.View style= {{position:'absolute', right:width/4 -20, top:handleStartPosition, opacity:buttonsFade.current}}>
            {(phaseState === 'break' || phaseState === 'breakOT') ? (
            <TouchableOpacity onPressIn={startSpin}>
                <NormalText style= {{textAlign: 'center', fontSize: 16}}>
                Start{'\n'}Focus
                </NormalText>
            </TouchableOpacity>
        ):(
            <TouchableOpacity>
                <NormalText style= {{textAlign: 'center', fontSize: 16, color:'grey'}}>
                    Start{'\n'}Break
                </NormalText>
            </TouchableOpacity> )}
        </Animated.View>
        ):(
        <Animated.View style= {{position:'absolute', right:width/4 -20, top:handleStartPosition, opacity:buttonsFade.current}}>
            {(phaseState === 'break' || phaseState === 'breakOT') ? (
            <TouchableOpacity onPressIn={startSpin}>
                <NormalText style= {{textAlign: 'center', fontSize: 16}}>
                    Start{'\n'}Focus
                </NormalText>
            </TouchableOpacity>
            ):(
            <TouchableOpacity onPressIn={startBreak}>
                <NormalText style= {{textAlign: 'center', fontSize: 16}}>
                    Start{'\n'}Break
                </NormalText>
            </TouchableOpacity> )}
        </Animated.View>
        )}

        
        


        </View>
        {/* {hardMode ? (
        <NormalText />
        ) : (
            (phaseState === 'initial' || phaseState === 'breakOT' || phaseState === 'spin') ? (<NormalText />) : (
				<TouchableOpacity
				style={{position: 'absolute', bottom: 150}}
				onPressIn={endSession}>
				<NormalText>End Study Session</NormalText>
			</TouchableOpacity>
        ))
        } */}
        {(phaseState === 'focus') ? (
        <View style={{flexDirection: 'row', position: 'absolute', bottom: 10, right: 15, height:40}}>
        </View>
        ) : (
			<View style={{flexDirection: 'row', position: 'absolute', bottom: 30, right: 15}}>

			<TouchableOpacity
            onPressIn={toggleHelpPopup}>
                <NormalImage
                    source={require('../assets/questiongrey.png')}
                    style = {{width:40, height:40, marginRight:10}}
                />
            </TouchableOpacity>
			<TouchableOpacity
            onPressIn={showOptionsPopup}>
                <NormalImage
                    source={require('../assets/settinggrey.png')}
                    style = {{width:40, height:40}}
                    />
       		</TouchableOpacity>
		</View>
        )}


<Modal transparent={true} visible={showOptions}>
<BlurView
    style={{ flex: 1 }}
    blurType="light" // Change the blurType as per your preference
    blurAmount={5} // Change the blurAmount as per your preference
  >
  <View style={{ flex: 1,justifyContent: 'center',
    alignItems: 'center', marginHorizontal: 'auto'}}>
    <View style={{ backgroundColor: '#ffffff', marginHorizontal:15, padding: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>


      <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#ccc', paddingVertical: 20,paddingRight: 10, marginRight: 10, alignItems: 'center' }}>
        {/* <Button onPress={logOutButton} title="Log out" /> */}
		<TouchableOpacity
			onPress={logOutButton}><NormalText>Log out</NormalText>
			</TouchableOpacity>
      </View>
	  <View style={{ flex:1 , borderRightWidth: 1, borderColor: '#ccc', paddingVertical: 20, alignItems: 'center',paddingRight: 10, marginRight: 10 }}>
	  <TouchableOpacity
			onPress={setupButton}><NormalText>Setup</NormalText>
			</TouchableOpacity>
      </View>
      <View style={{flexDirection: 'column', paddingVertical: 20, paddingHorizontal:10 , alignItems: 'center' }}>

			<NormalText>Hard Mode
		</NormalText>
        <Switch
			style={{ marginTop: 20 }}
          trackColor={{ false: 'white', true: 'black' }}
          onValueChange={toggleHardMode}
          value={hardMode}
        />


      </View>
    </View>
		<View style={{ marginTop:20}}>
	<Button  onPress={hideOptionsPopup} title = "Done"/>
		</View>
  </View>
  </BlurView>
</Modal>

<Modal transparent={true} visible={showHelp}>
<BlurView
    style={{ flex: 1 }}
    blurType="light" // Change the blurType as per your preference
    blurAmount={5} // Change the blurAmount as per your preference
  >
  <View style={{ flex: 1,justifyContent: 'center',
    alignItems: 'center', marginHorizontal: 'auto'}}>
    <View style={{ backgroundColor: '#ffffff', marginHorizontal:15, padding: 20, borderRadius: 10, flexDirection: 'column', alignItems: 'center' }}>

			<NormalText style = {{paddingHorizontal:20, paddingVertical:20, textAlign:'center'}}>
				nea uses the 'Pomodoro technique' to help you study.
			</NormalText>
			<NormalText style = {{paddingHorizontal:20, paddingVertical:20, textAlign:'center'}}>
				Pull down the lever to start a focus session.
			</NormalText>
			<NormalText style = {{paddingHorizontal:20, paddingVertical:20, textAlign:'center'}}>
				nea will calculate the optimum study time for you.
			</NormalText>
			<NormalText style = {{paddingHorizontal:20, paddingVertical:20, textAlign:'center'}}>
				Over time, nea will learn what study patterns suit you best.
			</NormalText>
			<NormalText style = {{paddingHorizontal:20, paddingVertical:20, textAlign:'center'}}>
				nea is in its alpha testing phase, so if you find any bugs I'd love to hear about them.
				You can send me an email with a screenshot at tayyebr@outlook.com.
			</NormalText>


    </View>
		<View style={{ marginTop:20}}>
	<Button  onPress={toggleHelpPopup} title = "Done"/>
		</View>
  </View>
  </BlurView>
</Modal>

    </View>
  );
};


export default HomeScreen2;

