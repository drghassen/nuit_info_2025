// Variables globales
let current = 0;
let score = 0;
const selected = new Array(questions.length).fill(null);

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('score').textContent = score;
  updateStats();
  renderQuestion();
  updateRandomFact();
  
  // Mettre à jour le fait aléatoire toutes les 15 secondes
  setInterval(updateRandomFact, 15000);
  
  // Événements des boutons
  document.getElementById('prevBtn').addEventListener('click', prevQuestion);
  document.getElementById('nextBtn').addEventListener('click', nextQuestion);
});

// Fonctions d'affichage
function createEmojiRain(emoji, count = 15) {
  for(let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'emoji-rain';
      el.textContent = emoji;
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-50px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 80);
  }
}

function createConfetti() {
  const colors = ['#4361ee', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'];
  for(let i = 0; i < 50; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 30);
  }
}

function showReaction(text) {
  const el = document.createElement('div');
  el.className = 'reaction-text';
  el.textContent = text;
  document.getElementById('quiz').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function updateMood() {
  const percentage = (score / questions.length) * 100;
  let moodIndex = Math.min(5, Math.floor(percentage / 20));
  
  const moodData = moods[moodIndex];
  const moodContainer = document.getElementById('moodMeter');
  document.getElementById('moodEmoji').textContent = moodData.emoji;
  document.getElementById('moodText').textContent = moodData.text;
  moodContainer.style.backgroundColor = moodData.color;
}

function updateRandomFact() {
  const factElement = document.getElementById('randomFact');
  if (factElement) {
    factElement.textContent = randomFacts[Math.floor(Math.random() * randomFacts.length)];
  }
}

function updateStats() {
  const answered = selected.filter(v => v !== null).length;
  const remaining = questions.length - answered;
  document.getElementById('statTotal').textContent = questions.length;
  document.getElementById('statAnswered').textContent = answered;
  document.getElementById('statRemaining').textContent = remaining;
  document.getElementById('statCorrect').textContent = score;
  updateMood();
}

function renderQuestion() {
  const q = questions[current];
  const root = document.getElementById('quiz');
  const pct = Math.round(((current) / questions.length) * 100);
  document.getElementById('progressBar').style.width = `${pct}%`;
  document.getElementById('qIndex').textContent = current + 1;
  document.getElementById('qTotal').textContent = questions.length;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  prevBtn.disabled = current === 0;
  
  if(current === questions.length - 1) {
    nextBtn.innerHTML = 'Découvrir mon destin <i class="fas fa-scroll ms-2"></i>';
  } else {
    nextBtn.innerHTML = 'Continuer l\'aventure <i class="fas fa-rocket ms-2"></i>';
  }

  root.innerHTML = `
    <div class="mb-3">
      <span class="badge bg-gradient" style="background: linear-gradient(135deg, var(--primary), var(--success));">
        📍 Question ${current+1} / ${questions.length}
      </span>
    </div>
    <div class="question-text">${q.q}</div>
    <div class="row g-3">
      ${q.options.map((opt, i) => `
        <div class="col-12">
          <button type="button" class="option ${selected[current] !== null ? (i === q.answer ? 'correct' : (i === selected[current] ? 'wrong' : '')) : ''}" data-index="${i}">
            <span class="bullet">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
          </button>
        </div>`).join('')}
    </div>
    ${selected[current] !== null ? `<div class="fun-fact-box"><strong><i class="fas fa-lightbulb me-2"></i>Le Saviez-Vous ?</strong><br>${q.funFact}</div>` : ''}
  `;

  nextBtn.disabled = (selected[current] === null);

  root.querySelectorAll('.option').forEach(el => {
    el.addEventListener('click', () => {
      if(selected[current] !== null) return;
      const idx = Number(el.dataset.index);
      selected[current] = idx;
      const isCorrect = idx === questions[current].answer;
      
      if(isCorrect) {
        score++;
        const reactions = q.reactions.correct;
        showReaction(reactions[Math.floor(Math.random() * reactions.length)]);
        createEmojiRain('⭐', 12);
        createEmojiRain('✨', 8);
      } else {
        const reactions = q.reactions.wrong;
        showReaction(reactions[Math.floor(Math.random() * reactions.length)]);
        createEmojiRain('💀', 6);
      }
      
      document.getElementById('score').textContent = score;
      nextBtn.disabled = false;
      renderQuestion();
      updateStats();
    });
  });
}

// Navigation
function prevQuestion() {
  if(current > 0) {
    current--;
    renderQuestion();
  }
}

function nextQuestion() {
  if(current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showFinalResults();
  }
}

// Résultats finaux
function showFinalResults() {
  document.getElementById('progressBar').style.width = '100%';
  const root = document.getElementById('quiz');
  const percentage = (score / questions.length) * 100;
  
  let message, subMessage, emoji, color, badge;
  
  if(percentage === 100) {
    message = "🎯 SCORE PARFAIT ! LÉGENDE CONFIRMÉE !";
    subMessage = "Vous êtes officiellement un Maître Jedi de l'IoT Éco-Responsable. Même Yoda est jaloux.";
    emoji = "👑";
    color = "warning";
    badge = "🏆 PERFECTION ABSOLUE";
    createConfetti();
    createEmojiRain('🏆', 30);
    createEmojiRain('👑', 20);
  } else if(percentage >= 80) {
    message = "🔥 EXCELLENT ! Vous êtes dans le Top 1% !";
    subMessage = "Niveau: Expert Senior Principal Architect Lead. Vous pouvez mettre ça sur LinkedIn.";
    emoji = "🚀";
    color = "success";
    badge = "⭐ EXPERT CONFIRMÉ";
    createEmojiRain('⭐', 20);
  } else if(percentage >= 60) {
    message = "👍 Solide ! Vous maîtrisez les bases !";
    subMessage = "Niveau: Développeur Conscient. Vous êtes sur la bonne voie, padawan.";
    emoji = "😎";
    color = "primary";
    badge = "💎 BON NIVEAU";
  } else if(percentage >= 40) {
    message = "😅 Pas mal ! Mais faut réviser un peu...";
    subMessage = "Niveau: Junior Prometteur. On sent le potentiel, mais faut bosser.";
    emoji = "📚";
    color = "info";
    badge = "📖 EN APPRENTISSAGE";
  } else if(percentage >= 20) {
    message = "😬 Ouch... Houston, we have a problem";
    subMessage = "Niveau: Stagiaire Premier Jour. Pas de panique, tout le monde est passé par là !";
    emoji = "🆘";
    color = "warning";
    badge = "⚠️ BESOIN DE FORMATION";
  } else {
    message = "💀 Résultat... surprenant !";
    subMessage = "Niveau: Réponses Aléatoires. Un singe qui tape au hasard aurait fait mieux (désolé).";
    emoji = "🙈";
    color = "danger";
    badge = "🚨 URGENT: RELIRE LES DOCS";
  }
  
  root.innerHTML = `<div class='text-center py-5'>
    <div class='mb-4' style='font-size: 6rem; animation: bounce 1s infinite;'>${emoji}</div>
    
    <div class='mb-3'>
      <span class='badge bg-${color} fs-6 px-3 py-2'>${badge}</span>
    </div>
    
    <h2 class='mb-3 fw-bold'>${message}</h2>
    <p class='lead mb-2'>Score Final: <strong class='text-${color} fs-3'>${score}/${questions.length}</strong> <span class='text-muted'>(${percentage.toFixed(0)}%)</span></p>
    <p class='text-muted mb-4 mx-auto' style='max-width: 600px;'>${subMessage}</p>
    
    <div class='alert alert-info mx-auto' style='max-width: 700px;'>
      <i class='fas fa-quote-left me-2'></i>
      <em>"L'IoT éco-responsable, c'est pas juste une mode, c'est une nécessité. Et aussi un excellent sujet de conversation en soirée."</em>
      <div class='mt-2 text-end'><small>- Personne (mais c'est vrai quand même)</small></div>
    </div>
    
    <div class='d-flex gap-3 justify-content-center flex-wrap mt-4'>
      <button class='btn btn-${color} btn-lg px-4' onclick='location.reload()'>
        <i class='fas fa-redo me-2'></i>Retenter ma chance
      </button>
      <a href='${typeof DASHBOARD_URL !== "undefined" ? DASHBOARD_URL : "/dashboard/"}' class='btn btn-outline-light btn-lg px-4'>
        <i class='fas fa-gauge-high me-2'></i>Retour Dashboard
      </a>
    </div>
    
    <div class='mt-5 pt-4 border-top border-secondary'>
      <small class='text-muted'>
        <i class='fas fa-heart text-danger me-1'></i>
        Quiz créé avec amour (et beaucoup de café) pour la planète 🌍
      </small>
    </div>
  </div>`;
  
  document.getElementById('prevBtn').disabled = true;
  document.getElementById('nextBtn').disabled = true;
}