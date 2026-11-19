# TCNOPS — قالب بلوجر أصلي (مجلد مستقل داخل مستودع bloger)

- لا تعدّل `dist/TCNOPS-2026.xml` يدوياً: المصدر في `src/` و`schema.py`، ثم `python3 -I build.py`.
- ابدأ بقراءة `.claude/session-handoff.md` و`docs/repo-map.md` فقط.
- الإصدار في `schema.py` (`VERSION`) ويظهر في `<meta name="tcnops-version">` ولوحة التحكم. ارفعه مع كل تغيير جوهري وأضف سطراً في `CHANGELOG.md`.
- قبل الدفع: `python3 -I build.py && xmllint --noout dist/TCNOPS-2026.xml && python3 tests/test.py ar > /tmp/ar.txt && python3 tests/check_results.py /tmp/ar.txt`.
- كل مزايا اللوحة تُعرّف في `schema.py` فقط (نص لوحة المزايا + اللوحة المرئية + قواعد الإخفاء تتولّد منه).
- ممنوع: سكربتات خارجية مجهولة، كود مشفّر، أي واجهة برمجية مدفوعة.
- لا تلمس ملف Sport Live 24 في جذر المستودع.
