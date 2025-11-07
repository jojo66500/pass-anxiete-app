// ============ MODIFICATION POUR DURÉES RÉELLES + 2 MUSIQUES ============

// Configuration des fichiers audio avec durées RÉELLES
const hypnoConfig = {
    6: {
        title: 'Session Courte',
        description: 'Relaxation rapide et ancrage positif',
        audioUrl: './audio/hypnotherapie/hypnose_session_courte.mp3',
        backgroundMusic: './audio/musiques/Wind_Among_the_Trees.mp3',
        realDuration: 469, // 7:49 minutes réelles
        displayDuration: '7:49 min'
    },
    10: {
        title: 'Session Standard', 
        description: 'Induction complète et suggestions thérapeutiques',
        audioUrl: './audio/hypnotherapie/hypnose_session_standard.mp3',
        backgroundMusic: './audio/musiques/Calme_Intrieur.mp3',
        realDuration: 602, // 10:02 minutes réelles
        displayDuration: '10:02 min'
    },
    20: {
        title: 'Session Complète',
        description: 'Transformation profonde et intégration durable',
        audioUrl: './audio/hypnotherapie/hypnose_session_complete.mp3',
        backgroundMusic: './audio/musiques/Wind_Among_the_Trees.mp3',
        realDuration: 1109, // 18:29 minutes réelles
        displayDuration: '18:29 min'
    }
};

const meditationConfig = {
    6: {
        title: 'Méditation Express',
        description: 'Retour au calme et centrage rapide',
        audioUrl: './audio/meditation/meditation_express.mp3',
        backgroundMusic: './audio/musiques/Calme_Intrieur.mp3',
        realDuration: 458, // 7:38 minutes réelles
        displayDuration: '7:38 min'
    },
    10: {
        title: 'Méditation Guidée',
        description: 'Pleine conscience et observation des pensées',
        audioUrl: './audio/meditation/meditation_guidee.mp3',
        backgroundMusic: './audio/musiques/Wind_Among_the_Trees.mp3',
        realDuration: 662, // 11:02 minutes réelles
        displayDuration: '11:02 min'
    },
    20: {
        title: 'Méditation Profonde',
        description: 'Exploration intérieure et paix durable',
        audioUrl: './audio/meditation/meditation_profonde.mp3',
        backgroundMusic: './audio/musiques/Calme_Intrieur.mp3',
        realDuration: 1206, // 20:06 minutes réelles
        displayDuration: '20:06 min'
    }
};

// Mode crise avec durée réelle
const criseConfig = {
    audioUrl: './audio/crise/scan_corporel_urgence.mp3',
    backgroundMusic: './audio/musiques/Wind_Among_the_Trees.mp3',
    realDuration: 226, // 3:46 minutes réelles
    displayDuration: '3:46 min'
};

// Variables globales pour l'audio
let currentHypnoAudio = null;
let currentHypnoBackground = null;
let currentMeditationAudio = null;
let currentMeditationBackground = null;
let currentCriseAudio = null;
let currentCriseBackground = null;
let hypnoProgressInterval = null;
let meditationProgressInterval = null;
let hypnoBackgroundEnabled = true;
let meditationBackgroundEnabled = true;
let criseBackgroundEnabled = true;

// ============ FONCTIONS HYPNOTHÉRAPIE MODIFIÉES ============

function startHypnotherapySession(duration) {
    goToScreen('hypnotherapy-session-screen');
    
    const config = hypnoConfig[duration];
    
    // Configuration de l'interface avec durées réelles
    document.getElementById('hypno-session-title').textContent = config.title + ' - ' + config.displayDuration;
    document.getElementById('hypno-total-time').textContent = config.displayDuration;
    document.getElementById('hypno-current-time').textContent = '0:00';
    document.getElementById('hypno-progress').style.width = '0%';
    
    // Créer l'élément audio principal
    currentHypnoAudio = new Audio(config.audioUrl);
    currentHypnoAudio.volume = 0.8;
    currentHypnoAudio.preload = 'auto';
    
    // Créer la musique de fond avec les 2 musiques disponibles
    if (hypnoBackgroundEnabled) {
        currentHypnoBackground = new Audio(config.backgroundMusic);
        currentHypnoBackground.volume = 0.2;
        currentHypnoBackground.loop = true;
        currentHypnoBackground.preload = 'auto';
    }
    
    // Événements audio principal
    currentHypnoAudio.addEventListener('loadeddata', function() {
        console.log('🎵 Audio hypno chargé:', formatTime(currentHypnoAudio.duration));
        // Utiliser la durée réelle détectée ou configurée
        const actualDuration = currentHypnoAudio.duration || config.realDuration;
        document.getElementById('hypno-total-time').textContent = formatTime(actualDuration);
    });
    
    currentHypnoAudio.addEventListener('timeupdate', updateHypnoProgress);
    currentHypnoAudio.addEventListener('ended', onHypnoSessionEnd);
    currentHypnoAudio.addEventListener('error', handleAudioError);
    
    // Événements musique de fond
    if (currentHypnoBackground) {
        currentHypnoBackground.addEventListener('error', function(e) {
            console.warn('⚠️ Musique de fond non disponible');
        });
    }
    
    // Log d'usage avec durée réelle
    DataManager.logToolUsage('hypnotherapy-' + duration + 'min-' + config.displayDuration);
    
    console.log(`🌀 Session d'hypnothérapie ${config.displayDuration} prête`);
}

