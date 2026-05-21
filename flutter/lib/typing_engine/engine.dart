import 'package:flutter/foundation.dart';

class TypingEngine {
  final String targetText;
  int currentIndex = 0;
  int mistakesCount = 0;
  
  // Timestamps for accurate speed computation
  DateTime? startTime;
  DateTime? lastTypedTime;

  // Key tracking to build weak keys heatmap analytics
  final Map<String, int> correctKeysMap = {};
  final Map<String, int> mistakesKeysMap = {};

  TypingEngine({required this.targetText});

  void reset() {
    currentIndex = 0;
    mistakesCount = 0;
    startTime = null;
    lastTypedTime = null;
    correctKeysMap.clear();
    mistakesKeysMap.clear();
  }

  // Processes key input dynamically, returning true if correct letter, false if incorrect
  bool registerKeystroke(String enteredChar) {
    if (currentIndex >= targetText.length) return false;
    
    startTime ??= DateTime.now();
    lastTypedTime = DateTime.now();

    String expectedChar = targetText[currentIndex];

    if (enteredChar == expectedChar) {
      // Log keystroke counts for analytics
      correctKeysMap[expectedChar] = (correctKeysMap[expectedChar] ?? 0) + 1;
      currentIndex++;
      return true;
    } else {
      mistakesCount++;
      mistakesKeysMap[expectedChar] = (mistakesKeysMap[expectedChar] ?? 0) + 1;
      return false;
    }
  }

  // Calculate standard formula: ((char typed - mistakes) / 5) / minutes
  double calculateWpm() {
    if (startTime == null || currentIndex == 0) return 0.0;
    
    final elapsedSecs = DateTime.now().difference(startTime!).inSeconds;
    if (elapsedSecs < 1) return 0.0;

    double minutes = elapsedSecs / 60.0;
    double netWords = (currentIndex / 5.0);
    double wpmValue = netWords / minutes;
    
    return wpmValue < 0 ? 0.0 : wpmValue;
  }

  // Accuracy calculated as: (total matches / (total matches + mistakes)) * 100
  double calculateAccuracy() {
    int totalTyped = currentIndex + mistakesCount;
    if (totalTyped == 0) return 100.0;
    return ((currentIndex / totalTyped) * 100.0);
  }

  // Get slow and most mistyped character reports
  List<MapEntry<String, int>> getTopWeakKeys() {
    var sorted = mistakesKeysMap.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return sorted;
  }
}
