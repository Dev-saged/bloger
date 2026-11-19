# خريطة TCNOPS

## الميزة ← الملف ← الرمز
- لوحة المزايا (نص): `schema.py` ← `settings_text()` ← تُحقن في أداة `HTML60`.
- قراءة الإعدادات قبل الرسم: `src/early.js` ← `window.TCN_S`، قواعد الإخفاء من `window.TCN_SEL`.
- اللوحة المرئية `?panel`: `src/app.js` قسم «لوحة التحكم المرئية» ← `window.TCN_SCHEMA`، المعاينة في `localStorage["tcn-preview"]`.
- شريط الأخبار: الأداة `HTML131` + `src/app.js` قسم «شريط الأخبار» ← `مصدر_الأخبار_الجاهز` ثم `جسر_الخلاصات`.
- جامع الأخبار: `feed/build_feed.py` + `feed/sources.json` ← فرع `tcnops-feed/ticker.json`.
- الأرشيف: `src/archive.js`.
- الواجهة (Bento) وصفحة المقال: `src/blog.xml` (`main`, `tcnRow`, `tcnFull`).
- المساحات الإعلانية الـ13: `{{AD:...}}` في `src/skeleton.xml` (HTML70–82).
- أقسام الرئيسية: `HTML144–147`. ملخص اليوم: `HTML132`. الأكثر قراءة: `PopularPosts7`. التصنيفات: `Label22`/`Label23`.

## قرارات وأسبابها
- معرّفات أدوات جديدة (مثل `HTML131`, `PopularPosts7`): بلوجر يحتفظ ببيانات المعرّفات القديمة فيتجاهل محتوى XML الجديد.
- لا `<template>` داخل الأدوات: بلوجر يحذفه. الإعدادات في `<div hidden id="tcn-settings">`.
- لا وسوم `data:` داخل CDATA: بلوجر يطبع علامات CDATA حرفياً.
- أداة HTML فارغة لا تُعرض: الأدوات التي يجب أن تظهر لها محتوى افتراضي.
- الحفظ للزوار يتم بلصق الإعدادات في `HTML60`: بلوجر لا يسمح للقالب بالكتابة على الخادم.
- أخبار الشريط عبر GitHub Actions بدل Cloudflare Worker: لا يحتاج مفتاحاً يدوياً، مجاني، بلا حد يومي.
- الرابط الأساسي يخرج http من بلوجر نفسه؛ JSON-LD يستخدم `homepageUrl` (https).

## أخطاء محلولة
- شريط ثابت: `prefers-reduced-motion` كان يوقفه + `:hover` عالق على اللمس ← استثناء الشريط + hover للحاسوب فقط.
- تمدد أفقي 10000px (القالب القديم): `left:-9999px` في RTL.
- لوحة المزايا لا تعمل: `<template>` محذوف ← `<div hidden>`.

## مفتوح
- صفحة `/p/disclaimer.html` غير موجودة على الموقع (النص في `pages/static-pages.html`).
- صفحة `/p/archive.html` اختيارية (الأرشيف يعمل على `?archive`).
- القراءة دون إنترنت تحتاج Service Worker (غير ممكن على blogspot.com).