function toggleHypnoPlayback() {
    const btn = document.getElementById('hypno-play-pause');
    
    if (!currentHypnoAudio) {
        console.error('❌ Aucun audio chargé');
        return;
    }
    
    if (currentHypnoAudio.paused) {
        // Démarrer la lecture
        currentHypnoAudio.play().then(() => {
            console.log('▶️ Lecture hypno démarrée');
            btn.textContent = '⏸️ Pause';
            
            // Démarrer la musique de fond
            if (currentHypnoBackground && hypnoBackgroundEnabled) {
                currentHypnoBackground.play().catch(e => {
                    console.warn('⚠️ Impossible de jouer la musique de fond');
                });
            }
            
            // Démarrer l'animation des ondes
            startAudioVisualization('hypno');
        }).catch(e => {
            console.error('❌ Erreur lecture:', e);
            alert('Impossible de lire l\'audio. Vérifiez votre connexion.');
        });
    } else {
        // Mettre en pause
        currentHypnoAudio.pause();
        btn.textContent = '▶️ Reprendre';
        
        // Pause de la musique de fond
        if (currentHypnoBackground) {
            currentHypnoBackground.pause();
        }
        
        // Arrêter l'animation
        stopAudioVisualization('hypno');
    }
}

function updateHypnoVolume() {
    const volume = document.getElementById('hypno-volume').value / 100;
    if (currentHypnoAudio) {
        currentHypnoAudio.volume = volume * 0.8;
    }
}

function updateHypnoBackgroundVolume() {
    const volume = document.getElementById('hypno-background-volume').value / 100;
    if (currentHypnoBackground) {
        currentHypnoBackground.volume = volume * 0.3;
    }
}

function toggleHypnoBackground() {
    hypnoBackgroundEnabled = !hypnoBackgroundEnabled;
    const btn = document.getElementById('hypno-background-toggle');
    
    if (hypnoBackgroundEnabled) {
        btn.textContent = '🎵 Musique ON';
        btn.style.background = 'var(--primary)';
        if (currentHypnoBackground && !currentHypnoAudio.paused) {
            currentHypnoBackground.play();
        }
    } else {
        btn.textContent = '🔇 Musique OFF';
        btn.style.background = '#6c757d';
        if (currentHypnoBackground) {
            currentHypnoBackground.pause();
        }
    }
}

// ============ FONCTIONS MÉDITATION MODIFIÉES ============

function startMeditationSession(duration) {
    goToScreen('meditation-session-screen');
    
    const config = meditationConfig[duration];
    
    // Configuration de l'interface avec durées réelles
    document.getElementById('meditation-session-title').textContent = config.title + ' - ' + config.displayDuration;
    document.getElementById('meditation-total-time').textContent = config.displayDuration;
    document.getElementById('meditation-current-time').textContent = '0:00';
    document.getElementById('meditation-progress').style.width = '0%';
    
    // Créer l'élément audio principal
    currentMeditationAudio = new Audio(config.audioUrl);
    currentMeditationAudio.volume = 0.8;
    currentMeditationAudio.preload = 'auto';
    
    // Créer la musique de fond
    if (meditationBackgroundEnabled) {
        currentMeditationBackground = new Audio(config.backgroundMusic);
        currentMeditationBackground.volume = 0.15;
        currentMeditationBackground.loop = true;
        currentMeditationBackground.preload = 'auto';
    }
    
    // Événements audio principal
    currentMeditationAudio.addEventListener('loadeddata', function() {
        console.log('🧘 Audio méditation chargé:', formatTime(currentMeditationAudio.duration));
        const actualDuration = currentMeditationAudio.duration || config.realDuration;
        document.getElementById('meditation-total-time').textContent = formatTime(actualDuration);
    });
    
    currentMeditationAudio.addEventListener('timeupdate', updateMeditationProgress);
    currentMeditationAudio.addEventListener('ended', onMeditationSessionEnd);
    currentMeditationAudio.addEventListener('error', handleAudioError);
    
    // Événements musique de fond
    if (currentMeditationBackground) {
        currentMeditationBackground.addEventListener('error', function(e) {
            console.warn('⚠️ Musique de fond méditation non disponible');
        });
    }
    
    // Démarrer l'animation de respiration
    startBreathingAnimation();
    
    // Log d'usage
    DataManager.logToolUsage('meditation-' + duration + 'min-' + config.displayDuration);
    
    console.log(`🧘 Session de méditation ${config.displayDuration} prête`);
}

