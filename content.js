/* =========================================================
   CONEXIONES ÉPICAS · content.js
   Todo el contenido editable está acá: textos, personajes,
   pistas, opciones, consecuencias y frases de reflexión.
   La lógica (app.js) lee estos datos; para cambiar una misión
   no hace falta tocar el motor.
   ========================================================= */
window.CONTENT = (function () {
  'use strict';

  /* ---------- Personajes ---------- */
  var PEOPLE = {
    // Espacio infantil
    mati: { name: 'Mati', about: 'Sabe el nombre de veinte dinosaurios. Se mueve en silla de ruedas.', look: { body: '#FF6B57', skin: '#8D5A3B', hair: '#1A1210', wheel: true, bg: '#FFE3DE' } },
    lia: { name: 'Lía', about: 'Inventa canciones y las canta bajito. Los ruidos muy fuertes la aturden.', look: { body: '#FFC83D', skin: '#F1C7A3', hair: '#C2562E', hairStyle: 'long', phones: true, bg: '#FFF4D6' } },
    tomi: { name: 'Tomi', about: 'Dibuja mapas de todo lo que ve. Entiende mejor las reglas cuando tienen dibujos.', look: { body: '#17BFAE', skin: '#C98B62', hairStyle: 'cap', cap: '#1F4FD8', bg: '#DDF8F4' } },
    sofi: { name: 'Sofi', about: 'Corre rapidísimo. Habla con lengua de señas y gestos; no escucha los silbatos.', look: { body: '#1F4FD8', skin: '#6B4430', hair: '#1A1210', hairStyle: 'curly', bg: '#E1E9FF' } },
    juli: { name: 'Juli', about: 'Le encantan el viento y los barriletes. Se comunica con los pictogramas de su tablero.', look: { body: '#9B7BFF', skin: '#E0A882', hair: '#5A3A20', hairStyle: 'bun', bg: '#EEE8FF' } },
    nina: { name: 'Nina', about: 'Colecciona piedras y sabe historias de piratas. Piensa un rato antes de responder.', look: { body: '#FF6B57', skin: '#C98B62', hair: '#3A2A20', hairStyle: 'long', bg: '#FFE3DE' } },
    fede: { name: 'Fede', about: 'Juega al fútbol todos los días y siempre propone primero.', look: { body: '#FFC83D', skin: '#F1C7A3', hair: '#7A4A20', bg: '#FFF4D6' } },
    leo: { name: 'Leo', about: 'Lee todo lo que encuentra, hasta los carteles de la calle.', look: { body: '#17BFAE', skin: '#8D5A3B', hair: '#1A1210', glasses: true, bg: '#DDF8F4' } },
    // Espacio de jóvenes y adultos
    carla: { name: 'Carla', about: 'Organiza la feria del barrio hace diez años. Usa silla de ruedas.', look: { body: '#FF6B57', skin: '#8D5A3B', hair: '#1A1210', hairStyle: 'long', wheel: true, bg: '#FFE3DE' } },
    bruno: { name: 'Bruno', about: 'Fotógrafo y muralista. Es sordo y se comunica en lengua de señas argentina (LSA).', look: { body: '#1F4FD8', skin: '#F1C7A3', hair: '#7A4A20', camera: true, bg: '#E1E9FF' } },
    ines: { name: 'Inés', about: 'Jubilada, dirige el coro del barrio. Lee mejor con letra grande y frases claras.', look: { body: '#9B7BFF', skin: '#E0A882', hair: '#D6D6D6', hairStyle: 'bun', glasses: true, bg: '#EEE8FF' } },
    ramiro: { name: 'Ramiro', about: 'Arquero del club y trabajador de la cooperativa. Prefiere la información en lectura fácil.', look: { body: '#FFC83D', skin: '#6B4430', hair: '#1A1210', hairStyle: 'cap', cap: '#17BFAE', bg: '#FFF4D6' } },
    ana: { name: 'Ana', about: 'Conduce un podcast de música. Es ciega y navega con lector de pantalla.', look: { body: '#17BFAE', skin: '#C98B62', hair: '#3A2A20', hairStyle: 'curly', cane: true, bg: '#DDF8F4' } }
  };

  /* ---------- Textos generales ---------- */
  var UI = {
    title: 'CONEXIONES ÉPICAS',
    subtitle: 'Explorá, descubrí y transformá un mundo donde todos podamos participar.',
    accessKids: 'NIÑOS · CONECTAMOS JUGANDO',
    accessAdults: 'JÓVENES Y ADULTOS · ACTIVAMOS EL CAMBIO',
    introMystery: 'HAY ALGO QUE ESTE MUNDO TODAVÍA NO TE MOSTRÓ. ¿PODÉS DESCUBRIRLO?',
    introButton: 'ACTIVAR EL MUNDO',
    twist: 'TODO ESTÁ LISTO… ¿TODOS PUEDEN PARTICIPAR?',
    steps: ['EXPLORAR', 'ESCUCHAR Y CONSULTAR', 'TRANSFORMAR', 'COMPROBAR', 'REFLEXIONAR'],
    changeMind: '¿La mantendrías o la cambiarías? ¿Qué descubriste?',
    groupPause: 'Antes de confirmar, conversen un momento: ¿qué eligió cada persona del grupo y por qué? ¿Alguien ve algo distinto?'
  };

  /* ---------- Espacios ---------- */
  var SPACES = {
    ninos: {
      id: 'ninos', name: 'Niños', label: 'NIÑOS · CONECTAMOS JUGANDO', scene: 'hubK', theme: 'kids',
      islands: { patio: 'P', mensaje: 'M', voces: 'V', construccion: 'B', celebracion: 'C' },
      missions: ['patio', 'mensaje', 'voces', 'construccion'], final: 'celebracion',
      hubIntro: 'Cada isla esconde un desafío. Elegí por dónde empezar: podés ir en el orden que quieras.',
      finalLocked: 'El faro de la plaza se enciende cuando actives las cuatro islas.',
      closingQuestion: '¿Qué podemos cambiar en nuestro aula para que todos participemos?',
      closingIdeas: ['Instrucciones con dibujos', 'Un rincón tranquilo', 'Esperar a que cada uno responda', 'Votar con pictogramas', 'Caminos sin obstáculos entre los bancos', 'Avisos escritos, hablados y dibujados'],
      intro: {
        type: 'pieces',
        play: 'Buscá tres piezas escondidas en las islas. Después, llevá cada una al lugar donde encaja: cada hueco tiene su forma dibujada.',
        pieces: [
          { id: 'tabla', name: 'Tabla de madera', shape: 'larga y rectangular', picto: 'tabla', spot: 'piece-tabla', where: 'Mirar entre los bloques', foundText: 'Encontraste una tabla de madera: es larga y rectangular.' },
          { id: 'estrella', name: 'Estrella de luz', shape: 'con cinco puntas', picto: 'estrella', spot: 'piece-estrella', where: 'Mirar junto al buzón', foundText: 'Encontraste una estrella de luz con cinco puntas.' },
          { id: 'piedra', name: 'Piedra redonda', shape: 'redonda', picto: 'piedra', spot: 'piece-piedra', where: 'Mirar en la ronda', foundText: 'Encontraste una piedra redonda y lisa.' }
        ],
        slots: [
          { id: 'tabla', name: 'Hueco del puente', shape: 'largo y rectangular', spot: 'slot-tabla', done: 'La tabla encajó: el puente quedó completo.' },
          { id: 'estrella', name: 'Marco del escenario', shape: 'con forma de estrella', spot: 'slot-estrella', done: 'La estrella encajó: el escenario se enciende.' },
          { id: 'piedra', name: 'Pozo del camino', shape: 'redondo', spot: 'slot-piedra', done: 'La piedra encajó: el camino está conectado.' }
        ],
        hints: [
          'Recorré las islas de afuera: en tres de ellas hay algo que no pertenece a ese lugar.',
          'Cada hueco tiene su forma dibujada con línea de puntos. Compará la forma de la pieza con la del hueco.',
          'La tabla va en el puente, la estrella en el escenario y la piedra en el camino.'
        ],
        lit: 'El mundo se encendió: el puente está completo, el escenario brilla y los caminos se unieron. Pero el faro de la plaza sigue apagado.'
      }
    },
    adultos: {
      id: 'adultos', name: 'Jóvenes y adultos', label: 'JÓVENES Y ADULTOS · ACTIVAMOS EL CAMBIO', scene: 'hubA', theme: 'adults',
      islands: { evento: 'P', reparar: 'M', control: 'V', domino: 'B', activa: 'C' },
      missions: ['evento', 'reparar', 'control', 'domino'], final: 'activa',
      hubIntro: 'Cuatro lugares, cuatro situaciones reales. Investigá en el orden que prefieras.',
      finalLocked: 'El faro de la plaza se enciende cuando actives los cuatro lugares.',
      closingQuestion: '¿Qué barrera podrías cambiar mañana, en un lugar del que vos formás parte?',
      closingIdeas: ['Una entrada con escalones', 'Un aviso difícil de entender', 'Un video sin subtítulos', 'Decisiones que se toman sin consultar', 'Un horario que deja gente afuera', 'Imágenes publicadas sin descripción'],
      intro: {
        type: 'code',
        play: 'Para encender la red hace falta un código de tres símbolos. Las pistas están repartidas en tres lugares del mapa: el cartel, el escenario y el mapa. Relacionalas.',
        symbols: [
          { id: 'ola', name: 'Ola', picto: 'ola' },
          { id: 'sol', name: 'Sol', picto: 'sol' },
          { id: 'hoja', name: 'Hoja', picto: 'hoja' },
          { id: 'llave', name: 'Llave', picto: 'llave' }
        ],
        solution: ['sol', 'ola', 'hoja'],
        clues: [
          { id: 'cartel', spot: 'cartel', name: 'Cartel de la plaza', text: 'PARA ENCENDER LA RED: anotá el símbolo de cada lugar por el que pasa el recorrido, en el orden en que lo visitás. Los lugares que quedan fuera del recorrido no cuentan.' },
          { id: 'escenario', spot: 'escenario', name: 'Banderas del escenario', text: 'Cada bandera muestra un lugar y su símbolo. Torre: Sol. Mirador: Llave. Jardín: Hoja. Puente: Ola.' },
          { id: 'mapa', spot: 'mapa', name: 'Mapa del archipiélago', text: 'Recorrido marcado: sale de la entrada, pasa primero por el edificio más alto, después cruza sobre el agua y termina entre los árboles, antes de llegar al escenario. El mirador queda a un costado.' }
        ],
        hints: [
          'El cartel dice qué buscar; las banderas, qué símbolo tiene cada lugar; el mapa, en qué orden se visitan.',
          'Traducí el mapa a nombres de lugares: el edificio más alto es la Torre; lo que cruza sobre el agua es el Puente; el lugar con árboles es el Jardín.',
          'El orden es Torre, Puente, Jardín. Buscá sus símbolos en las banderas.'
        ],
        lit: 'La red se encendió: el puente se completó y el escenario muestra su pantalla. Pero el faro de la plaza sigue apagado.'
      }
    }
  };

  /* =========================================================
     MISIONES
     Etapas: elección inicial → EXPLORAR → ESCUCHAR Y CONSULTAR
     → TRANSFORMAR → COMPROBAR → REFLEXIONAR
     ========================================================= */
  var MISSIONS = {

    /* ---------------- NIÑOS 1 ---------------- */
    patio: {
      space: 'ninos', title: 'EL PATIO DE TODOS', scene: 'patio', icon: 'pelota',
      teaser: 'Un patio con juegos… ¿para quiénes?',
      intro: 'Llegó un patio nuevo. Mirá bien: ¿todos pueden jugar acá?',
      choice: { q: 'Antes de empezar: si tuvieras que mejorar el patio, ¿qué harías primero?', options: ['Pintarlo de colores', 'Poner más juegos', 'Preguntar a quienes juegan', 'Arreglar los caminos'] },
      explore: {
        prompt: 'Tocá los cuatro lugares marcados para mirar el patio de cerca.',
        spots: [
          { id: 'camino', anchor: 'camino', label: 'El camino', text: 'El camino desde la entrada está hecho de piedras sueltas. Algunas se mueven cuando las pisás.' },
          { id: 'tobogan', anchor: 'tobogan', label: 'El tobogán', text: 'El tobogán es alto. Para subir hay una escalera, nada más.' },
          { id: 'cartel', anchor: 'cartel', label: 'El cartel', text: 'El cartel tiene muchas reglas escritas en letra chica. No tiene ningún dibujo.' },
          { id: 'tambores', anchor: 'tambores', label: 'Los tambores', text: 'Los tambores suenan muy fuerte. Se escuchan desde cualquier rincón del patio.' }
        ]
      },
      consult: {
        prompt: 'Cada chica y cada chico tiene ideas propias. Preguntales qué piensan del patio.',
        people: [
          { id: 'mati', idea: '¡Una búsqueda de huellas de dinosaurio por todo el patio!', says: 'Las piedras sueltas me traban las ruedas. Y al tobogán no llego por la escalera.', unlocks: ['camino_liso', 'huellas'] },
          { id: 'lia', idea: 'Jugar a las estatuas con canciones suaves.', says: 'Cuando suenan los tambores me tapo los oídos y me voy. Me gustaría un rincón más tranquilo.', unlocks: ['tambores_suaves', 'rincon_tranquilo'] },
          { id: 'tomi', idea: 'Dibujar un mapa del patio para que nadie se pierda.', says: 'Las reglas escritas son larguísimas. Con dibujos las entiendo enseguida.', unlocks: ['reglas_dibujos'] },
          { id: 'sofi', idea: 'Una carrera de postas con tramos para todos.', says: '(En señas) Yo no escucho el silbato. Si alguien levanta un banderín, veo cuándo empieza el juego.', unlocks: ['senal_visual'] }
        ]
      },
      transform: {
        type: 'toggle',
        prompt: 'Elegí qué cambios hacer en el patio. Podés sumar y sacar todas las veces que quieras.',
        options: [
          { id: 'pintar', label: 'Pintar todo de colores', effect: 'El patio quedó muy colorido. Se ve lindo, pero nadie llega más fácil a los juegos.' },
          { id: 'rampa', label: 'Rampa para subir al tobogán', icon: 'mano' },
          { id: 'mas_tambores', label: 'Sumar más tambores', effect: 'Hay más tambores y el patio suena todavía más fuerte.' },
          { id: 'silbato', label: 'Silbato bien fuerte para empezar', effect: 'El silbato se escucha en todo el patio.' },
          { id: 'mas_reglas', label: 'Agregar más reglas escritas al cartel', effect: 'El cartel quedó todavía más largo.' },
          { id: 'camino_liso', label: 'Camino liso desde la entrada', unlockBy: 'mati' },
          { id: 'huellas', label: 'Huellas de dinosaurio para seguir', unlockBy: 'mati', effect: 'Aparecieron huellas de dinosaurio: ¡un juego nuevo para todo el patio, idea de Mati!' },
          { id: 'tambores_suaves', label: 'Tambores con almohadillas suaves', unlockBy: 'lia' },
          { id: 'rincon_tranquilo', label: 'Rincón tranquilo con almohadones', unlockBy: 'lia' },
          { id: 'reglas_dibujos', label: 'Reglas con dibujos', unlockBy: 'tomi' },
          { id: 'senal_visual', label: 'Banderín para avisar cuándo empieza', unlockBy: 'sofi', layer: 'pintar' }
        ],
        people: [
          { id: 'mati', needs: [
            { any: ['camino_liso'], ok: 'Llegó por el camino liso sin trabarse.', miss: 'Las piedras sueltas frenan sus ruedas antes de llegar a los juegos.' },
            { any: ['rampa'], ok: 'Subió al tobogán por la rampa.', miss: 'El tobogán solo tiene escalera.' }] },
          { id: 'lia', needs: [
            { any: ['tambores_suaves', 'rincon_tranquilo'], ok: 'Encontró dónde jugar sin aturdirse.', miss: 'El ruido de los tambores la hace irse del juego.' }],
            harms: [{ id: 'mas_tambores', text: 'Con más tambores, el ruido es todavía más fuerte.' }, { id: 'silbato', text: 'El silbato fuerte la sobresalta cada vez.' }] },
          { id: 'tomi', needs: [
            { any: ['reglas_dibujos'], ok: 'Entendió las reglas mirando los dibujos.', miss: 'No entiende las reglas: son todas escritas.' }],
            harms: [{ id: 'mas_reglas', text: 'Con más reglas escritas, se pierde todavía más.' }] },
          { id: 'sofi', needs: [
            { any: ['senal_visual'], ok: 'Vio el banderín y arrancó junto con todos.', miss: 'No sabe cuándo empieza cada juego: el aviso es solo un sonido.' }] }
        ],
        hints: [
          'Leé lo que contestó cada persona: sus palabras dicen qué les impide jugar.',
          'Algunos cambios solo aparecen después de consultar. ¿Le preguntaste a todo el grupo?',
          'Hace falta: camino liso y rampa, tambores suaves o rincón tranquilo, reglas con dibujos y un banderín. Lo que hace más ruido o agrega texto, complica.'
        ],
        okWord: 'Pudo jugar', noWord: 'Todavía no pudo jugar'
      },
      reflect: {
        questions: [
          { q: '¿Todos pudieron jugar?', options: ['Sí, todos', 'Al principio no', 'Todavía tengo dudas'] },
          { q: '¿Cómo te diste cuenta?', options: ['Lo vi en el patio', 'Les pregunté', 'Probamos los juegos', 'De otra forma'] }
        ],
        phrases: [
          { text: 'La invitación decía “todos”. ¿La entrada también?', when: { failed: 'mati' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } },
          { text: '¿No entendió… o no encontramos cómo explicarlo?', when: { failed: 'tomi' } }
        ]
      },
      secret: { anchor: 'secret', label: 'Algo pequeño en el pasto', text: 'Encontraste un caracol con caparazón de colores. Ahora aparece un barrilete en el mapa.' },
      doneText: 'El patio quedó conectado: caminos lisos, juegos con dibujos y lugares tranquilos.'
    },

    /* ---------------- NIÑOS 2 ---------------- */
    mensaje: {
      space: 'ninos', title: 'EL MENSAJE ESCONDIDO', scene: 'mensaje', icon: 'texto',
      teaser: 'Un mensaje partido en tres pedazos.',
      intro: 'Alguien dejó un mensaje para todo el grupo, pero quedó repartido en tres pistas.',
      choice: { q: 'Si tuvieras que dejar un mensaje para todo tu grupo, ¿cómo lo harías?', options: ['Escrito', 'Grabado en audio', 'Con dibujos', 'De varias formas'] },
      explore: {
        prompt: 'Buscá las tres pistas. Cada una se puede leer, escuchar o ver en imágenes: elegí la forma que te sirva.',
        spots: [
          { id: 'botella', anchor: 'botella', label: 'Una botella en la orilla', text: 'Adentro de la botella hay un papel enrollado.',
            clue: { n: 1, slot: 'donde', text: 'Pista 1. ¿Dónde? Nos encontramos donde el agua sube y vuelve a caer.', picto: 'fuente', img: 'Dibujo: una fuente con un chorro de agua que sube y cae.' } },
          { id: 'barrilete', anchor: 'barrilete', label: 'Un barrilete en el árbol', text: 'El barrilete tiene algo escrito en la cola.',
            clue: { n: 2, slot: 'cuando', text: 'Pista 2. ¿Cuándo? Cuando el sol se esconde y aparece la luna.', picto: 'luna', img: 'Dibujo: una luna en el cielo, con dos estrellitas.' } },
          { id: 'buzon', anchor: 'buzon', label: 'El buzón amarillo', text: 'En el buzón hay una tarjeta.',
            clue: { n: 3, slot: 'que', text: 'Pista 3. ¿Qué traer? Algo que te guste para jugar y compartir.', picto: 'juego', img: 'Dibujo: un juego con botones, para jugar entre varios.' } }
        ]
      },
      consult: {
        prompt: 'El mensaje es para todo el grupo. Preguntá cómo le gusta recibir mensajes a cada persona.',
        people: [
          { id: 'leo', idea: 'Escribir el mensaje con letras grandes en la pizarra.', says: 'A mí me gusta leer. Si está escrito, lo leo dos veces y no me olvido.', unlocks: [] },
          { id: 'nina', idea: 'Contarlo como una historia de piratas.', says: 'Leer letras chiquitas me cuesta mucho. Si me lo cuentan en voz alta, lo entiendo.', unlocks: [] },
          { id: 'juli', idea: 'Hacer el mensaje con pictogramas, como mi tablero.', says: '(Con su tablero de pictogramas) Yo — entender — dibujos.', unlocks: [] }
        ]
      },
      transform: {
        type: 'message',
        prompt: 'Primero armá el mensaje con las pistas. Después elegí de qué formas lo compartís con el grupo.',
        slots: [
          { id: 'donde', label: '¿Dónde?', answer: 'fuente', options: [{ id: 'fuente', text: 'En la fuente de la plaza', picto: 'fuente' }, { id: 'rio', text: 'En el río', picto: 'rio' }, { id: 'escuela', text: 'En la escuela', picto: 'escuela' }] },
          { id: 'cuando', label: '¿Cuándo?', answer: 'luna', options: [{ id: 'manana', text: 'A la mañana', picto: 'manana' }, { id: 'luna', text: 'Cuando sale la luna', picto: 'luna' }, { id: 'mediodia', text: 'Al mediodía', picto: 'sol' }] },
          { id: 'que', label: '¿Qué traer?', answer: 'juego', options: [{ id: 'libro', text: 'Un libro para leer solo', picto: 'libro' }, { id: 'juego', text: 'Tu juego favorito para compartir', picto: 'juego' }, { id: 'tele', text: 'Nada: vamos a mirar la tele', picto: 'tv' }] }
        ],
        formats: [
          { id: 'texto', label: 'Escrito', picto: 'texto' },
          { id: 'audio', label: 'En audio', picto: 'oreja' },
          { id: 'imagenes', label: 'Con imágenes y pictogramas', picto: 'ojo' }
        ],
        people: [
          { id: 'leo', format: 'texto', ok: 'Leyó el mensaje escrito.', miss: 'No hay versión escrita para leer.' },
          { id: 'nina', format: 'audio', ok: 'Escuchó el mensaje en audio.', miss: 'Le cuesta leer letras chicas y no hay versión en audio.' },
          { id: 'juli', format: 'imagenes', ok: 'Entendió el mensaje con los pictogramas.', miss: 'No hay imágenes ni pictogramas para entenderlo.' }
        ],
        hints: [
          'Las pistas tienen un número: 1 es ¿dónde?, 2 es ¿cuándo?, 3 es ¿qué traer?',
          'La pista 1 habla de agua que sube y cae: ¿qué lugar de la plaza hace eso?',
          'El mensaje es: en la fuente de la plaza, cuando sale la luna, con tu juego favorito. Para que llegue a todo el grupo, compartilo escrito, en audio y con imágenes.'
        ],
        okWord: 'Recibió el mensaje', noWord: 'Todavía no le llegó'
      },
      reflect: {
        questions: [{ q: '¿Qué te ayudó a entender las pistas?', options: ['Leerlas', 'Escucharlas', 'Ver las imágenes', 'Combinar varias formas'] }],
        phrases: [
          { text: '¿No entendió… o no encontramos cómo explicarlo?', when: { failedAny: true } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Algo salta en la fuente', text: '¡Un pez dorado saltó en la fuente! Ahora hay un arcoíris sobre el mapa.' },
      doneText: 'El mensaje llegó a todo el grupo: escrito, en audio y con imágenes.'
    },

    /* ---------------- NIÑOS 3 ---------------- */
    voces: {
      space: 'ninos', title: 'TODAS LAS VOCES', scene: 'voces', icon: 'grupo',
      teaser: 'En la ronda, cada voz suena distinta.',
      intro: 'El grupo arma una tarde de juegos. Hay cuatro bloques de tiempo y muchas ideas.',
      choice: { q: 'En una ronda, ¿quién debería elegir el juego?', options: ['Quien habla primero', 'La seño o el profe', 'Votamos', 'Sumamos ideas de todos'] },
      explore: {
        prompt: 'Mirá la ronda, la pizarra y el banco.',
        spots: [
          { id: 'ronda', anchor: 'ronda', label: 'La ronda', text: 'Fede ya gritó “¡fútbol!” y anotaron fútbol en los cuatro bloques de la tarde.' },
          { id: 'pizarra', anchor: 'pizarra', label: 'La pizarra', text: 'En la pizarra hay pictogramas pegados. Alguien los dejó ahí para decir algo.' },
          { id: 'banco', anchor: 'banco', label: 'El banco', text: 'Nina está sentada en el banco. Parece que está pensando algo.' }
        ]
      },
      consult: {
        prompt: 'Cada persona propone a su manera: con palabras, con pictogramas o con gestos. Recogé todas las propuestas.',
        people: [
          { id: 'fede', mode: 'palabras', idea: 'Fútbol', says: '¡Fútbol! ¡Fútbol todo el día!', proposal: 'futbol' },
          { id: 'juli', mode: 'pictogramas', idea: 'Su propuesta está en pictogramas.', pictos: ['barrilete', 'viento', 'plaza'], says: 'Juli señala tres pictogramas de su tablero, uno después del otro.',
            interpret: { q: '¿Qué propone Juli?', options: [{ id: 'barriletes', text: 'Remontar barriletes en la plaza' }, { id: 'playa', text: 'Ir a la playa' }, { id: 'tele', text: 'Mirar la tele' }] } },
          { id: 'sofi', mode: 'gestos', idea: 'Su propuesta está en gestos.', gesture: 'Sofi hace girar una soga imaginaria con las dos manos, salta varias veces y después señala a todo el grupo.', says: 'Sofi propone con gestos.',
            interpret: { q: '¿Qué propone Sofi?', options: [{ id: 'sola', text: 'Jugar sola' }, { id: 'soga', text: 'Saltar la soga gigante entre todos' }, { id: 'dormir', text: 'Ir a dormir la siesta' }] } },
          { id: 'nina', mode: 'palabras', wait: true, thinking: 'Nina está pensando su propuesta.', idea: 'Una búsqueda del tesoro', says: 'Me gustaría… una búsqueda del tesoro, con pistas escondidas por toda la plaza.', proposal: 'tesoro' }
        ]
      },
      transform: {
        type: 'voices',
        prompt: 'Armá la tarde compartida: elegí una actividad para cada bloque. Solo podés usar las propuestas que recogiste.',
        slots: ['Primer bloque', 'Segundo bloque', 'Tercer bloque', 'Último bloque'],
        start: ['futbol', 'futbol', 'futbol', 'futbol'],
        activities: {
          futbol: { text: 'Partido de fútbol', picto: 'pelota' },
          barriletes: { text: 'Remontar barriletes en la plaza', picto: 'barrilete' },
          soga: { text: 'Saltar la soga gigante entre todos', picto: 'soga' },
          tesoro: { text: 'Búsqueda del tesoro con pistas', picto: 'tesoro' },
          playa: { text: 'Ir a la playa', picto: 'playa' },
          tele: { text: 'Mirar la tele', picto: 'tv' },
          sola: { text: 'Jugar sola', picto: 'mano' },
          dormir: { text: 'Dormir la siesta', picto: 'luna' }
        },
        people: [
          { id: 'fede', wants: 'futbol', ok: 'Su partido de fútbol está en la tarde.', miss: 'El fútbol quedó afuera.' },
          { id: 'juli', wants: 'barriletes', ok: 'Remontan barriletes, como propuso con sus pictogramas.', miss: 'Su idea no está en la tarde.', wrong: 'Pusimos otra cosa: los pictogramas decían barrilete, viento y plaza.' },
          { id: 'sofi', wants: 'soga', ok: 'Todo el grupo salta la soga gigante, como propuso con gestos.', miss: 'Su idea no está en la tarde.', wrong: 'Pusimos otra cosa: sus gestos mostraban una soga y señalaban a todo el grupo.' },
          { id: 'nina', wants: 'tesoro', ok: 'Hay búsqueda del tesoro: alguien esperó su respuesta.', miss: 'Nadie esperó su respuesta, así que su idea no llegó a la tarde.' }
        ],
        hints: [
          'Hay cuatro bloques y cuatro personas con propuestas distintas.',
          'Para sumar la idea de Juli y de Sofi, primero hay que entender sus pictogramas y sus gestos. ¿Y Nina? A veces hace falta esperar.',
          'Una tarde para todo el grupo: fútbol, barriletes en la plaza, soga gigante y búsqueda del tesoro.'
        ],
        okWord: 'Su idea está', noWord: 'Su idea falta'
      },
      reflect: {
        questions: [{ q: '¿Escuchamos lo que cada uno quería?', options: ['Sí, a todos', 'A algunos', 'Al principio nos faltó alguien'] }],
        phrases: [
          { text: '¿No tenía nada para decir o nadie esperó su respuesta?', when: { failed: 'nina' } },
          { text: '¿No entendió… o no encontramos cómo explicarlo?', when: { flag: 'misread' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Un nido entre las ramas', text: 'En el árbol hay un nido con dos huevos. Unos pájaros ahora vuelan por el mapa.' },
      doneText: 'La tarde quedó armada con las ideas de todas las voces.'
    },

    /* ---------------- NIÑOS 4 ---------------- */
    construccion: {
      space: 'ninos', title: 'LA GRAN CONSTRUCCIÓN', scene: 'construccion', icon: 'mapa',
      teaser: 'Cuatro ideas, cuatro zonas, un solo espacio.',
      intro: 'El equipo va a construir un espacio compartido. Cada persona trae una parte.',
      choice: { q: 'Para armar un espacio compartido, ¿qué es mejor?', options: ['Que cada uno arme su parte por separado', 'Que decida quien tiene la mejor idea', 'Juntar las ideas de todos', 'Todavía no sé'] },
      explore: {
        prompt: 'Recorré las cuatro zonas y descubrí cómo es cada una.',
        spots: [
          { id: 'rio', anchor: 'rio', label: 'Junto al río', text: 'Junto al río hay una franja larga y recta, sin obstáculos.' },
          { id: 'centro', anchor: 'centro', label: 'El centro', text: 'El centro tiene suelo liso y por ahí pasa todo el mundo.' },
          { id: 'arbol', anchor: 'arbol', label: 'Bajo el árbol', text: 'Bajo el árbol grande hay sombra y silencio. Casi nadie pasa corriendo.' },
          { id: 'entrada', anchor: 'entrada', label: 'La entrada', text: 'La entrada es lo primero que se ve al llegar.' }
        ]
      },
      consult: {
        prompt: 'Cada integrante del equipo trae un aporte. Preguntá qué necesita cada uno para que funcione.',
        people: [
          { id: 'mati', idea: 'Pista de huellas de dinosaurio', says: 'Las huellas necesitan suelo liso. Y quiero que estén donde pasa todo el mundo, así juegan todos.' },
          { id: 'lia', idea: 'Rincón de canciones suaves', says: 'Para cantar bajito necesito sombra y que no pase gente corriendo al lado.' },
          { id: 'tomi', idea: 'Mapa gigante del lugar', says: 'Un mapa sirve si lo ves apenas llegás. Si está escondido, ¿para qué?' },
          { id: 'sofi', idea: 'Pista de carrera', says: '(En señas) Para correr de verdad necesito un tramo largo y recto.' }
        ]
      },
      transform: {
        type: 'zones',
        prompt: 'Ubicá cada aporte en una zona. Cada zona recibe un solo aporte. Si elegís una zona ocupada, los aportes se intercambian.',
        zones: [
          { id: 'rio', label: 'Junto al río', trait: 'largo y recto' },
          { id: 'centro', label: 'El centro', trait: 'liso, pasa todo el mundo' },
          { id: 'arbol', label: 'Bajo el árbol', trait: 'sombra y silencio' },
          { id: 'entrada', label: 'La entrada', trait: 'se ve al llegar' }
        ],
        items: [
          { id: 'huellas', label: 'Pista de huellas de dinosaurio', owner: 'mati', picto: 'mano', fits: 'centro', ok: 'Sus huellas están en el centro liso: todo el mundo las sigue.',
            miss: { rio: 'Junto al río queda lejos: casi nadie pasa por ahí.', arbol: 'Bajo el árbol hay raíces: el suelo no es liso.', entrada: 'En la entrada hay mucha gente parada mirando el mapa: las huellas se pisan.' } },
          { id: 'canciones', label: 'Rincón de canciones suaves', owner: 'lia', picto: 'nota', fits: 'arbol', ok: 'Canta bajito a la sombra, sin ruidos alrededor.',
            miss: { rio: 'Al lado de la pista larga pasa gente corriendo todo el tiempo.', centro: 'En el centro pasa todo el mundo: no se escuchan las canciones.', entrada: 'En la entrada hay mucho movimiento y no hay sombra.' } },
          { id: 'mapa', label: 'Mapa gigante del lugar', owner: 'tomi', picto: 'mapa', fits: 'entrada', ok: 'Su mapa se ve apenas se llega: nadie se pierde.',
            miss: { rio: 'Junto al río nadie ve el mapa al llegar.', centro: 'En el centro el mapa aparece tarde: muchos ya se perdieron.', arbol: 'Bajo el árbol el mapa queda escondido.' } },
          { id: 'carrera', label: 'Pista de carrera', owner: 'sofi', picto: 'soga', fits: 'rio', ok: 'Corre por el tramo largo y recto junto al río.',
            miss: { centro: 'En el centro la carrera choca con quienes pasan.', arbol: 'Bajo el árbol no hay espacio para correr.', entrada: 'En la entrada la pista es muy corta.' } }
        ],
        hints: [
          'Leé las características de cada zona y compará con lo que pidió cada persona.',
          'Empezá por la pista más fácil: ¿qué zona es larga y recta? ¿Cuál se ve al llegar?',
          'Huellas en el centro, canciones bajo el árbol, mapa en la entrada y carrera junto al río.'
        ],
        okWord: 'Su aporte funciona', noWord: 'Su aporte no funciona ahí'
      },
      reflect: {
        questions: [{ q: '¿Qué cambió cuando decidimos juntos?', options: ['Todas las ideas entraron', 'Tuvimos que mover cosas', 'Descubrimos lugares nuevos', 'Otra cosa'] }],
        phrases: [
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } },
          { text: 'Estar en el mismo lugar… ¿alcanza para ser parte?', when: { failedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Algo colgado del árbol', text: 'Hay una casita de pájaros colgada del árbol. Ahora un pez salta cerca de la isla del mapa.' },
      doneText: 'El espacio compartido quedó armado con los aportes de todo el equipo.'
    },

    /* ---------------- NIÑOS FINAL ---------------- */
    celebracion: {
      space: 'ninos', final: true, title: 'LA GRAN CELEBRACIÓN', scene: 'finalNinos', icon: 'estrella',
      teaser: 'Preparar una fiesta para todo el mundo.',
      intro: 'El faro se encendió: es hora de preparar una celebración en la plaza. Usá todo lo que descubriste.',
      choice: { q: 'Para que una fiesta sea para todos, ¿qué es lo más importante?', options: ['Que haya mucha música', 'Que todos puedan llegar', 'Que todos puedan proponer', 'Que todos se enteren'] },
      explore: {
        prompt: 'Revisá la plaza antes de preparar la fiesta.',
        spots: [
          { id: 'escenario', anchor: 'escenario', label: 'El escenario', text: 'Para subir al escenario hay dos escalones.' },
          { id: 'entrada', anchor: 'entrada', label: 'La entrada', text: 'En la entrada hay piedras sueltas otra vez.' },
          { id: 'cartelera', anchor: 'cartelera', label: 'La invitación', text: 'Todavía no hay invitación. ¿Cómo se van a enterar todos?' },
          { id: 'mesas', anchor: 'mesas', label: 'Las mesas', text: 'En las mesas alguien dejó una lista de juegos: los eligió una sola persona.' }
        ]
      },
      consult: {
        prompt: 'Preguntale al grupo qué necesita cada persona para disfrutar la fiesta.',
        people: [
          { id: 'mati', idea: 'Bailar arriba del escenario', says: 'Quiero subir al escenario a bailar. ¡Y que no haya piedras en la entrada!' },
          { id: 'lia', idea: 'Cantar una canción suave', says: 'Si la música está muy fuerte, necesito un lugar para descansar.' },
          { id: 'sofi', idea: 'Una carrera de postas', says: '(En señas) Si cada juego empieza con una señal que se vea, juego desde el principio.', unlocks: ['senal'] },
          { id: 'nina', idea: 'Una búsqueda del tesoro', says: 'Para proponer juegos necesito que me esperen un poquito.', unlocks: ['espera'] },
          { id: 'juli', idea: 'Remontar barriletes', says: '(Con pictogramas) Yo — votar — dibujos.' },
          { id: 'leo', idea: 'Leer un cuento en voz alta', says: 'Si la invitación está escrita, me la guardo en el bolsillo.' },
          { id: 'tomi', idea: 'Un mapa de la fiesta', says: 'Con dibujos en la invitación, sé adónde ir.' }
        ]
      },
      transform: {
        type: 'toggle',
        prompt: 'Prepará la celebración. Combiná todo lo que aprendiste en las islas.',
        options: [
          { id: 'musica_fuerte', label: 'Parlantes a todo volumen', effect: 'La música suena fortísimo en toda la plaza.' },
          { id: 'sena_elige', label: 'La seño elige todos los juegos', layer: 'none', effect: 'Los juegos están decididos sin preguntar.' },
          { id: 'inv-texto', label: 'Invitación escrita' },
          { id: 'inv-audio', label: 'Invitación en audio' },
          { id: 'inv-dibujos', label: 'Invitación con dibujos y pictogramas' },
          { id: 'camino', label: 'Camino liso en la entrada' },
          { id: 'rampa', label: 'Rampa para subir al escenario' },
          { id: 'rincon', label: 'Rincón tranquilo' },
          { id: 'voto', label: 'Votar los juegos con pictogramas' },
          { id: 'juegos', label: 'Un juego propuesto por cada grupo' },
          { id: 'senal', label: 'Señal visual para empezar cada juego', unlockBy: 'sofi', layer: 'juegos' },
          { id: 'espera', label: 'Ronda de ideas con tiempo para responder', unlockBy: 'nina', layer: 'voto' }
        ],
        people: [
          { id: 'mati', needs: [{ any: ['camino'], ok: 'Entró por el camino liso.', miss: 'Las piedras de la entrada lo frenan.' }, { any: ['rampa'], ok: 'Subió a bailar por la rampa.', miss: 'No puede subir al escenario.' }] },
          { id: 'lia', needs: [{ any: ['rincon'], ok: 'Descansa del ruido en el rincón tranquilo.', miss: 'No tiene dónde descansar del ruido.' }], harms: [{ id: 'musica_fuerte', text: 'Con los parlantes a todo volumen, se va de la fiesta.' }] },
          { id: 'leo', needs: [{ any: ['inv-texto'], ok: 'Leyó la invitación escrita.', miss: 'No hay invitación escrita.' }] },
          { id: 'tomi', needs: [{ any: ['inv-dibujos'], ok: 'Entendió la invitación con dibujos.', miss: 'No hay dibujos en la invitación.' }] },
          { id: 'nina', needs: [{ any: ['inv-audio'], ok: 'Escuchó la invitación.', miss: 'No hay invitación en audio.' }, { any: ['espera'], ok: 'Propuso su búsqueda del tesoro: le dieron tiempo.', miss: 'No llegó a proponer: la ronda fue muy rápida.' }], harms: [{ id: 'sena_elige', text: 'Los juegos ya estaban elegidos: no pudo proponer.' }] },
          { id: 'juli', needs: [{ any: ['voto'], ok: 'Votó con pictogramas.', miss: 'No puede votar: la votación es solo hablada.' }], harms: [{ id: 'sena_elige', text: 'Los juegos ya estaban elegidos: no pudo votar.' }] },
          { id: 'sofi', needs: [{ any: ['senal'], ok: 'Vio la señal y empezó junto con todos.', miss: 'No sabe cuándo empieza cada juego.' }] }
        ],
        hints: [
          'Pensá en tres momentos: enterarse de la fiesta, llegar y estar, y decidir qué se juega.',
          'Consultá a todo el grupo: Sofi y Nina tienen ideas que no aparecen hasta que les preguntás.',
          'Hace falta invitación escrita, en audio y con dibujos; camino liso y rampa; rincón tranquilo; votar con pictogramas; señal visual y tiempo para responder. Sin parlantes fuertes ni juegos elegidos por una sola persona.'
        ],
        okWord: 'Disfrutó la fiesta', noWord: 'Todavía no puede ser parte'
      },
      reflect: {
        questions: [{ q: '¿Qué fue lo más difícil de preparar?', options: ['Que todos se enteren', 'Que todos puedan llegar', 'Que todos puedan elegir', 'Pensar en todo a la vez'] }],
        phrases: [
          { text: 'La intención era ayudar. ¿La persona pudo decidir?', when: { everSelected: 'sena_elige' } },
          { text: '¿No tenía nada para decir o nadie esperó su respuesta?', when: { failed: 'nina' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Algo brilla en el cielo', text: 'Fuegos artificiales silenciosos: solo luces, sin estruendo. Ahora hay banderines en todo el mapa.' },
      doneText: 'La celebración es para todo el mundo.'
    },

    /* ---------------- ADULTOS 1 ---------------- */
    evento: {
      space: 'adultos', title: 'EL EVENTO ESTÁ ABIERTO… ¿PARA TODOS?', scene: 'evento', icon: 'grupo',
      teaser: 'El anuncio dice “abierto a todos”.',
      intro: 'El centro de eventos organiza una jornada del barrio. El anuncio dice “abierto a todos”. Investigá si es cierto.',
      choice: { q: 'Un evento dice “abierto a todos”. ¿Qué revisarías primero?', options: ['La entrada', 'El anuncio', 'Quiénes organizan y deciden', 'Que sea gratis'] },
      explore: {
        prompt: 'Investigá cuatro puntos del evento: anuncio, ingreso, video y organización.',
        spots: [
          { id: 'anuncio', anchor: 'anuncio', label: 'Anuncio', text: 'El anuncio dice “ABIERTO A TODOS” en grande. Debajo, la fecha y el lugar están en letra muy chica y frases largas.' },
          { id: 'ingreso', anchor: 'ingreso', label: 'Ingreso', text: 'La única entrada tiene una escalinata de tres escalones.' },
          { id: 'video', anchor: 'video', label: 'Video', text: 'Un video explica el programa completo. Es solo audio y no tiene subtítulos.' },
          { id: 'organizacion', anchor: 'organizacion', label: 'Organización', text: 'Dos personas armaron todo el programa solas. No hay forma de proponer actividades.' }
        ]
      },
      consult: {
        prompt: 'Hablá con quienes quieren participar. Sus respuestas abren opciones nuevas.',
        people: [
          { id: 'carla', idea: 'Un puesto de fotos de la feria', says: 'Llego sin problema hasta la puerta: la escalinata es lo que me deja afuera. Y una cosa: prefiero recorrer sola. Sé lo que quiero ver.', unlocks: [] },
          { id: 'bruno', idea: 'Un mural colectivo', says: '(En LSA) El video explica todo el programa y no tiene subtítulos. Con subtítulos o con intérprete de LSA me entero igual que el resto.', unlocks: ['subtitulos', 'interprete'] },
          { id: 'ines', idea: 'Que cante el coro', says: 'El anuncio tiene la letra chiquita y frases larguísimas. Ni la hora me quedó clara.', unlocks: ['anuncio_claro'] },
          { id: 'ramiro', idea: 'Un torneo de penales', says: 'El programa lo armaron dos personas. Yo quería proponer un torneo de penales, pero nadie preguntó.', unlocks: ['asamblea'] }
        ]
      },
      transform: {
        type: 'toggle',
        dashboard: true,
        prompt: 'Transformá el evento. Cada cambio tiene consecuencias en el escenario.',
        options: [
          { id: 'cartel_grande', label: 'Cartel gigante: “TODOS BIENVENIDOS”', effect: 'Ahora el mensaje es más grande. Las barreras siguen en el mismo lugar.' },
          { id: 'rampa', label: 'Rampa en el ingreso' },
          { id: 'acompanante', label: 'Asignar a alguien que acompañe a Carla y elija por ella el recorrido', effect: 'Hay una persona del equipo pegada a Carla todo el tiempo.' },
          { id: 'musica', label: 'Música fuerte en la puerta para atraer gente', effect: 'Hay más ruido en la entrada. Ninguna barrera cambió.' },
          { id: 'subtitulos', label: 'Subtítulos en el video', unlockBy: 'bruno' },
          { id: 'interprete', label: 'Intérprete de LSA durante la jornada', unlockBy: 'bruno' },
          { id: 'anuncio_claro', label: 'Anuncio en lenguaje claro, con letra grande', unlockBy: 'ines' },
          { id: 'asamblea', label: 'Asamblea abierta para armar el programa', unlockBy: 'ramiro' }
        ],
        categories: { acceso: 'Acceso', comprension: 'Comprensión', comunicacion: 'Comunicación', decision: 'Decisión' },
        people: [
          { id: 'carla', needs: [{ cat: 'acceso', any: ['rampa'], ok: 'Entró por la rampa.', miss: 'La escalinata la deja afuera.' }],
            harms: [{ id: 'acompanante', text: 'Entró, pero alguien elige por ella adónde ir. Está, pero no decide.' }] },
          { id: 'bruno', needs: [{ cat: 'comunicacion', any: ['subtitulos', 'interprete'], ok: 'Se enteró del programa completo.', miss: 'El video es solo audio: no se entera del programa.' }] },
          { id: 'ines', needs: [{ cat: 'comprension', any: ['anuncio_claro'], ok: 'Entendió la fecha, la hora y el lugar.', miss: 'El anuncio es confuso: no sabe a qué hora ir.' }] },
          { id: 'ramiro', needs: [{ cat: 'decision', any: ['asamblea'], ok: 'Propuso su torneo de penales y entró al programa.', miss: 'Puede ir, pero el programa se decidió sin él.' }] }
        ],
        hints: [
          'Cada lugar que exploraste esconde un tipo de barrera: acceso, comprensión, comunicación y decisión.',
          'La rampa resuelve el ingreso. ¿Qué pasa con el video, el anuncio y el programa? Consultar a Bruno, Inés y Ramiro abre opciones nuevas.',
          'Una solución completa: rampa, subtítulos o intérprete, anuncio claro y asamblea abierta. Acompañar no es lo mismo que decidir por alguien.'
        ],
        okWord: 'Puede participar', noWord: 'Todavía no puede ser parte'
      },
      reflect: {
        questions: [{ q: '¿Qué barrera te costó más ver?', options: ['Acceso', 'Comprensión', 'Comunicación', 'Decisión'] }],
        phrases: [
          { text: 'La invitación decía “todos”. ¿La entrada también?', when: { always: true } },
          { text: 'La intención era ayudar. ¿La persona pudo decidir?', when: { everSelected: 'acompanante' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } },
          { text: 'Estar en el mismo lugar… ¿alcanza para ser parte?', when: { failed: 'ramiro' } }
        ]
      },
      secret: { anchor: 'secret', label: 'Una pared con colores', text: 'Detrás del edificio hay un mural empezado: es de Bruno. Ahora un barrilete vuela en el mapa.' },
      doneText: 'El evento está abierto de verdad: se puede entrar, entender, comunicarse y decidir.'
    },

    /* ---------------- ADULTOS 2 ---------------- */
    reparar: {
      space: 'adultos', title: 'REPARÁ LA EXPERIENCIA', scene: 'reparar', icon: 'ojo',
      teaser: 'Una publicación que no llega a todo el mundo.',
      intro: 'El estudio digital publicó el anuncio de la feria. Vas a analizar la publicación como un objeto de estudio y mejorarla.',
      choice: { q: '¿Para quién se hacen los subtítulos?', options: ['Solo para personas sordas', 'Para cualquiera que no pueda escuchar en ese momento', 'Para quienes aprenden el idioma', 'No estoy seguro'] },
      explore: {
        prompt: 'Analizá las cuatro partes de la publicación.',
        spots: [
          { id: 'video', anchor: 'video', label: 'El video', text: 'El video dura un minuto, explica horarios y actividades. No tiene subtítulos.' },
          { id: 'imagen', anchor: 'imagen', label: 'La imagen', text: 'La imagen es el afiche con toda la información. Su texto alternativo es “img_0234.jpg”.' },
          { id: 'texto', anchor: 'texto', label: 'El texto', text: 'El texto principal es una sola frase de cuarenta y siete palabras, con lenguaje administrativo.' },
          { id: 'colores', anchor: 'colores', label: 'Los colores', text: 'El título está en gris claro sobre fondo blanco: el contraste es de 1,5 a 1, muy por debajo de lo recomendado.' }
        ]
      },
      consult: {
        prompt: 'Preguntá cómo usa cada persona este tipo de publicaciones.',
        people: [
          { id: 'bruno', idea: 'Grabar una versión en LSA', says: '(En LSA) Los subtítulos automáticos se equivocan con nombres y números. Un número mal escrito cambia todo.' },
          { id: 'ana', idea: 'Una versión del programa para el podcast', says: 'Mi lector de pantalla lee el texto alternativo. Si dice “img_0234.jpg”, me quedo sin saber qué hay en el afiche.' },
          { id: 'ines', idea: 'Que el coro esté en el programa', says: 'Letras clarito sobre fondo clarito no las veo. Y las frases largas me pierden.' },
          { id: 'ramiro', idea: 'Repartir el programa en el club', says: 'Cuando hay una versión en lectura fácil o en audio, la entiendo de una.', unlocks: ['lectura_facil', 'audio'] }
        ]
      },
      transform: {
        type: 'repair',
        prompt: 'Repará cada parte. La vista previa muestra cómo queda la publicación.',
        tasks: [
          { id: 'subtitulos', label: 'Subtítulos del video', kind: 'choice', start: 'ninguno', options: [
            { id: 'ninguno', text: 'Sin subtítulos' },
            { id: 'auto', text: 'Subtítulos automáticos, sin revisar', note: 'Los subtítulos automáticos dicen “feria del varrio a las 6” en lugar de 16 h.' },
            { id: 'revisados', text: 'Subtítulos revisados, con quién habla y sonidos importantes' }] },
          { id: 'alt', label: 'Texto alternativo de la imagen', kind: 'choice', start: 'archivo', options: [
            { id: 'archivo', text: 'img_0234.jpg' },
            { id: 'afiche', text: 'Afiche' },
            { id: 'completo', text: 'Afiche de la Feria del Barrio: sábado 12, de 16 a 20 h, en la plaza San Martín. Entrada libre.' }] },
          { id: 'claro', label: 'Texto principal', kind: 'choice', start: 'largo', options: [
            { id: 'largo', text: 'Se informa a la comunidad que, en virtud de la planificación anual, la Feria se llevará a cabo el día sábado 12 del corriente a partir de las dieciséis horas en el espacio público denominado plaza San Martín, siendo el acceso de carácter libre y gratuito.' },
            { id: 'claro', text: 'Feria del Barrio. Sábado 12, de 16 a 20 h. Plaza San Martín. Entrada libre. Hay rampa y baño accesible.' },
            { id: 'corto', text: '¡Vení! Va a estar buenísimo.', note: 'Es corto, pero no dice cuándo ni dónde.' }] },
          { id: 'contraste', label: 'Colores del título', kind: 'contrast', start: 'gris', threshold: 4.5, options: [
            { id: 'gris', text: 'Gris claro sobre blanco', fg: '#B9C3D3', bg: '#FFFFFF' },
            { id: 'amarillo', text: 'Amarillo sobre blanco', fg: '#FFC83D', bg: '#FFFFFF' },
            { id: 'turquesa', text: 'Turquesa sobre blanco', fg: '#17BFAE', bg: '#FFFFFF' },
            { id: 'marino', text: 'Amarillo sobre azul marino', fg: '#FFC83D', bg: '#0F1F4B' }] },
          { id: 'formatos', label: 'Otras formas de acceder', kind: 'multi', start: [], options: [
            { id: 'pdf', text: 'PDF escaneado del afiche', note: 'Un PDF escaneado es una foto del texto: los lectores de pantalla no pueden leerlo.' },
            { id: 'lectura_facil', text: 'Versión en lectura fácil', unlockBy: 'ramiro' },
            { id: 'audio', text: 'Versión en audio', unlockBy: 'ramiro' }] }
        ],
        people: [
          { id: 'bruno', needs: [{ any: [{ task: 'subtitulos', eq: 'revisados' }], ok: 'Leyó los subtítulos revisados: horarios y nombres correctos.', miss: 'Sin subtítulos confiables, se pierde el horario.' }] },
          { id: 'ana', needs: [{ any: [{ task: 'alt', eq: 'completo' }], ok: 'Su lector de pantalla leyó toda la información del afiche.', miss: 'Su lector no le cuenta qué dice el afiche.' }] },
          { id: 'ines', needs: [{ any: [{ task: 'contraste', min: 4.5 }], ok: 'Ve el título con claridad.', miss: 'No distingue el título del fondo.' }, { any: [{ task: 'claro', eq: 'claro' }], ok: 'Entiende el texto de una lectura.', miss: 'El texto no le deja claro qué, cuándo y dónde.' }] },
          { id: 'ramiro', needs: [{ any: [{ task: 'formatos', has: 'lectura_facil' }, { task: 'formatos', has: 'audio' }], ok: 'Entendió el programa con una versión alternativa.', miss: 'No hay versión en lectura fácil ni en audio.' }] }
        ],
        hints: [
          'Probá cada mejora y mirá la vista previa: la relación de contraste se calcula sola.',
          'Para el contraste del texto normal se recomienda al menos 4,5 a 1. Un texto alternativo útil cuenta lo que dice la imagen, no su nombre de archivo.',
          'Una solución: subtítulos revisados, texto alternativo completo, texto claro, amarillo sobre azul marino y versión en lectura fácil o audio (consultá a Ramiro).'
        ],
        okWord: 'Accede al contenido', noWord: 'Todavía no accede'
      },
      reflect: {
        questions: [{ q: '¿Qué mejora le sirve a más personas de las que pensabas?', options: ['Subtítulos', 'Lenguaje claro', 'Buen contraste', 'Texto alternativo'] }],
        phrases: [
          { text: '¿No entendió… o no encontramos cómo explicarlo?', when: { failedAny: true } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Un sello en el piso', text: 'Encontraste un sello de “revisado por la comunidad”. Ahora hay un arcoíris sobre el mapa.' },
      doneText: 'La publicación ahora se puede ver, leer, escuchar y entender.'
    },

    /* ---------------- ADULTOS 3 ---------------- */
    control: {
      space: 'adultos', title: '¿QUIÉN TIENE EL CONTROL?', scene: 'control', icon: 'llave',
      teaser: 'Una salida que ya estaba decidida.',
      intro: 'El centro cultural organiza una salida. La coordinación ya decidió todo. Vos podés cambiar cómo se decide.',
      choice: { q: 'Si organizás una salida para un grupo, ¿cómo decidís?', options: ['Decido yo, así es más rápido', 'Ofrezco algunas opciones', 'Pregunto qué quiere cada persona', 'Depende de la situación'] },
      explore: {
        prompt: 'Revisá el plan que armó la coordinación.',
        spots: [
          { id: 'centro', anchor: 'centro', label: 'La planilla', text: 'Planilla de la coordinación: destino Museo de Historia, sábado a las 9, y Bruno “viaja adelante para que no se pierda”.' },
          { id: 'micro', anchor: 'micro', label: 'El micro', text: 'El micro está reservado. Tiene rampa trasera.' },
          { id: 'museo', anchor: 'museo', label: 'El museo', text: 'El Museo de Historia tiene escalinata en la entrada.' },
          { id: 'parque', anchor: 'parque', label: 'El parque', text: 'El parque del río tiene cancha, senderos de cemento y un museo al aire libre. Nadie lo propuso todavía.' }
        ]
      },
      consult: {
        prompt: 'Preguntá a cada persona qué le importa de la salida.',
        people: [
          { id: 'ramiro', idea: 'Armar un partido', says: 'Me encantaría armar un partido. Y no me pregunten solo entre opciones que ya están cerradas.' },
          { id: 'carla', idea: 'Revisar accesos antes de elegir', says: 'Antes de elegir el lugar, revisemos senderos, baños y transporte. Yo puedo encargarme.' },
          { id: 'ines', idea: 'Ir a la tarde', says: 'A la mañana tengo ensayo del coro hasta las 12. A la tarde voy encantada.' },
          { id: 'bruno', idea: 'Hacer las fotos', says: '(En LSA) Puedo hacer las fotos de la salida; tengo mi cámara.' }
        ]
      },
      transform: {
        type: 'control',
        prompt: 'Para cada decisión, elegí cómo se decide. Mirá qué cambia para cada persona.',
        modes: [
          { id: 'decidir', label: 'Decidir por el grupo' },
          { id: 'opciones', label: 'Ofrecer opciones ya armadas' },
          { id: 'consultar', label: 'Consultar y que decidan' }
        ],
        levels: ['Afuera', 'Asiste', 'Participa', 'Decide'],
        decisions: [
          { id: 'destino', label: '¿Adónde vamos?', affects: ['ramiro', 'carla'],
            plans: { decidir: 'Museo de Historia, elegido por la coordinación.', opciones: 'Elegir entre dos museos que propuso la coordinación.', consultar: 'Parque del río: partido, senderos accesibles y museo al aire libre.' },
            layers: { decidir: 'dest-museo', opciones: 'dest-museo', consultar: 'dest-parque' },
            results: {
              ramiro: { decidir: [1, 'Va al museo, pero no le interesa: mira la hora todo el tiempo.'], opciones: [2, 'Elige entre dos museos. Ninguno es lo que él hubiera propuesto.'], consultar: [3, 'Propuso el partido y armó los equipos.'] },
              carla: { decidir: [0, 'El museo tiene escalinata: no puede entrar.'], opciones: [2, 'Uno de los museos tiene rampa: elige entre lo que otros pensaron.'], consultar: [3, 'Revisó los accesos y eligió los senderos del parque.'] }
            } },
          { id: 'horario', label: '¿A qué hora?', affects: ['ines'],
            plans: { decidir: 'Sábado a las 9.', opciones: 'Sábado a las 9 o a las 10.', consultar: 'Sábado a las 15, después del ensayo.' },
            layers: { decidir: 'hora-manana ines-fuera', opciones: 'hora-manana ines-fuera', consultar: 'hora-tarde' },
            results: {
              ines: { decidir: [0, 'A las 9 tiene ensayo: no puede ir.'], opciones: [0, 'Ninguna opción le sirve: el ensayo dura hasta las 12.'], consultar: [3, 'Propuso la tarde y llega con el coro para cantar.'] }
            } },
          { id: 'rol', label: '¿Qué hace cada persona?', affects: ['bruno'],
            plans: { decidir: 'Bruno viaja adelante “para que no se pierda”.', opciones: 'Bruno puede ayudar con la merienda o con la limpieza.', consultar: 'Bruno queda a cargo de las fotos de la jornada.' },
            layers: { decidir: '', opciones: '', consultar: 'rol-fotos' },
            results: {
              bruno: { decidir: [1, 'Está, pero lo cuidan como si no supiera moverse solo. No hace nada de lo que le gusta.'], opciones: [2, 'Ayuda con la merienda. Participa, aunque no era lo que quería.'], consultar: [3, 'Está a cargo de las fotos: su mirada queda en el registro de la salida.'] }
            } }
        ],
        hints: [
          'Mirá la escala de cada persona: afuera, asiste, participa, decide. ¿Qué modo la mueve hacia “decide”?',
          'Solo podés “consultar y que decidan” después de hablar con esa persona. Ofrecer opciones cerradas no siempre alcanza: a Inés ninguna le sirve.',
          'Para que todas las personas decidan: consultá a Ramiro, Carla, Inés y Bruno, y elegí “Consultar y que decidan” en las tres decisiones.'
        ],
        okWord: 'Decide', noWord: 'Todavía no decide'
      },
      reflect: {
        questions: [{ q: '¿Qué diferencia notaste entre asistir, participar y decidir?', options: ['Asistir es solo estar', 'Participar es hacer algo', 'Decidir cambia el resultado', 'Las tres cosas'] }],
        phrases: [
          { text: '¿Le facilitaste participar o elegiste en su lugar?', when: { flag: 'decidir' } },
          { text: 'Estar en el mismo lugar… ¿alcanza para ser parte?', when: { flag: 'asiste' } },
          { text: 'Ayudar también puede quitar espacio para elegir.', when: { flag: 'rol-decidir' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Una pelota en el pasto', text: 'Una pelota olvidada junto a la cancha. Ahora un pez salta cerca del barrio en el mapa.' },
      doneText: 'La salida quedó decidida por quienes van a ir.'
    },

    /* ---------------- ADULTOS 4 ---------------- */
    domino: {
      space: 'adultos', title: 'EFECTO DOMINÓ', scene: 'domino', icon: 'grupo',
      teaser: 'Una barrera, muchas consecuencias.',
      intro: 'La radio comunitaria abre su taller. Una sola barrera puede hacer caer muchas fichas.',
      choice: { q: 'Una barrera, ¿a quién afecta?', options: ['Solo a quien la encuentra', 'A esa persona y a su entorno', 'A toda la comunidad', 'Depende'] },
      explore: {
        prompt: 'Recorré la calle y el centro comunitario.',
        spots: [
          { id: 'centro', anchor: 'centro', label: 'El taller', text: 'Las inscripciones al taller de radio se hacen solo en persona, en el primer piso, de lunes a viernes de 9 a 13 h.' },
          { id: 'escalera', anchor: 'escalera', label: 'La escalera', text: 'Al primer piso se llega solo por escalera. No hay ascensor.' },
          { id: 'calle', anchor: 'calle', label: 'Las fichas', text: 'En la calle hay una fila de fichas de dominó. Cada una representa algo que pasa por culpa de la barrera.' },
          { id: 'barrio', anchor: 'barrio', label: 'El barrio', text: 'En el barrio mucha gente trabaja por la mañana. La radio casi siempre habla de los mismos temas.' }
        ]
      },
      consult: {
        prompt: 'Escuchá a vecinas y vecinos que quisieron sumarse al taller.',
        people: [
          { id: 'carla', idea: 'Un programa de deporte adaptado', says: 'Quería proponer un programa de deporte adaptado. Nunca pude subir a anotarme.' },
          { id: 'ramiro', idea: 'Transmitir los partidos del club', says: 'Trabajo en la cooperativa de 8 a 16. Imposible ir a la mañana. Si abrieran un día a la tarde, me anoto.', unlocks: ['horario'] },
          { id: 'bruno', idea: 'Un segmento en video con LSA', says: '(En LSA) Si me pudiera anotar por mensaje, ya estaría en el taller.', unlocks: ['online'] },
          { id: 'ines', idea: 'Historias del coro', says: 'Con el coro tenemos mil historias del barrio. Nadie nos preguntó qué queremos escuchar.', unlocks: ['consulta'] }
        ]
      },
      transform: {
        type: 'domino',
        prompt: 'Primero relacioná la barrera con sus consecuencias. Después elegí intervenciones: este mes el centro puede hacer cambios por 2 puntos.',
        barrier: 'Las inscripciones se hacen solo en persona, en un primer piso sin ascensor, de lunes a viernes de 9 a 13 h.',
        budget: 2,
        consequences: [
          { id: 'c1', real: true, text: 'Quienes no pueden usar escaleras no llegan a inscribirse.', why: 'El primer piso sin ascensor deja afuera a quien no puede subir.' },
          { id: 'c2', real: true, text: 'Quienes trabajan por la mañana no llegan a inscribirse.', why: 'El horario coincide con la jornada laboral.' },
          { id: 'c5', real: false, text: 'El taller pasa a ser pago.', why: 'Nada en la barrera habla de dinero.' },
          { id: 'c3', real: true, causedBy: ['c1', 'c2'], text: 'El taller se llena siempre con las mismas personas.', why: 'Si muchas personas no pueden anotarse, el grupo es siempre parecido.' },
          { id: 'c6', real: false, text: 'Quienes ya están en el taller aprenden menos.', why: 'La barrera cambia quién llega, no cuánto aprende quien ya está.' },
          { id: 'c4', real: true, causedBy: ['c3'], text: 'La radio no habla de lo que le importa a todo el barrio.', why: 'Quien no está en el taller no puede proponer temas.' }
        ],
        chainLayers: { c1: 'c1-ok', c2: 'c2-ok', c3: 'c3-ok', c4: 'c4-ok' },
        opportunities: [
          { after: 'c3', layer: 'c5-ok', text: 'Se suman voces nuevas al taller: Carla, Ramiro y Bruno se anotan.' },
          { after: 'c4', layer: 'c6-ok', text: 'La radio estrena programas propuestos por el barrio: deporte adaptado, partidos del club, historias del coro.' }
        ],
        interventions: [
          { id: 'ascensor', label: 'Instalar un ascensor', cost: 2, resolves: ['c1'], note: 'Resuelve el acceso al primer piso, pero usa todo el presupuesto del mes.' },
          { id: 'planta_baja', label: 'Mover la mesa de inscripción a la planta baja', cost: 1, resolves: ['c1'] },
          { id: 'separado', label: 'Armar un taller aparte, solo para personas con discapacidad, en otro horario', cost: 1, resolves: [], limits: 'Separa a las personas: el taller principal sigue siendo el mismo y la radio sigue sin esas voces.' },
          { id: 'cartel', label: 'Colgar un cartel: “Todos son bienvenidos”', cost: 1, resolves: [], limits: 'El cartel invita, pero no cambia cómo inscribirse.' },
          { id: 'online', label: 'Inscripción también por mensaje, teléfono y formulario en línea', cost: 1, resolves: ['c1', 'c2'], unlockBy: 'bruno' },
          { id: 'horario', label: 'Abrir la inscripción también un día por la tarde', cost: 1, resolves: ['c2'], unlockBy: 'ramiro' },
          { id: 'consulta', label: 'Preguntar al barrio qué temas quiere escuchar', cost: 1, resolves: ['c4'], unlockBy: 'ines' }
        ],
        people: [
          { id: 'carla', needs: 'c1', ok: 'Se anotó sin subir escaleras.', miss: 'Sigue sin poder anotarse.' },
          { id: 'ramiro', needs: 'c2', ok: 'Se anotó fuera de su horario de trabajo.', miss: 'Sigue sin poder anotarse por su horario.' },
          { id: 'ines', needs: 'c4', ok: 'Sus historias del coro tienen lugar en la radio.', miss: 'La radio sigue sin preguntar qué quiere escuchar el barrio.' }
        ],
        hints: [
          'Una consecuencia real se desprende de la barrera: escalera, solo en persona, horario de mañana. Las fichas que no tienen relación no caen.',
          'Algunas fichas caen solas cuando caen las anteriores: si se destraban las dos primeras, se abre la tercera. Consultar abre intervenciones que cuestan menos.',
          'Con 2 puntos alcanza: inscripción por mensaje y en línea más otra mejora, o planta baja más un día por la tarde.'
        ],
        okWord: 'Se abrió su oportunidad', noWord: 'Su ficha sigue trabada'
      },
      reflect: {
        questions: [{ q: '¿Qué decisión abrió más oportunidades?', options: ['La que cambió cómo inscribirse', 'La que movió la mesa', 'La que preguntó al barrio', 'La combinación'] }],
        phrases: [
          { text: 'La intención era ayudar. ¿La persona pudo decidir?', when: { everSelected: 'separado' } },
          { text: 'Estar en el mismo lugar… ¿alcanza para ser parte?', when: { everSelected: 'separado' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Algo bajo el árbol', text: 'Un pájaro de origami bajo el árbol. Ahora vuelan pájaros sobre el mapa.' },
      doneText: 'Las fichas cayeron para el lado de las oportunidades.'
    },

    /* ---------------- ADULTOS FINAL ---------------- */
    activa: {
      space: 'adultos', final: true, title: 'ACTIVÁ TU MUNDO', scene: 'finalAdultos', icon: 'estrella',
      teaser: 'Un evento con todo lo aprendido.',
      intro: 'El faro se encendió. La plaza mayor organiza su gran evento y vos tenés el presupuesto. No existe una única respuesta: hay varias soluciones posibles.',
      choice: { q: 'Con recursos limitados, ¿qué priorizarías?', options: ['Que todos puedan entrar', 'Que todos puedan entender', 'Que todos puedan decidir', 'Un poco de cada cosa'] },
      explore: {
        prompt: 'Revisá cuatro puntos de la plaza.',
        spots: [
          { id: 'escenario', anchor: 'escenario', label: 'El escenario', text: 'El escenario tiene escalones y una pantalla donde se proyectarán charlas.' },
          { id: 'plaza', anchor: 'plaza', label: 'La plaza', text: 'Habrá parlantes, puestos y mucha gente. No hay lugar para descansar del ruido.' },
          { id: 'ingreso', anchor: 'ingreso', label: 'Cómo llegar', text: 'La plaza queda lejos del barrio y no hay transporte accesible.' },
          { id: 'organizacion', anchor: 'organizacion', label: 'La organización', text: 'La inscripción es por una web que no funciona con lector de pantalla. El programa todavía no está decidido.' }
        ]
      },
      consult: {
        prompt: 'Consultá a quienes van a participar. Algunas respuestas abren opciones nuevas.',
        people: [
          { id: 'carla', idea: 'Coordinar los puestos de la feria', says: 'Si hay rampa al escenario, puedo presentar la feria yo misma.' },
          { id: 'bruno', idea: 'Exponer sus fotos', says: '(En LSA) Con subtítulos me entero de las charlas. Con intérprete, además puedo conversar con la gente.', unlocks: ['interprete'] },
          { id: 'ines', idea: 'Cerrar con el coro', says: 'Un programa claro, con letra grande o en audio, y llego sin perderme.' },
          { id: 'ramiro', idea: 'Torneo de penales', says: 'Una asamblea me sirve. Y si se vota con opciones en dibujos y lectura fácil, mejor todavía.', unlocks: ['votacion'] },
          { id: 'ana', idea: 'Transmitir en vivo por su podcast', says: 'Si la inscripción web funciona con mi lector, o si el programa está en audio, me arreglo sola.', unlocks: ['web_accesible'] }
        ]
      },
      transform: {
        type: 'toggle',
        dashboard: true,
        budget: 7,
        prompt: 'Tenés 7 puntos de presupuesto. Elegí los cambios que creas más justos. Hay varias soluciones válidas.',
        options: [
          { id: 'musica_fuerte', label: 'Música fuerte para animar', cost: 0, effect: 'La plaza suena muy fuerte durante todo el evento.' },
          { id: 'acompanante', label: 'Personal que decide por quienes “necesitan ayuda”', cost: 0, effect: 'Hay personal que guía a la gente sin preguntarle adónde quiere ir.' },
          { id: 'rampa', label: 'Rampa al escenario', cost: 2 },
          { id: 'transporte', label: 'Transporte accesible desde el barrio', cost: 2 },
          { id: 'subtitulos', label: 'Subtítulos en la pantalla', cost: 1 },
          { id: 'info_clara', label: 'Programa en lenguaje claro y letra grande', cost: 1 },
          { id: 'audio_guia', label: 'Programa también en audio', cost: 1 },
          { id: 'asamblea', label: 'Asamblea abierta para armar el programa', cost: 1 },
          { id: 'zona_tranquila', label: 'Zona tranquila con menos ruido y luz', cost: 1 },
          { id: 'interprete', label: 'Intérprete de LSA durante todo el evento', cost: 2, unlockBy: 'bruno' },
          { id: 'votacion', label: 'Votación con opciones en dibujos y lectura fácil', cost: 1, unlockBy: 'ramiro' },
          { id: 'web_accesible', label: 'Inscripción web compatible con lectores de pantalla', cost: 1, unlockBy: 'ana', layer: 'info_clara' }
        ],
        categories: { acceso: 'Acceso', comprension: 'Comprensión', comunicacion: 'Comunicación', decision: 'Decisión' },
        people: [
          { id: 'carla', needs: [{ cat: 'acceso', any: ['rampa'], ok: 'Sube al escenario y presenta la feria.', miss: 'No puede subir al escenario.' }], harms: [{ id: 'acompanante', text: 'Alguien decide por ella adónde ir.' }] },
          { id: 'bruno', needs: [{ cat: 'comunicacion', any: ['subtitulos', 'interprete'], ok: 'Sigue las charlas.', miss: 'No se entera de las charlas.' }] },
          { id: 'ines', needs: [{ cat: 'comprension', any: ['info_clara', 'audio_guia'], ok: 'Entiende el programa.', miss: 'El programa es confuso para ella.' }] },
          { id: 'ramiro', needs: [{ cat: 'decision', any: ['asamblea', 'votacion'], ok: 'Su torneo entró al programa.', miss: 'El programa se decide sin él.' }] },
          { id: 'ana', needs: [{ cat: 'acceso', any: ['web_accesible', 'audio_guia'], ok: 'Se inscribe y se informa sola.', miss: 'No puede inscribirse ni leer el programa por su cuenta.' }], harms: [{ id: 'acompanante', text: 'La guían sin preguntarle: pierde autonomía.' }] }
        ],
        pending: [
          { any: ['zona_tranquila'], text: 'No hay un lugar para descansar del ruido.' },
          { any: ['transporte'], text: 'Llegar desde el barrio sigue siendo difícil para muchas personas.' },
          { any: ['interprete'], text: 'Con subtítulos se entienden las charlas, pero sin intérprete Bruno no puede conversar en vivo con el público.' },
          { any: ['web_accesible'], text: 'La inscripción web todavía no funciona con lectores de pantalla.' },
          { any: ['votacion'], text: 'Votar solo en asamblea hablada deja afuera otras formas de expresarse.' },
          { not: 'musica_fuerte', text: 'La música fuerte expulsa a quienes no toleran el ruido.' }
        ],
        prioritiesQ: { q: '¿Qué priorizaste en tu plan?', options: ['Llegar y entrar', 'Entender y comunicarse', 'Decidir el programa', 'Equilibrar todo'] },
        hints: [
          'Primero asegurá que cada persona pueda participar; después usá lo que sobra para los asuntos pendientes.',
          'Algunas opciones resuelven dos cosas a la vez: el programa en audio sirve a Inés y a Ana. Consultar abre alternativas más baratas o mejores.',
          'Una base posible: rampa (2), subtítulos (1), programa en audio (1) y asamblea (1). Te quedan 2 puntos para lo pendiente.'
        ],
        okWord: 'Puede participar', noWord: 'Todavía no puede ser parte'
      },
      reflect: {
        questions: [{ q: '¿Qué asunto pendiente atenderías primero el año que viene?', options: ['El transporte', 'La zona tranquila', 'La intérprete', 'Otro'] }],
        phrases: [
          { text: 'La intención era ayudar. ¿La persona pudo decidir?', when: { everSelected: 'acompanante' } },
          { text: 'Cuando preguntaste, apareció una posibilidad que no habías pensado.', when: { consultedAny: true } },
          { text: 'Ayudar también puede quitar espacio para elegir.', when: { everSelected: 'acompanante' } },
          { text: 'Estar en el mismo lugar… ¿alcanza para ser parte?', when: { always: true } }
        ]
      },
      secret: { anchor: 'secret', label: 'Un papel en el pasto', text: 'Un volante del primer evento del barrio, de hace treinta años. Ahora hay banderines en todo el mapa.' },
      doneText: 'Tu mundo está activado. Y quedan asuntos pendientes: así es el cambio.'
    }
  };

  return { PEOPLE: PEOPLE, UI: UI, SPACES: SPACES, MISSIONS: MISSIONS };
})();
