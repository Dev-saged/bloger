# مولّد دفعات المقالات

- `a1..a4.py` المقالات، `a5.py` معلومات+أسئلة شائعة، `a6.py` قسم إضافي، `bidi.py` لف الأرقام المشرطة بـ`<bdi>`.
- الصور: `python3 gen_images.py [slug...]` ← `images/articles/{slug}-cover|info.jpg` (Chrome + خط Noto Kufi من `npm i @fontsource/noto-kufi-arabic`).
- الملف: ادفع الصور أولاً، ثم `python3 build_xml.py <SHA>` ← `articles/*.xml` (الصور عبر jsDelivr مثبّتة بالـSHA).
- المسارات ثابتة على `/tmp/art` — انسخ المجلد إليه قبل التشغيل.