function toggleMeditationPlayback() {
    const btn = document.getElementById('meditation-play-pause');
    
    if (!currentMeditationAudio) {
        console.error('❌ Aucun audio méditation chargé');
        return;
    }
    
    if (currentMeditationAudio.paused) {
        // Démarrer la lecture
        currentMeditationAudio.play().then(() => {
            console.log('▶️ Méditation démarrée');
            btn.textContent = '⏸️ Pause';
            
            // Démarrer la musique de fond
            if (currentMeditationBackground && meditationBackgroundEnabled) {
                currentMeditationBackground.play().catch(e => {
                    console.warn('⚠️ Impossible de jouer la musique de fond méditation');
                });
            }
        }).catch(e => {
            console.error('❌ Erreur lecture méditation:', e);
            alert('Impossible de lire l\'audio. Vérifiez votre connexion.');
        });
    } else {
        // Mettre en pause
        currentMeditationAudio.pause();
        btn.textContent = '▶️ Reprendre';
        
        // Pause de la musique de fond
        if (currentMeditationBackground) {
            currentMeditationBackground.pause();
        }
    }
}

function updateMeditationVolume() {
    const volume = document.getElementById('meditation-volume').value / 100;
    if (currentMeditationAudio) {
        currentMeditationAudio.volume = volume * 0.8;
    }
}

function updateMeditationBackgroundVolume() {
    const volume = document.getElementById('meditation-background-volume').value / 100;
    if (currentMeditationBackground) {
        currentMeditationBackground.volume = volume * 0.2;
    }
}

function toggleMeditationBackground() {
    meditationBackgroundEnabled = !meditationBackgroundEnabled;
    const btn = document.getElementById('meditation-background-toggle');
    
    if (meditationBackgroundEnabled) {
        btn.textContent = '🎵 Ambiance ON';
        btn.style.background = 'var(--primary)';
        if (currentMeditationBackground && !currentMeditationAudio.paused) {
            currentMeditationBackground.play();
        }
    } else {
        btn.textContent = '🔇 Ambiance OFF';
        btn.style.background = '#6c757d';
        if (currentMeditationBackground) {
            currentMeditationBackground.pause();
        }
    }
}

// ============ MODE CRISE AVEC MUSIQUE ============

function startEmergencyBreathing() {
    // Si mode crise avec scan corporel existe, ajouter musique
    if (criseBackgroundEnabled) {
        currentCriseBackground = new Audio(criseConfig.backgroundMusic);
        currentCriseBackground.volume = 0.1; // Volume très faible pour urgence
        currentCriseBackground.loop = true;
        currentCriseBackground.play().catch(e => {
            console.warn('⚠️ Musique de fond crise non disponible');
        });
    }
}

function stopEmergencyBreathing() {
    if (currentCriseBackground) {
        currentCriseBackground.pause();
        currentCriseBackground = null;
    }
}

// ============ FONCTIONS UTILITAIRES (IDENTIQUES) ============

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return minutes + ':' + secs.toString().padStart(2, '0');
}

function handleAudioError(e) {
    console.error('❌ Erreur audio:', e);
    showNotification('❌ Erreur de chargement audio. Vérifiez votre connexion.', 'error');
}

function updateHypnoProgress() {
    if (!currentHypnoAudio) return;
    
    const currentTime = currentHypnoAudio.currentTime;
    const duration = currentHypnoAudio.duration;
    
    if (duration) {
        const progress = (currentTime / duration) * 100;
        document.getElementById('hypno-progress').style.width = progress + '%';
        document.getElementById('hypno-current-time').textContent = formatTime(currentTime);
    }
}

function updateMeditationProgress() {
    if (!currentMeditationAudio) return;
    
    const currentTime = currentMeditationAudio.currentTime;
    const duration = currentMeditationAudio.duration;
    
    if (duration) {
        const progress = (currentTime / duration) * 100;
        document.getElementById('meditation-progress').style.width = progress + '%';
        document.getElementById('meditation-current-time').textContent = formatTime(currentTime);
    }
}

