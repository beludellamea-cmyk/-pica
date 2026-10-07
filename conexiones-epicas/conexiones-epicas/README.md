# CONEXIONES ÉPICAS

Explorá, descubrí y transformá un mundo donde todos podamos participar.

Prototipo web interactivo sobre inclusión para niños, jóvenes y adultos. Se explora un mundo ilustrado en perspectiva isométrica, se resuelven desafíos y se transforman los espacios para que más personas puedan acceder, comunicarse, participar y decidir.

Está hecho con HTML, CSS y JavaScript, sin dependencias externas. No necesita cuentas, micrófono, claves de API ni servidor, y no pide datos personales.

## Cómo abrirlo

1. Descomprimí el ZIP.
2. Abrí `index.html` con doble clic en un navegador actual: Chrome, Edge, Firefox o Safari.

No hace falta instalar nada. Si preferís usar un servidor local, desde la carpeta podés ejecutar:

```
python3 -m http.server 8000
```

Después abrí `http://localhost:8000`.

## Estructura

```
index.html          Página principal (estructura, diálogos de ayuda y accesibilidad)
css/styles.css      Identidad visual, adaptación a celulares, foco, contraste y movimiento
js/content.js       TODO el contenido editable: personajes, misiones, pistas, frases
js/scenes.js        Escenarios SVG isométricos originales, avatares y pictogramas
js/app.js           Motor: rutas, desafíos, comprobaciones, voz y guardado local
README.md           Este archivo
```

### Cómo editar el contenido

Para cambiar textos, personajes, opciones, consecuencias o frases de reflexión, editá solo `js/content.js`. El motor no necesita cambios.

- Cada misión tiene sus etapas: `choice`, `explore`, `consult`, `transform` (con su `type`) y `reflect`.
- Una opción con `unlockBy: 'nombre'` aparece recién después de consultar a esa persona.
- En `reflect.phrases`, el campo `when` decide en qué situación aparece cada frase. Las condiciones posibles son:
  - `always`: siempre.
  - `consultedAny`: si se consultó a alguien.
  - `failed: 'persona'`: si esa persona no pudo participar en algún intento.
  - `failedAny`: si alguien no pudo participar en algún intento.
  - `everSelected: 'opción'`: si se eligió esa opción alguna vez.
  - `flag`: según una marca interna de la misión.

## Qué incluye

**Pantalla de entrada.** Una isla con dos caminos y dos accesos: niños y jóvenes y adultos. Tiene botones de ESCUCHAR, AYUDA y OPCIONES DE ACCESIBILIDAD, y permite elegir modo individual o grupal.

**Desafío inicial "El mundo se desconectó".**
- Niños: buscar tres piezas en el paisaje y colocarlas según su forma. Se puede seleccionar y colocar con botones, o arrastrar.
- Jóvenes y adultos: un código de tres símbolos que surge de relacionar el cartel, el escenario y el mapa.
- Al resolverlo, el mundo se ilumina, pero el faro sigue apagado: "TODO ESTÁ LISTO… ¿TODOS PUEDEN PARTICIPAR?".

**Mapa.** Cuatro lugares por espacio, que se pueden recorrer en cualquier orden, más una misión final que se habilita al completar los cuatro.
- El contador "CONEXIONES ACTIVADAS" muestra el avance.
- Las transformaciones quedan visibles en el paisaje.
- Los lugares también aparecen como lista en el panel.

**Ocho misiones y dos finales**, todas con la dinámica EXPLORAR → ESCUCHAR Y CONSULTAR → TRANSFORMAR → COMPROBAR → REFLEXIONAR.

