// ============ SYSTEME AUDIO AVANCÉ PASS ANXIÉTÉ ============

// Configuration des fichiers audio avec durées réelles et musique de fond
const hypnoConfig = {
    6: {
        title: 'Session Courte',
        description: 'Relaxation rapide et ancrage positif',
        audioUrl: './audio/hypnotherapie/hypnose_session_courte.mp3',
        backgroundMusic: './audio/musiques/nature_douce.mp3',
        realDuration: 420, // 7 minutes réelles
        displayDuration: '6-7 min'
    },
    10: {
        title: 'Session Standard', 
        description: 'Induction complète et suggestions thérapeutiques',
        audioUrl: './audio/hypnotherapie/hypnose_session_standard.mp3',
        backgroundMusic: './audio/musiques/ambiance_zen.mp3',
        realDuration: 720, // 12 minutes réelles
        displayDuration: '10-12 min'
    },
    20: {
        title: 'Session Complète',
        description: 'Transformation profonde et intégration durable',
        audioUrl: './audio/hypnotherapie/hypnose_session_complete.mp3',
        backgroundMusic: './audio/musiques/meditation_profonde.mp3',
        realDuration: 1380, // 23 minutes réelles
        displayDuration: '20-23 min'
    }
};

const meditationConfig = {
    6: {
        title: 'Méditation Express',
        description: 'Retour au calme et centrage rapide',
        audioUrl: './audio/meditation/meditation_express.mp3',
        backgroundMusic: './audio/musiques/bol_tibetain.mp3',
        realDuration: 420, // 7 minutes réelles
        displayDuration: '6-7 min'
    },
    10: {
        title: 'Méditation Guidée',
        description: 'Pleine conscience et observation des pensées',
        audioUrl: './audio/meditation/meditation_guidee.mp3',
        backgroundMusic: './audio/musiques/nature_foret.mp3',
        realDuration: 720, // 12 minutes réelles
        displayDuration: '10-12 min'
    },
    20: {
        title: 'Méditation Profonde',
        description: 'Exploration intérieure et paix durable',
        audioUrl: './audio/meditation/meditation_profonde.mp3',
        backgroundMusic: './audio/musiques/ambiance_cosmique.mp3',
        realDuration: 1320, // 22 minutes réelles
        displayDuration: '20-22 min'
    }
};

// Variables globales pour l'audio
let currentHypnoAudio = null;
let currentHypnoBackground = null;
let currentMeditationAudio = null;
let currentMeditationBackground = null;
let hypnoProgressInterval = null;
let meditationProgressInterval = null;
let hypnoBackgroundEnabled = true;
let meditationBackgroundEnabled = true;

// ============ FONCTIONS HYPNOTHÉRAPIE AVANCÉES ============

