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

## قرارات
- ESPN `site.api.espn.com` (CORS مفتوح، بدون مفتاح)، استعلام لكل دوري بتاريخ اليوم (نطاق التواريخ يرجع 400).
- الأخبار: rss2json ثم جلب مباشر ثم مصدر بديل؛ الافتراضي France24 عربي رياضة.
- Font Awesome بقي على 5.15.4 لأن القالب يعتمد أسماء خطوط FA5؛ أيقونة X عبر SVG mask.
- رابط X: `saged_al` (يوزرات X لا تقبل الشرطة).

## أخطاء محلولة
- سكربت مشفّر يحقن `cdn.jsdelivr.net/gh/dandinma3i/Test/second.js` بعد التحميل → حُذف واستُبدل بنسخة مفكوكة نظيفة.
- مواضع إعلان أعلى/أسفل الموضوع كانت معكوسة (IDs) → تبديل `top/bottom-ad-placeholder`.
- مباريات اليوم القديمة: API ميت + jQuery قبل تحميله + Analytics غريب UA-137036133 → استبدال كامل.
- JSON-LD يكسر عند وجود علامات تنصيص في العنوان → jsonEscaped في كل الحقول.

## مفتوح
- اختبار الرفع الفعلي على بلوجر (لا يمكن تشغيله آلياً).
