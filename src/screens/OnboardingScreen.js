import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'All Rohini Property Inventory',
    desc: 'Find verified properties in one place',
    image: require('../assets/onboarding/slide2.png'),
    icon: 'grid-outline',
  },
  {
    title: 'Share Listings in Seconds',
    desc: 'Send property details instantly',
    image: require('../assets/onboarding/slide5.png'),
    icon: 'paper-plane-outline',
  },
];

export default function OnboardingScreen({ navigation }) {
  const flatListRef = useRef();
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = { viewAreaCoveragePercentThreshold: 50 };

  const nextSlide = () => {
    if (index < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: index + 1 });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderItem = ({ item, index: slideIndex }) => (
    <View style={styles.slide}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconWrap}>
            <Icon name={item.icon} size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.heroEyebrow}>
            {slideIndex === slides.length - 1 ? 'Fast Sharing' : 'Verified Search'}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>

        <View style={styles.imageCard}>
          <Image source={item.image} style={styles.image} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AcreX</Text>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      <View style={styles.bottomCard}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={nextSlide} activeOpacity={0.9}>
          <View style={styles.buttonIconWrap}>
            <Icon
              name={index === slides.length - 1 ? 'log-in-outline' : 'arrow-forward'}
              size={16}
              color="#0F766E"
            />
          </View>
          <View style={styles.buttonTextWrap}>
            <Text style={styles.buttonText}>
              {index === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Text style={styles.buttonSubtext}>
              {index === slides.length - 1 ? 'Go to login' : 'See what AcreX offers'}
            </Text>
          </View>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  skipButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  skipText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  slide: {
    width,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  heroCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#99F6E4',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 18,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#CBD5E1',
  },
  imageCard: {
    flex: 1,
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomCard: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0F766E',
  },
  button: {
    minHeight: 62,
    backgroundColor: '#0F766E',
    borderRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    shadowColor: '#0F766E',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },
  buttonIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonSubtext: {
    color: '#CCFBF1',
    fontSize: 11,
    marginTop: 2,
  },
});
