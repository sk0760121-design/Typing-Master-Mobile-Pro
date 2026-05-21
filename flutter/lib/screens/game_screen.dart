import 'package:flutter/material.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({Key? key}) : super(key: key);

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  int score = 0;
  final TextEditingController _inputController = TextEditingController();
  final List<String> activeWords = ["FLUTTER", "DATABASE", "KEYBOARD", "SPEED", "TRAINER"];

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  void checkWord(String typed) {
    String uppercaseTyped = typed.trim().toUpperCase();
    if (activeWords.contains(uppercaseTyped)) {
      setState(() {
        score += 15;
        // Shift word list
        activeWords.remove(uppercaseTyped);
        activeWords.add(["SYNTAX", "GLIDE", "VELOCITY", "ENGINE", "FLUIDITY"][score % 5]);
      });
      _inputController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Typing Arcade Space Run", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: Container(
        padding: const EdgeInsets.all(20.0),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          )
        ),
        child: Column(
          children: [
            // Active Score Display
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text("🔴 LIVE", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 11)),
                    SizedBox(width: 8),
                    Text("LEVEL: HyperSpeed", style: TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, py: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "Score: $score pts",
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, fontFamily: "monospace"),
                  ),
                )
              ],
            ),
            const SizedBox(height: 24),

            // Main Active Game canvas simulation
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: 40,
                      left: 30,
                      child: _buildGlowingWord(activeWords[0], Colors.cyan),
                    ),
                    Positioned(
                      top: 120,
                      right: 40,
                      child: _buildGlowingWord(activeWords[1], Colors.indigoAccent),
                    ),
                    Positioned(
                      bottom: 80,
                      left: 50,
                      child: _buildGlowingWord(activeWords[2], Colors.orangeAccent),
                    ),
                    const Center(
                      child: Text(
                        "💥 TYPE & DESTROY WORDS",
                        style: TextStyle(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
                      ),
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Active Game typing block
            TextField(
              controller: _inputController,
              onChanged: checkWord,
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5),
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                hintText: "Enter matching word here...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 12),
                prefixIcon: const Icon(Icons.keyboard, color: Colors.white30),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF6366F1)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGlowingWord(String word, Color glow) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.4),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: glow.withOpacity(0.4)),
        boxShadow: [
          BoxShadow(
            color: glow.withOpacity(0.15),
            blurRadius: 8,
          )
        ]
      ),
      child: Text(
        word,
        style: TextStyle(color: glow, fontWeight: FontWeight.bold, fontSize: 13, fontFamily: "monospace", letterSpacing: 1),
      ),
    );
  }
}
