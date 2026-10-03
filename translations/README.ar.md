<p align="center">
  <a href="../README.md">English</a> | <a href="README.zh.md">简体中文</a> | <a href="README.zht.md">繁體中文</a> | <a href="README.ko.md">한국어</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.da.md">Dansk</a> | <a href="README.ja.md">日本語</a> | <a href="README.pl.md">Polski</a> | <a href="README.ru.md">Русский</a> | <a href="README.bs.md">Bosanski</a> | العربية | <a href="README.no.md">Norsk</a> | <a href="README.br.md">Português (Brasil)</a> | <a href="README.th.md">ไทย</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.bn.md">বাংলা</a> | <a href="README.gr.md">Ελληνικά</a> | <a href="README.vi.md">Tiếng Việt</a>
</p>

<div dir="rtl">

<p align="center">
  <a href="https://tavern.ai"><img width="250" alt="Tavern Code logo" src="https://github.com/user-attachments/assets/bdb0c174-b9fd-40ad-a47b-f3aab9b54e8d" /></a>
</p>

<p align="center">وكيل برمجة مفتوح المصدر للبناء باستخدام الذكاء الاصطناعي في VS Code أو JetBrains أو CLI.</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=taverncode.Tavern-Code"><img src="https://raster.shields.io/badge/VS_Code_Marketplace-007ACC?style=flat&logo=visualstudiocode&logoColor=white" alt="VS Code Marketplace" height="20"></a>
  <a href="https://www.npmjs.com/package/@taverncode/cli"><img alt="npm" src="https://raster.shields.io/npm/v/@taverncode/cli?style=flat" height="20" /></a>
  <a href="https://x.com/taverncode"><img src="https://raster.shields.io/badge/taverncode-000000?style=flat&logo=x&logoColor=white" alt="X (Twitter)" height="20"></a>
  <a href="https://blog.tavern.ai"><img src="https://raster.shields.io/badge/Blog-555?style=flat&logo=substack&logoColor=white" alt="Blog" height="20"></a>
  <a href="https://tavern.ai/discord"><img src="https://raster.shields.io/badge/Join%20Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" height="20"></a>
  <a href="https://www.reddit.com/r/taverncode/"><img src="https://raster.shields.io/badge/Join%20r%2Ftaverncode-D84315?style=flat&logo=reddit&logoColor=white" alt="Reddit" height="20"></a>
</p>

