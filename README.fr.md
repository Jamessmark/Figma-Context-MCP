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

La réduction de la quantité de contexte fournie au modèle contribue à rendre l'IA plus précise et les réponses plus pertinentes.

## Fonctionnalités Clés et Avantages

Alors que d'autres serveurs MCP Figma peuvent fournir des informations de base sur les nœuds, le **Serveur MCP Figma par Bao To** offre des capacités supérieures pour comprendre et utiliser votre système de design :

*   **Extraction complète des données de conception (`get_figma_data`)**: Récupère des informations détaillées sur vos fichiers Figma ou des nœuds spécifiques, simplifiant les structures Figma complexes en un format plus digestible pour l'IA.
*   **Téléchargements d'images précis (`download_figma_images`)**: Permet le téléchargement ciblé d'actifs d'images spécifiques (SVG, PNG) à partir de vos fichiers Figma.
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