| Espacio | Misión | Mecánica |
|---|---|---|
| Niños | El patio de todos | Cambios que se suman y se quitan; las consultas abren opciones nuevas |
| Niños | El mensaje escondido | Pistas en texto, audio e imagen; reconstruir el mensaje y elegir cómo compartirlo |
| Niños | Todas las voces | Propuestas con palabras, pictogramas y gestos; esperar a quien tarda en responder |
| Niños | La gran construcción | Ubicar aportes en zonas según lo que necesita cada persona |
| Niños | La gran celebración (final) | Combina todo lo aprendido |
| Jóvenes y adultos | El evento está abierto… ¿para todos? | Barreras de acceso, comprensión, comunicación y decisión |
| Jóvenes y adultos | Repará la experiencia | Subtítulos, texto alternativo, lenguaje claro y contraste calculado en vivo |
| Jóvenes y adultos | ¿Quién tiene el control? | Decidir por otros, ofrecer opciones o consultar: afuera / asiste / participa / decide |
| Jóvenes y adultos | Efecto dominó | Relacionar consecuencias y elegir intervenciones con presupuesto, con efectos en cadena |
| Jóvenes y adultos | Activá tu mundo (final) | Presupuesto, varias soluciones válidas, justificación y asuntos pendientes |

**Otras funciones.**
- **Cambié de idea:** cada misión registra una elección inicial y la retoma al final, con opción de mantenerla, cambiarla o volver a probar. Nunca califica a la persona.
- **Pistas y secretos:** pistas en tres niveles, reintentos ilimitados y secretos opcionales (✦) que agregan detalles al mapa.
- **Modo grupal:** una pausa para conversar antes de confirmar cada comprobación.

## Accesibilidad

- **Teclado:** todo funciona con teclado y el foco está muy marcado (amarillo y azul marino). Cada punto del paisaje también aparece como botón en el panel.
- **Sin depender de un solo sentido:** ninguna actividad depende solo de arrastrar, del color o del sonido. Los estados llevan ícono y texto.
- **Voz:** está apagada por defecto. ESCUCHAR lee el panel y DETENER VOZ la corta. Todo lo hablado también está escrito. Hay una opción de lectura automática, que viene desactivada.
- **Ajustes de lectura:** cuatro tamaños de texto, modo de contraste alto y opción de reducir movimiento. Se respeta la preferencia de movimiento reducido del dispositivo.
- **Sin estímulos automáticos:** no hay destellos, sonido automático ni instrucciones que aparezcan solo al pasar el cursor.
- **Lectores de pantalla:** los cambios de estado se anuncian con una región `aria-live`, y el paisaje tiene una descripción textual que se actualiza con las transformaciones.

## Progreso

El progreso se guarda únicamente en el dispositivo, con `localStorage`. Para empezar de cero, usá "Reiniciar progreso" en OPCIONES DE ACCESIBILIDAD o en el mapa.

Si el navegador no permite guardar (por ejemplo, en algunos modos privados), el juego funciona igual: el progreso se conserva mientras la página siga abierta, y un aviso lo indica.

## Cómo probarlo rápido

- Para ver una comprobación parcial, entrá a "El evento está abierto…", agregá solo la rampa y tocá Comprobar. Se resuelve el acceso, pero quedan pendientes la comprensión, la comunicación y la decisión.
- Las soluciones están en la tercera pista de cada desafío.
  - Código adulto: Sol, Ola, Hoja.
  - Piezas infantiles: tabla en el puente, estrella en el escenario y piedra en el camino.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub (por ejemplo, `conexiones-epicas`).
2. Subí el contenido de la carpeta, con `index.html` en la raíz del repositorio. Desde la web podés usar "Add file → Upload files"; desde la terminal:

   ```
   git init
   git add .
   git commit -m "Conexiones Épicas"
   git branch -M main
   git remote add origin https://github.com/USUARIO/conexiones-epicas.git
   git push -u origin main
   ```

3. En el repositorio, entrá a **Settings → Pages**.
4. En "Build and deployment", elegí **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guardá.
5. En uno o dos minutos, el sitio queda en `https://USUARIO.github.io/conexiones-epicas/`.

Todas las rutas son relativas, así que funciona igual en una subcarpeta.
