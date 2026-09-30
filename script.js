document.addEventListener('DOMContentLoaded', () => {
    const scenes = document.querySelectorAll('.scene');
    const totalScenes = scenes.length;
    const progressIndicator = document.getElementById('progress');
    const enterBtn = document.getElementById('enter-btn');
    const flashOverlay = document.getElementById('flash-overlay');
    
    // Audio Elements
    const sfxAlarm = document.getElementById('sfx-alarm');
    const bgmOpening = document.getElementById('bgm-opening');
    const bgmPeak = document.getElementById('bgm-peak');
    const sfxWhoosh = document.getElementById('sfx-whoosh');
    const sfxHeartbeat = document.getElementById('sfx-heartbeat');
    const sfxClassroom = document.getElementById('sfx-ambience-class');

    let currentSceneIndex = 0;
    let presentationStarted = false;
    let isTransitioning = false;
    let textRevealTimeouts = [];
    
    // Attempt to set volumes
    if(bgmOpening) bgmOpening.volume = 0.4;
    if(bgmPeak) bgmPeak.volume = 0.5;
    if(sfxHeartbeat) sfxHeartbeat.volume = 0.8;
    if(sfxClassroom) sfxClassroom.volume = 0.2;

    // Start presentation
    enterBtn.addEventListener('click', () => {
        presentationStarted = true;
        
        // Play cinematic whoosh and start opening BGM
        playSound(sfxWhoosh);
        playSound(bgmOpening);
        
        nextScene();
    });

    // Navigation
    window.addEventListener('wheel', (e) => {
        if (!presentationStarted || isTransitioning) return;
        if (e.deltaY > 0) nextScene();
        else if (e.deltaY < 0) prevScene();
    });

    window.addEventListener('keydown', (e) => {
        if (!presentationStarted || isTransitioning) return;
        if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) nextScene();
        else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) prevScene();
    });

    function playSound(audioEl) {
        if(audioEl && audioEl.readyState >= 2) {
            audioEl.currentTime = 0;
            audioEl.play().catch(() => {});
        }
    }

    function stopSound(audioEl) {
        if(audioEl) {
            // Fade out effect
            let vol = audioEl.volume;
            let fade = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    audioEl.volume = vol;
                } else {
                    audioEl.pause();
                    audioEl.volume = 1; // reset for next time
                    clearInterval(fade);
                }
            }, 100);
        }
    }

    function updateProgress() {
        const sceneNum = currentSceneIndex + 1;
        progressIndicator.textContent = `0${sceneNum} / 0${totalScenes}`;
        if (currentSceneIndex === 0 || currentSceneIndex >= totalScenes - 2) {
            progressIndicator.classList.add('hidden-nav');
        } else {
            progressIndicator.classList.remove('hidden-nav');
        }
    }

    function handleMedia(scene) {
        // Pause all videos
        document.querySelectorAll('.bg-video').forEach(v => v.pause());
        // Play current video
        const currentVideo = scene.querySelector('.bg-video');
        if (currentVideo) currentVideo.play().catch(()=>{});

        // Handle Audio Contexts per scene
        if(scene.id === 'scene-04') playSound(sfxClassroom);
        else stopSound(sfxClassroom);

        if(scene.id === 'scene-07') {
            stopSound(bgmOpening);
            playSound(bgmPeak);
        }

        if(scene.id === 'scene-08') {
            stopSound(bgmPeak);
            playSound(sfxHeartbeat);
        }
    }

    function triggerFlash() {
        flashOverlay.style.opacity = '1';
        playSound(sfxWhoosh);
        setTimeout(() => { flashOverlay.style.opacity = '0'; }, 150);
    }

    function revealTextSequentially(scene) {
        // Clear previous timeouts
        textRevealTimeouts.forEach(clearTimeout);
        textRevealTimeouts = [];

        // Hide all anim-texts first
        scene.querySelectorAll('.anim-text').forEach(el => el.classList.remove('revealed'));

        // Find delays (delay-1, delay-2, etc. using data attributes or classes)
        // For simplicity, we parse the class list
        const textElements = scene.querySelectorAll('.anim-text');
        textElements.forEach(el => {
            let delayTime = 500; // Base delay
            
            if (el.classList.contains('delay-1')) delayTime = 1000;
            if (el.classList.contains('delay-2')) delayTime = 2000;
            if (el.classList.contains('delay-3')) delayTime = 3000;
            if (el.classList.contains('delay-4')) delayTime = 4000;

            const t = setTimeout(() => {
                el.classList.add('revealed');
            }, delayTime);
            textRevealTimeouts.push(t);
        });
    }

    function triggerAlarmSequence() {
        // Stop all background audio instantly
        [bgmOpening, bgmPeak, sfxHeartbeat, sfxClassroom].forEach(a => {
            if(a) { a.pause(); a.currentTime = 0; }
        });
        
        const wakeUpText = document.getElementById('wake-up-text');
        const finalText = document.getElementById('final-text');
        
        // 3 SECONDS OF COMPLETE SILENCE
        setTimeout(() => {
            // ALARM
            if (sfxAlarm) {
                sfxAlarm.currentTime = 0;
                sfxAlarm.volume = 1;
                sfxAlarm.play().catch(()=>{});
            }

            // FLASH BANG
            flashOverlay.style.background = 'white';
            flashOverlay.style.opacity = '1';
            setTimeout(() => { flashOverlay.style.opacity = '0'; }, 100);

            // GLITCH TEXT
            wakeUpText.classList.remove('hidden');
            wakeUpText.classList.add('glitch-anim');
            
            setTimeout(() => {
                wakeUpText.classList.remove('glitch-anim');
                wakeUpText.classList.add('hidden');
                
                setTimeout(() => {
                    finalText.classList.remove('hidden');
                    // Need a slight delay before adding 'revealed' for CSS transition to work
                    setTimeout(() => finalText.classList.add('revealed'), 50);
                    
                    // Stop alarm after a bit
                    setTimeout(() => { if(sfxAlarm) stopSound(sfxAlarm); }, 3000);
                }, 1500);
            }, 1500);
            
        }, 3000); 
    }

    function goToScene(index) {
        if (index < 0 || index >= totalScenes) return;
        isTransitioning = true;
        
        const currentScene = scenes[currentSceneIndex];
        const targetScene = scenes[index];

        // Custom transition handling before switching
        if (targetScene.dataset.transition === 'flash') triggerFlash();

        currentScene.classList.remove('active');
        currentSceneIndex = index;
        
        setTimeout(() => {
            targetScene.classList.add('active');
            handleMedia(targetScene);
            updateProgress();
            revealTextSequentially(targetScene);
            
            if (targetScene.id === 'scene-09') {
                triggerAlarmSequence();
            }
            
            setTimeout(() => { isTransitioning = false; }, 2000);
        }, 600); // Crossfade gap
    }

    function nextScene() {
        if (currentSceneIndex < totalScenes - 1) goToScene(currentSceneIndex + 1);
    }

    function prevScene() {
        if (currentSceneIndex === totalScenes - 1) return; // Don't go back from ending
        if (currentSceneIndex > 0) goToScene(currentSceneIndex - 1);
    }

    updateProgress();
});
