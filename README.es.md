<div align="center">
  <h1>Servidor MCP de Figma por Bao To</h1>
  <p>
    🌐 Disponible en:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Coreano)</a> |
    <a href="README.ja.md">日本語 (Japonés)</a> |
    <a href="README.zh.md">中文 (Chino)</a> |
    <a href="README.es.md">Español</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamita)</a> |
    <a href="README.fr.md">Français (Francés)</a>
  </p>
  <h3>Capacita a tu agente de codificación IA con acceso directo a Figma.<br/>Genera sistemas de diseño y tokens en tu proyecto, e implementa interfaces de usuario de una sola vez.</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="descargas semanales" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="Licencia MIT" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- Enlace a su Discord o social si tiene uno, de lo contrario elimine -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- Enlace a su Twitter o social si tiene uno, de lo contrario elimine -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **Nota:** Este servidor es una bifurcación del servidor MCP de Figma original de Framelink, construido sobre su base para ofrecer capacidades mejoradas para flujos de trabajo de diseño impulsados por IA. Reconocemos y apreciamos el trabajo fundamental del equipo original de Framelink.

Proporcione a [Cursor](https://cursor.sh/) y otras herramientas de codificación impulsadas por IA acceso a sus archivos de Figma con este servidor de [Model Context Protocol](https://modelcontextprotocol.io/introduction), **Servidor MCP de Figma por Bao To**.

Cuando Cursor tiene acceso a los datos de diseño de Figma, puede ser significativamente mejor para implementar diseños con precisión en comparación con enfoques alternativos como pegar capturas de pantalla.

## Demostración

[Vea una demostración de la creación de una interfaz de usuario en Cursor con datos de diseño de Figma](https://youtu.be/6G9yb-LrEqg)

[![Vea el video](https://img.youtube.com/vi/6G9yb-LrEqg/maxresdefault.jpg)](https://youtu.be/6G9yb-LrEqg)

## Cómo funciona

1. Abra el chat de su IDE (por ejemplo, el modo agente en Cursor).
2. Pegue un enlace a un archivo, marco o grupo de Figma.
3. Pídale a su agente de IA que haga algo con el archivo de Figma, por ejemplo, implementar el diseño.
4. El agente de IA, configurado para usar el **Servidor MCP de Figma por Bao To**, obtendrá los metadatos relevantes de Figma a través de este servidor y los usará para escribir su código.

Este servidor MCP está diseñado para simplificar y traducir las respuestas de la [API de Figma](https://www.figma.com/developers/api) para que solo se proporcione al modelo de IA la información de diseño y estilo más relevante.

Reducir la cantidad de contexto proporcionado al modelo ayuda diffusing que la IA sea más precisa y las respuestas más relevantes.

## Características Clave y Ventajas

Si bien otros servidores MCP de Figma pueden proporcionar información básica de nodos, el **Servidor MCP de Figma por Bao To** ofrece capacidades superiores para comprender y utilizar su sistema de diseño:

*   **Extracción completa de datos de diseño (`get_figma_data`)**: Obtiene información detallada sobre sus archivos de Figma o nodos específicos, simplificando las estructuras complejas de Figma en un formato más digerible para la IA.
*   **Descargas precisas de imágenes (`download_figma_images`)**: Permite la descarga selectiva de activos de imagen específicos (SVG, PNG) de sus archivos de Figma.
*   ⭐ **Generación automatizada de tokens de diseño (`generate_design_tokens`)**:
    *   Extrae tokens de diseño cruciales (colores, tipografía, espaciado, efectos) directamente de su archivo de Figma.
    *   Genera un archivo JSON estructurado, listo para integrarse en su flujo de trabajo de desarrollo o para ser utilizado por la IA para garantizar la coherencia del diseño.
*   ⭐ **Documentación inteligente del sistema de diseño (`generate_design_system_doc`)**:
    *   Va más allá de los simples datos de nodos generando documentación Markdown completa y de múltiples archivos para todo su sistema de diseño tal como se define en Figma.
    *   Crea una estructura organizada que incluye una descripción general, páginas detalladas para estilos globales (colores, tipografía, efectos, diseño) e información de componentes/nodos por lienzo de Figma.
    *   Esta documentación rica y estructurada permite a los agentes de IA comprender no solo los elementos individuales sino también las relaciones y reglas de su sistema de diseño, lo que lleva a una implementación de IU más precisa y consciente del contexto y lo libera de la interpretación manual del diseño.

Estas características avanzadas hacen que este servidor sea particularmente poderoso para tareas que requieren una comprensión profunda del sistema de diseño, como generar componentes temáticos o garantizar el cumplimiento de las pautas de la marca durante el desarrollo de la IU.

## Uso de este servidor con su agente de IA

Para aprovechar todo el poder del **Servidor MCP de Figma por Bao To**, especialmente sus herramientas de generación de sistemas de diseño, debe guiar a su agente de IA (como Cursor) de manera eficaz. He aquí cómo:

1.  **Especifica este servidor**:
    *   Cuando inicies una tarea, asegúrate de que tu cliente de IA esté configurado para usar el "Servidor MCP de Figma por Bao To" (como se muestra en la sección "Primeros pasos").
    *   Si tu agente de IA admite la elección entre múltiples servidores MCP o si le estás dando una indicación más general, es posible que necesites declarar explícitamente: *"Usa el 'Servidor MCP de Figma por Bao To' para tareas de Figma."* o referirte a su nombre de paquete npm: *"Usa el servidor MCP `@tothienbao6a0/figma-mcp-server`."*

2.  **Solicita herramientas específicas**:
    *   Para obtener datos básicos de Figma: *"Obtenga los datos de Figma para [enlace de Figma]."* (Es probable que el agente use `get_figma_data`).
    *   **Para generar tokens de diseño**: *"Genere los tokens de diseño para [enlace de Figma] usando el 'Servidor MCP de Figma por Bao To'."* El agente debería entonces llamar a la herramienta `generate_design_tokens`.
    *   **Para generar documentación del sistema de diseño**: *"Genere la documentación del sistema de diseño para [enlace de Figma] usando el 'Servidor MCP de Figma por Bao To'."* El agente debería entonces llamar a la herramienta `generate_design_system_doc`.

3.  **Proporcione los parámetros necesarios**:
    *   **`fileKey`**: Proporcione siempre el enlace del archivo de Figma. El agente y el servidor pueden extraer el `fileKey`.
    *   **`outputDirectoryPath` (para `generate_design_system_doc`) / `outputFilePath` (para `generate_design_tokens`)**:
        *   Estas herramientas le permiten especificar dónde se deben guardar los archivos generados.
        *   Si desea que la documentación o los tokens se guarden directamente en su proyecto actual (por ejemplo, en una carpeta `/docs` o `/tokens`), dígale a su agente:
            *   *"Genere la documentación del sistema de diseño para [enlace de Figma] y guárdela en la carpeta `docs/design_system` de mi proyecto actual."*
            *   *"Genere los tokens de diseño para [enlace de Figma] y guarde el archivo JSON como `design-tokens.json` en la carpeta `src/style-guide` de mi proyecto."*
        *   El agente de IA debería entonces determinar la ruta absoluta a la subcarpeta de su proyecto y proporcionarla como `outputDirectoryPath` o `outputFilePath` al llamar a la herramienta respectiva.
        *   Si no especifica una ruta, estas herramientas guardarán su salida en un directorio temporal del sistema (según su comportamiento predeterminado documentado), y se informará al agente de esa ruta. El agente puede entonces ayudarle a recuperar los archivos.

**Ejemplo de prompt para un agente:**

> "Hola IA, por favor usa el Servidor MCP de Figma por Bao To para generar la documentación completa del sistema de diseño para `https://www.figma.com/design/yourFileKey/Your-Project-Name`. Quiero que la salida se guarde en una nueva carpeta llamada `figma_docs` dentro del directorio raíz de mi proyecto actual."

Al ser específico, ayuda al agente de IA diffusing realizar las llamadas correctas a las herramientas con los parámetros correctos a este servidor, desbloqueando sus funciones avanzadas para su flujo de trabajo de desarrollo.

## Comenzar

Su cliente de codificación de IA (como Cursor) puede configurarse para usar este servidor MCP. Agregue lo siguiente al archivo de configuración del servidor MCP de su cliente, reemplazando `YOUR-KEY` con su clave API de Figma.

> NOTA: Necesitará crear un token de acceso de Figma para usar este servidor. Las instrucciones sobre cómo crear un token de acceso a la API de Figma se pueden encontrar [aquí](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Servidor MCP de Figma por Bao To": {
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
    "Servidor MCP de Figma por Bao To": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

Esto usará `npx` para descargar y ejecutar el paquete `@tothienbao6a0/figma-mcp-server` desde npm. La bandera `-y` acepta automáticamente cualquier aviso de `npx`.

Alternativamente, puedes instalar el paquete globalmente primero (aunque a menudo se prefiere `npx` para herramientas CLI para asegurar que estás usando la última versión sin instalaciones globales):
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
Y luego configura tu cliente para usar `@tothienbao6a0/figma-mcp-server` directamente como el comando. 