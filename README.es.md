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

> **Nota:** Este servidor es una bifurcación del servidor MCP de Figma original de [Framelink Figma MCP server](https://www.npmjs.com/package/figma-developer-mcp), construido sobre su base para ofrecer capacidades mejoradas para flujos de trabajo de diseño impulsados por IA. Reconocemos y apreciamos el trabajo fundamental del equipo original de Framelink.

Proporcione a [Cursor](https://cursor.sh/) y otras herramientas de codificación impulsadas por IA acceso a sus archivos de Figma con este servidor de [Model Context Protocol](https://modelcontextprotocol.io/introduction), **Servidor MCP de Figma por Bao To**.

Cuando Cursor tiene acceso a los datos de diseño de Figma, puede ser significativamente mejor para implementar diseños con precisión en comparación con enfoques alternativos como pegar capturas de pantalla.

## Demostración

[Vea una demostración de la creación de una interfaz de usuario en Cursor con datos de diseño de Figma](https://youtu.be/4I4Zs2zg1Oo)

[![Vea el video](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

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

## Hacer más legibles los sistemas de diseño generados

Al usar este servidor MCP para generar tokens y documentación de diseño, notarás que los IDs internos de Figma (como `fill-hxq15en`) pueden hacer que el sistema sea difícil de mantener. La documentación del sistema de diseño generada es extensa, con IDs internos dispersos en múltiples archivos y secciones. Aquí hay un flujo de trabajo para transformar TODOS estos IDs en tokens semánticos:

### Flujo de trabajo de mapeo semántico

1. **Generar el sistema de diseño inicial**
   - Usar el servidor MCP para generar tokens y documentación de diseño inicial
   - Obtendrás múltiples archivos con IDs internos de Figma:
     * JSON de tokens de diseño
     * Variables CSS
     * Documentación de componentes
     * Guías de estilo
     * Ejemplos de uso

2. **Preparar captura de pantalla del sistema de colores**
   - En Figma, navegar a la página de estilos de color
   - Tomar una captura de pantalla clara que muestre:
     * Todas las muestras de color
     * Nombres y valores de colores
     * Agrupación/jerarquía de colores
   - Guardar la captura para referencia

3. **Usar IA para crear mapeo semántico completo**
   - En Cursor, compartir la captura del sistema de colores
   - Pedir a la IA que realice un mapeo completo
   - Ejemplo de prompt:
     ```
     "Tengo una captura de pantalla de mi sistema de colores Figma y los archivos del sistema de diseño generados.
     Por favor, ayuda a crear un mapeo semántico para TODAS las instancias de IDs internos en toda la documentación:
     1. Primero, analizar el sistema de colores en la imagen para entender el significado semántico de cada color
     2. Luego, buscar en todos los archivos generados para encontrar cada instancia de cada ID interno
     3. Crear un mapeo completo entre IDs y nombres semánticos
     4. Actualizar TODAS las ocurrencias en:
        - Archivos de tokens
        - Variables CSS
        - Documentación de componentes
        - Ejemplos de uso
        - Guías de estilo
     5. Asegurar consistencia en todo el sistema de diseño
     6. Generar documentación adicional incluyendo:
        - Guías de uso para los tokens semánticos
        - Ejemplos para diferentes contextos (componentes, temas)
        - Mejores prácticas para implementación
        - Patrones y combinaciones comunes
        - Consideraciones de accesibilidad"
     ```
   - La IA:
     * Analizará visualmente el sistema de colores
     * Buscará TODAS las instancias de cada ID
     * Creará un mapeo completo
     * Actualizará cada ocurrencia en todos los archivos
     * Mantendrá consistencia en todo
     * Creará documentación de soporte

4. **Archivos generados**
   La IA creará/actualizará TODOS los archivos relevantes:
   - `token-mapping.json` - Mapeo completo de ID a nombre semántico
   - `design_variables.css` - Variables CSS actualizadas
   - Todos los archivos de documentación con nombres semánticos
   - Ejemplos de componentes con nuevos nombres de tokens
   - Guías de estilo con referencias semánticas

### Ejemplo de transformación completa

Antes (a través de múltiples archivos):
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
Usar `var(--fill-hxq15en)` para acciones primarias
Borde: 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | Azul primario | #556AEB |
```

Después:
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
Usar `var(--color-primary-500)` para acciones primarias
Borde: 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | Azul primario | #556AEB |
```

### Mejores prácticas

1. **Captura de pantalla del sistema de colores**
   - Asegurar que TODOS los colores sean visibles
   - Incluir sistema de nombres completo
   - Mostrar jerarquía completa de colores
   - Capturar guías de uso

2. **Nombres semánticos**
   - Usar nombres consistentes basados en propósito
   - Seguir una jerarquía clara de nombres
   - Documentar relaciones entre colores
   - Incluir contexto de uso

3. **Actualizaciones completas**
   - Verificar que TODAS las instancias estén actualizadas
   - Revisar TODOS los archivos de documentación
   - Revisar TODOS los ejemplos de componentes
   - Validar TODAS las referencias

4. **Mantenimiento**
   - Mantener captura de pantalla actualizada
   - Volver a ejecutar mapeo completo cuando sea necesario
   - Verificar consistencia en TODOS los archivos
   - Documentar cualquier anulación manual

La IA también generará documentación adicional para ayudar a los desarrolladores a usar correctamente los tokens semánticos, incluyendo guías de uso y ejemplos para diferentes contextos (componentes, temas, etc.).

## Contribuir 