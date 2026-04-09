import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddStaticScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>➕</Text>
      <Text style={styles.text}>Add Property Screen</Text>
      <Text style={styles.subText}>Coming Soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  subText: {
    marginTop: 6,
    color: 'black',
  },
});