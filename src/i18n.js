// UI translations. Hebrew names of tracks and garage parts live next to their data
// (trackdefs.js, physics.js, carmodel.js); every other language is here.

export const LANGS = { en: 'English', he: 'עברית', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch' };

const en = {
  title1: 'Candy Kart', title2: 'Racers', tagline: '🍭 Sweet races at crazy speed 🍩',
  mRace: '🏁 Race', mTime: '⏱️ Time Trial', mSplit: '👫 2 Players', mGarage: '🛠️ Garage', mSettings: '⚙️ Settings', mHelp: '❔ How to play',
  needKeyboard: '2-player mode needs a keyboard (computer)',
  chooseTrack: 'choose a track', back: '← Back', world: '🌍 World {n}', place: 'Place {n}', orPodium: 'or top 3 on "{track}"', allTracks: '🏁 All tracks',
  unlocked: '✨ Unlocked!', garage: '🛠️ Garage', player1: 'Player 1', player2: 'Player 2', player: 'Player',
  tabBody: '🏎️ Kart', tabWheels: '🛞 Wheels', tabTopper: '👑 Topper', tabPaint: '🎨 Paint', tabFx: '✨ Effects',
  speed: 'Speed', accel: 'Acceleration', handling: 'Handling', colorMain: 'Main color', colorAccent: 'Second color', pattern: 'Pattern', finish: 'Finish', trail: 'Boost trail',
  done: '✔ Done', colorLabel: 'Color',
  settings: '⚙️ Settings', playerName: 'Player name', difficulty: 'Difficulty', easy: '😊 Easy', normal: '😎 Normal', hard: '🔥 Hard',
  easyHint: 'On easy the steering helps you stay on the track and rivals are slower.', autoGas: 'Auto gas (touch screen)', on: 'On', off: 'Off',
  graphics: 'Graphics', gLow: 'Saver', gAuto: 'Normal', gHigh: 'High', music: 'Music', sfx: 'Sounds', language: 'Language', reset: '🗑️ Reset progress', save: '✔ Save',
  resetConfirm: 'Delete all progress, coins and records?',
  help: '❔ How to play', gasBrake: 'Gas / brake', steer: 'Steer', drift: 'Drift', useItem: 'Use item', leftShift: 'Left Shift', rightShift: 'Right Shift', space: 'Space',
  helpSolo: 'Playing alone you can also use the arrows or a gamepad. <b>Esc</b> – pause, <b>R</b> – quick restart.',
  helpDrift: '🌀 <b>Drift:</b> hold drift while turning. When the sparks turn blue or orange – let go for a turbo!',
  helpPads: '🟧 <b>Boost pads</b> on the road push you forward. <b>Ramps</b> send you flying.',
  helpItems: '🎁 <b>Mystery boxes:</b> 🚀 turbo · 🫧 bubble-gum shield · 🍬 taffy trap (dropped behind) · 🍭 candy rocket (chases whoever is ahead)',
  helpCoins: '🪙 <b>Coins:</b> collect them in races and buy tracks, karts and parts in the garage.',
  helpTime: '⏱️ <b>Time trial:</b> one lap against the ghost of your best run. Earn 🥉🥈🥇!',
  helpStart: '🙌 <b>Rocket start:</b> press gas exactly when the 1 appears in the countdown.',
  gotIt: 'Got it!',
  newRecord: 'New record! 🎉', yourBest: 'Your best: {time}', wins: '{name} wins!', victory: '🏆 Victory!', podium: 'Place {n} – well done!',
  again: '↻ Again', nextTrack: 'Next track →', menu: 'Menu', watchAd: '🎬 Watch an ad – coins ×2', doubled: 'Coins doubled! 🎉',
  pause: '⏸️ Paused', resume: '▶ Resume', restart: '↻ Restart', quit: '🏠 Quit to menu',
  buyTrack: 'Unlock "{name}" for {cost} coins?', needTrackCoins: 'You need {cost} coins to unlock this track (you have {have}).\nOr finish in the top 3 on "{prev}" and it opens for free!',
  needCoins: 'You need {cost} coins. You have {have}.', buyPart: 'Buy "{name}" for {cost} coins?', unlockBy: '"{name}" is unlocked by an achievement:\n{how}',
  howGold: 'Win {n} gold medals 🥇 in time trial', howTrophy: 'Win (1st place 🏆) on {n} different tracks', howAll: 'Finish a race on every track',
  kmh: 'km/h', go: 'GO!', rocketStart: 'Rocket start!', lastLap: 'Final lap!', lap: 'Lap {n}', lapOf: 'Lap {n}/{of}', timeTrial: 'Time trial',
  win: 'Victory!', blueTurbo: 'Blue turbo!', orangeTurbo: 'Orange turbo!', start: 'START!', rotate: 'Turn your device sideways',
  tLeft: 'Left', tRight: 'Right', tItem: 'Item', tDrift: 'Drift', tBrake: 'Brake', tGas: 'Gas',
  ai: 'Minty,Sprinkles,Caramel,Choco,Marshy,Taffy,Licorice,Gummy',
};

const he = {
  title1: 'מרוץ', title2: 'הממתקים', tagline: '🍭 מרוצים מתוקים במהירות מטורפת 🍩',
  mRace: '🏁 מרוץ', mTime: '⏱️ נגד השעון', mSplit: '👫 2 שחקנים', mGarage: '🛠️ המוסך', mSettings: '⚙️ הגדרות', mHelp: '❔ איך משחקים',
  needKeyboard: 'מצב 2 שחקנים דורש מקלדת (מחשב)',
  chooseTrack: 'בחרו מסלול', back: '→ חזרה', world: '🌍 עולם {n}', place: 'מקום {n}', orPodium: 'או מקום 1–3 ב"{track}"', allTracks: '🏁 כל המסלולים',
  unlocked: '✨ נפתח!', garage: '🛠️ המוסך', player1: 'שחקן 1', player2: 'שחקן 2', player: 'שחקן',
  tabBody: '🏎️ מכונית', tabWheels: '🛞 גלגלים', tabTopper: '👑 קישוט', tabPaint: '🎨 צבע', tabFx: '✨ אפקטים',
  speed: 'מהירות', accel: 'תאוצה', handling: 'שליטה', colorMain: 'צבע ראשי', colorAccent: 'צבע משני', pattern: 'דוגמה', finish: 'גימור', trail: 'שובל טורבו',
  done: '✔ סיום', colorLabel: 'צבע',
  settings: '⚙️ הגדרות', playerName: 'שם השחקן', difficulty: 'רמת קושי', easy: '😊 קל', normal: '😎 רגיל', hard: '🔥 קשה',
  easyHint: 'בקל – ההגה עוזר להישאר על המסלול והיריבים איטיים יותר.', autoGas: 'גז אוטומטי (מסך מגע)', on: 'פועל', off: 'כבוי',
  graphics: 'גרפיקה', gLow: 'חסכונית', gAuto: 'רגילה', gHigh: 'גבוהה', music: 'מוזיקה', sfx: 'צלילים', language: 'שפה', reset: '🗑️ איפוס התקדמות', save: '✔ שמירה',
  resetConfirm: 'למחוק את כל ההתקדמות, המטבעות והשיאים?',
  help: '❔ איך משחקים', gasBrake: 'גז / ברקס', steer: 'היגוי', drift: 'דריפט', useItem: 'שימוש בחפץ', leftShift: 'Shift שמאלי', rightShift: 'Shift ימני', space: 'רווח',
  helpSolo: "במשחק לבד אפשר להשתמש גם בחצים, וגם בשלט (ג'ויסטיק). <b>Esc</b> – הפסקה, <b>R</b> – התחלה מחדש מהירה.",
  helpDrift: '🌀 <b>דריפט:</b> החזיקו דריפט תוך כדי פנייה. כשהניצוצות כחולים או כתומים – שחררו לקבלת טורבו!',
  helpPads: '🟧 <b>משטחי טורבו</b> על הכביש נותנים דחיפה. <b>רמפות</b> מעיפות אתכם לאוויר.',
  helpItems: '🎁 <b>קופסאות הפתעה:</b> 🚀 טורבו · 🫧 מגן מסטיק · 🍬 מלכודת טופי (נזרקת אחורה) · 🍭 טיל סוכריה (רודף אחרי מי שלפניכם)',
  helpCoins: '🪙 <b>מטבעות:</b> אספו במרוצים וקנו מסלולים, מכוניות וגלגלים במוסך.',
  helpTime: '⏱️ <b>נגד השעון:</b> הקפה אחת נגד רוח הרפאים של השיא שלכם. השיגו 🥉🥈🥇!',
  helpStart: '🙌 <b>זינוק טורבו:</b> לחצו גז בדיוק כשמופיע 1 בספירה.',
  gotIt: '!הבנתי',
  newRecord: '!שיא חדש 🎉', yourBest: 'השיא שלך: {time}', wins: '{name} !ניצח', victory: '🏆 !ניצחון', podium: '!מקום {n} – כל הכבוד',
  again: '↻ שוב', nextTrack: 'המסלול הבא ←', menu: 'תפריט', watchAd: '🎬 צפו בפרסומת – מטבעות ×2', doubled: '!המטבעות הוכפלו 🎉',
  pause: '⏸️ הפסקה', resume: '▶ המשך', restart: '↻ התחלה מחדש', quit: '🏠 יציאה לתפריט',
  buyTrack: 'לפתוח את "{name}" ב-{cost} מטבעות?', needTrackCoins: 'צריך {cost} מטבעות כדי לפתוח את המסלול (יש לך {have}).\nאו: סיימו במקום 1–3 ב"{prev}" והוא ייפתח בחינם!',
  needCoins: 'צריך {cost} מטבעות. יש לך {have}.', buyPart: 'לקנות "{name}" ב-{cost} מטבעות?', unlockBy: '"{name}" נפתח בהישג:\n{how}',
  howGold: 'השיגו {n} מדליות זהב 🥇 במצב נגד השעון', howTrophy: 'נצחו (מקום 1 🏆) ב-{n} מסלולים שונים', howAll: 'סיימו מרוץ בכל המסלולים',
  kmh: 'קמ"ש', go: '!סעו', rocketStart: '!זינוק טורבו', lastLap: '!הקפה אחרונה', lap: 'הקפה {n}', lapOf: 'הקפה {n}/{of}', timeTrial: 'נגד השעון',
  win: '!ניצחון', blueTurbo: '!טורבו כחול', orangeTurbo: '!טורבו כתום', start: '!סטארט', rotate: 'סובבו את המכשיר לרוחב',
  tLeft: 'שמאלה', tRight: 'ימינה', tItem: 'חפץ', tDrift: 'דריפט', tBrake: 'ברקס', tGas: 'גז',
  ai: 'מנטה,סוכריון,קרמלה,שוקו,מרשי,טופי,לקריצה,גומי',
};

const es = {
  title1: 'Candy Kart', title2: 'Racers', tagline: '🍭 Carreras dulces a toda velocidad 🍩',
  mRace: '🏁 Carrera', mTime: '⏱️ Contrarreloj', mSplit: '👫 2 jugadores', mGarage: '🛠️ Taller', mSettings: '⚙️ Ajustes', mHelp: '❔ Cómo jugar',
  needKeyboard: 'El modo de 2 jugadores necesita un teclado (ordenador)',
  chooseTrack: 'elige una pista', back: '← Volver', world: '🌍 Mundo {n}', place: 'Puesto {n}', orPodium: 'o top 3 en "{track}"', allTracks: '🏁 Todas las pistas',
  unlocked: '✨ ¡Desbloqueado!', garage: '🛠️ Taller', player1: 'Jugador 1', player2: 'Jugador 2', player: 'Jugador',
  tabBody: '🏎️ Kart', tabWheels: '🛞 Ruedas', tabTopper: '👑 Adorno', tabPaint: '🎨 Pintura', tabFx: '✨ Efectos',
  speed: 'Velocidad', accel: 'Aceleración', handling: 'Manejo', colorMain: 'Color principal', colorAccent: 'Segundo color', pattern: 'Diseño', finish: 'Acabado', trail: 'Estela turbo',
  done: '✔ Listo', colorLabel: 'Color',
  settings: '⚙️ Ajustes', playerName: 'Nombre', difficulty: 'Dificultad', easy: '😊 Fácil', normal: '😎 Normal', hard: '🔥 Difícil',
  easyHint: 'En fácil la dirección te ayuda a seguir en la pista y los rivales van más lentos.', autoGas: 'Gas automático (pantalla táctil)', on: 'Sí', off: 'No',
  graphics: 'Gráficos', gLow: 'Ahorro', gAuto: 'Normal', gHigh: 'Altos', music: 'Música', sfx: 'Sonidos', language: 'Idioma', reset: '🗑️ Borrar progreso', save: '✔ Guardar',
  resetConfirm: '¿Borrar todo el progreso, monedas y récords?',
  help: '❔ Cómo jugar', gasBrake: 'Gas / freno', steer: 'Dirección', drift: 'Derrape', useItem: 'Usar objeto', leftShift: 'Shift izq.', rightShift: 'Shift der.', space: 'Espacio',
  helpSolo: 'Jugando solo también puedes usar las flechas o un mando. <b>Esc</b> – pausa, <b>R</b> – reinicio rápido.',
  helpDrift: '🌀 <b>Derrape:</b> mantén derrape al girar. Cuando las chispas sean azules o naranjas, ¡suelta para un turbo!',
  helpPads: '🟧 Las <b>placas turbo</b> te impulsan. Las <b>rampas</b> te hacen volar.',
  helpItems: '🎁 <b>Cajas sorpresa:</b> 🚀 turbo · 🫧 escudo de chicle · 🍬 trampa de caramelo (hacia atrás) · 🍭 cohete de caramelo (persigue al de delante)',
  helpCoins: '🪙 <b>Monedas:</b> recógelas en las carreras y compra pistas, karts y piezas en el taller.',
  helpTime: '⏱️ <b>Contrarreloj:</b> una vuelta contra el fantasma de tu mejor tiempo. ¡Gana 🥉🥈🥇!',
  helpStart: '🙌 <b>Salida turbo:</b> pulsa el gas justo cuando aparezca el 1.',
  gotIt: '¡Entendido!',
  newRecord: '¡Nuevo récord! 🎉', yourBest: 'Tu mejor: {time}', wins: '¡{name} gana!', victory: '🏆 ¡Victoria!', podium: '¡Puesto {n}, muy bien!',
  again: '↻ Otra vez', nextTrack: 'Siguiente pista →', menu: 'Menú', watchAd: '🎬 Ver anuncio – monedas ×2', doubled: '¡Monedas dobladas! 🎉',
  pause: '⏸️ Pausa', resume: '▶ Seguir', restart: '↻ Reiniciar', quit: '🏠 Salir al menú',
  buyTrack: '¿Desbloquear "{name}" por {cost} monedas?', needTrackCoins: 'Necesitas {cost} monedas para esta pista (tienes {have}).\n¡O termina en el top 3 de "{prev}" y se abre gratis!',
  needCoins: 'Necesitas {cost} monedas. Tienes {have}.', buyPart: '¿Comprar "{name}" por {cost} monedas?', unlockBy: '"{name}" se desbloquea con un logro:\n{how}',
  howGold: 'Consigue {n} medallas de oro 🥇 en contrarreloj', howTrophy: 'Gana (1.º 🏆) en {n} pistas distintas', howAll: 'Termina una carrera en todas las pistas',
  kmh: 'km/h', go: '¡YA!', rocketStart: '¡Salida turbo!', lastLap: '¡Última vuelta!', lap: 'Vuelta {n}', lapOf: 'Vuelta {n}/{of}', timeTrial: 'Contrarreloj',
  win: '¡Victoria!', blueTurbo: '¡Turbo azul!', orangeTurbo: '¡Turbo naranja!', start: '¡SALIDA!', rotate: 'Gira el dispositivo en horizontal',
  tLeft: 'Izquierda', tRight: 'Derecha', tItem: 'Objeto', tDrift: 'Derrape', tBrake: 'Freno', tGas: 'Gas',
  ai: 'Menta,Chispa,Caramela,Choco,Malvi,Toffi,Regaliz,Gomita',
};

const pt = {
  title1: 'Candy Kart', title2: 'Racers', tagline: '🍭 Corridas doces em alta velocidade 🍩',
  mRace: '🏁 Corrida', mTime: '⏱️ Contra o relógio', mSplit: '👫 2 jogadores', mGarage: '🛠️ Garagem', mSettings: '⚙️ Opções', mHelp: '❔ Como jogar',
  needKeyboard: 'O modo 2 jogadores precisa de teclado (computador)',
  chooseTrack: 'escolha uma pista', back: '← Voltar', world: '🌍 Mundo {n}', place: '{n}º lugar', orPodium: 'ou top 3 em "{track}"', allTracks: '🏁 Todas as pistas',
  unlocked: '✨ Desbloqueado!', garage: '🛠️ Garagem', player1: 'Jogador 1', player2: 'Jogador 2', player: 'Jogador',
  tabBody: '🏎️ Kart', tabWheels: '🛞 Rodas', tabTopper: '👑 Enfeite', tabPaint: '🎨 Pintura', tabFx: '✨ Efeitos',
  speed: 'Velocidade', accel: 'Aceleração', handling: 'Controle', colorMain: 'Cor principal', colorAccent: 'Segunda cor', pattern: 'Estampa', finish: 'Acabamento', trail: 'Rastro turbo',
  done: '✔ Pronto', colorLabel: 'Cor',
  settings: '⚙️ Opções', playerName: 'Nome', difficulty: 'Dificuldade', easy: '😊 Fácil', normal: '😎 Normal', hard: '🔥 Difícil',
  easyHint: 'No fácil a direção ajuda a ficar na pista e os rivais são mais lentos.', autoGas: 'Acelerador automático (tela de toque)', on: 'Ligado', off: 'Desligado',
  graphics: 'Gráficos', gLow: 'Econômico', gAuto: 'Normal', gHigh: 'Alto', music: 'Música', sfx: 'Sons', language: 'Idioma', reset: '🗑️ Apagar progresso', save: '✔ Salvar',
  resetConfirm: 'Apagar todo o progresso, moedas e recordes?',
  help: '❔ Como jogar', gasBrake: 'Acelerar / frear', steer: 'Direção', drift: 'Drift', useItem: 'Usar item', leftShift: 'Shift esq.', rightShift: 'Shift dir.', space: 'Espaço',
  helpSolo: 'Jogando sozinho você também pode usar as setas ou um controle. <b>Esc</b> – pausa, <b>R</b> – reinício rápido.',
  helpDrift: '🌀 <b>Drift:</b> segure drift na curva. Quando as faíscas ficarem azuis ou laranja, solte para ganhar turbo!',
  helpPads: '🟧 As <b>placas turbo</b> dão impulso. As <b>rampas</b> fazem você voar.',
  helpItems: '🎁 <b>Caixas surpresa:</b> 🚀 turbo · 🫧 escudo de chiclete · 🍬 armadilha de bala (para trás) · 🍭 foguete de doce (persegue quem está na frente)',
  helpCoins: '🪙 <b>Moedas:</b> colete nas corridas e compre pistas, karts e peças na garagem.',
  helpTime: '⏱️ <b>Contra o relógio:</b> uma volta contra o fantasma do seu recorde. Ganhe 🥉🥈🥇!',
  helpStart: '🙌 <b>Largada turbo:</b> acelere exatamente quando aparecer o 1.',
  gotIt: 'Entendi!',
  newRecord: 'Novo recorde! 🎉', yourBest: 'Seu recorde: {time}', wins: '{name} venceu!', victory: '🏆 Vitória!', podium: '{n}º lugar – muito bem!',
  again: '↻ De novo', nextTrack: 'Próxima pista →', menu: 'Menu', watchAd: '🎬 Ver anúncio – moedas ×2', doubled: 'Moedas dobradas! 🎉',
  pause: '⏸️ Pausa', resume: '▶ Continuar', restart: '↻ Reiniciar', quit: '🏠 Voltar ao menu',
  buyTrack: 'Desbloquear "{name}" por {cost} moedas?', needTrackCoins: 'Você precisa de {cost} moedas para esta pista (tem {have}).\nOu termine no top 3 em "{prev}" e ela abre de graça!',
  needCoins: 'Você precisa de {cost} moedas. Tem {have}.', buyPart: 'Comprar "{name}" por {cost} moedas?', unlockBy: '"{name}" é desbloqueado por uma conquista:\n{how}',
  howGold: 'Ganhe {n} medalhas de ouro 🥇 no contra o relógio', howTrophy: 'Vença (1º 🏆) em {n} pistas diferentes', howAll: 'Termine uma corrida em todas as pistas',
  kmh: 'km/h', go: 'VAI!', rocketStart: 'Largada turbo!', lastLap: 'Última volta!', lap: 'Volta {n}', lapOf: 'Volta {n}/{of}', timeTrial: 'Contra o relógio',
  win: 'Vitória!', blueTurbo: 'Turbo azul!', orangeTurbo: 'Turbo laranja!', start: 'LARGADA!', rotate: 'Vire o aparelho na horizontal',
  tLeft: 'Esquerda', tRight: 'Direita', tItem: 'Item', tDrift: 'Drift', tBrake: 'Freio', tGas: 'Acelerar',
  ai: 'Menta,Granulado,Caramela,Choco,Marsh,Bala,Alcaçuz,Jujuba',
};

const fr = {
  title1: 'Candy Kart', title2: 'Racers', tagline: '🍭 Des courses sucrées à toute vitesse 🍩',
  mRace: '🏁 Course', mTime: '⏱️ Contre-la-montre', mSplit: '👫 2 joueurs', mGarage: '🛠️ Garage', mSettings: '⚙️ Réglages', mHelp: '❔ Comment jouer',
  needKeyboard: 'Le mode 2 joueurs nécessite un clavier (ordinateur)',
  chooseTrack: 'choisis un circuit', back: '← Retour', world: '🌍 Monde {n}', place: '{n}e place', orPodium: 'ou top 3 sur « {track} »', allTracks: '🏁 Tous les circuits',
  unlocked: '✨ Débloqué !', garage: '🛠️ Garage', player1: 'Joueur 1', player2: 'Joueur 2', player: 'Joueur',
  tabBody: '🏎️ Kart', tabWheels: '🛞 Roues', tabTopper: '👑 Déco', tabPaint: '🎨 Peinture', tabFx: '✨ Effets',
  speed: 'Vitesse', accel: 'Accélération', handling: 'Maniabilité', colorMain: 'Couleur principale', colorAccent: 'Deuxième couleur', pattern: 'Motif', finish: 'Finition', trail: 'Traînée turbo',
  done: '✔ Terminé', colorLabel: 'Couleur',
  settings: '⚙️ Réglages', playerName: 'Nom', difficulty: 'Difficulté', easy: '😊 Facile', normal: '😎 Normal', hard: '🔥 Difficile',
  easyHint: 'En facile, la direction t’aide à rester sur la piste et les rivaux sont plus lents.', autoGas: 'Accélération auto (écran tactile)', on: 'Oui', off: 'Non',
  graphics: 'Graphismes', gLow: 'Économie', gAuto: 'Normal', gHigh: 'Élevé', music: 'Musique', sfx: 'Sons', language: 'Langue', reset: '🗑️ Effacer la progression', save: '✔ Enregistrer',
  resetConfirm: 'Effacer toute la progression, les pièces et les records ?',
  help: '❔ Comment jouer', gasBrake: 'Accélérer / freiner', steer: 'Diriger', drift: 'Dérapage', useItem: 'Utiliser un objet', leftShift: 'Maj gauche', rightShift: 'Maj droite', space: 'Espace',
  helpSolo: 'En solo, tu peux aussi utiliser les flèches ou une manette. <b>Échap</b> – pause, <b>R</b> – recommencer.',
  helpDrift: '🌀 <b>Dérapage :</b> maintiens dérapage dans un virage. Quand les étincelles sont bleues ou orange, relâche pour un turbo !',
  helpPads: '🟧 Les <b>plaques turbo</b> te propulsent. Les <b>tremplins</b> te font voler.',
  helpItems: '🎁 <b>Boîtes surprise :</b> 🚀 turbo · 🫧 bouclier chewing-gum · 🍬 piège caramel (lancé derrière) · 🍭 fusée bonbon (poursuit celui devant)',
  helpCoins: '🪙 <b>Pièces :</b> ramasse-les en course et achète circuits, karts et pièces au garage.',
  helpTime: '⏱️ <b>Contre-la-montre :</b> un tour contre le fantôme de ton record. Gagne 🥉🥈🥇 !',
  helpStart: '🙌 <b>Départ turbo :</b> accélère pile quand le 1 apparaît.',
  gotIt: 'Compris !',
  newRecord: 'Nouveau record ! 🎉', yourBest: 'Ton record : {time}', wins: '{name} gagne !', victory: '🏆 Victoire !', podium: '{n}e place, bravo !',
  again: '↻ Rejouer', nextTrack: 'Circuit suivant →', menu: 'Menu', watchAd: '🎬 Voir une pub – pièces ×2', doubled: 'Pièces doublées ! 🎉',
  pause: '⏸️ Pause', resume: '▶ Reprendre', restart: '↻ Recommencer', quit: '🏠 Retour au menu',
  buyTrack: 'Débloquer « {name} » pour {cost} pièces ?', needTrackCoins: 'Il faut {cost} pièces pour ce circuit (tu en as {have}).\nOu finis dans le top 3 sur « {prev} » et il s’ouvre gratuitement !',
  needCoins: 'Il faut {cost} pièces. Tu en as {have}.', buyPart: 'Acheter « {name} » pour {cost} pièces ?', unlockBy: '« {name} » se débloque avec un exploit :\n{how}',
  howGold: 'Gagne {n} médailles d’or 🥇 en contre-la-montre', howTrophy: 'Gagne (1re place 🏆) sur {n} circuits différents', howAll: 'Termine une course sur chaque circuit',
  kmh: 'km/h', go: 'PARTEZ !', rocketStart: 'Départ turbo !', lastLap: 'Dernier tour !', lap: 'Tour {n}', lapOf: 'Tour {n}/{of}', timeTrial: 'Contre-la-montre',
  win: 'Victoire !', blueTurbo: 'Turbo bleu !', orangeTurbo: 'Turbo orange !', start: 'DÉPART !', rotate: 'Tourne ton appareil à l’horizontale',
  tLeft: 'Gauche', tRight: 'Droite', tItem: 'Objet', tDrift: 'Dérapage', tBrake: 'Frein', tGas: 'Accélérer',
  ai: 'Menthe,Paillette,Caramel,Choco,Guimauve,Toffee,Réglisse,Gommette',
};

const de = {
  title1: 'Candy Kart', title2: 'Racers', tagline: '🍭 Süße Rennen mit irrem Tempo 🍩',
  mRace: '🏁 Rennen', mTime: '⏱️ Zeitfahren', mSplit: '👫 2 Spieler', mGarage: '🛠️ Garage', mSettings: '⚙️ Einstellungen', mHelp: '❔ Anleitung',
  needKeyboard: 'Der 2-Spieler-Modus braucht eine Tastatur (Computer)',
  chooseTrack: 'Strecke wählen', back: '← Zurück', world: '🌍 Welt {n}', place: 'Platz {n}', orPodium: 'oder Top 3 auf „{track}“', allTracks: '🏁 Alle Strecken',
  unlocked: '✨ Freigeschaltet!', garage: '🛠️ Garage', player1: 'Spieler 1', player2: 'Spieler 2', player: 'Spieler',
  tabBody: '🏎️ Kart', tabWheels: '🛞 Räder', tabTopper: '👑 Deko', tabPaint: '🎨 Lack', tabFx: '✨ Effekte',
  speed: 'Tempo', accel: 'Beschleunigung', handling: 'Handling', colorMain: 'Hauptfarbe', colorAccent: 'Zweitfarbe', pattern: 'Muster', finish: 'Oberfläche', trail: 'Turbo-Spur',
  done: '✔ Fertig', colorLabel: 'Farbe',
  settings: '⚙️ Einstellungen', playerName: 'Name', difficulty: 'Schwierigkeit', easy: '😊 Leicht', normal: '😎 Normal', hard: '🔥 Schwer',
  easyHint: 'Auf leicht hilft die Lenkung auf der Strecke zu bleiben und die Gegner sind langsamer.', autoGas: 'Auto-Gas (Touchscreen)', on: 'An', off: 'Aus',
  graphics: 'Grafik', gLow: 'Sparsam', gAuto: 'Normal', gHigh: 'Hoch', music: 'Musik', sfx: 'Sounds', language: 'Sprache', reset: '🗑️ Fortschritt löschen', save: '✔ Speichern',
  resetConfirm: 'Gesamten Fortschritt, Münzen und Rekorde löschen?',
  help: '❔ Anleitung', gasBrake: 'Gas / Bremse', steer: 'Lenken', drift: 'Driften', useItem: 'Item benutzen', leftShift: 'Shift links', rightShift: 'Shift rechts', space: 'Leertaste',
  helpSolo: 'Allein kannst du auch die Pfeiltasten oder ein Gamepad nutzen. <b>Esc</b> – Pause, <b>R</b> – Schnellstart.',
  helpDrift: '🌀 <b>Driften:</b> halte Drift in der Kurve. Wenn die Funken blau oder orange sind – loslassen für Turbo!',
  helpPads: '🟧 <b>Turbofelder</b> geben dir Schub. <b>Rampen</b> lassen dich fliegen.',
  helpItems: '🎁 <b>Überraschungsboxen:</b> 🚀 Turbo · 🫧 Kaugummi-Schild · 🍬 Toffee-Falle (nach hinten) · 🍭 Bonbon-Rakete (jagt den Vordermann)',
  helpCoins: '🪙 <b>Münzen:</b> sammle sie in Rennen und kaufe Strecken, Karts und Teile in der Garage.',
  helpTime: '⏱️ <b>Zeitfahren:</b> eine Runde gegen den Geist deiner Bestzeit. Hol dir 🥉🥈🥇!',
  helpStart: '🙌 <b>Turbostart:</b> gib Gas genau wenn die 1 erscheint.',
  gotIt: 'Verstanden!',
  newRecord: 'Neuer Rekord! 🎉', yourBest: 'Deine Bestzeit: {time}', wins: '{name} gewinnt!', victory: '🏆 Sieg!', podium: 'Platz {n} – super!',
  again: '↻ Nochmal', nextTrack: 'Nächste Strecke →', menu: 'Menü', watchAd: '🎬 Werbung ansehen – Münzen ×2', doubled: 'Münzen verdoppelt! 🎉',
  pause: '⏸️ Pause', resume: '▶ Weiter', restart: '↻ Neustart', quit: '🏠 Zum Menü',
  buyTrack: '„{name}“ für {cost} Münzen freischalten?', needTrackCoins: 'Du brauchst {cost} Münzen für diese Strecke (du hast {have}).\nOder fahre auf „{prev}“ in die Top 3 und sie wird kostenlos frei!',
  needCoins: 'Du brauchst {cost} Münzen. Du hast {have}.', buyPart: '„{name}“ für {cost} Münzen kaufen?', unlockBy: '„{name}“ wird durch einen Erfolg freigeschaltet:\n{how}',
  howGold: 'Hol {n} Goldmedaillen 🥇 im Zeitfahren', howTrophy: 'Gewinne (Platz 1 🏆) auf {n} verschiedenen Strecken', howAll: 'Beende ein Rennen auf jeder Strecke',
  kmh: 'km/h', go: 'LOS!', rocketStart: 'Turbostart!', lastLap: 'Letzte Runde!', lap: 'Runde {n}', lapOf: 'Runde {n}/{of}', timeTrial: 'Zeitfahren',
  win: 'Sieg!', blueTurbo: 'Blauer Turbo!', orangeTurbo: 'Oranger Turbo!', start: 'START!', rotate: 'Dreh dein Gerät quer',
  tLeft: 'Links', tRight: 'Rechts', tItem: 'Item', tDrift: 'Drift', tBrake: 'Bremse', tGas: 'Gas',
  ai: 'Minzi,Streusel,Karamella,Schoko,Marshi,Toffee,Lakritz,Gummi',
};

// names of tracks and garage parts (Hebrew comes from the data files)
const NAMES = {
  en: {
    'track.lollipop': ['Lollipop Lane', 'A gentle first track – perfect to start'],
    'track.choco': ['Chocolate Valley', 'Hills, a jump and a chocolate river'],
    'track.cake': ['Cake Mountain', 'A giant figure-8 with a bridge over the cake'],
    'track.marsh': ['Marshmallow Loop', 'A huge loop! You need lots of speed'],
    'track.licorice': ['Licorice Tornado', 'Loop, jumps and twists – the craziest of world 1'],
    'track.glacier': ['Ice Cream Glacier', 'Long sweeping corners on ice and ice cream'],
    'track.gummy': ['Gummy Jungle', 'Chicanes, gummy bears and a bridge over the valley'],
    'track.clouds': ['Cotton Candy Clouds', 'A sky-high track with a giant spiral'],
    'track.factory': ['Candy Factory', 'Double loop and boost pads everywhere'],
    'track.volcano': ['Chocolate Volcano', 'The final challenge: loop, spiral and three jumps'],
    'bodies.kart': 'Candy Kart', 'bodies.cupcake': 'Turbo Cupcake', 'bodies.cookie': 'Lightning Cookie', 'bodies.icecream': 'Ice Cream Truck',
    'bodies.donut': 'Donut Racer', 'bodies.gummy': 'Gummy Bear', 'bodies.choco': 'Choco Bar', 'bodies.rocket': 'Candy Rocket',
    'wheels.donut': 'Donut', 'wheels.cookie': 'Cookie', 'wheels.mint': 'Peppermint', 'wheels.gumball': 'Gumball', 'wheels.licorice': 'Licorice', 'wheels.jelly': 'Jelly', 'wheels.lolli': 'Lollipop',
    'toppers.none': 'None', 'toppers.cherry': 'Cherry', 'toppers.star': 'Star', 'toppers.bow': 'Bow', 'toppers.candle': 'Birthday candle', 'toppers.antenna': 'Candy antenna',
    'toppers.chef': 'Chef hat', 'toppers.propeller': 'Propeller', 'toppers.horn': 'Unicorn horn', 'toppers.crown': 'Crown',
    'patterns.none': 'Plain', 'patterns.stripes': 'Stripes', 'patterns.dots': 'Dots', 'patterns.sprinkles': 'Sprinkles', 'patterns.checker': 'Checkers', 'patterns.hearts': 'Hearts', 'patterns.flames': 'Flames',
    'finishes.gloss': 'Gloss', 'finishes.matte': 'Matte', 'finishes.metal': 'Metallic', 'finishes.sparkle': 'Glitter',
    'trails.classic': 'Fire', 'trails.rainbow': 'Rainbow', 'trails.hearts': 'Hearts', 'trails.stars': 'Stars', 'trails.snow': 'Snow',
  },
  es: {
    'track.lollipop': ['Senda de Piruletas', 'Una pista suave para empezar'], 'track.choco': ['Valle de Chocolate', 'Colinas, un salto y un río de chocolate'],
    'track.cake': ['Monte Pastel', 'Un ocho gigante con puente sobre el pastel'], 'track.marsh': ['Rizo de Malvavisco', '¡Un rizo enorme! Necesitas mucha velocidad'],
    'track.licorice': ['Tornado de Regaliz', 'Rizo, saltos y curvas: la más loca del mundo 1'], 'track.glacier': ['Glaciar de Helado', 'Curvas largas sobre hielo y helado'],
    'track.gummy': ['Selva de Gominolas', 'Chicanes, ositos de goma y un puente'], 'track.clouds': ['Nubes de Algodón', 'Una pista en el cielo con una espiral gigante'],
    'track.factory': ['Fábrica de Caramelos', 'Doble rizo y placas turbo por todas partes'], 'track.volcano': ['Volcán de Chocolate', 'El reto final: rizo, espiral y tres saltos'],
    'bodies.kart': 'Kart Caramelo', 'bodies.cupcake': 'Cupcake Turbo', 'bodies.cookie': 'Galleta Rayo', 'bodies.icecream': 'Camión de Helados',
    'bodies.donut': 'Dónut Veloz', 'bodies.gummy': 'Osito de Goma', 'bodies.choco': 'Tableta de Choco', 'bodies.rocket': 'Cohete Dulce',
    'wheels.donut': 'Dónut', 'wheels.cookie': 'Galleta', 'wheels.mint': 'Menta', 'wheels.gumball': 'Chicle bola', 'wheels.licorice': 'Regaliz', 'wheels.jelly': 'Gelatina', 'wheels.lolli': 'Piruleta',
    'toppers.none': 'Nada', 'toppers.cherry': 'Cereza', 'toppers.star': 'Estrella', 'toppers.bow': 'Lazo', 'toppers.candle': 'Vela', 'toppers.antenna': 'Antena dulce',
    'toppers.chef': 'Gorro de chef', 'toppers.propeller': 'Hélice', 'toppers.horn': 'Cuerno de unicornio', 'toppers.crown': 'Corona',
    'patterns.none': 'Liso', 'patterns.stripes': 'Rayas', 'patterns.dots': 'Lunares', 'patterns.sprinkles': 'Fideos de colores', 'patterns.checker': 'Cuadros', 'patterns.hearts': 'Corazones', 'patterns.flames': 'Llamas',
    'finishes.gloss': 'Brillante', 'finishes.matte': 'Mate', 'finishes.metal': 'Metálico', 'finishes.sparkle': 'Purpurina',
    'trails.classic': 'Fuego', 'trails.rainbow': 'Arcoíris', 'trails.hearts': 'Corazones', 'trails.stars': 'Estrellas', 'trails.snow': 'Nieve',
  },
  pt: {
    'track.lollipop': ['Trilha do Pirulito', 'Uma pista tranquila para começar'], 'track.choco': ['Vale do Chocolate', 'Morros, um salto e um rio de chocolate'],
    'track.cake': ['Montanha de Bolo', 'Um oito gigante com ponte sobre o bolo'], 'track.marsh': ['Looping de Marshmallow', 'Um looping enorme! Precisa de muita velocidade'],
    'track.licorice': ['Tornado de Alcaçuz', 'Looping, saltos e curvas: a mais louca do mundo 1'], 'track.glacier': ['Geleira de Sorvete', 'Curvas longas no gelo e no sorvete'],
    'track.gummy': ['Selva de Jujuba', 'Chicanes, ursinhos de goma e uma ponte'], 'track.clouds': ['Nuvens de Algodão-Doce', 'Uma pista no céu com uma espiral gigante'],
    'track.factory': ['Fábrica de Doces', 'Looping duplo e placas turbo por todo lado'], 'track.volcano': ['Vulcão de Chocolate', 'O desafio final: looping, espiral e três saltos'],
    'bodies.kart': 'Kart Doce', 'bodies.cupcake': 'Cupcake Turbo', 'bodies.cookie': 'Biscoito Relâmpago', 'bodies.icecream': 'Caminhão de Sorvete',
    'bodies.donut': 'Donut Veloz', 'bodies.gummy': 'Ursinho de Goma', 'bodies.choco': 'Barra de Chocolate', 'bodies.rocket': 'Foguete Doce',
    'wheels.donut': 'Donut', 'wheels.cookie': 'Biscoito', 'wheels.mint': 'Hortelã', 'wheels.gumball': 'Chiclete', 'wheels.licorice': 'Alcaçuz', 'wheels.jelly': 'Gelatina', 'wheels.lolli': 'Pirulito',
    'toppers.none': 'Nada', 'toppers.cherry': 'Cereja', 'toppers.star': 'Estrela', 'toppers.bow': 'Laço', 'toppers.candle': 'Vela', 'toppers.antenna': 'Antena doce',
    'toppers.chef': 'Chapéu de chef', 'toppers.propeller': 'Hélice', 'toppers.horn': 'Chifre de unicórnio', 'toppers.crown': 'Coroa',
    'patterns.none': 'Liso', 'patterns.stripes': 'Listras', 'patterns.dots': 'Bolinhas', 'patterns.sprinkles': 'Granulado', 'patterns.checker': 'Xadrez', 'patterns.hearts': 'Corações', 'patterns.flames': 'Chamas',
    'finishes.gloss': 'Brilhante', 'finishes.matte': 'Fosco', 'finishes.metal': 'Metálico', 'finishes.sparkle': 'Glitter',
    'trails.classic': 'Fogo', 'trails.rainbow': 'Arco-íris', 'trails.hearts': 'Corações', 'trails.stars': 'Estrelas', 'trails.snow': 'Neve',
  },
  fr: {
    'track.lollipop': ['Allée des Sucettes', 'Un premier circuit tout doux'], 'track.choco': ['Vallée Chocolat', 'Collines, un saut et une rivière de chocolat'],
    'track.cake': ['Mont Gâteau', 'Un huit géant avec un pont au-dessus du gâteau'], 'track.marsh': ['Looping Guimauve', 'Un looping géant ! Il faut beaucoup de vitesse'],
    'track.licorice': ['Tornade Réglisse', 'Looping, sauts et virages : le plus fou du monde 1'], 'track.glacier': ['Glacier Glacé', 'De longs virages sur la glace'],
    'track.gummy': ['Jungle Bonbons', 'Chicanes, oursons gélifiés et un pont'], 'track.clouds': ['Nuages Barbe à Papa', 'Un circuit dans le ciel avec une spirale géante'],
    'track.factory': ['Usine à Bonbons', 'Double looping et plaques turbo partout'], 'track.volcano': ['Volcan Chocolat', 'Le défi final : looping, spirale et trois sauts'],
    'bodies.kart': 'Kart Bonbon', 'bodies.cupcake': 'Cupcake Turbo', 'bodies.cookie': 'Cookie Éclair', 'bodies.icecream': 'Camion de Glaces',
    'bodies.donut': 'Donut Racer', 'bodies.gummy': 'Ourson Gélifié', 'bodies.choco': 'Tablette Choco', 'bodies.rocket': 'Fusée Bonbon',
    'wheels.donut': 'Donut', 'wheels.cookie': 'Cookie', 'wheels.mint': 'Menthe', 'wheels.gumball': 'Boule de gomme', 'wheels.licorice': 'Réglisse', 'wheels.jelly': 'Gelée', 'wheels.lolli': 'Sucette',
    'toppers.none': 'Aucun', 'toppers.cherry': 'Cerise', 'toppers.star': 'Étoile', 'toppers.bow': 'Nœud', 'toppers.candle': 'Bougie', 'toppers.antenna': 'Antenne bonbon',
    'toppers.chef': 'Toque de chef', 'toppers.propeller': 'Hélice', 'toppers.horn': 'Corne de licorne', 'toppers.crown': 'Couronne',
    'patterns.none': 'Uni', 'patterns.stripes': 'Rayures', 'patterns.dots': 'Pois', 'patterns.sprinkles': 'Vermicelles', 'patterns.checker': 'Damier', 'patterns.hearts': 'Cœurs', 'patterns.flames': 'Flammes',
    'finishes.gloss': 'Brillant', 'finishes.matte': 'Mat', 'finishes.metal': 'Métallisé', 'finishes.sparkle': 'Paillettes',
    'trails.classic': 'Feu', 'trails.rainbow': 'Arc-en-ciel', 'trails.hearts': 'Cœurs', 'trails.stars': 'Étoiles', 'trails.snow': 'Neige',
  },
  de: {
    'track.lollipop': ['Lutscherweg', 'Eine sanfte erste Strecke'], 'track.choco': ['Schokotal', 'Hügel, ein Sprung und ein Schokofluss'],
    'track.cake': ['Tortenberg', 'Eine riesige Acht mit Brücke über der Torte'], 'track.marsh': ['Marshmallow-Looping', 'Ein riesiger Looping! Du brauchst viel Tempo'],
    'track.licorice': ['Lakritz-Tornado', 'Looping, Sprünge und Kurven: die wildeste in Welt 1'], 'track.glacier': ['Eiscreme-Gletscher', 'Lange Kurven auf Eis und Eiscreme'],
    'track.gummy': ['Gummibär-Dschungel', 'Schikanen, Gummibärchen und eine Brücke'], 'track.clouds': ['Zuckerwatte-Wolken', 'Eine Strecke im Himmel mit Riesenspirale'],
    'track.factory': ['Bonbonfabrik', 'Doppel-Looping und überall Turbofelder'], 'track.volcano': ['Schoko-Vulkan', 'Die letzte Prüfung: Looping, Spirale und drei Sprünge'],
    'bodies.kart': 'Bonbon-Kart', 'bodies.cupcake': 'Turbo-Cupcake', 'bodies.cookie': 'Blitz-Keks', 'bodies.icecream': 'Eiswagen',
    'bodies.donut': 'Donut-Racer', 'bodies.gummy': 'Gummibär', 'bodies.choco': 'Schokoriegel', 'bodies.rocket': 'Bonbon-Rakete',
    'wheels.donut': 'Donut', 'wheels.cookie': 'Keks', 'wheels.mint': 'Pfefferminz', 'wheels.gumball': 'Kaugummikugel', 'wheels.licorice': 'Lakritz', 'wheels.jelly': 'Wackelpudding', 'wheels.lolli': 'Lutscher',
    'toppers.none': 'Keins', 'toppers.cherry': 'Kirsche', 'toppers.star': 'Stern', 'toppers.bow': 'Schleife', 'toppers.candle': 'Geburtstagskerze', 'toppers.antenna': 'Bonbon-Antenne',
    'toppers.chef': 'Kochmütze', 'toppers.propeller': 'Propeller', 'toppers.horn': 'Einhorn-Horn', 'toppers.crown': 'Krone',
    'patterns.none': 'Glatt', 'patterns.stripes': 'Streifen', 'patterns.dots': 'Punkte', 'patterns.sprinkles': 'Streusel', 'patterns.checker': 'Karo', 'patterns.hearts': 'Herzen', 'patterns.flames': 'Flammen',
    'finishes.gloss': 'Glanz', 'finishes.matte': 'Matt', 'finishes.metal': 'Metallic', 'finishes.sparkle': 'Glitzer',
    'trails.classic': 'Feuer', 'trails.rainbow': 'Regenbogen', 'trails.hearts': 'Herzen', 'trails.stars': 'Sterne', 'trails.snow': 'Schnee',
  },
};

const DICT = { en, he, es, pt, fr, de };
let lang = 'en';

export function detectLang(saved) {
  if (saved && DICT[saved]) return saved;
  const langs = navigator.languages || [navigator.language || 'en'];
  for (const l of langs) {
    let code = (l || '').slice(0, 2).toLowerCase();
    if (code === 'iw') code = 'he';
    if (DICT[code]) return code;
  }
  return 'en';
}

export function setLang(l) {
  lang = DICT[l] ? l : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.title = lang === 'he' ? 'מרוץ הממתקים' : 'Candy Kart Racers';
  const rot = document.getElementById('rotate');
  if (rot) rot.innerHTML = `🔄<br>${t('rotate')}`;
}

export const getLang = () => lang;
export const isRTL = () => lang === 'he';

export function t(key, params = {}) {
  let s = DICT[lang][key] ?? en[key] ?? key;
  for (const k in params) s = s.split(`{${k}}`).join(params[k]);
  return s;
}

// track name / description
export function trackName(def) {
  if (lang === 'he') return def.name;
  return (NAMES[lang]?.[`track.${def.id}`] || NAMES.en[`track.${def.id}`])[0];
}
export function trackDesc(def) {
  if (lang === 'he') return def.desc;
  return (NAMES[lang]?.[`track.${def.id}`] || NAMES.en[`track.${def.id}`])[1];
}

// garage part name: group is a save.owned key (bodies, wheels, toppers, patterns, finishes, trails)
export function partName(group, id, info) {
  if (lang === 'he') return info.name;
  return NAMES[lang]?.[`${group}.${id}`] || NAMES.en[`${group}.${id}`] || info.name;
}

export const aiNames = () => t('ai').split(',');