function startHypnotherapySession(duration) {
    goToScreen('hypnotherapy-session-screen');
    
    const config = hypnoConfig[duration];
    
    // Configuration de l'interface
    document.getElementById('hypno-session-title').textContent = config.title + ' - ' + config.displayDuration;
    document.getElementById('hypno-total-time').textContent = formatTime(config.realDuration);
    document.getElementById('hypno-current-time').textContent = '0:00';
    document.getElementById('hypno-progress').style.width = '0%';
    
    // Créer l'élément audio principal
    currentHypnoAudio = new Audio(config.audioUrl);
    currentHypnoAudio.volume = 0.8;
    currentHypnoAudio.preload = 'auto';
    
    // Créer la musique de fond
    if (hypnoBackgroundEnabled) {
        currentHypnoBackground = new Audio(config.backgroundMusic);
        currentHypnoBackground.volume = 0.2;
        currentHypnoBackground.loop = true;
        currentHypnoBackground.preload = 'auto';
    }
    
    // Événements audio principal
    currentHypnoAudio.addEventListener('loadeddata', function() {
        console.log('🎵 Audio hypno chargé:', formatTime(currentHypnoAudio.duration));
        // Mettre à jour avec la durée réelle
        if (currentHypnoAudio.duration) {
            document.getElementById('hypno-total-time').textContent = formatTime(currentHypnoAudio.duration);
        }
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
    
    // Afficher les contrôles
    updateHypnoControls('ready');
    
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

function updateHypnoVolume() {
    const volume = document.getElementById('hypno-volume').value / 100;
    if (currentHypnoAudio) {
        currentHypnoAudio.volume = volume * 0.8; // Volume principal
    }
}

function updateHypnoBackgroundVolume() {
    const volume = document.getElementById('hypno-background-volume').value / 100;
    if (currentHypnoBackground) {
        currentHypnoBackground.volume = volume * 0.3; // Volume fond plus faible
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

function stopHypnotherapySession() {
    // Arrêter les audios
    if (currentHypnoAudio) {
        currentHypnoAudio.pause();
        currentHypnoAudio = null;
    }
    
    if (currentHypnoBackground) {
        currentHypnoBackground.pause();
        currentHypnoBackground = null;
    }
    
    // Arrêter les animations
    stopAudioVisualization('hypno');
    
    // Retour à l'écran principal
    goToScreen('hypnotherapy-screen');
    
    console.log('⏹️ Session hypno arrêtée');
}

function onHypnoSessionEnd() {
    document.getElementById('hypno-play-pause').textContent = '✅ Terminé';
    
    // Arrêter la musique de fond
    if (currentHypnoBackground) {
        currentHypnoBackground.pause();
    }
    
    // Arrêter l'animation
    stopAudioVisualization('hypno');
    
    // Message de fin
    setTimeout(() => {
        showNotification('🌟 Session d\'hypnothérapie terminée ! Prenez un moment pour intégrer cette expérience.', 'success');
        setTimeout(() => {
            goToScreen('hypnotherapy-screen');
        }, 3000);
    }, 1000);
}

// ============ FONCTIONS MÉDITATION AVANCÉES ============

function startMeditationSession(duration) {
    goToScreen('meditation-session-screen');
    
    const config = meditationConfig[duration];
    
    // Configuration de l'interface
    document.getElementById('meditation-session-title').textContent = config.title + ' - ' + config.displayDuration;
    document.getElementById('meditation-total-time').textContent = formatTime(config.realDuration);
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
        if (currentMeditationAudio.duration) {
            document.getElementById('meditation-total-time').textContent = formatTime(currentMeditationAudio.duration);
        }
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

function stopMeditationSession() {
    // Arrêter les audios
    if (currentMeditationAudio) {
        currentMeditationAudio.pause();
        currentMeditationAudio = null;
    }
    
    if (currentMeditationBackground) {
        currentMeditationBackground.pause();
        currentMeditationBackground = null;
    }
    
    // Arrêter l'animation de respiration
    stopBreathingAnimation();
    
    // Retour à l'écran principal
    goToScreen('meditation-screen');
    
    console.log('⏹️ Session méditation arrêtée');
}

function onMeditationSessionEnd() {
    document.getElementById('meditation-play-pause').textContent = '✅ Terminé';
    
    // Arrêter la musique de fond
    if (currentMeditationBackground) {
        currentMeditationBackground.pause();
    }
    
    // Arrêter l'animation
    stopBreathingAnimation();
    
    // Message de fin
    setTimeout(() => {
        showNotification('🧘 Méditation terminée ! Restez encore un moment dans cette paix intérieure.', 'success');
        setTimeout(() => {
            goToScreen('meditation-screen');
        }, 3000);
    }, 1000);
}

// ============ FONCTIONS UTILITAIRES AUDIO ============

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
    
    // Cycle de 8 secondes (4s inspiration + 4s expiration)
    breathingInterval = setInterval(breathCycle, 4000);
    breathCycle(); // Démarrer immédiatement
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

// ============ INITIALISATION ============

// Sauvegarder les préférences utilisateur
function saveAudioPreferences() {
    const prefs = {
        hypnoBackgroundEnabled,
        meditationBackgroundEnabled,
        hypnoVolume: document.getElementById('hypno-volume')?.value || 70,
        meditationVolume: document.getElementById('meditation-volume')?.value || 70
    };
    localStorage.setItem('audio-preferences', JSON.stringify(prefs));
}

// Charger les préférences utilisateur
function loadAudioPreferences() {
    const prefs = JSON.parse(localStorage.getItem('audio-preferences') || '{}');
    
    hypnoBackgroundEnabled = prefs.hypnoBackgroundEnabled !== false;
    meditationBackgroundEnabled = prefs.meditationBackgroundEnabled !== false;
    
    // Appliquer les volumes sauvegardés
    if (document.getElementById('hypno-volume')) {
        document.getElementById('hypno-volume').value = prefs.hypnoVolume || 70;
    }
    if (document.getElementById('meditation-volume')) {
        document.getElementById('meditation-volume').value = prefs.meditationVolume || 70;
    }
}

// Charger les préférences au démarrage
document.addEventListener('DOMContentLoaded', function() {
    loadAudioPreferences();
});

// Sauvegarder les préférences avant de quitter
window.addEventListener('beforeunload', function() {
    saveAudioPreferences();
});

console.log('🎧 Système audio avancé Pass Anxiété initialisé !');
