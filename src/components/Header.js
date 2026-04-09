import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({
  title = 'Dashboard',
  subtitle = 'Explore verified listings around you',
  onNotificationPress,
   notificationCount = 0, // 👈 ADD THIS
}) {
  const floatMotion = useRef(new Animated.Value(0)).current;
  const shineMotion = useRef(new Animated.Value(0)).current;
  const pulseMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatMotion, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatMotion, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const shineLoop = Animated.loop(
      Animated.timing(shineMotion, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseMotion, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseMotion, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    shineLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      shineLoop.stop();
      pulseLoop.stop();
    };
  }, [floatMotion, shineMotion, pulseMotion]);

  const subtitleOpacity = floatMotion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.92, 1, 0.92],
  });

  const subtitleLift = floatMotion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -2, 0],
  });

  const compassTilt = floatMotion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const shineTranslate = shineMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 340],
  });

  const pulseScale = pulseMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 2],
  });

  const pulseOpacity = pulseMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>A</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.brandName}>AcreX</Text>
            {/* <Text style={styles.title}>{title}</Text> */}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.iconContainer}
          onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color="#123247" />
         {notificationCount > 0 && (
  <View style={styles.notificationBadge}>
    <Text style={styles.badgeText}>
      {notificationCount > 9 ? '9+' : notificationCount}
    </Text>
  </View>
)}
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.subtitlePill,
          {opacity: subtitleOpacity, transform: [{translateY: subtitleLift}]},
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.subtitleShine, {transform: [{translateX: shineTranslate}]}]}
        />
        <View style={styles.subtitleIconShell}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.iconPulseRing,
              {opacity: pulseOpacity, transform: [{scale: pulseScale}]},
            ]}
          />
          <Animated.View style={[styles.subtitleIconWrap, {transform: [{rotate: compassTilt}]}]}>
            <Ionicons name="compass" size={14} color="#0F766E" />
          </Animated.View>
        </View>
        <View style={styles.subtitleTextWrap}>
          <Text style={styles.subtitleLabel}>Discover Nearby</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#F2F8FC',
  },

  header: {
    paddingHorizontal: 2,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#123247',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  titleBlock: {
    flexShrink: 1,
  },

  brandName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#4B6B80',
    marginBottom: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A43',
  },

  subtitle: {
    marginTop: 1,
    fontSize: 13,
    color: '#1E3A4D',
    fontWeight: '600',
  },

  subtitlePill: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  subtitleShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 92,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },

  subtitleIconShell: {
    width: 30,
    height: 30,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconPulseRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(15, 118, 110, 0.22)',
  },

  subtitleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtitleTextWrap: {
    flex: 1,
  },

  subtitleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 50, 71, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    position: 'relative',
  },
  notificationBadge: {
  position: 'absolute',
  top: 6,
  right: 6,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '#F97316',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},

badgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '700',
},
});
