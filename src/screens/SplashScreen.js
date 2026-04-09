import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/onboarding/AcreXSplashScreen.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Text Section */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Find Properties.{'\n'}Connect Owners.{'\n'}Move Forward.
        </Text>

        <Text style={styles.desc}>
          Find the Right Property in Rohini
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View> */}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.btnText}>Explore</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 210,
    alignItems: 'center',
    zIndex: 1,
  },
title: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 54,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
  },

  desc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 28,
    letterSpacing: 1.3,
  },

  bottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100,
    zIndex: 1,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 4,
  },

  activeDot: {
    backgroundColor: '#1e88e5',
  },

  btn: {
    backgroundColor: '#c28b25',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
