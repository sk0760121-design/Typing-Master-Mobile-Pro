import 'package:flutter/material.dart';

class LessonsScreen extends StatefulWidget {
  const LessonsScreen({Key? key}) : super(key: key);

  @override
  State<LessonsScreen> createState() => _LessonsScreenState();
}

class _LessonsScreenState extends State<LessonsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> beginnerLessons = [
    {
      "title": "Home Row Foundation",
      "subtitle": "Warmup keys A S D F and J K L ;",
      "target": "25 WPM",
      "text": "asdf jkl; asdf jkl; sd f j k l; asdf jkl;"
    },
    {
      "title": "Index Finger Mastery",
      "subtitle": "Introducing keys F G and H J",
      "target": "30 WPM",
      "text": "fg hj fg hj ff gg hh jj fghj fghj"
    }
  ];

  final List<Map<String, dynamic>> intermediateLessons = [
    {
      "title": "Top Row Insertion",
      "subtitle": "Adding Q W E R and U I O P",
      "target": "40 WPM",
      "text": "qwer uiop qwer uiop re qw op iu qwer uiop"
    },
    {
      "title": "Bottom Row Insertion",
      "subtitle": "Adding Z X C V and M , . /",
      "target": "42 WPM",
      "text": "zxcv m,./ zxcv m,./ cx vm zxcv m,./"
    }
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Typing Lessons", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF4F46E5),
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: const Color(0xFF4F46E5),
          tabs: const [
            Tab(text: "Beginner Course"),
            Tab(text: "Intermediate Course"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLessonList(beginnerLessons),
          _buildLessonList(intermediateLessons),
        ],
      ),
    );
  }

  Widget _buildLessonList(List<Map<String, dynamic>> lessons) {
    return ListView.separated(
      padding: const EdgeInsets.all(20.0),
      itemCount: lessons.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, idx) {
        final lesson = lessons[idx];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x04000000),
                blurRadius: 8,
                offset: Offset(0, 2),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, py: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            "STABILITY",
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "Target ${lesson['target']}",
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      lesson['title']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      lesson['subtitle']!,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () {
                  // Show simulation snackbar
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("Launching Practice Run inside Typing Arena: ${lesson['title']}"),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: const Color(0xFF4F46E5),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Icon(Icons.arrow_forward_ios, size: 14),
              )
            ],
          ),
        );
      },
    );
  }
}
