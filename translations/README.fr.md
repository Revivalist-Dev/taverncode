<p align="center">
  <a href="../README.md">English</a> | <a href="README.zh.md">简体中文</a> | <a href="README.zht.md">繁體中文</a> | <a href="README.ko.md">한국어</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | Français | <a href="README.it.md">Italiano</a> | <a href="README.da.md">Dansk</a> | <a href="README.ja.md">日本語</a> | <a href="README.pl.md">Polski</a> | <a href="README.ru.md">Русский</a> | <a href="README.bs.md">Bosanski</a> | <a href="README.ar.md">العربية</a> | <a href="README.no.md">Norsk</a> | <a href="README.br.md">Português (Brasil)</a> | <a href="README.th.md">ไทย</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.bn.md">বাংলা</a> | <a href="README.gr.md">Ελληνικά</a> | <a href="README.vi.md">Tiếng Việt</a>
</p>

<p align="center">
  <a href="https://tavern.ai"><img width="250" alt="Tavern Code logo" src="https://github.com/user-attachments/assets/bdb0c174-b9fd-40ad-a47b-f3aab9b54e8d" /></a>
</p>

<p align="center">L'agent de codage open source pour construire avec l'IA dans VS Code, JetBrains ou la CLI.</p>

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

Tavern Code est un agent de codage avec IA qui vous accompagne partout où vous travaillez : [VS Code](https://tavern.ai/landing/vs-code), [JetBrains](https://tavern.ai/features/jetbrains-native) et la [CLI](https://tavern.ai/cli). Il est open source avec une tarification ouverte. Vous choisissez parmi plus de 500 modèles, vous pouvez en changer en cours de tâche et vous payez le tarif du fournisseur du modèle sans majoration. Aucune clé API n'est nécessaire pour commencer.

### Installation

Choisissez où vous voulez exécuter Tavern.

<details open>
<summary><strong>VS Code</strong></summary>

<br>

Installez directement l'[extension Tavern Code](vscode:extension/taverncode.tavern-code), ou récupérez-la sur le [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=taverncode.Tavern-Code). Créez un compte et vous aurez accès à plus de 500 modèles, dont GPT-5.5, Claude Opus 4.7, Claude Sonnet 4.6 et Gemini 3.1 Pro Preview, tous au prix fournisseur.

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

Exécutez ensuite `tavern` dans n'importe quel répertoire de projet pour commencer.

</details>

<details>
<summary><strong>JetBrains</strong></summary>

<br>

Installez le [plugin Tavern Code](https://plugins.jetbrains.com/plugin/28350-tavern-code) depuis JetBrains Marketplace, ou recherchez "Tavern Code" dans `Settings → Plugins` dans n'importe quel IDE JetBrains.

</details>

<details>
<summary><strong>Cloud Agent</strong></summary>

<br>

Exécutez Tavern depuis le web, sans machine locale, sur [app.tavern.ai/cloud](https://app.tavern.ai/cloud).

</details>

<details>
<summary><strong>Revues de code</strong></summary>

<br>

Configurez des revues de code IA automatisées sur vos pull requests à l'adresse [app.tavern.ai/code-reviews](https://app.tavern.ai/code-reviews).

</details>

<details>
<summary>Installer la CLI depuis GitHub Releases (binaires)</summary>

Téléchargez le dernier binaire depuis la [page des releases](https://github.com/Kilo-Org/kilocode/releases).

| Plateforme | Fichier |
|---|---|
| Windows (la plupart des PC) | `tavern-windows-x64.zip` |
| macOS (Apple Silicon) | `tavern-darwin-arm64.zip` |
| macOS (Intel) | `tavern-darwin-x64.zip` |
| Linux x64 | `tavern-linux-x64.tar.gz` |
| Linux ARM | `tavern-linux-arm64.tar.gz` |

Notes : `x64-baseline` est une build de compatibilité pour les anciens processeurs sans AVX. `musl` est la build liée statiquement pour Alpine ou les images Docker minimales sans glibc. `tavern-vscode-*.vsix` est le paquet de l'extension VS Code, pas la CLI. Les archives `Source code` servent à compiler depuis les sources.

</details>

### Agents

Tavern inclut des agents spécialisés entre lesquels vous pouvez basculer selon la tâche. Vous pouvez aussi créer vos propres agents personnalisés.

- **Code** - Par défaut. Implémente et modifie le code à partir du langage naturel.
- **Plan** - Conçoit l'architecture et rédige des plans d'implémentation avant l'écriture du code.
- **Ask** - Répond aux questions sur votre base de code sans modifier les fichiers.
- **Debug** - Diagnostique et trace les problèmes.
- **Review** - Examine vos changements et signale les problèmes de performance, sécurité, style et couverture de tests.

En savoir plus sur les [agents et agents personnalisés](https://tavern.ai/docs/code-with-ai/agents/using-agents).

### Fonctionnalités

- **Génération de code** en langage naturel, sur plusieurs fichiers.
- **Autocomplétion en ligne** avec suggestions ghost-text et Tab pour accepter.
- **Auto-vérification** pour que l'agent relise et corrige son propre travail.
- **Contrôle du terminal et du navigateur** pour exécuter des commandes et automatiser le web.
- **Marketplace MCP** pour trouver et connecter des serveurs MCP qui étendent les capacités de l'agent.
- **Plus de 500 modèles** avec changement en cours de tâche, pour adapter latence, coût et raisonnement au travail.

### Mode autonome (CI/CD)

Exécutez `tavern run` avec `--auto` pour un fonctionnement entièrement autonome sans prompts, conçu pour les pipelines CI/CD :

```bash
tavern run --auto "run tests and fix any failures"
```

`--auto` désactive toutes les demandes d'autorisation et permet à l'agent d'exécuter n'importe quelle action sans confirmation. Utilisez-le uniquement dans des environnements de confiance.

### Documentation

Pour la configuration et tout le reste, consultez la [documentation](https://tavern.ai/docs).

### Contribuer

Les contributions des développeurs, rédacteurs et de toute personne intéressée sont les bienvenues. Commencez par le [guide de contribution](/CONTRIBUTING.md) pour la configuration de l'environnement, les standards de code et l'ouverture d'une pull request. Consultez [RELEASING.md](../RELEASING.md) pour le processus de release de l'extension VS Code et de la CLI, et [packages/tavern-jetbrains/RELEASING.md](../packages/tavern-jetbrains/RELEASING.md) pour le plugin JetBrains.

Veuillez lire notre [Code de conduite](/CODE_OF_CONDUCT.md) avant de participer.

### Licence

MIT. Vous pouvez utiliser, modifier et distribuer ce code, y compris commercialement, tant que vous conservez les mentions d'attribution et de licence. Voir [License](/LICENSE).

### FAQ

<details>
<summary>D'où vient Tavern CLI ?</summary>

Tavern CLI est un fork d'[OpenCode](https://github.com/anomalyco/opencode), amélioré pour fonctionner au sein de la plateforme d'ingénierie agentique Tavern.

</details>

---

**Rejoindre la communauté** [Discord](https://tavern.ai/discord) | [X](https://x.com/taverncode) | [Reddit](https://www.reddit.com/r/taverncode/)
