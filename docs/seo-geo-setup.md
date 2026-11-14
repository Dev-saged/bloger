# إعداد SEO/GEO لمدونة سبورت لايف 24 (يُنفَّذ من لوحة بلوجر)

## robots.txt المخصص
الإعدادات ← الزاحفات والفهرسة ← تفعيل robots.txt المخصص، ثم الصق:

```
User-agent: Mediapartners-Google
Disallow:

User-agent: *
Disallow: /search
Allow: /

# محركات بحث الذكاء الاصطناعي (تسمح بالظهور والاستشهاد)
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# زواحف التدريب: السماح هنا = السماح بتدريب النماذج على المحتوى.
# للمنع غيّر Allow إلى Disallow في الأربعة التالية.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://sport1live24.blogspot.com/sitemap.xml
```

## علامات رأس الروبوتات المخصصة
الصفحة الرئيسية: all. الأرشيف والبحث: noindex. المقالات والصفحات: all (مع max-image-preview:large يضيفها القالب).

## قائمة التنفيذ
1. إنشاء صفحات: من نحن (`about-us`)، الخصوصية (`privacy-policy`)، اتصل بنا (`contact-us`). القالب يربط المؤلف بـ `p/about-us.html`.
2. Search Console: إضافة المدونة، تقديم `sitemap.xml`، طلب فهرسة أحدث 10 مقالات يدوياً.
3. Bing Webmaster Tools: استيراد الموقع من Search Console (يخدم ChatGPT Search وCopilot).
4. نشر 2 إلى 3 مقالات يومياً بتواريخ تحديث حقيقية، وروابط داخلية في كل مقال.
