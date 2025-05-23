<div align="center">
  <h1>Serveur MCP Figma par Bao To</h1>
  <p>
    🌐 Disponible en :
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Coréen)</a> |
    <a href="README.ja.md">日本語 (Japonais)</a> |
    <a href="README.zh.md">中文 (Chinois)</a> |
    <a href="README.es.md">Español (Espagnol)</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamien)</a> |
    <a href="README.fr.md">Français</a>
  </p>
  <h3>Donnez à votre agent de codage IA un accès direct à Figma.<br/>Générez des systèmes de design et des tokens dans votre projet, et implémentez des UI en une seule fois.</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="téléchargements hebdomadaires" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="Licence MIT" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- Lien vers votre Discord ou réseau social si vous en avez un, sinon supprimez -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- Lien vers votre Twitter ou réseau social si vous en avez un, sinon supprimez -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **Remarque :** Ce serveur est un fork du serveur MCP Figma original de [Framelink Figma MCP server](https://www.npmjs.com/package/figma-developer-mcp), construit sur ses fondations pour offrir des capacités améliorées pour les flux de travail de conception pilotés par l'IA. Nous reconnaissons et apprécions le travail fondamental de l'équipe Framelink originale.

Donnez à [Cursor](https://cursor.sh/) et à d'autres outils de codage basés sur l'IA l'accès à vos fichiers Figma avec ce serveur [Model Context Protocol](https://modelcontextprotocol.io/introduction), **Serveur MCP Figma par Bao To**.

Lorsque Cursor a accès aux données de conception Figma, il peut être nettement meilleur pour implémenter des conceptions avec précision par rapport à des approches alternatives comme le collage de captures d'écran.

## Démo

[Regardez une démo de la création d'une interface utilisateur dans Cursor avec les données de conception Figma](https://youtu.be/4I4Zs2zg1Oo)

[![Regardez la vidéo](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## Comment ça marche

1. Ouvrez le chat de votre IDE (par exemple, le mode agent dans Cursor).
2. Collez un lien vers un fichier, un cadre ou un groupe Figma.
3. Demandez à votre agent IA de faire quelque chose avec le fichier Figma, par exemple, implémenter le design.
4. L'agent IA, configuré pour utiliser le **Serveur MCP Figma par Bao To**, récupérera les métadonnées pertinentes de Figma via ce serveur et les utilisera pour écrire votre code.

Ce serveur MCP est conçu pour simplifier et traduire les réponses de l'[API Figma](https://www.figma.com/developers/api) afin que seules les informations de mise en page et de style les plus pertinentes soient fournies au modèle IA.

Réduire la quantité de contexte fourni au modèle aide à rendre l'IA plus précise et les réponses plus pertinentes.

## Limitations du Plan

⚠️ **Note Importante concernant l'API Variables de Figma**

La fonction `get_figma_variables` nécessite un **plan Enterprise de Figma**. Cette limitation est imposée par Figma, pas par ce serveur MCP :

- ✅ **Disponible sur TOUS les plans** : `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- ❌ **Enterprise uniquement** : `get_figma_variables` (accès à l'API REST Variables)

**Pourquoi cette limitation existe :**
- Figma restreint l'accès à l'API Variables aux plans Enterprise uniquement
- Les utilisateurs des plans Starter, Professional ou Organization recevront des erreurs `403 Forbidden`
- C'est une décision commerciale de Figma pour stimuler les ventes Enterprise

**Alternatives pour les utilisateurs non-Enterprise :**
- Utiliser `generate_design_tokens` - extrait des informations de style similaires de vos designs
- Utiliser l'API Plugin de Figma (nécessite de construire un plugin personnalisé)
- Exporter manuellement les variables depuis l'interface Figma

Pour plus de détails, voir la [documentation officielle de Figma sur les fonctionnalités des plans](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features).

## Fonctionnalités Clés et Avantages

Alors que d'autres serveurs MCP Figma peuvent fournir des informations de nœud de base, **le Serveur MCP Figma par Bao To** offre des capacités supérieures pour comprendre et utiliser votre système de design :

*   **Extraction Complète de Données de Design (`get_figma_data`)** : Récupère des informations détaillées sur vos fichiers Figma ou nœuds spécifiques, simplifiant les structures Figma complexes en un format plus digestible pour l'IA.
*   **Téléchargements d'Images Précis (`download_figma_images`)** : Permet le téléchargement ciblé d'actifs d'image spécifiques (SVG, PNG) depuis vos fichiers Figma.
*   ⭐ **Extraction de Variables Figma (`get_figma_variables`)** ⚠️ **Nécessite un Plan Enterprise Figma** :
    *   Récupère toutes les variables et collections de variables directement depuis votre fichier Figma en utilisant l'API Variables de Figma.
    *   **⚠️ IMPORTANT** : Cette fonctionnalité ne fonctionne qu'avec les **plans Enterprise de Figma**. Les utilisateurs des plans Starter, Professional ou Organization recevront une erreur 403 Forbidden en tentant d'accéder aux variables via l'API REST.
    *   Les Variables sont le système de valeurs dynamiques de Figma qui peut stocker des couleurs, nombres, chaînes et booléens avec différents modes/thèmes.
    *   Différent des tokens de design : Les Variables sont une fonctionnalité spécifique de Figma pour créer des valeurs dynamiques et conscientes du mode, tandis que les tokens de design sont des valeurs de style extraites du design.
    *   Supporte à la fois les variables locales (toutes les variables dans le fichier) et les variables publiées (celles publiées dans la bibliothèque d'équipe).
    *   Produit des données structurées montrant les collections de variables, modes et valeurs pour chaque mode.
    *   **Alternative** : Pour les utilisateurs non-Enterprise, utilisez la fonction `generate_design_tokens` qui extrait des informations de style similaires et fonctionne sur tous les plans Figma.
*   ⭐ **Génération automatisée de tokens de design (`generate_design_tokens`)**:
    *   Extrait les tokens de design cruciaux (couleurs, typographie, espacement, effets) directement de votre fichier Figma.
    *   Produit un fichier JSON structuré, prêt à être intégré dans votre flux de travail de développement ou utilisé par l'IA pour garantir la cohérence du design.
*   ⭐ **Documentation intelligente du système de design (`generate_design_system_doc`)**:
    *   Va au-delà des simples données de nœuds en générant une documentation Markdown complète et multi-fichiers pour l'ensemble de votre système de design tel que défini dans Figma.
    *   Crée une structure organisée comprenant un aperçu, des pages détaillées pour les styles globaux (couleurs, typographie, effets, mise en page) et des informations sur les composants/nœuds par canevas Figma.
    *   Cette documentation riche et structurée permet aux agents IA de comprendre non seulement les éléments individuels, mais aussi les relations et les règles de votre système de design, ce qui conduit à une implémentation d'interface utilisateur plus précise et contextuelle et vous libère de l'interprétation manuelle du design.

Ces fonctionnalités avancées rendent ce serveur particulièrement puissant pour les tâches nécessitant une compréhension approfondie du système de design, telles que la génération de composants thématiques ou la garantie du respect des directives de la marque lors du développement de l'interface utilisateur.

## Utilisation de ce serveur avec votre agent IA

Pour exploiter toute la puissance du **Serveur MCP Figma par Bao To**, en particulier ses outils de génération de systèmes de design, vous devez guider efficacement votre agent IA (comme Cursor). Voici comment :

1.  **Spécifiez ce serveur** :
    *   Lorsque vous démarrez une tâche, assurez-vous que votre client IA est configuré pour utiliser le "Serveur MCP Figma par Bao To" (comme indiqué dans la section "Mise en route").
    *   Si votre agent IA prend en charge le choix entre plusieurs serveurs MCP ou si vous lui donnez une instruction plus générale, vous devrez peut-être indiquer explicitement : *"Utilisez le 'Serveur MCP Figma par Bao To' pour les tâches Figma."* ou vous référer à son nom de package npm : *"Utilisez le serveur MCP `@tothienbao6a0/figma-mcp-server`."*

2.  **Demandez des outils spécifiques** :
    *   Pour obtenir des données Figma de base : *"Obtenez les données Figma pour [lien Figma]."* (L'agent utilisera probablement `get_figma_data`).
    *   **Pour générer des tokens de design** : *"Générez les tokens de design pour [lien Figma] en utilisant le 'Serveur MCP Figma par Bao To'."* L'agent devrait alors appeler l'outil `generate_design_tokens`.
    *   **Pour générer la documentation du système de design** : *"Générez la documentation du système de design pour [lien Figma] en utilisant le 'Serveur MCP Figma par Bao To'."* L'agent devrait alors appeler l'outil `generate_design_system_doc`.

3.  **Fournissez les paramètres nécessaires** :
    *   **`fileKey`** : Fournissez toujours le lien du fichier Figma. L'agent et le serveur peuvent extraire la `fileKey`.
    *   **`outputDirectoryPath` (pour `generate_design_system_doc`) / `outputFilePath` (pour `generate_design_tokens`)** :
        *   Ces outils vous permettent de spécifier où les fichiers générés doivent être enregistrés.
        *   Si vous souhaitez que la documentation ou les tokens soient enregistrés directement dans votre projet actuel (par exemple, dans un dossier `/docs` ou `/tokens`), dites à votre agent :
            *   *"Générez la documentation du système de design pour [lien Figma] et enregistrez-la dans le dossier `docs/design_system` de mon projet actuel."*
            *   *"Générez les tokens de design pour [lien Figma] et enregistrez le fichier JSON sous `design-tokens.json` dans le dossier `src/style-guide` de mon projet."*
        *   L'agent IA devrait alors déterminer le chemin absolu vers le sous-dossier de votre projet et le fournir en tant que `outputDirectoryPath` ou `outputFilePath` lors de l'appel de l'outil respectif.
        *   Si vous ne spécifiez pas de chemin, ces outils enregistreront leur sortie dans un répertoire temporaire du système (conformément à leur comportement par défaut documenté), et l'agent sera informé de ce chemin. L'agent pourra alors vous aider à récupérer les fichiers.

**Exemple de prompt pour un agent :**

> "Salut IA, veuillez utiliser le Serveur MCP Figma par Bao To pour générer la documentation complète du système de design pour `https://www.figma.com/design/yourFileKey/Your-Project-Name`. Je souhaite que la sortie soit enregistrée dans un nouveau dossier appelé `figma_docs` à l'intérieur du répertoire racine de mon projet actuel."

En étant spécifique, vous aidez l'agent IA à effectuer les appels d'outils corrects avec les bons paramètres vers ce serveur, débloquant ses fonctionnalités avancées pour votre flux de travail de développement.

## Mise en route

Votre client de codage IA (comme Cursor) peut être configuré pour utiliser ce serveur MCP. Ajoutez ce qui suit au fichier de configuration du serveur MCP de votre client, en remplaçant `YOUR-KEY` par votre clé API Figma.

> REMARQUE : Vous devrez créer un jeton d'accès Figma pour utiliser ce serveur. Les instructions sur la façon de créer un jeton d'accès à l'API Figma se trouvent [ici](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Serveur MCP Figma par Bao To": {
      "command": "npx",
      "args": ["-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "Serveur MCP Figma par Bao To": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

Cela utilisera `npx` pour télécharger et exécuter le package `@tothienbao6a0/figma-mcp-server` depuis npm. L'indicateur `-y` accepte automatiquement toutes les invites de `npx`.

Alternativement, vous pouvez d'abord installer le package globalement (bien que `npx` soit souvent préféré pour les outils CLI afin de s'assurer que vous utilisez la dernière version sans installation globale) :
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
Et configurez ensuite votre client pour qu'il utilise `@tothienbao6a0/figma-mcp-server` directement comme commande. 

## Rendre les systèmes de design générés plus lisibles

Lors de l'utilisation de ce serveur MCP pour générer des tokens de design et de la documentation, vous remarquerez que les ID internes de Figma (comme `fill-hxq15en`) peuvent rendre le système difficile à maintenir. La documentation du système de design générée est vaste, avec des ID internes dispersés dans plusieurs fichiers et sections. Voici un flux de travail pour transformer TOUS ces ID en tokens sémantiques :

### Flux de travail de mappage sémantique

1. **Générer le système de design initial**
   - Utiliser le serveur MCP pour générer les tokens de design et la documentation initiale
   - Vous obtiendrez plusieurs fichiers avec des ID internes Figma :
     * JSON des tokens de design
     * Variables CSS
     * Documentation des composants
     * Guides de style
     * Exemples d'utilisation

2. **Préparer la capture d'écran du système de couleurs**
   - Dans Figma, naviguer vers la page des styles de couleurs
   - Prendre une capture d'écran claire montrant :
     * Tous les échantillons de couleurs
     * Noms et valeurs des couleurs
     * Groupement/hiérarchie des couleurs
   - Sauvegarder la capture pour référence

3. **Utiliser l'IA pour créer un mappage sémantique complet**
   - Dans Cursor, partager la capture du système de couleurs
   - Demander à l'IA d'effectuer un mappage complet
   - Exemple de prompt :
     ```
     "J'ai une capture d'écran de mon système de couleurs Figma et les fichiers du système de design générés.
     Veuillez aider à créer un mappage sémantique pour TOUTES les instances d'ID internes dans toute la documentation :
     1. D'abord, analyser le système de couleurs dans l'image pour comprendre la signification sémantique de chaque couleur
     2. Ensuite, rechercher dans tous les fichiers générés pour trouver chaque instance de chaque ID interne
     3. Créer un mappage complet entre les ID et les noms sémantiques
     4. Mettre à jour TOUTES les occurrences dans :
        - Fichiers de tokens
        - Variables CSS
        - Documentation des composants
        - Exemples d'utilisation
        - Guides de style
     5. Assurer la cohérence dans tout le système de design
     6. Générer une documentation supplémentaire incluant :
        - Directives d'utilisation des tokens sémantiques
        - Exemples pour différents contextes (composants, thèmes)
        - Meilleures pratiques pour l'implémentation
        - Motifs et combinaisons courants
        - Considérations d'accessibilité"
     ```
   - L'IA va :
     * Analyser visuellement le système de couleurs
     * Rechercher TOUTES les instances de chaque ID
     * Créer un mappage complet
     * Mettre à jour chaque occurrence dans tous les fichiers
     * Maintenir la cohérence globale
     * Créer la documentation de support

4. **Fichiers générés**
   L'IA créera/mettra à jour TOUS les fichiers pertinents :
   - `token-mapping.json` - Mappage complet des ID vers les noms sémantiques
   - `design_variables.css` - Variables CSS mises à jour
   - Tous les fichiers de documentation avec des noms sémantiques
   - Exemples de composants avec les nouveaux noms de tokens
   - Guides de style avec références sémantiques

### Exemple de transformation complète

Avant (à travers plusieurs fichiers) :
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
Utiliser `var(--fill-hxq15en)` pour les actions primaires
Bordure : 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | Bleu primaire | #556AEB |
```

Après :
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
Utiliser `var(--color-primary-500)` pour les actions primaires
Bordure : 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | Bleu primaire | #556AEB |
```

### Meilleures pratiques

1. **Capture d'écran du système de couleurs**
   - S'assurer que TOUTES les couleurs sont visibles
   - Inclure le système de nommage complet
   - Montrer la hiérarchie complète des couleurs
   - Capturer les directives d'utilisation

2. **Nommage sémantique**
   - Utiliser des noms cohérents basés sur l'objectif
   - Suivre une hiérarchie de nommage claire
   - Documenter les relations entre les couleurs
   - Inclure le contexte d'utilisation

3. **Mises à jour complètes**
   - Vérifier que TOUTES les instances sont mises à jour
   - Vérifier TOUS les fichiers de documentation
   - Examiner TOUS les exemples de composants
   - Valider TOUTES les références

4. **Maintenance**
   - Garder la capture d'écran à jour
   - Réexécuter le mappage complet si nécessaire
   - Vérifier la cohérence dans TOUS les fichiers
   - Documenter toute substitution manuelle

L'IA générera également une documentation supplémentaire pour aider les développeurs à utiliser correctement les tokens sémantiques, y compris des directives d'utilisation et des exemples pour différents contextes (composants, thèmes, etc.).

## Contribuer 