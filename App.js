import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  Switch,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

const TIMES = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  // Interval / break here
  '12:30 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
];

export default function App() {
  const [descriptions, setDescriptions] = useState(Array(8).fill(''));
  const [dateStr, setDateStr] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // Track which row is expanded

  // Animation references
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const rowAnimations = useRef(TIMES.map(() => new Animated.Value(0))).current;
  const inputHeightAnimations = useRef(TIMES.map(() => new Animated.Value(40))).current; // Default height for TextInput

  useEffect(() => {
    const today = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    setDateStr(today.toLocaleDateString(undefined, options));
    setDescriptions(Array(8).fill('')); // reset for new day

    // Animate header
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animate rows sequentially
    rowAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  function updateDescription(index, text) {
    setDescriptions((prev) => {
      const newArr = [...prev];
      newArr[index] = text;
      return newArr;
    });
  }

  function handleExpand(index) {
    if (expandedIndex === index) {
      // Collapse the expanded row
      Animated.timing(inputHeightAnimations[index], {
        toValue: 40, // Default height
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedIndex(null);
    } else {
      // Expand the clicked row
      if (expandedIndex !== null) {
        // Collapse the previously expanded row
        Animated.timing(inputHeightAnimations[expandedIndex], {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      Animated.timing(inputHeightAnimations[index], {
        toValue: 120, // Expanded height
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedIndex(index);
    }
  }

  const themeStyles = isDarkMode ? darkStyles : styles;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={themeStyles.safe}>
        <View style={themeStyles.container}>
          <Animated.View style={[themeStyles.headerRow, { opacity: headerOpacity }]}>
            <Text style={themeStyles.title}>Daily Diary</Text>
            <Text style={themeStyles.date}>{dateStr}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setIsDarkMode(value)}
            />
          </Animated.View>

          <ScrollView style={themeStyles.table}>
            {TIMES.map((time, i) => (
              <Animated.View
                key={i}
                style={[
                  themeStyles.row,
                  { transform: [{ scale: rowAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
                ]}
              >
                <View style={themeStyles.cellTime}>
                  <Text style={themeStyles.timeText}>{time}</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => handleExpand(i)}>
                  <Animated.View style={{ flex: 2, height: inputHeightAnimations[i] }}>
                    <TextInput
                      style={themeStyles.cellDesc}
                      placeholder="Write description"
                      placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                      multiline
                      value={descriptions[i]}
                      onChangeText={(text) => updateDescription(i, text)}
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </Animated.View>
            ))}

            <View style={themeStyles.intervalRow}>
              <Text style={themeStyles.intervalText}>Break / Interval (30 mins)</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    paddingTop: (Platform.OS === 'android' ? 10 : 0) + 45,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  table: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cellTime: {
    flex: 1,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  timeText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  cellDesc: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
  },
  intervalRow: {
    backgroundColor: '#ffeb3b',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 8,
    justifyContent: 'center',
  },
  intervalText: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#444',
  },
});

const darkStyles = StyleSheet.create({
  ...styles,
  safe: {
    ...styles.safe,
    backgroundColor: '#121212',
  },
  container: {
    ...styles.container,
    backgroundColor: '#121212',
  },
  title: {
    ...styles.title,
    color: '#fff',
  },
  date: {
    ...styles.date,
    color: '#bbb',
  },
  row: {
    ...styles.row,
    backgroundColor: '#1e1e1e',
  },
  cellTime: {
    ...styles.cellTime,
    backgroundColor: '#333',
  },
  timeText: {
    ...styles.timeText,
    color: '#fff',
  },
  cellDesc: {
    ...styles.cellDesc,
    color: '#fff',
  },
  intervalRow: {
    ...styles.intervalRow,
    backgroundColor: '#444',
  },
  intervalText: {
    ...styles.intervalText,
    color: '#fff',
  },
});