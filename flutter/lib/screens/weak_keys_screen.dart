import 'package:flutter/material.dart';

class WeakKeysScreen extends StatelessWidget {
  const WeakKeysScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Standard mock heatmap indexes representing weak characters and slow keys
    final List<Map<String, dynamic>> weakKeysData = [
      {"char": "B", "errors": 12, "accuracy": "74%", "color": Colors.red.shade400},
      {"char": "Q", "errors": 8, "accuracy": "82%", "color": Colors.orange.shade400},
      {"char": "P", "errors": 6, "accuracy": "87%", "color": Colors.amber.shade400},
      {"char": "Z", "errors": 5, "accuracy": "89%", "color": Colors.yellow.shade600},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Finger Diagnostics & Weak Keys", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Insight Info Board
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50 / 2,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade100),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.red.shade500, size: 20),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Muscle Memory Stress Identified",
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          "Your left pinky key 'Q' and index stretch 'B' are showing sluggish reaction times and minor misfires. Focus on slow-drills to recalibrate.",
                          style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B), height: 1.4),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              "Weak Characters Evaluation Chart",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
            ),
            const SizedBox(height: 12),

            // Grid Heatmap of Keys
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.6,
              ),
              itemCount: weakKeysData.length,
              itemBuilder: (context, idx) {
                final item = weakKeysData[idx];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                    boxShadow: const [BoxShadow(color: Color(0x02000000), blurRadius: 6)],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Key ${item['char']}",
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "${item['errors']} Mistakes",
                            style: const TextStyle(fontSize: 9.5, color: Color(0xFF94A3B8)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Acc: ${item['accuracy']}",
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: item['color']),
                          ),
                        ],
                      ),
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: item['color'].withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            item['char'],
                            style: TextStyle(fontWeight: FontWeight.bold, color: item['color'], fontSize: 15),
                          ),
                        ),
                      )
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
            // Smart Practice Recommendations Action button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Launching Targeted Smart Drill for weak keys [ B, Q ]"),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: Color(0xFF4F46E5),
                    ),
                  );
                },
                icon: const Icon(Icons.flash_on, size: 16),
                label: const Text("Launch Personalized Weak Key Drill", style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
