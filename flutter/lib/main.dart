import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/dashboard_screen.dart';
import 'screens/lessons_screen.dart';
import 'screens/weak_keys_screen.dart';
import 'screens/game_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Ensure Firebase is initialized (wrapped in try-catch for offline fallback)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init failed, running in offline sandbox mode: $e");
  }
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TypingSessionProvider()),
        ChangeNotifierProvider(create: (_) => UserProfileProvider()),
      ],
      child: const TypingMasterApp(),
    ),
  );
}

class TypingMasterApp extends StatelessWidget {
  const TypingMasterApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Typing Master Mobile Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFFAFAFA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Elegant Indigo
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFF06B6D4), // Cyan
        ),
        textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const DashboardScreen(),
        '/lessons': (context) => const LessonsScreen(),
        '/weak_keys': (context) => const WeakKeysScreen(),
        '/games': (context) => const GameScreen(),
      },
    );
  }
}

// Providers for State Management
class TypingSessionProvider extends ChangeNotifier {
  double _wpm = 0.0;
  double _accuracy = 100.0;
  int _mistakes = 0;
  
  double get wpm => _wpm;
  double get accuracy => _accuracy;
  int get mistakes => _mistakes;

  void updateMetrics(double rawWpm, double acc, int errs) {
    _wpm = rawWpm;
    _accuracy = acc;
    _mistakes = errs;
    notifyListeners();
  }
}

class UserProfileProvider extends ChangeNotifier {
  String _username = "Sk Master Typer";
  int _level = 3;
  int _xp = 340;
  int _coins = 120;
  int _streak = 4;
  
  String get username => _username;
  int get level => _level;
  int get xp => _xp;
  int get coins => _coins;
  int get streak => _streak;

  void addXp(int amount) {
    _xp += amount;
    // Simple level up thresholds
    if (_xp >= 150 * _level) {
      _xp -= 150 * _level;
      _level += 1;
    }
    notifyListeners();
  }

  void addCoins(int amount) {
    _coins += amount;
    notifyListeners();
  }
}
