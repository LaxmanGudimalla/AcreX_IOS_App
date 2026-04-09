import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFCMToken } from './src/services/firebaseService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const letters = ['A', 'c', 'r', 'e', 'X'];
  const letterAnims = useRef(
    letters.map(() => ({
      translateY: new Animated.Value(18),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Ask notification permission
    requestUserPermission();

    // Get FCM token
    getFCMToken();

    // Foreground notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage);
    });

    // When notification is opened (background)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Opened from background:', remoteMessage);
    });

    // When app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Opened from quit:', remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const letterAnimations = letterAnims.map(anim =>
      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.sequence([
      Animated.stagger(140, letterAnimations),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(splashScale, {
          toValue: 1.15,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setShowSplash(false));
  }, [letterAnims, splashOpacity, splashScale]);

  return (
    <View style={styles.root}>
      <AppNavigator />
      {showSplash ? (
        <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
          <Animated.View style={[styles.word, { transform: [{ scale: splashScale }] }]}>
            {letters.map((ch, i) => (
              <Animated.Text
                key={`${ch}-${i}`}
                style={[
                  styles.letter,
                  {
                    opacity: letterAnims[i].opacity,
                    transform: [{ translateY: letterAnims[i].translateY }],
                  },
                ]}
              >
                {ch}
              </Animated.Text>
            ))}
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#0B2E1F',
  },
});
