# Repo map

## Feature → موقعها (grep)
- SEO (title/robots/OG/X/JSON-LD WebSite+Organization): رأس `<head>` → `Sport Live 24 | SEO`
- NewsArticle + BreadcrumbList: `"@type":"NewsArticle"` / `"BreadcrumbList"` (نسختان: defaultmarkup + Blog1)
- الشعار البرمجي: `sl24-logo` (رأس سطح المكتب، `#xvx-rox1` للجوال، Image150 بالفوتر)
- CSS الجديد كله: `<style id='sl24-css'>`
- المباريات + الأخبار العاجلة: ودجت `id='HTML4'` → `var CONFIG` (enableAutoNews, leagues, newsFeeds, livePageUrl)
- سكربت القالب الأساسي (نظيف): `Theme core (clean`
- السوشيال: LinkList5 / LinkList77 / LinkList7 — القائمة: LinkList12 — الفوتر: LinkList8
- الإعلانات (فارغة): HTML14, HTML8, HTML9, HTML7, HTML5, HTML15 — الحقوق: HTML33

## مقالات (دفعة 1 — فرع articles-batch-1)
- 20 مقالاً أصلياً + صورتان لكل مقال (غلاف + بطاقة معلومات) → `articles/sport-live-24-articles-batch-1.xml`، صور `images/articles/`، المولّد `tools/articles-src/`.
- الاستيراد: بلوجر ← الإعدادات ← النسخ الاحتياطي ← استعادة؛ التصنيفات: أخبار + تصنيف موضوعي؛ روابط الصور jsDelivr@SHA.

## قرارات
- أرقام مشرطة (4-3-3) داخل نص عربي تنعكس بصرياً (AN لا يدمج ES): في العناوين/الأوصاف تجنّبها أو استبدلها بـ`/`، وفي الـHTML لفّها `<bdi>`.
- ESPN `site.api.espn.com` (CORS مفتوح، بدون مفتاح)، استعلام لكل دوري بتاريخ اليوم (نطاق التواريخ يرجع 400).
- الأخبار: rss2json ثم جلب مباشر ثم مصدر بديل؛ الافتراضي France24 عربي رياضة.
- Font Awesome بقي على 5.15.4 لأن القالب يعتمد أسماء خطوط FA5؛ أيقونة X عبر SVG mask.
- رابط X: `saged_al` (يوزرات X لا تقبل الشرطة).

## أخطاء محلولة
- سكربت مشفّر يحقن `cdn.jsdelivr.net/gh/dandinma3i/Test/second.js` بعد التحميل → حُذف واستُبدل بنسخة مفكوكة نظيفة.
- مواضع إعلان أعلى/أسفل الموضوع كانت معكوسة (IDs) → تبديل `top/bottom-ad-placeholder`.
- مباريات اليوم القديمة: API ميت + jQuery قبل تحميله + Analytics غريب UA-137036133 → استبدال كامل.
- JSON-LD يكسر عند وجود علامات تنصيص في العنوان → jsonEscaped في كل الحقول.

## v2.1.0 / دفعة 2
- مصغرات الأغلفة: بلوجر يعيد تحجيم الصور الخارجية عبر blogger_img_proxy؛ لاحقة `-c` تعطي مربعاً 202×202 → lazyimg (grep `blogger_img_proxy`) يطلب `=sN-rw` بنسبة أصلية.
- شريط أبيض أسفل الشاشة = إشعار الكوكيز الفارغ (#cookies-iki) → حُذف (HTML+CSS+JS).
- JSON-LD المقال: BlogPosting + author(url,sameAs). مقالات دفعة 2: tools/articles-src/b1-b3.py، gen_images2.py، build_xml2.py <sha>.

## استوديو المقالات (tools/article-studio)
- PWA ملف واحد: توليد XML+صور. محرك المزودين: grep `async function chat(` (تبديل/استراحة)، التخطيط `planTopics`، المقال `genArticle`/`normArticle`، الصور `drawCover`/`drawCard`، XML `buildXml`، رفع `pushImages`، اختبار `selfTest` (#test).
- قرارات: مفاتيح المزودين في localStorage فقط. Zen محجوب بـCORS لذلك تجريبي. صور بإيداع Git واحد (Git Data API) مثبتة بالـSHA. مواد مرجعية من ESPN فقط لمنع التلفيق.
- بناء: build.py يحقن data.json. CSP في الـmeta يمنع eval (الاختبار الآلي يحتاج bypass_csp).
- خطأ محلول: كتابة `</script>` حرفياً داخل نص JS قطعت الصفحة → `<\/script>`.

## مفتوح
- اختبار الرفع الفعلي على بلوجر (لا يمكن تشغيله آلياً).

- استوديو المقالات لم يُجرَّب بمفاتيح مزودين حقيقية (اختُبر بمحاكاة)؛ جودة النماذج المجانية وحدودها تُقاس عند أول تشغيل.
