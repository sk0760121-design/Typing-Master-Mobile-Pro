import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final profile = Provider.of<UserProfileProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 22,
                        backgroundColor: Color(0xFFEEF2FF),
                        child: Text("🚀", style: TextStyle(fontSize: 22)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile.username,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                          ),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, py: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEEF2FF),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  "LVL ${profile.level}",
                                  style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text("Professional Pilot", style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                            ],
                          )
                        ],
                      )
                    ],
                  ),
                  
                  // Streak and Coins
                  Row(
                    children: [
                      _buildHeaderChip("🔥", "${profile.streak}d", Colors.orange.shade50, Colors.orange.shade850),
                      const SizedBox(width: 8),
                      _buildHeaderChip("🪙", "\$${profile.coins}", Colors.amber.shade50, Colors.amber.shade850),
                    ],
                  )
                ],
              ),
              const SizedBox(height: 24),

              // Glassmorphism Hero Panel
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22.0),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEEF2FF), Colors.white, Color(0xFFECFEFF)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE0E7FF), width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF4F46E5).withOpacity(0.04),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    )
                  ]
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "⭐ ACCELERATED TRAINING",
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5), letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Perfect your finger positions & velocity",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B), height: 1.2),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      "Daily training matches enhance keystroke mechanics & motor coordination.",
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/lessons'),
                          icon: const Icon(Icons.play_arrow, size: 16),
                          label: const Text("Launch Course", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/weak_keys'),
                          icon: const Icon(Icons.analytics_outlined, size: 15),
                          label: const Text("Weak Keys", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF4F46E5),
                            side: const BorderSide(color: Color(0xFFE2E8F0)),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        )
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Activity Cards Grid Row
              Row(
                children: [
                  Expanded(
                    child: _buildActionCard(
                      context,
                      "🎯",
                      "Typing Games",
                      "Falling Words / Shooter",
                      "/games",
                      const Color(0xFFE0F2FE),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionCard(
                      context,
                      "🔥",
                      "Finger Diagnostics",
                      "Analyze slow triggers",
                      "/weak_keys",
                      const Color(0xFFFEF3C7),
                    ),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderChip(String icon, String value, Color bg, Color textC) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textC.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textC, fontFamily: "monospace"),
          )
        ],
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, String emoji, String title, String subtitle, String route, Color bgPlate) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bgPlate,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(emoji, style: const TextStyle(fontSize: 18)),
          ),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => Navigator.pushNamed(context, route),
            child: const Row(
              children: [
                Text("Open", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5))),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward, size: 12, color: Color(0xFF4F46E5)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