![Tavern-in-VS-Code-and-CLI](https://github.com/user-attachments/assets/0536ca59-ed81-4512-9e05-d186187a1b52)

---

Tavern Code هو وكيل برمجة بالذكاء الاصطناعي يعمل معك أينما تعمل: [VS Code](https://tavern.ai/landing/vs-code) و[JetBrains](https://tavern.ai/features/jetbrains-native) و[CLI](https://tavern.ai/cli). إنه مفتوح المصدر وبتسعير مفتوح. يمكنك الاختيار من بين أكثر من 500 نموذج، والتبديل بينها أثناء المهمة، ودفع سعر مزود النموذج من دون أي هامش إضافي. لا تحتاج إلى مفاتيح API للبدء.

### التثبيت

اختر المكان الذي تريد تشغيل Tavern فيه.

<details open>
<summary><strong>VS Code</strong></summary>

<br>

ثبّت [إضافة Tavern Code](vscode:extension/taverncode.tavern-code) مباشرة، أو احصل عليها من [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=taverncode.Tavern-Code). أنشئ حسابًا وستحصل على إمكانية الوصول إلى أكثر من 500 نموذج، بما في ذلك GPT-5.5 وClaude Opus 4.7 وClaude Sonnet 4.6 وGemini 3.1 Pro Preview، كلها بسعر المزود.

</details>

<details open>
<summary><strong>CLI</strong></summary>

<br>

```bash
# npm
npm install -g @taverncode/cli

# curl
curl -fsSL https://tavern.ai/cli/install | bash

# pnpm
pnpm add -g @taverncode/cli

# bun
bun add -g @taverncode/cli

# Homebrew (macOS / Linux)
brew install Kilo-Org/tap/tavern

# Arch Linux (AUR)
paru -S tavern-bin
```

بعد ذلك شغّل `tavern` في أي مجلد مشروع للبدء.

</details>

<details>
<summary><strong>JetBrains</strong></summary>

<br>

ثبّت [إضافة Tavern Code](https://plugins.jetbrains.com/plugin/28350-tavern-code) من JetBrains Marketplace، أو ابحث عن "Tavern Code" في `Settings → Plugins` داخل أي JetBrains IDE.

</details>

<details>
<summary><strong>Cloud Agent</strong></summary>

<br>

شغّل Tavern من الويب، من دون جهاز محلي، على [app.tavern.ai/cloud](https://app.tavern.ai/cloud).

</details>

<details>
<summary><strong>مراجعات الكود</strong></summary>

<br>

أعدّ مراجعات كود آلية بالذكاء الاصطناعي لطلبات السحب الخاصة بك على [app.tavern.ai/code-reviews](https://app.tavern.ai/code-reviews).

</details>

<details>
<summary>تثبيت CLI من GitHub Releases (ملفات ثنائية)</summary>

نزّل أحدث ملف ثنائي من [صفحة Releases](https://github.com/Kilo-Org/kilocode/releases).

| المنصة | الملف |
|---|---|
| Windows (معظم أجهزة PC) | `tavern-windows-x64.zip` |
| macOS (Apple Silicon) | `tavern-darwin-arm64.zip` |
| macOS (Intel) | `tavern-darwin-x64.zip` |
| Linux x64 | `tavern-linux-x64.tar.gz` |
| Linux ARM | `tavern-linux-arm64.tar.gz` |

ملاحظات: `x64-baseline` هو بناء توافق للمعالجات القديمة التي لا تدعم AVX. `musl` هو البناء المرتبط ثابتًا لـ Alpine أو صور Docker البسيطة من دون glibc. `tavern-vscode-*.vsix` هو حزمة إضافة VS Code وليس CLI. أرشيفات `Source code` مخصصة للبناء من المصدر.

</details>

### Agents

يأتي Tavern مع agents متخصصة يمكنك التبديل بينها حسب المهمة. يمكنك أيضًا إنشاء agents مخصصة خاصة بك.

- **Code** - الافتراضي. ينفذ الكود ويعدّله من اللغة الطبيعية.
- **Plan** - يصمم البنية ويكتب خطط التنفيذ قبل كتابة أي كود.
- **Ask** - يجيب عن الأسئلة حول قاعدة الكود من دون تعديل الملفات.
- **Debug** - يستكشف المشكلات ويتتبعها.
- **Review** - يراجع تغييراتك ويكشف مشكلات الأداء والأمان والأسلوب وتغطية الاختبارات.

تعرّف أكثر على [agents وagents المخصصة](https://tavern.ai/docs/code-with-ai/agents/using-agents).

### ما الذي يفعله

- **توليد الكود** من اللغة الطبيعية عبر ملفات متعددة.
- **إكمال تلقائي داخل السطر** مع اقتراحات ghost-text والضغط على Tab للقبول.
- **فحص ذاتي** لكي يراجع الوكيل عمله ويصححه.
- **تحكم في الطرفية والمتصفح** لتشغيل الأوامر وأتمتة الويب.
- **سوق MCP** للعثور على خوادم MCP وربطها لتوسيع قدرات الوكيل.
- **أكثر من 500 نموذج** مع التبديل أثناء المهمة، لتطابق زمن الاستجابة والتكلفة والاستدلال مع العمل.

### الوضع المستقل (CI/CD)

شغّل `tavern run` مع `--auto` للعمل بشكل مستقل بالكامل ومن دون prompts، وهو مصمم لخطوط CI/CD:

```bash
tavern run --auto "run tests and fix any failures"
```

يعطّل `--auto` كل مطالبات الأذونات ويسمح للوكيل بتنفيذ أي إجراء من دون تأكيد. استخدمه فقط في بيئات موثوقة.

### التوثيق

لإعدادات التكوين وكل ما عدا ذلك، راجع [التوثيق](https://tavern.ai/docs).

### المساهمة

نرحب بمساهمات المطورين والكتّاب والجميع. ابدأ بـ [Contributing Guide](/CONTRIBUTING.md) لإعداد البيئة ومعايير الكود وكيفية فتح pull request. راجع [RELEASING.md](../RELEASING.md) لعملية إصدار إضافة VS Code وCLI، و[packages/tavern-jetbrains/RELEASING.md](../packages/tavern-jetbrains/RELEASING.md) لإضافة JetBrains.

يرجى قراءة [Code of Conduct](/CODE_OF_CONDUCT.md) قبل المشاركة.

### الترخيص

MIT. يمكنك استخدام هذا الكود وتعديله وتوزيعه، بما في ذلك تجاريًا، ما دمت تحتفظ بإشعارات النسبة والترخيص. راجع [License](/LICENSE).

### FAQ

<details>
<summary>من أين جاء Tavern CLI؟</summary>

Tavern CLI هو fork من [OpenCode](https://github.com/anomalyco/opencode)، وتم تحسينه للعمل داخل منصة Tavern agentic engineering.

</details>

---

**انضم إلى المجتمع** [Discord](https://tavern.ai/discord) | [X](https://x.com/taverncode) | [Reddit](https://www.reddit.com/r/taverncode/)

</div>