function stopHypnotherapySession() {
    if (currentHypnoAudio) {
        currentHypnoAudio.pause();
        currentHypnoAudio = null;
    }
    
    if (currentHypnoBackground) {
        currentHypnoBackground.pause();
        currentHypnoBackground = null;
    }
    
    stopAudioVisualization('hypno');
    goToScreen('hypnotherapy-screen');
    console.log('⏹️ Session hypno arrêtée');
}

function stopMeditationSession() {
    if (currentMeditationAudio) {
        currentMeditationAudio.pause();
        currentMeditationAudio = null;
    }
    
    if (currentMeditationBackground) {
        currentMeditationBackground.pause();
        currentMeditationBackground = null;
    }
    
    stopBreathingAnimation();
    goToScreen('meditation-screen');
    console.log('⏹️ Session méditation arrêtée');
}

function onHypnoSessionEnd() {
    document.getElementById('hypno-play-pause').textContent = '✅ Terminé';
    
    if (currentHypnoBackground) {
        currentHypnoBackground.pause();
    }
    
    stopAudioVisualization('hypno');
    
    setTimeout(() => {
        showNotification('🌟 Session d\'hypnothérapie terminée !', 'success');
        setTimeout(() => {
            goToScreen('hypnotherapy-screen');
        }, 3000);
    }, 1000);
}

function onMeditationSessionEnd() {
    document.getElementById('meditation-play-pause').textContent = '✅ Terminé';
    
    if (currentMeditationBackground) {
        currentMeditationBackground.pause();
    }
    
    stopBreathingAnimation();
    
    setTimeout(() => {
        showNotification('🧘 Méditation terminée !', 'success');
        setTimeout(() => {
            goToScreen('meditation-screen');
        }, 3000);
    }, 1000);
}

function startAudioVisualization(type) {
    const waves = document.querySelectorAll('.wave');
    waves.forEach(wave => {
        wave.style.animationPlayState = 'running';
    });
}

function stopAudioVisualization(type) {
    const waves = document.querySelectorAll('.wave');
    waves.forEach(wave => {
        wave.style.animationPlayState = 'paused';
    });
}

let breathingInterval = null;

function startBreathingAnimation() {
    const circle = document.getElementById('meditation-circle');
    const instruction = document.getElementById('meditation-instruction');
    let isBreathingIn = true;
    
    function breathCycle() {
        if (isBreathingIn) {
            circle.classList.add('breathe-in');
            instruction.textContent = 'Inspirez...';
        } else {
            circle.classList.remove('breathe-in');
            instruction.textContent = 'Expirez...';
        }
        isBreathingIn = !isBreathingIn;
    }
    
    breathingInterval = setInterval(breathCycle, 4000);
    breathCycle();
}

function stopBreathingAnimation() {
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    const circle = document.getElementById('meditation-circle');
    const instruction = document.getElementById('meditation-instruction');
    
    circle.classList.remove('breathe-in');
    instruction.textContent = 'Respiration naturelle';
}

// Sauvegarder les préférences utilisateur
function saveAudioPreferences() {
    const prefs = {
        hypnoBackgroundEnabled,
        meditationBackgroundEnabled,
        criseBackgroundEnabled,
        hypnoVolume: document.getElementById('hypno-volume')?.value || 80,
        meditationVolume: document.getElementById('meditation-volume')?.value || 80
    };
    localStorage.setItem('audio-preferences', JSON.stringify(prefs));
}

// Charger les préférences utilisateur
function loadAudioPreferences() {
    const prefs = JSON.parse(localStorage.getItem('audio-preferences') || '{}');
    
    hypnoBackgroundEnabled = prefs.hypnoBackgroundEnabled !== false;
    meditationBackgroundEnabled = prefs.meditationBackgroundEnabled !== false;
    criseBackgroundEnabled = prefs.criseBackgroundEnabled !== false;
    
    if (document.getElementById('hypno-volume')) {
        document.getElementById('hypno-volume').value = prefs.hypnoVolume || 80;
    }
    if (document.getElementById('meditation-volume')) {
        document.getElementById('meditation-volume').value = prefs.meditationVolume || 80;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadAudioPreferences();
});

window.addEventListener('beforeunload', function() {
    saveAudioPreferences();
});

console.log('🎧 Système audio Pass Anxiété avec durées réelles initialisé !');

// ============ STRUCTURE DES 2 MUSIQUES REQUISES ============
/*
📦 audio/
└── 📁 musiques/
    ├── Wind_Among_the_Trees.mp3 (3:37 - utilisé pour hypnose courte, complète + méditation guidée)
    └── Calme_Intrieur.mp3 (3:40 - utilisé pour hypnose standard + méditation express, profonde)
*/
