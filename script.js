
const DEFAULT_TIMER_SECONDS = 0;

const CLUB_THEMES = [
    { id: "real", name: "Real Madrid", color: "#f2f2f2", textColor: "#1f3b7a" },
    { id: "barca", name: "FC Barcelona", color: "#a60b2d", textColor: "#f2bd2e" },
    { id: "city", name: "Manchester City", color: "#6cabdd", textColor: "#ffffff" },
    { id: "liverpool", name: "Liverpool", color: "#c8102e", textColor: "#ffffff" },
    { id: "bayern", name: "Bayern Munchen", color: "#dc052d", textColor: "#ffffff" },
    { id: "juventus", name: "Juventus", color: "#111111", textColor: "#ffffff" },
    { id: "psg", name: "PSG", color: "#1a2d5c", textColor: "#ffffff" },
    { id: "chelsea", name: "Chelsea", color: "#034694", textColor: "#ffffff" },
    { id: "milan", name: "AC Milan", color: "#a0001b", textColor: "#ffffff" },
    { id: "inter", name: "Inter", color: "#005cb3", textColor: "#ffffff" }
];

const FALLBACK_GOALSONGS = [
    "A.S. Roma 2024 Goal Song.wav",
    "Arsenal F.C. 2020 FA Cup Final Goal Song.wav",
    "Athletic Bilbao 2024 Goal Song.wav",
    "BAYER04 LEVERKUSEN GOAL SONG 202324 [Stadium Effect].wav",
    "Celtic Glasgow Goal Song (Kernkraft 400).wav",
    "Chelsea Goal song.wav",
    "chelseagoalsong(1).WAV",
    "CTID - Haaland Song ( Ha Ha Ha) [Man City chant  English Version].wav",
    "FC Barcelona Goal Song.WAV",
    "ffdmvv.WAV",
    "Getafe C.F Goal Song.wav",
    "Glasgow Rangers Goal Song (Levels).wav",
    "haalandgoalsong.WAV",
    "Liverpool F.C. 2023 Goal Song.wav",
    "Manchester City Goal song.wav",
    "Manchester United Goal Song 202425.wav",
    "Osasuna Goal Song.wav",
    "Poland National Team Anthem  Stadium Effect.wav",
    "Rayo Vallecano 2022 Goal Song.wav",
    "RCD Mallorca Goal Song.wav",
    "Real Madrid Goal Song.wav",
    "Sevilla F.C. 2024 Goal Song.wav",
    "Travis Scott Fein Goal Song.WAV",
    "UEFA Euro 2024 Goal Song.wav",
    "Villarreal FC Goal SongCanción de Gol Europa League 20-21.wav",
    "Zagłębie Lubin-Goal Song.wav"
];
const STORAGE_KEY = "s7_overlay_state_v1";

const state = {
    teams: [
        { name: "Player 1", score: 0, sets: 0, crest: "", color: "#2f95e2", textColor: "#ffffff", themeId: "", goalsongEnabled: false, goalsongTrack: "", goalsongVolume: 0.8, goalsongDuration: -1, pendingSetWin: false, matchWon: false },
        { name: "Player 2", score: 0, sets: 0, crest: "", color: "#ff3b35", textColor: "#ffffff", themeId: "", goalsongEnabled: false, goalsongTrack: "", goalsongVolume: 0.8, goalsongDuration: -1, pendingSetWin: false, matchWon: false }
    ],
    slotMap: { left: 0, right: 1 },
    timerSeconds: DEFAULT_TIMER_SECONDS,
    timerRunning: false,
    timerIntervalId: null,
    history: [],
    future: [],
    editingSlot: null,
    activeGoalAudio: null,
    voiceRecognition: null,
    voiceRecognitionRestartTimer: null,
    voiceRecognitionEnabled: false,
    voiceRecognitionActive: false,
    voiceRecognitionStarting: false,
    voiceMicStream: null,
    voiceRecognitionStartedAt: 0,
    voiceLastSpeechAt: 0,
    voiceLastCommandAt: 0,
    voiceLastCommandKey: "",
    goalsongFiles: [],
    widgets: {
        orientationVertical: false,
        darkMode: false,
        showTimer: true,
        showSets: true,
        showNames: true,
        scoreScale: 100,
        nameScale: 100,
        crestScale: 100,
        timerScale: 100,
        nameY: 0,
        crestY: 0,
        centerY: 0,
        menuY: 38,
        menuScale: 100
    },
    settings: {
        swipeScore: true,
        swipeDownMinus: true,
        swipeArea: "score",
        setsEnabled: false,
        pointsToSet: 25,
        setAdvantage: 2,
        setsToMatch: 3,
        askSetAward: false,
        setAnimationsEnabled: true,
        voiceGoalCommandsEnabled: false,
        countdownEnabled: false,
        countdownFormat: "hms",
        countdownLengthSeconds: -1,
        audioEnabled: false,
        audioVoice: "",
        audioRate: 1,
        audioVolume: 1,
        audioFormat: "Lewi {w1} - Prawi {w2}"
    }
};

const el = {
    overlay: document.getElementById("overlay"),
    sideLeft: document.getElementById("side-left"),
    sideRight: document.getElementById("side-right"),
    nameLeft: document.getElementById("name-left"),
    nameRight: document.getElementById("name-right"),
    crestLeft: document.getElementById("crest-left"),
    crestRight: document.getElementById("crest-right"),
    crownLeft: document.getElementById("crown-left"),
    crownRight: document.getElementById("crown-right"),
    fireLeft: document.getElementById("fire-left"),
    fireRight: document.getElementById("fire-right"),
    scoreLeft: document.getElementById("score-left"),
    scoreRight: document.getElementById("score-right"),
    centerStack: document.querySelector(".center-stack"),
    menuWrap: document.querySelector(".menu-wrap"),
    setsLeft: document.getElementById("sets-left"),
    setsRight: document.getElementById("sets-right"),
    timerToggle: document.getElementById("timer-toggle"),
    timerDisplay: document.getElementById("timer-display"),
    timerReset: document.getElementById("timer-reset"),
    timerPanel: document.querySelector(".timer-panel"),
    timeEditor: document.getElementById("time-editor"),
    setPanel: document.getElementById("set-panel"),
    menuToggle: document.getElementById("menu-toggle"),
    controlMenu: document.getElementById("control-menu"),
    menuPopover: document.getElementById("menu-popover"),
    sidePopover: document.getElementById("side-popover"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    teamEditorModal: document.getElementById("team-editor-modal"),
    widgetsModal: document.getElementById("widgets-modal"),
    settingsModal: document.getElementById("settings-modal"),
    widgetPreview: document.getElementById("widget-preview"),
    resetAllBtn: document.getElementById("reset-all-settings"),
    teamEditorTitle: document.getElementById("team-editor-title"),
    teamNameInput: document.getElementById("team-name-input"),
    teamCrestFile: document.getElementById("team-crest-file"),
    teamGoalsongTrack: document.getElementById("team-goalsong-track"),
    teamGoalsongVolume: document.getElementById("team-goalsong-volume"),
    teamGoalsongDuration: document.getElementById("team-goalsong-duration"),
    teamColorInput: document.getElementById("team-color-input"),
    teamThemeSelect: document.getElementById("team-theme-select"),
    teamSaveBtn: document.getElementById("team-save-btn"),
    teamClearEmblem: document.getElementById("team-clear-emblem"),
    teamExportBtn: document.getElementById("team-export-btn"),
    teamImportBtn: document.getElementById("team-import-btn"),
    teamTransferBtn: document.getElementById("team-transfer-btn"),
    teamTransferPanel: document.getElementById("team-transfer-panel"),
    teamImportFile: document.getElementById("team-import-file"),
    exportSettingsBtn: document.getElementById("export-settings-btn"),
    exportAllBtn: document.getElementById("export-all-btn"),
    importAllBtn: document.getElementById("import-all-btn"),
    importAllFile: document.getElementById("import-all-file"),
    settingsTransferBtn: document.getElementById("settings-transfer-btn"),
    settingsTransferPanel: document.getElementById("settings-transfer-panel"),
    widgetAdvancedReset: document.getElementById("widget-advanced-reset")
};

const widgetInputs = {
    orientation: document.getElementById("widget-toggle-orientation"),
    dark: document.getElementById("widget-toggle-dark"),
    timer: document.getElementById("widget-toggle-timer"),
    sets: document.getElementById("widget-toggle-sets"),
    names: document.getElementById("widget-toggle-names"),
    scoreSize: document.getElementById("widget-score-size"),
    nameSize: document.getElementById("widget-name-size"),
    crestSize: document.getElementById("widget-crest-size"),
    timerSize: document.getElementById("widget-timer-size"),
    nameY: document.getElementById("widget-name-y"),
    crestY: document.getElementById("widget-crest-y"),
    centerY: document.getElementById("widget-center-y"),
    menuY: document.getElementById("widget-menu-y"),
    menuSize: document.getElementById("widget-menu-size")
};

const settingInputs = {
    swipe: document.getElementById("swipe-score"),
    swipeDownMinus: document.getElementById("swipe-down-minus"),
    swipeArea: document.getElementById("swipe-area"),
    askSetAward: document.getElementById("ask-set-award"),
    voiceGoalEnabled: document.getElementById("voice-goal-enabled"),
    setsEnabled: document.getElementById("sets-enabled"),
    pointsToSet: document.getElementById("points-to-set"),
    setAdvantage: document.getElementById("set-advantage"),
    setsToMatch: document.getElementById("sets-to-match"),
    setAnimationsEnabled: document.getElementById("set-animations-enabled"),
    name1: document.getElementById("default-name-1"),
    name2: document.getElementById("default-name-2"),
    color1: document.getElementById("default-color-1"),
    color2: document.getElementById("default-color-2"),
    theme1: document.getElementById("default-theme-1"),
    theme2: document.getElementById("default-theme-2"),
    goalsongTrack1: document.getElementById("default-goalsong-track-1"),
    goalsongTrack2: document.getElementById("default-goalsong-track-2"),
    goalsongVolume1: document.getElementById("default-goalsong-volume-1"),
    goalsongVolume2: document.getElementById("default-goalsong-volume-2"),
    goalsongDuration1: document.getElementById("default-goalsong-duration-1"),
    goalsongDuration2: document.getElementById("default-goalsong-duration-2"),
    audioEnabled: document.getElementById("audio-enabled"),
    audioVoice: document.getElementById("audio-voice"),
    audioRate: document.getElementById("audio-rate"),
    audioVolume: document.getElementById("audio-volume"),
    audioFormat: document.getElementById("audio-format"),
    countdownLength: document.getElementById("countdown-length"),
    countdownFormat: document.getElementById("countdown-format"),
    countdownEnabled: document.getElementById("countdown-enabled")
};

function takeSnapshot() {
    return {
        teams: state.teams.map((team) => ({ ...team })),
        slotMap: { ...state.slotMap },
        timerSeconds: state.timerSeconds,
        timerRunning: state.timerRunning
    };
}

function applySnapshot(snapshot) {
    state.teams = snapshot.teams.map((team) => ({ ...team }));
    state.slotMap = { ...snapshot.slotMap };
    state.timerSeconds = snapshot.timerSeconds;
    state.timerRunning = snapshot.timerRunning;
    syncTimerInterval();
    syncSettingsTeamInputs();
    renderAll();
}

function pushHistory() {
    state.history.push(takeSnapshot());
    if (state.history.length > 120) {
        state.history.shift();
    }
    state.future = [];
}

function undo() {
    if (!state.history.length) {
        return;
    }
    state.future.push(takeSnapshot());
    applySnapshot(state.history.pop());
}

function redo() {
    if (!state.future.length) {
        return;
    }
    state.history.push(takeSnapshot());
    applySnapshot(state.future.pop());
}

function getTeamAt(slot) {
    return state.teams[state.slotMap[slot]];
}

function saveState() {
    try {
        const payload = {
            teams: state.teams,
            slotMap: state.slotMap,
            timerSeconds: state.timerSeconds,
            widgets: state.widgets,
            settings: state.settings
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }
        const parsed = JSON.parse(raw);
        if (parsed.teams?.length === 2) {
            state.teams = parsed.teams.map((team, i) => ({
                ...state.teams[i],
                ...team,
                crest: team.crest || "",
                pendingSetWin: false,
                matchWon: false
            }));
        }
        if (parsed.slotMap) {
            state.slotMap = { ...state.slotMap, ...parsed.slotMap };
        }
        if (typeof parsed.timerSeconds === "number") {
            state.timerSeconds = Math.max(0, parsed.timerSeconds);
        }
        if (parsed.widgets) {
            state.widgets = { ...state.widgets, ...parsed.widgets };
        }
        if (parsed.settings) {
            state.settings = { ...state.settings, ...parsed.settings };
        }
    } catch (_) {}
}

function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function resetAllState() {
    localStorage.removeItem(STORAGE_KEY);
    state.teams = [
        { name: "Player 1", score: 0, sets: 0, crest: "", color: "#2f95e2", textColor: "#ffffff", themeId: "", goalsongEnabled: false, goalsongTrack: "", goalsongVolume: 0.8, goalsongDuration: -1, pendingSetWin: false, matchWon: false },
        { name: "Player 2", score: 0, sets: 0, crest: "", color: "#ff3b35", textColor: "#ffffff", themeId: "", goalsongEnabled: false, goalsongTrack: "", goalsongVolume: 0.8, goalsongDuration: -1, pendingSetWin: false, matchWon: false }
    ];
    state.slotMap = { left: 0, right: 1 };
    state.timerSeconds = 0;
    state.timerRunning = false;
    state.widgets = {
        orientationVertical: false,
        darkMode: false,
        showTimer: true,
        showSets: true,
        showNames: true,
        scoreScale: 100,
        nameScale: 100,
        crestScale: 100,
        timerScale: 100,
        nameY: 0,
        crestY: 0,
        centerY: 0,
        menuY: 38,
        menuScale: 100
    };
        state.settings = {
            swipeScore: true,
            swipeDownMinus: true,
            swipeArea: "score",
            setsEnabled: false,
            pointsToSet: 25,
            setAdvantage: 2,
            setsToMatch: 3,
            askSetAward: false,
            setAnimationsEnabled: true,
            voiceGoalCommandsEnabled: false,
            countdownEnabled: false,
            countdownFormat: "hms",
            countdownLengthSeconds: -1,
            audioEnabled: false,
            audioVoice: "",
            audioRate: 1,
        audioVolume: 1,
        audioFormat: "Lewi {w1} - Prawi {w2}"
    };
    initializeDefaults();
    renderAll();
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatClock(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const useMinuteSecondFormat = state.settings.countdownFormat === "ms";
    const hours = Math.floor(safe / 3600);
    const minutes = useMinuteSecondFormat
        ? Math.floor(safe / 60)
        : Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    if (useMinuteSecondFormat) {
        return `${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getTimeParts(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    if (state.settings.countdownFormat === "ms") {
        return {
            hours: 0,
            minutes: Math.floor(safe / 60),
            seconds: safe % 60
        };
    }
    return {
        hours: Math.floor(safe / 3600),
        minutes: Math.floor((safe % 3600) / 60),
        seconds: safe % 60
    };
}

function setTimeFromParts(parts) {
    const useMinuteSecondFormat = state.settings.countdownFormat === "ms";
    const hours = Math.max(0, Math.min(99, parts.hours));
    const minutes = useMinuteSecondFormat
        ? Math.max(0, Math.min(9999, parts.minutes))
        : Math.max(0, Math.min(59, parts.minutes));
    const seconds = Math.max(0, Math.min(59, parts.seconds));
    state.timerSeconds = useMinuteSecondFormat
        ? minutes * 60 + seconds
        : hours * 3600 + minutes * 60 + seconds;
}

function parseTimeInput(value) {
    const text = String(value).trim();
    if (text === "-1") {
        return -1;
    }
    if (!text) {
        return 0;
    }
    const parts = text.split(":").map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part) || part < 0)) {
        return null;
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 1) {
        return parts[0];
    }
    return null;
}

function getTimerResetValue() {
    if (!state.settings.countdownEnabled) {
        return 0;
    }
    return state.settings.countdownLengthSeconds < 0 ? 0 : state.settings.countdownLengthSeconds;
}

function formatDurationInput(seconds) {
    if (seconds < 0) {
        return "-1";
    }
    return formatClock(seconds);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("read_failed"));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("image_load_failed"));
        image.src = dataUrl;
    });
}

async function normalizeCrestToSquarePng(dataUrl) {
    const image = await loadImage(dataUrl);
    const sourceCanvas = document.createElement("canvas");
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    const srcW = image.naturalWidth || image.width || 1;
    const srcH = image.naturalHeight || image.height || 1;
    sourceCanvas.width = srcW;
    sourceCanvas.height = srcH;
    sourceCtx.drawImage(image, 0, 0, srcW, srcH);

    const pixels = sourceCtx.getImageData(0, 0, srcW, srcH).data;
    let minX = srcW;
    let minY = srcH;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < srcH; y += 1) {
        for (let x = 0; x < srcW; x += 1) {
            const alpha = pixels[(y * srcW + x) * 4 + 3];
            if (alpha > 0) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        minX = 0;
        minY = 0;
        maxX = srcW - 1;
        maxY = srcH - 1;
    }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const side = Math.max(cropW, cropH);
    const outCanvas = document.createElement("canvas");
    const outCtx = outCanvas.getContext("2d");
    outCanvas.width = side;
    outCanvas.height = side;
    const dx = Math.floor((side - cropW) / 2);
    const dy = Math.floor((side - cropH) / 2);

    outCtx.drawImage(
        sourceCanvas,
        minX,
        minY,
        cropW,
        cropH,
        dx,
        dy,
        cropW,
        cropH
    );

    return outCanvas.toDataURL("image/png");
}

function updateCrestScaling() {
    const apply = (sideEl, crestEl) => {
        const team = sideEl === el.sideLeft ? getTeamAt("left") : getTeamAt("right");
        if (!team.crest) {
            return;
        }
        const sideW = sideEl.clientWidth;
        const sideH = sideEl.clientHeight;
        const namesShown = state.widgets.showNames;
        const target = namesShown
            ? Math.min(sideW * 0.16, sideH * 0.11)
            : Math.min(sideW * 0.22, sideH * 0.16);
        const crestScale = Math.max(70, Math.min(160, state.widgets.crestScale || 100)) / 100;
        const scaled = target * crestScale;
        const size = Math.max(36, Math.min(190, Math.round(scaled)));
        crestEl.style.width = `${size}px`;
        crestEl.style.height = `${size}px`;
    };
    apply(el.sideLeft, el.crestLeft);
    apply(el.sideRight, el.crestRight);
}

function adjustTimeUnit(unit, delta) {
    pushHistory();
    const parts = getTimeParts(state.timerSeconds);
    const useMinuteSecondFormat = state.settings.countdownFormat === "ms";
    if (unit === "hours") {
        if (useMinuteSecondFormat) {
            return;
        }
        parts.hours = Math.max(0, Math.min(99, parts.hours + delta));
    }
    if (unit === "minutes") {
        parts.minutes = useMinuteSecondFormat
            ? Math.max(0, Math.min(9999, parts.minutes + delta))
            : (parts.minutes + delta + 60) % 60;
    }
    if (unit === "seconds") {
        parts.seconds = (parts.seconds + delta + 60) % 60;
    }
    setTimeFromParts(parts);
    renderTime();
    updateWidgetPreview();
}

function syncTimerInterval() {
    if (state.timerRunning && !state.timerIntervalId) {
        state.timerIntervalId = window.setInterval(() => {
            if (state.settings.countdownEnabled) {
                if (state.timerSeconds > 0) {
                    state.timerSeconds -= 1;
                } else {
                    pauseTimer();
                }
            } else {
                state.timerSeconds += 1;
            }
            renderTime();
            updateWidgetPreview();
        }, 1000);
    }
    if (!state.timerRunning && state.timerIntervalId) {
        window.clearInterval(state.timerIntervalId);
        state.timerIntervalId = null;
    }
}

function startTimer() {
    state.timerRunning = true;
    syncTimerInterval();
    renderTime();
}

function pauseTimer() {
    state.timerRunning = false;
    syncTimerInterval();
    renderTime();
}

function playGoalSong(slot) {
    const team = getTeamAt(slot);
    if (!team.goalsongTrack) {
        return;
    }
    if (state.activeGoalAudio) {
        state.activeGoalAudio.pause();
        state.activeGoalAudio = null;
    }
    const track = team.goalsongTrack;
    if (!track) {
        return;
    }
    const encodedSrc = `goalsongs/${encodeURIComponent(track)}`;
    const rawSrc = `goalsongs/${track}`;
    const audio = new Audio(encodedSrc);
    audio.volume = team.goalsongVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {
        // Some local servers/file modes work only with raw names.
        audio.src = rawSrc;
        audio.play().catch(() => {});
    });
    state.activeGoalAudio = audio;

    if (team.goalsongDuration < 0) {
        return;
    }

    const keepSeconds = Math.max(1, team.goalsongDuration);
    const fadeMs = 1200;
    window.setTimeout(() => {
        const startVolume = audio.volume;
        const ticks = 12;
        let current = 0;
        const fadeInterval = window.setInterval(() => {
            current += 1;
            audio.volume = Math.max(0, startVolume * (1 - current / ticks));
            if (current >= ticks) {
                window.clearInterval(fadeInterval);
                audio.pause();
                if (state.activeGoalAudio === audio) {
                    state.activeGoalAudio = null;
                }
            }
        }, Math.floor(fadeMs / ticks));
    }, keepSeconds * 1000);
}

function speakScore() {
    if (!state.settings.audioEnabled || !("speechSynthesis" in window)) {
        return;
    }
    const leftTeam = getTeamAt("left");
    const rightTeam = getTeamAt("right");
    const text = state.settings.audioFormat
        .replace("{w1}", leftTeam.score)
        .replace("{w2}", rightTeam.score);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.settings.audioRate;
    utterance.volume = state.settings.audioVolume;
    const selectedVoice = speechSynthesis.getVoices().find((voice) => voice.name === state.settings.audioVoice);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function normalizeSpeechText(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getVoiceGoalSlot(transcript) {
    const text = normalizeSpeechText(transcript);
    const hasGoalWord = /\b(go+l|goal)\b/.test(text);
    if (!hasGoalWord) {
        return null;
    }
    const homeMatch = /\b(gospodar\w*|lew\w*|left|home)\b/.test(text);
    const awayMatch = /\b(gosc\w*|praw\w*|right|away)\b/.test(text);
    if (homeMatch === awayMatch) {
        return null;
    }
    return homeMatch ? "left" : "right";
}

function applyVoiceGoalCommand(transcript, confidence, isFinal) {
    if (!isFinal) {
        return false;
    }
    if (Number.isFinite(confidence) && confidence > 0 && confidence < 0.55) {
        return false;
    }
    const slot = getVoiceGoalSlot(transcript);
    if (!slot) {
        return false;
    }
    const now = Date.now();
    if (state.voiceLastCommandKey === slot && now - state.voiceLastCommandAt < 1200) {
        return false;
    }
    state.voiceLastCommandKey = slot;
    state.voiceLastCommandAt = now;
    changeScore(slot, 1, { playGoalSong: false });
    return true;
}

function stopVoiceGoalRecognition() {
    state.voiceRecognitionEnabled = false;
    state.voiceRecognitionActive = false;
    state.voiceRecognitionStarting = false;
    state.voiceRecognitionStartedAt = 0;
    state.voiceLastSpeechAt = 0;
    state.voiceLastCommandAt = 0;
    state.voiceLastCommandKey = "";
    if (state.voiceRecognitionRestartTimer) {
        window.clearTimeout(state.voiceRecognitionRestartTimer);
        state.voiceRecognitionRestartTimer = null;
    }
    if (state.voiceRecognition) {
        try {
            state.voiceRecognition.stop();
        } catch (_) {}
    }
    if (state.voiceMicStream) {
        state.voiceMicStream.getTracks().forEach((track) => track.stop());
        state.voiceMicStream = null;
    }
}

function isVoiceRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function requestMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
        return Promise.resolve(false);
    }
    if (state.voiceMicStream) {
        return Promise.resolve(true);
    }
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            state.voiceMicStream = stream;
            return true;
        })
        .catch(() => false);
}

function scheduleVoiceRecognitionRestart(delayMs) {
    if (!state.voiceRecognitionEnabled) {
        return;
    }
    if (state.voiceRecognitionRestartTimer) {
        return;
    }
    state.voiceRecognitionRestartTimer = window.setTimeout(() => {
        state.voiceRecognitionRestartTimer = null;
        startVoiceGoalRecognition();
    }, delayMs);
}

function startVoiceGoalRecognition() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
        state.settings.voiceGoalCommandsEnabled = false;
        settingInputs.voiceGoalEnabled.checked = false;
        saveState();
        return false;
    }
    if (state.voiceRecognitionRestartTimer) {
        window.clearTimeout(state.voiceRecognitionRestartTimer);
        state.voiceRecognitionRestartTimer = null;
    }
    if (state.voiceRecognitionStarting || state.voiceRecognitionActive) {
        return true;
    }
    state.voiceRecognitionEnabled = true;
    if (!state.voiceRecognition) {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "pl-PL";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.onstart = () => {
            state.voiceRecognitionStarting = false;
            state.voiceRecognitionActive = true;
            state.voiceRecognitionStartedAt = Date.now();
        };
        recognition.onresult = (event) => {
            state.voiceLastSpeechAt = Date.now();
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                for (let j = 0; j < result.length; j += 1) {
                    const alt = result[j];
                    if (applyVoiceGoalCommand(alt?.transcript || "", alt?.confidence, result.isFinal)) {
                        return;
                    }
                }
            }
        };
        recognition.onend = () => {
            state.voiceRecognitionActive = false;
            state.voiceRecognitionStarting = false;
            if (!state.voiceRecognitionEnabled) {
                return;
            }
            const now = Date.now();
            const sessionMs = state.voiceRecognitionStartedAt ? now - state.voiceRecognitionStartedAt : 0;
            const silenceMs = state.voiceLastSpeechAt ? now - state.voiceLastSpeechAt : Infinity;
            let restartDelay = 320;
            if (sessionMs < 1500) {
                restartDelay = 1800;
            } else if (sessionMs < 3000 && silenceMs > 1800) {
                restartDelay = 1200;
            } else if (silenceMs > 6000) {
                restartDelay = 850;
            }
            scheduleVoiceRecognitionRestart(restartDelay);
        };
        recognition.onerror = (event) => {
            if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
                state.settings.voiceGoalCommandsEnabled = false;
                settingInputs.voiceGoalEnabled.checked = false;
                stopVoiceGoalRecognition();
                saveState();
                window.alert("Brak dostepu do mikrofonu. Zezwol na mikrofon i wlacz opcje ponownie.");
                return;
            }
            if (!state.voiceRecognitionEnabled) {
                return;
            }
            // Let onend handle restart to avoid rapid start/stop loops on mobile.
            if (event?.error === "audio-capture") {
                state.settings.voiceGoalCommandsEnabled = false;
                settingInputs.voiceGoalEnabled.checked = false;
                stopVoiceGoalRecognition();
                saveState();
                window.alert("Nie wykryto aktywnego mikrofonu.");
            }
        };
        state.voiceRecognition = recognition;
    }
    try {
        state.voiceRecognitionStarting = true;
        state.voiceRecognition.start();
        return true;
    } catch (_) {
        state.voiceRecognitionStarting = false;
        return false;
    }
}

function renderScores() {
    const leftTeam = getTeamAt("left");
    const rightTeam = getTeamAt("right");

    el.nameLeft.textContent = leftTeam.name;
    el.nameRight.textContent = rightTeam.name;
    el.scoreLeft.textContent = leftTeam.score;
    el.scoreRight.textContent = rightTeam.score;
    el.setsLeft.textContent = leftTeam.sets;
    el.setsRight.textContent = rightTeam.sets;
    el.crestLeft.src = leftTeam.crest || "";
    el.crestRight.src = rightTeam.crest || "";
    el.crestLeft.classList.toggle("is-hidden", !leftTeam.crest);
    el.crestRight.classList.toggle("is-hidden", !rightTeam.crest);
    el.crownLeft.classList.toggle("is-hidden", !(leftTeam.pendingSetWin || leftTeam.matchWon));
    el.crownRight.classList.toggle("is-hidden", !(rightTeam.pendingSetWin || rightTeam.matchWon));
    el.fireLeft.classList.toggle("is-hidden", !(state.settings.setAnimationsEnabled && (leftTeam.pendingSetWin || leftTeam.matchWon)));
    el.fireRight.classList.toggle("is-hidden", !(state.settings.setAnimationsEnabled && (rightTeam.pendingSetWin || rightTeam.matchWon)));

    el.sideLeft.style.background = leftTeam.color;
    el.sideRight.style.background = rightTeam.color;
    el.sideLeft.style.color = leftTeam.textColor;
    el.sideRight.style.color = rightTeam.textColor;

    const scoreScale = Math.max(70, Math.min(140, state.widgets.scoreScale)) / 100;
    const nameScale = Math.max(70, Math.min(160, state.widgets.nameScale)) / 100;
    const baseOffset = 28;
    const extraOffset = (nameScale - 1) * 8;
    const safeOffset = Math.max(20, Math.min(38, baseOffset + extraOffset));
    const offsetVh = `${safeOffset}vh`;
    const nameYPx = Math.max(-180, Math.min(180, Number(state.widgets.nameY) || 0));
    const crestYPx = Math.max(-180, Math.min(180, Number(state.widgets.crestY) || 0));
    const crestScale = Math.max(70, Math.min(160, state.widgets.crestScale || 100)) / 100;

    [el.sideLeft, el.sideRight].forEach((sideElement) => {
        sideElement.style.setProperty("--score-scale", String(scoreScale));
        sideElement.style.setProperty("--name-scale", String(nameScale));
        sideElement.style.setProperty("--name-offset", offsetVh);
        sideElement.style.setProperty("--name-y", `${nameYPx}px`);
        sideElement.style.setProperty("--crest-y", `${crestYPx}px`);
        sideElement.style.setProperty("--crest-scale", String(crestScale));
    });
    updateCrestScaling();
    saveState();
}

function renderTime() {
    el.timerDisplay.textContent = formatClock(state.timerSeconds);
    el.timerToggle.innerHTML = state.timerRunning ? "&#10074;&#10074;" : "&#9654;";

    const parts = getTimeParts(state.timerSeconds);
    const useMinuteSecondFormat = state.settings.countdownFormat === "ms";
    el.timeEditor.classList.toggle("is-ms-format", useMinuteSecondFormat);
    el.timeEditor.querySelector('.time-value[data-unit="hours"]').textContent = pad(parts.hours);
    el.timeEditor.querySelector('.time-value[data-unit="minutes"]').textContent = pad(parts.minutes);
    el.timeEditor.querySelector('.time-value[data-unit="seconds"]').textContent = pad(parts.seconds);
}

function updateWidgetPreview() {
    if (!el.widgetPreview) {
        return;
    }
    const dstW = el.widgetPreview.clientWidth;
    const dstH = el.widgetPreview.clientHeight;
    if (dstW < 10 || dstH < 10) {
        return;
    }

    const copy = el.overlay.cloneNode(true);
    copy.classList.add("preview-live");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    copy.querySelectorAll("button").forEach((btn) => btn.disabled = true);
    copy.style.pointerEvents = "none";
    copy.style.position = "absolute";
    const srcW = Math.max(1, el.overlay.clientWidth);
    const srcH = Math.max(1, el.overlay.clientHeight);
    const scale = Math.min(dstW / srcW, dstH / srcH);
    const scaledW = srcW * scale;
    const scaledH = srcH * scale;
    const offsetX = (dstW - scaledW) / 2;
    const offsetY = (dstH - scaledH) / 2;

    copy.style.left = `${offsetX}px`;
    copy.style.top = `${offsetY}px`;
    copy.style.width = `${srcW}px`;
    copy.style.height = `${srcH}px`;
    copy.style.transformOrigin = "top left";
    copy.style.transform = `scale(${scale})`;
    el.widgetPreview.dataset.previewScale = String(scale);
    el.widgetPreview.innerHTML = "";
    el.widgetPreview.append(copy);
}

function renderWidgets() {
    el.overlay.classList.toggle("is-vertical", state.widgets.orientationVertical);
    el.overlay.classList.toggle("is-dark", state.widgets.darkMode);
    el.timerPanel.classList.toggle("widget-hidden", !state.widgets.showTimer);
    el.setPanel.classList.toggle("widget-hidden", !state.widgets.showSets || !state.settings.setsEnabled);
    el.nameLeft.classList.toggle("is-hidden", !state.widgets.showNames);
    el.nameRight.classList.toggle("is-hidden", !state.widgets.showNames);
    el.sideLeft.classList.toggle("names-hidden", !state.widgets.showNames);
    el.sideRight.classList.toggle("names-hidden", !state.widgets.showNames);
    const viewportWidth = Math.max(320, window.innerWidth || 0);
    const viewportHeight = Math.max(240, window.innerHeight || 0);
    const isPhone = viewportWidth <= 1000;
    const isMobileLandscape = viewportWidth <= 1000 && viewportWidth > viewportHeight;
    const compactHeightScale = Math.max(0.45, Math.min(1, viewportHeight / 560));
    const compactWidthScale = Math.max(0.62, Math.min(1, viewportWidth / 1100));
    const compactScale = isMobileLandscape ? Math.min(compactHeightScale, compactWidthScale) : 1;
    const timerScale = Math.max(70, Math.min(160, state.widgets.timerScale)) / 100;
    const phoneTimerMultiplier = isPhone ? 0.72 : 1;
    const effectiveTimerScale = timerScale * compactScale * phoneTimerMultiplier;
    const timerWidth = Math.max(260, Math.min(Math.round(680 * effectiveTimerScale), Math.round(viewportWidth * (isMobileLandscape ? 0.86 : 0.94))));
    const timerHeight = Math.max(52, Math.min(Math.round(118 * effectiveTimerScale), Math.round(viewportHeight * (isMobileLandscape ? 0.18 : 0.24))));
    const timerFontSize = Math.max(26, Math.min(Math.round(84 * effectiveTimerScale), Math.round(viewportHeight * (isMobileLandscape ? 0.115 : 0.14))));
    const setWidth = Math.max(160, Math.min(Math.round(312 * effectiveTimerScale), Math.round(viewportWidth * (isMobileLandscape ? 0.46 : 0.64))));
    const setHeight = Math.max(48, Math.min(Math.round(136 * effectiveTimerScale), Math.round(viewportHeight * (isMobileLandscape ? 0.14 : 0.2))));
    el.timerDisplay.style.transform = "none";
    el.timerDisplay.style.fontSize = `${timerFontSize}px`;
    el.timerPanel.style.height = `${timerHeight}px`;
    el.timerPanel.style.width = `${timerWidth}px`;
    el.setPanel.style.height = `${setHeight}px`;
    el.setPanel.style.width = `${setWidth}px`;
    el.centerStack.style.gap = `${Math.max(6, Math.round(14 * compactScale))}px`;
    el.menuWrap.style.paddingTop = `${Math.max(52, Math.round(88 * compactScale))}px`;
    el.menuToggle.style.width = `${Math.max(78, Math.round(110 * compactScale))}px`;
    el.menuToggle.style.height = `${Math.max(52, Math.round(80 * compactScale))}px`;
    el.menuToggle.style.fontSize = `${Math.max(34, Math.round(58 * compactScale))}px`;
    el.controlMenu.style.width = `${Math.max(220, Math.min(Math.round(480 * compactScale), Math.round(viewportWidth * (isMobileLandscape ? 0.8 : 0.92))))}px`;
    el.controlMenu.style.height = `${Math.max(110, Math.min(Math.round(272 * compactScale), Math.round(viewportHeight * (isMobileLandscape ? 0.34 : 0.46))))}px`;
    el.controlMenu.style.padding = `${Math.max(8, Math.round(18 * compactScale))}px`;
    el.controlMenu.style.gap = `${Math.max(6, Math.round(10 * compactScale))}px`;
    el.controlMenu.querySelectorAll(".menu-btn").forEach((btn) => {
        btn.style.fontSize = `${Math.max(26, Math.round(52 * compactScale))}px`;
    });
    const safeCenterY = isMobileLandscape
        ? Math.max(-36, Math.min(42, state.widgets.centerY))
        : state.widgets.centerY;
    if (state.widgets.orientationVertical) {
        el.centerStack.style.transform = `translate(-50%, -50%) translateY(${safeCenterY}px)`;
    } else {
        el.centerStack.style.transform = `translateX(-50%) translateY(${safeCenterY}px)`;
    }
    const safeMenuY = isMobileLandscape
        ? Math.max(-18, Math.min(Math.round(viewportHeight * 0.12), state.widgets.menuY))
        : state.widgets.menuY;
    const landscapeMenuLift = isMobileLandscape ? -Math.max(16, Math.round(viewportHeight * 0.06)) : 0;
    const phoneMenuY = isPhone ? (safeMenuY + landscapeMenuLift) * 0.5 : safeMenuY + landscapeMenuLift;
    el.menuWrap.style.transform = `translateY(${phoneMenuY}px)`;
    const menuScale = Math.max(70, Math.min(160, state.widgets.menuScale || 100)) / 100;
    const effectiveMenuScale = isPhone ? menuScale * 0.5 : menuScale;
    el.controlMenu.style.setProperty("--menu-scale", String(effectiveMenuScale));
    updateWidgetPreview();
    saveState();
}

function syncWidgetButtons() {
    widgetInputs.orientation.classList.toggle("is-active", state.widgets.orientationVertical);
    widgetInputs.dark.classList.toggle("is-active", state.widgets.darkMode);
    widgetInputs.timer.classList.toggle("is-active", state.widgets.showTimer);
    widgetInputs.sets.classList.toggle("is-active", state.widgets.showSets);
    widgetInputs.names.classList.toggle("is-active", state.widgets.showNames);
}

function renderAll() {
    renderScores();
    renderTime();
    renderWidgets();
    syncWidgetButtons();
}

function openModal(modal) {
    el.modalBackdrop.classList.remove("is-hidden");
    modal.classList.remove("is-hidden");
    if (modal === el.widgetsModal) {
        window.requestAnimationFrame(() => {
            updateWidgetPreview();
        });
    }
}

function closeModals() {
    el.modalBackdrop.classList.add("is-hidden");
    el.widgetsModal.classList.add("is-hidden");
    el.settingsModal.classList.add("is-hidden");
    el.teamEditorModal.classList.add("is-hidden");
}

function hideMenuPopover() {
    el.menuPopover.classList.add("is-hidden");
    el.menuPopover.innerHTML = "";
}

function hideSidePopover() {
    el.sidePopover.classList.add("is-hidden");
    el.sidePopover.innerHTML = "";
}

function openMenuPopover(anchorButton, actions) {
    const btnRect = anchorButton.getBoundingClientRect();
    const wrapRect = el.menuWrap.getBoundingClientRect();
    const left = Math.max(8, Math.round(btnRect.left - wrapRect.left + 12));
    const top = Math.max(8, Math.round(btnRect.top - wrapRect.top + 14));

    el.menuPopover.innerHTML = actions
        .map((action) => `<button data-menu-action="${action.id}">${action.label}</button>`)
        .join("");

    el.menuPopover.style.left = `${left}px`;
    el.menuPopover.style.top = `${top}px`;
    el.menuPopover.classList.remove("is-hidden");
}

function openSidePopover(anchorButton, slot) {
    const team = getTeamAt(slot);
    const actions = [
        `<button data-side-action="score-up" data-side-slot="${slot}">Wynik +1</button>`,
        `<button data-side-action="score-down" data-side-slot="${slot}">Wynik -1</button>`
    ];
    if (state.settings.setsEnabled) {
        actions.push(`<button data-side-action="set-up" data-side-slot="${slot}">Set +1</button>`);
        actions.push(`<button data-side-action="set-down" data-side-slot="${slot}">Set -1</button>`);
    }
    el.sidePopover.innerHTML = `<strong>${team.name}</strong>${actions.join("")}`;
    const rect = anchorButton.getBoundingClientRect();
    const top = Math.round(rect.bottom + 6);
    const estimatedWidth = 240;
    const left = slot === "right"
        ? Math.round(rect.right - estimatedWidth)
        : Math.round(rect.left - 6);
    el.sidePopover.style.top = `${top}px`;
    el.sidePopover.style.left = `${Math.max(8, Math.min(window.innerWidth - estimatedWidth - 8, left))}px`;
    el.sidePopover.classList.remove("is-hidden");
}

function changeScore(slot, delta, options = {}) {
    const team = getTeamAt(slot);
    pushHistory();
    team.score = Math.max(0, team.score + delta);
    if (delta > 0) {
        checkSetCondition(slot);
    }
    renderScores();
    updateWidgetPreview();
    speakScore();
    const shouldPlayGoalSong = options.playGoalSong !== false;
    if (delta > 0 && shouldPlayGoalSong) {
        playGoalSong(slot);
    }
}

function changeSet(slot, delta) {
    if (!state.settings.setsEnabled) {
        return;
    }
    const team = getTeamAt(slot);
    pushHistory();
    if (delta > 0 && team.pendingSetWin) {
        awardSet(slot);
    } else {
        team.sets = Math.max(0, team.sets + delta);
    }
    renderScores();
    updateWidgetPreview();
}

function clearSetPending() {
    state.teams.forEach((team) => {
        team.pendingSetWin = false;
    });
}

function awardSet(slot) {
    const winner = getTeamAt(slot);
    winner.sets = Math.max(0, winner.sets + 1);
    clearSetPending();
    state.teams.forEach((team) => {
        team.score = 0;
    });
    const target = Math.max(1, Number(state.settings.setsToMatch) || 3);
    if (winner.sets >= target) {
        winner.matchWon = true;
    }
}

function checkSetCondition(slot) {
    if (!state.settings.setsEnabled) {
        return;
    }
    const winner = getTeamAt(slot);
    const loser = getTeamAt(slot === "left" ? "right" : "left");
    const target = Math.max(1, Number(state.settings.pointsToSet) || 25);
    const advantage = Math.max(0, Number(state.settings.setAdvantage) || 2);
    if (winner.score < target) {
        return;
    }
    if (winner.score - loser.score < advantage) {
        return;
    }
    winner.pendingSetWin = true;
    loser.pendingSetWin = false;
    if (state.settings.askSetAward) {
        const yes = window.confirm(`Przyznac set dla ${winner.name}?`);
        if (yes) {
            awardSet(slot);
        }
    }
}

function resetMatch(full = false) {
    pushHistory();
    state.teams.forEach((team) => {
        team.score = 0;
        team.pendingSetWin = false;
        team.matchWon = false;
        if (full) {
            team.sets = 0;
        }
    });
    if (full) {
        state.timerSeconds = getTimerResetValue();
        pauseTimer();
    }
    renderAll();
}

function swapSides() {
    pushHistory();
    const oldLeft = state.slotMap.left;
    state.slotMap.left = state.slotMap.right;
    state.slotMap.right = oldLeft;
    renderAll();
}

function bindTimeEditorDrag() {
    const values = [...document.querySelectorAll(".time-value")];
    values.forEach((valueElement) => {
        let startY = null;
        const unit = valueElement.dataset.unit;

        valueElement.addEventListener("wheel", (event) => {
            event.preventDefault();
            adjustTimeUnit(unit, event.deltaY < 0 ? 1 : -1);
        }, { passive: false });

        valueElement.addEventListener("pointerdown", (event) => {
            startY = event.clientY;
            valueElement.setPointerCapture(event.pointerId);
        });

        valueElement.addEventListener("pointermove", (event) => {
            if (startY === null) {
                return;
            }
            const diff = startY - event.clientY;
            if (Math.abs(diff) >= 18) {
                adjustTimeUnit(unit, diff > 0 ? 1 : -1);
                startY = event.clientY;
            }
        });

        valueElement.addEventListener("pointerup", () => {
            startY = null;
        });
    });
}

function bindScoreGestures(scoreElement, slot) {
    scoreElement.addEventListener("mousedown", (event) => {
        if (!state.settings.swipeScore) {
            return;
        }
        if (event.button === 0) {
            changeScore(slot, 1);
        }
        if (event.button === 2) {
            changeScore(slot, -1);
        }
    });

    scoreElement.addEventListener("contextmenu", (event) => {
        if (state.settings.swipeScore) {
            event.preventDefault();
        }
    });

    let startY = null;
    let swipeTriggered = false;
    scoreElement.addEventListener("touchstart", (event) => {
        if (!state.settings.swipeScore || state.settings.swipeArea === "side") {
            return;
        }
        startY = event.touches[0].clientY;
        swipeTriggered = false;
    }, { passive: true });

    scoreElement.addEventListener("touchmove", (event) => {
        if (!state.settings.swipeScore || state.settings.swipeArea === "side" || startY === null || swipeTriggered) {
            return;
        }
        const nowY = event.touches[0].clientY;
        const diff = startY - nowY;
        const direction = state.settings.swipeDownMinus ? (diff > 0 ? 1 : -1) : (diff > 0 ? -1 : 1);
        if (Math.abs(diff) >= 24) {
            changeScore(slot, direction);
            swipeTriggered = true;
        }
    }, { passive: true });

    scoreElement.addEventListener("touchend", () => {
        startY = null;
        swipeTriggered = false;
    });

    scoreElement.addEventListener("touchcancel", () => {
        startY = null;
        swipeTriggered = false;
    });
}

function bindSideSwipeGestures(sideElement, slot) {
    let startY = null;
    let swipeTriggered = false;
    let validStart = false;

    sideElement.addEventListener("touchstart", (event) => {
        if (!state.settings.swipeScore || state.settings.swipeArea !== "side") {
            return;
        }
        if (event.target.closest("button, input, select, .menu-popover, .side-popover")) {
            validStart = false;
            return;
        }
        startY = event.touches[0].clientY;
        swipeTriggered = false;
        validStart = true;
    }, { passive: true });

    sideElement.addEventListener("touchmove", (event) => {
        if (!state.settings.swipeScore || state.settings.swipeArea !== "side" || !validStart || startY === null || swipeTriggered) {
            return;
        }
        const nowY = event.touches[0].clientY;
        const diff = startY - nowY;
        const direction = state.settings.swipeDownMinus ? (diff > 0 ? 1 : -1) : (diff > 0 ? -1 : 1);
        if (Math.abs(diff) >= 24) {
            changeScore(slot, direction);
            swipeTriggered = true;
        }
    }, { passive: true });

    const stop = () => {
        startY = null;
        swipeTriggered = false;
        validStart = false;
    };

    sideElement.addEventListener("touchend", stop);
    sideElement.addEventListener("touchcancel", stop);
}

function openTeamEditor(slot) {
    state.editingSlot = slot;
    const team = getTeamAt(slot);
    el.teamEditorTitle.textContent = `Edycja: ${team.name}`;
    el.teamNameInput.value = team.name;
    el.teamCrestFile.value = "";
    el.teamGoalsongTrack.value = team.goalsongTrack || "";
    el.teamGoalsongVolume.value = String(team.goalsongVolume ?? 0.8);
    el.teamGoalsongDuration.value = String(team.goalsongDuration ?? -1);
    el.teamColorInput.value = normalizeHex(team.color);
    el.teamThemeSelect.value = team.themeId || "";
    openModal(el.teamEditorModal);
}

function normalizeHex(color) {
    const value = String(color || "").trim();
    if (!value.startsWith("#")) {
        return "#2f95e2";
    }
    if (value.length === 4) {
        const r = value[1];
        const g = value[2];
        const b = value[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    if (value.length === 7) {
        return value;
    }
    return "#2f95e2";
}

function applyThemeToTeam(team, themeId) {
    const theme = CLUB_THEMES.find((item) => item.id === themeId);
    if (!theme) {
        team.themeId = "";
        return;
    }
    team.themeId = theme.id;
    team.color = theme.color;
    team.textColor = theme.textColor;
}

function saveTeamEditor() {
    if (!state.editingSlot) {
        return;
    }
    pushHistory();
    const team = getTeamAt(state.editingSlot);
    const selectedTheme = el.teamThemeSelect.value;
    team.name = el.teamNameInput.value.trim() || team.name;
    team.goalsongTrack = el.teamGoalsongTrack.value || "";
    team.goalsongVolume = Number(el.teamGoalsongVolume.value || 0.8);
    team.goalsongDuration = Number(el.teamGoalsongDuration.value || -1);
    if (selectedTheme) {
        applyThemeToTeam(team, selectedTheme);
    } else {
        team.themeId = "";
        team.color = normalizeHex(el.teamColorInput.value);
        team.textColor = "#ffffff";
    }
    syncSettingsTeamInputs();
    renderAll();
    closeModals();
}

function syncSettingsTeamInputs() {
    settingInputs.name1.value = state.teams[0].name;
    settingInputs.name2.value = state.teams[1].name;
    settingInputs.color1.value = normalizeHex(state.teams[0].color);
    settingInputs.color2.value = normalizeHex(state.teams[1].color);
    settingInputs.theme1.value = state.teams[0].themeId || "";
    settingInputs.theme2.value = state.teams[1].themeId || "";
    settingInputs.goalsongTrack1.value = state.teams[0].goalsongTrack || "";
    settingInputs.goalsongTrack2.value = state.teams[1].goalsongTrack || "";
    settingInputs.goalsongVolume1.value = String(state.teams[0].goalsongVolume);
    settingInputs.goalsongVolume2.value = String(state.teams[1].goalsongVolume);
    settingInputs.goalsongDuration1.value = String(state.teams[0].goalsongDuration);
    settingInputs.goalsongDuration2.value = String(state.teams[1].goalsongDuration);
}

function fillThemeSelect(selectElement) {
    CLUB_THEMES.forEach((theme) => {
        const option = document.createElement("option");
        option.value = theme.id;
        option.textContent = theme.name;
        selectElement.append(option);
    });
}

async function loadGoalSongs() {
    const files = new Set(FALLBACK_GOALSONGS);
    try {
        const response = await fetch("goalsongs/");
        if (response.ok) {
            const html = await response.text();
            const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => decodeURIComponent(match[1]));
            links.forEach((link) => {
                const clean = link.split("/").pop();
                if (clean && /\.(mp3|wav)$/i.test(clean)) {
                    files.add(clean);
                }
            });
        }
    } catch (_) {
        // no-op: local file mode or server without listing
    }

    state.goalsongFiles = [...files].sort((a, b) => a.localeCompare(b));
    const allSongSelects = [el.teamGoalsongTrack, settingInputs.goalsongTrack1, settingInputs.goalsongTrack2];
    allSongSelects.forEach((select) => {
        select.innerHTML = "<option value=''>Brak</option>";
        if (!state.goalsongFiles.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Brak plikow w folderze goalsongs";
            select.append(option);
            return;
        }
        state.goalsongFiles.forEach((name) => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            select.append(option);
        });
    });
    syncSettingsTeamInputs();
}

function setupVoices() {
    if (!("speechSynthesis" in window)) {
        return;
    }
    const fillVoices = () => {
        const selected = settingInputs.audioVoice.value;
        settingInputs.audioVoice.innerHTML = "<option value=''>Domyslny</option>";
        speechSynthesis.getVoices().forEach((voice) => {
            const option = document.createElement("option");
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            settingInputs.audioVoice.append(option);
        });
        settingInputs.audioVoice.value = selected;
    };
    fillVoices();
    speechSynthesis.addEventListener("voiceschanged", fillVoices);
}

function bindMainActions() {
    el.timerToggle.addEventListener("click", () => {
        if (state.timerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    el.timerReset.addEventListener("click", () => {
        if (!window.confirm("Na pewno zresetowac czas?")) {
            return;
        }
        pushHistory();
        state.timerSeconds = getTimerResetValue();
        pauseTimer();
        renderTime();
        updateWidgetPreview();
    });

    el.timerDisplay.addEventListener("click", () => {
        el.timeEditor.classList.toggle("is-hidden");
    });

    el.timeEditor.addEventListener("click", (event) => {
        const button = event.target.closest(".time-step");
        if (!button) {
            return;
        }
        const unit = button.closest(".time-col").dataset.unit;
        adjustTimeUnit(unit, button.dataset.dir === "up" ? 1 : -1);
    });

    el.menuToggle.addEventListener("click", () => {
        el.controlMenu.classList.toggle("is-collapsed");
        el.menuToggle.classList.toggle("is-open");
        hideMenuPopover();
    });

    el.controlMenu.addEventListener("click", (event) => {
        const button = event.target.closest(".menu-btn");
        if (!button) {
            return;
        }
        const action = button.dataset.action;
        if (action === "reset-match") {
            openMenuPopover(button, [
                { id: "reset-score", label: "Zresetuj wynik" },
                { id: "reset-full", label: "Zresetuj mecz" }
            ]);
            return;
        }
        if (action === "undo-redo") {
            openMenuPopover(button, [
                { id: "undo", label: "Cofnij" },
                { id: "redo", label: "Ponow" }
            ]);
            return;
        }
        if (action === "swap-sides") {
            swapSides();
            return;
        }
        if (action === "widgets") {
            openModal(el.widgetsModal);
            return;
        }
        if (action === "settings") {
            openModal(el.settingsModal);
            return;
        }
        openMenuPopover(button, [{ id: "none", label: "Ta funkcja bedzie pozniej" }]);
    });

    el.menuPopover.addEventListener("click", (event) => {
        const button = event.target.closest("[data-menu-action]");
        if (!button) {
            return;
        }
        const action = button.dataset.menuAction;
        if (action === "reset-score") {
            resetMatch(false);
        } else if (action === "reset-full") {
            resetMatch(true);
        } else if (action === "undo") {
            undo();
        } else if (action === "redo") {
            redo();
        }
        hideMenuPopover();
    });

    document.querySelectorAll(".quick-btn").forEach((quickButton) => {
        quickButton.addEventListener("click", () => {
            const slot = quickButton.dataset.quickSlot;
            openSidePopover(quickButton, slot);
        });
    });

    el.sidePopover.addEventListener("click", (event) => {
        const button = event.target.closest("[data-side-action]");
        if (!button) {
            return;
        }
        const slot = button.dataset.sideSlot;
        const action = button.dataset.sideAction;
        if (action === "score-up") {
            changeScore(slot, 1);
        } else if (action === "score-down") {
            changeScore(slot, -1);
        } else if (action === "set-up") {
            changeSet(slot, 1);
        } else if (action === "set-down") {
            changeSet(slot, -1);
        }
        hideSidePopover();
    });

    document.querySelectorAll(".edit-btn").forEach((editButton) => {
        editButton.addEventListener("click", () => {
            openTeamEditor(editButton.dataset.teamSlot);
        });
    });

    document.querySelectorAll(".stop-btn").forEach((stopButton) => {
        stopButton.addEventListener("click", () => {
            if (state.activeGoalAudio) {
                state.activeGoalAudio.pause();
                state.activeGoalAudio.currentTime = 0;
                state.activeGoalAudio = null;
            }
        });
    });

    el.modalBackdrop.addEventListener("click", () => {
        closeModals();
        hideMenuPopover();
        hideSidePopover();
    });

    document.querySelectorAll(".close-modal").forEach((closeButton) => {
        closeButton.addEventListener("click", closeModals);
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".menu-wrap")) {
            hideMenuPopover();
        }
        if (!event.target.closest(".quick-btn") && !event.target.closest("#side-popover")) {
            hideSidePopover();
        }
        if (!event.target.closest("#team-transfer-btn") && !event.target.closest("#team-transfer-panel")) {
            el.teamTransferPanel.classList.add("is-hidden");
        }
        if (!event.target.closest("#settings-transfer-btn") && !event.target.closest("#settings-transfer-panel")) {
            el.settingsTransferPanel.classList.add("is-hidden");
        }
    });
}

function bindWidgetInputs() {
    widgetInputs.orientation.addEventListener("click", () => {
        state.widgets.orientationVertical = !state.widgets.orientationVertical;
        renderWidgets();
        syncWidgetButtons();
    });
    widgetInputs.dark.addEventListener("click", () => {
        state.widgets.darkMode = !state.widgets.darkMode;
        renderWidgets();
        syncWidgetButtons();
    });
    widgetInputs.timer.addEventListener("click", () => {
        state.widgets.showTimer = !state.widgets.showTimer;
        renderWidgets();
        syncWidgetButtons();
    });
    widgetInputs.sets.addEventListener("click", () => {
        state.widgets.showSets = !state.widgets.showSets;
        renderWidgets();
        syncWidgetButtons();
    });
    widgetInputs.names.addEventListener("click", () => {
        state.widgets.showNames = !state.widgets.showNames;
        renderWidgets();
        syncWidgetButtons();
    });
    widgetInputs.scoreSize.addEventListener("input", () => {
        state.widgets.scoreScale = Number(widgetInputs.scoreSize.value);
        renderScores();
        updateWidgetPreview();
    });
    widgetInputs.nameSize.addEventListener("input", () => {
        state.widgets.nameScale = Number(widgetInputs.nameSize.value);
        renderScores();
        updateWidgetPreview();
    });
    widgetInputs.crestSize.addEventListener("input", () => {
        state.widgets.crestScale = Number(widgetInputs.crestSize.value);
        renderScores();
        updateWidgetPreview();
    });
    widgetInputs.timerSize.addEventListener("input", () => {
        state.widgets.timerScale = Number(widgetInputs.timerSize.value);
        renderWidgets();
    });
    widgetInputs.nameY.addEventListener("input", () => {
        state.widgets.nameY = Number(widgetInputs.nameY.value);
        renderScores();
        updateWidgetPreview();
    });
    widgetInputs.crestY.addEventListener("input", () => {
        state.widgets.crestY = Number(widgetInputs.crestY.value);
        renderScores();
        updateWidgetPreview();
    });
    widgetInputs.centerY.addEventListener("input", () => {
        state.widgets.centerY = Number(widgetInputs.centerY.value);
        renderWidgets();
    });
    widgetInputs.menuY.addEventListener("input", () => {
        state.widgets.menuY = Number(widgetInputs.menuY.value);
        renderWidgets();
    });
    widgetInputs.menuSize.addEventListener("input", () => {
        state.widgets.menuScale = Number(widgetInputs.menuSize.value);
        renderWidgets();
    });

    el.widgetAdvancedReset.addEventListener("click", () => {
        state.widgets.scoreScale = 100;
        state.widgets.nameScale = 100;
        state.widgets.crestScale = 100;
        state.widgets.timerScale = 100;
        state.widgets.nameY = 0;
        state.widgets.crestY = 0;
        state.widgets.centerY = 0;
        state.widgets.menuY = 38;
        state.widgets.menuScale = 100;
        widgetInputs.scoreSize.value = "100";
        widgetInputs.nameSize.value = "100";
        widgetInputs.crestSize.value = "100";
        widgetInputs.timerSize.value = "100";
        widgetInputs.nameY.value = "0";
        widgetInputs.crestY.value = "0";
        widgetInputs.centerY.value = "0";
        widgetInputs.menuY.value = "38";
        widgetInputs.menuSize.value = "100";
        renderAll();
    });
}

function bindWidgetPreviewDrag() {
    let dragTarget = "";
    let lastY = 0;
    let activePointerId = null;

    el.widgetPreview.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
            return;
        }
        const target = event.target.closest(".player-name, .team-crest");
        if (!target || !el.widgetPreview.contains(target)) {
            return;
        }
        dragTarget = target.classList.contains("team-crest") ? "crest" : "name";
        lastY = event.clientY;
        activePointerId = event.pointerId;
        el.widgetPreview.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    el.widgetPreview.addEventListener("pointermove", (event) => {
        if (!dragTarget || activePointerId !== event.pointerId) {
            return;
        }
        const previewScale = Math.max(0.01, Number(el.widgetPreview.dataset.previewScale) || 1);
        const deltaY = (event.clientY - lastY) / previewScale;
        lastY = event.clientY;
        if (dragTarget === "name") {
            state.widgets.nameY = Math.max(-180, Math.min(180, (Number(state.widgets.nameY) || 0) + deltaY));
            widgetInputs.nameY.value = String(Math.round(state.widgets.nameY));
        } else if (dragTarget === "crest") {
            state.widgets.crestY = Math.max(-180, Math.min(180, (Number(state.widgets.crestY) || 0) + deltaY));
            widgetInputs.crestY.value = String(Math.round(state.widgets.crestY));
        }
        renderScores();
        updateWidgetPreview();
    });

    const stopDrag = (event) => {
        if (activePointerId !== null && event.pointerId !== undefined && event.pointerId !== activePointerId) {
            return;
        }
        dragTarget = "";
        activePointerId = null;
    };

    el.widgetPreview.addEventListener("pointerup", stopDrag);
    el.widgetPreview.addEventListener("pointercancel", stopDrag);
}

function bindSetGestures(setElement, slot) {
    setElement.addEventListener("mousedown", (event) => {
        if (!state.settings.swipeScore || !state.settings.setsEnabled) {
            return;
        }
        if (event.button === 0) {
            changeSet(slot, 1);
        }
        if (event.button === 2) {
            changeSet(slot, -1);
        }
    });
    setElement.addEventListener("contextmenu", (event) => event.preventDefault());
    let startY = null;
    setElement.addEventListener("touchstart", (event) => {
        if (!state.settings.swipeScore || !state.settings.setsEnabled) {
            return;
        }
        startY = event.touches[0].clientY;
    }, { passive: true });
    setElement.addEventListener("touchmove", (event) => {
        if (!state.settings.swipeScore || !state.settings.setsEnabled || startY === null) {
            return;
        }
        const nowY = event.touches[0].clientY;
        const diff = startY - nowY;
        const direction = state.settings.swipeDownMinus ? (diff > 0 ? 1 : -1) : (diff > 0 ? -1 : 1);
        if (Math.abs(diff) >= 24) {
            changeSet(slot, direction);
            startY = nowY;
        }
    }, { passive: true });
}

function updateTeamFromSettings(teamIndex) {
    const team = state.teams[teamIndex];
    const nameInput = teamIndex === 0 ? settingInputs.name1 : settingInputs.name2;
    const colorInput = teamIndex === 0 ? settingInputs.color1 : settingInputs.color2;
    const themeInput = teamIndex === 0 ? settingInputs.theme1 : settingInputs.theme2;
    const goalsongTrackInput = teamIndex === 0 ? settingInputs.goalsongTrack1 : settingInputs.goalsongTrack2;
    const goalsongVolumeInput = teamIndex === 0 ? settingInputs.goalsongVolume1 : settingInputs.goalsongVolume2;
    const goalsongDurationInput = teamIndex === 0 ? settingInputs.goalsongDuration1 : settingInputs.goalsongDuration2;

    team.name = nameInput.value.trim() || `Player ${teamIndex + 1}`;
    if (themeInput.value) {
        applyThemeToTeam(team, themeInput.value);
    } else {
        team.themeId = "";
        team.color = normalizeHex(colorInput.value);
        team.textColor = "#ffffff";
    }
    team.goalsongTrack = goalsongTrackInput.value || "";
    team.goalsongVolume = Number(goalsongVolumeInput.value);
    const duration = Number(goalsongDurationInput.value);
    team.goalsongDuration = Number.isNaN(duration) ? -1 : duration;
    renderAll();
    saveState();
}

function bindSettingsInputs() {
    settingInputs.swipe.addEventListener("change", () => {
        state.settings.swipeScore = settingInputs.swipe.checked;
        saveState();
    });
    settingInputs.swipeDownMinus.addEventListener("change", () => {
        state.settings.swipeDownMinus = settingInputs.swipeDownMinus.checked;
        saveState();
    });
    settingInputs.swipeArea.addEventListener("change", () => {
        state.settings.swipeArea = settingInputs.swipeArea.value === "side" ? "side" : "score";
        saveState();
    });
    settingInputs.askSetAward.addEventListener("change", () => {
        state.settings.askSetAward = settingInputs.askSetAward.checked;
        saveState();
    });
    settingInputs.voiceGoalEnabled.addEventListener("change", () => {
        state.settings.voiceGoalCommandsEnabled = settingInputs.voiceGoalEnabled.checked;
        if (state.settings.voiceGoalCommandsEnabled) {
            if (!isVoiceRecognitionSupported()) {
                state.settings.voiceGoalCommandsEnabled = false;
                settingInputs.voiceGoalEnabled.checked = false;
                stopVoiceGoalRecognition();
                window.alert("Ta przegladarka nie wspiera komend glosowych (SpeechRecognition). Uzyj Chrome/Edge na HTTPS lub localhost.");
            } else {
                requestMicrophonePermission().then((granted) => {
                    if (!state.settings.voiceGoalCommandsEnabled) {
                        return;
                    }
                    if (!granted) {
                        state.settings.voiceGoalCommandsEnabled = false;
                        settingInputs.voiceGoalEnabled.checked = false;
                        stopVoiceGoalRecognition();
                        window.alert("Brak aktywnego dostepu do mikrofonu. Wlacz mikrofon dla tej strony i sprobuj ponownie.");
                        saveState();
                        return;
                    }
                    if (!startVoiceGoalRecognition()) {
                        state.settings.voiceGoalCommandsEnabled = false;
                        settingInputs.voiceGoalEnabled.checked = false;
                        stopVoiceGoalRecognition();
                        window.alert("Nie udalo sie uruchomic rozpoznawania mowy. Odswiez strone i sprobuj ponownie.");
                        saveState();
                    }
                });
            }
        } else {
            stopVoiceGoalRecognition();
        }
        saveState();
    });
    settingInputs.setsEnabled.addEventListener("change", () => {
        state.settings.setsEnabled = settingInputs.setsEnabled.checked;
        renderWidgets();
        saveState();
    });
    settingInputs.pointsToSet.addEventListener("input", () => {
        state.settings.pointsToSet = Math.max(1, Number(settingInputs.pointsToSet.value) || 25);
        saveState();
    });
    settingInputs.setAdvantage.addEventListener("input", () => {
        state.settings.setAdvantage = Math.max(0, Number(settingInputs.setAdvantage.value) || 2);
        saveState();
    });
    settingInputs.setsToMatch.addEventListener("input", () => {
        state.settings.setsToMatch = Math.max(1, Number(settingInputs.setsToMatch.value) || 3);
        saveState();
    });
    settingInputs.setAnimationsEnabled.addEventListener("change", () => {
        state.settings.setAnimationsEnabled = settingInputs.setAnimationsEnabled.checked;
        renderScores();
        saveState();
    });

    settingInputs.name1.addEventListener("input", () => updateTeamFromSettings(0));
    settingInputs.name2.addEventListener("input", () => updateTeamFromSettings(1));
    settingInputs.color1.addEventListener("input", () => updateTeamFromSettings(0));
    settingInputs.color2.addEventListener("input", () => updateTeamFromSettings(1));
    settingInputs.theme1.addEventListener("change", () => updateTeamFromSettings(0));
    settingInputs.theme2.addEventListener("change", () => updateTeamFromSettings(1));

    settingInputs.audioEnabled.addEventListener("change", () => {
        state.settings.audioEnabled = settingInputs.audioEnabled.checked;
    });
    settingInputs.audioVoice.addEventListener("change", () => {
        state.settings.audioVoice = settingInputs.audioVoice.value;
    });
    settingInputs.audioRate.addEventListener("input", () => {
        state.settings.audioRate = Number(settingInputs.audioRate.value);
    });
    settingInputs.audioVolume.addEventListener("input", () => {
        state.settings.audioVolume = Number(settingInputs.audioVolume.value);
    });
    settingInputs.audioFormat.addEventListener("input", () => {
        state.settings.audioFormat = settingInputs.audioFormat.value;
    });

    settingInputs.goalsongTrack1.addEventListener("change", () => {
        updateTeamFromSettings(0);
    });
    settingInputs.goalsongTrack2.addEventListener("change", () => {
        updateTeamFromSettings(1);
    });
    settingInputs.goalsongVolume1.addEventListener("input", () => updateTeamFromSettings(0));
    settingInputs.goalsongVolume2.addEventListener("input", () => updateTeamFromSettings(1));
    settingInputs.goalsongDuration1.addEventListener("input", () => updateTeamFromSettings(0));
    settingInputs.goalsongDuration2.addEventListener("input", () => updateTeamFromSettings(1));

    settingInputs.countdownLength.addEventListener("change", () => {
        const parsed = parseTimeInput(settingInputs.countdownLength.value);
        if (parsed === null) {
            settingInputs.countdownLength.value = formatDurationInput(state.settings.countdownLengthSeconds);
            return;
        }
        state.settings.countdownLengthSeconds = parsed;
        if (state.settings.countdownEnabled && !state.timerRunning) {
            state.timerSeconds = parsed < 0 ? 0 : parsed;
            renderTime();
            updateWidgetPreview();
        }
        settingInputs.countdownLength.value = formatDurationInput(state.settings.countdownLengthSeconds);
    });

    settingInputs.countdownFormat.addEventListener("change", () => {
        state.settings.countdownFormat = settingInputs.countdownFormat.value === "ms" ? "ms" : "hms";
        renderTime();
        updateWidgetPreview();
    });

    settingInputs.countdownEnabled.addEventListener("change", () => {
        state.settings.countdownEnabled = settingInputs.countdownEnabled.checked;
        if (state.settings.countdownEnabled && state.timerSeconds === 0) {
            state.timerSeconds = state.settings.countdownLengthSeconds;
        }
        renderTime();
        updateWidgetPreview();
    });

    el.teamClearEmblem.addEventListener("click", () => {
        if (!state.editingSlot) {
            return;
        }
        const team = getTeamAt(state.editingSlot);
        team.crest = "";
        el.teamCrestFile.value = "";
        renderAll();
        saveState();
    });

    el.teamCrestFile.addEventListener("change", () => {
        if (!state.editingSlot) {
            return;
        }
        const file = el.teamCrestFile.files?.[0];
        if (!file) {
            return;
        }
        (async () => {
            try {
                const rawDataUrl = await readFileAsDataUrl(file);
                const normalizedPng = await normalizeCrestToSquarePng(rawDataUrl);
                const team = getTeamAt(state.editingSlot);
                team.crest = normalizedPng;
                renderAll();
                saveState();
            } catch (_) {}
        })();
    });

    el.teamThemeSelect.addEventListener("change", () => {
        if (!el.teamThemeSelect.value) {
            return;
        }
        const theme = CLUB_THEMES.find((item) => item.id === el.teamThemeSelect.value);
        if (!theme) {
            return;
        }
        el.teamColorInput.value = normalizeHex(theme.color);
    });

    el.teamSaveBtn.addEventListener("click", saveTeamEditor);
    el.teamExportBtn.addEventListener("click", () => {
        if (!state.editingSlot) {
            return;
        }
        const team = getTeamAt(state.editingSlot);
        downloadJson(`${team.name || "team"}.s7team.json`, {
            version: 1,
            team
        });
    });
    el.teamTransferBtn.addEventListener("click", () => {
        el.teamTransferPanel.classList.toggle("is-hidden");
    });
    el.teamImportBtn.addEventListener("click", () => {
        el.teamImportFile.click();
    });
    el.teamImportFile.addEventListener("change", async () => {
        if (!state.editingSlot) {
            return;
        }
        const file = el.teamImportFile.files?.[0];
        if (!file) {
            return;
        }
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!parsed?.team) {
                return;
            }
            const team = getTeamAt(state.editingSlot);
            Object.assign(team, parsed.team);
            syncSettingsTeamInputs();
            openTeamEditor(state.editingSlot);
            renderAll();
            saveState();
        } catch (_) {}
    });
    el.resetAllBtn.addEventListener("click", () => {
        if (window.confirm("Na pewno zresetowac wszystkie ustawienia?")) {
            resetAllState();
        }
    });
    el.exportSettingsBtn.addEventListener("click", () => {
        downloadJson("s7-settings.json", {
            version: 1,
            settings: state.settings,
            widgets: state.widgets
        });
    });
    el.settingsTransferBtn.addEventListener("click", () => {
        el.settingsTransferPanel.classList.toggle("is-hidden");
    });
    el.exportAllBtn.addEventListener("click", () => {
        downloadJson("s7-all.json", {
            version: 1,
            teams: state.teams,
            slotMap: state.slotMap,
            timerSeconds: state.timerSeconds,
            settings: state.settings,
            widgets: state.widgets
        });
    });
    el.importAllBtn.addEventListener("click", () => {
        el.importAllFile.click();
    });
    el.importAllFile.addEventListener("change", async () => {
        const file = el.importAllFile.files?.[0];
        if (!file) {
            return;
        }
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (parsed?.settings) {
                state.settings = { ...state.settings, ...parsed.settings };
            }
            if (parsed?.widgets) {
                state.widgets = { ...state.widgets, ...parsed.widgets };
            }
            if (parsed?.teams?.length === 2) {
                state.teams = parsed.teams.map((team, i) => ({ ...state.teams[i], ...team }));
            }
            if (parsed?.slotMap) {
                state.slotMap = { ...state.slotMap, ...parsed.slotMap };
            }
            if (typeof parsed?.timerSeconds === "number") {
                state.timerSeconds = Math.max(0, parsed.timerSeconds);
            }
            initializeDefaults();
            renderAll();
            saveState();
        } catch (_) {}
    });
    el.settingsModal.addEventListener("change", saveState);
    el.settingsModal.addEventListener("input", saveState);
}

function initializeDefaults() {
    loadState();
    state.settings.countdownFormat = state.settings.countdownFormat === "ms" ? "ms" : "hms";
    state.settings.voiceGoalCommandsEnabled = Boolean(state.settings.voiceGoalCommandsEnabled);
    state.settings.swipeArea = state.settings.swipeArea === "side" ? "side" : "score";
    state.widgets = {
        orientationVertical: false,
        darkMode: false,
        showTimer: true,
        showSets: true,
        showNames: true,
        scoreScale: 100,
        nameScale: 100,
        crestScale: 100,
        timerScale: 100,
        nameY: 0,
        crestY: 0,
        centerY: 0,
        menuY: 38,
        menuScale: 100,
        ...state.widgets
    };
    fillThemeSelect(el.teamThemeSelect);
    fillThemeSelect(settingInputs.theme1);
    fillThemeSelect(settingInputs.theme2);
    settingInputs.countdownLength.value = formatDurationInput(state.settings.countdownLengthSeconds);
    settingInputs.countdownFormat.value = state.settings.countdownFormat;
    widgetInputs.scoreSize.value = String(state.widgets.scoreScale);
    widgetInputs.nameSize.value = String(state.widgets.nameScale);
    widgetInputs.crestSize.value = String(state.widgets.crestScale);
    widgetInputs.timerSize.value = String(state.widgets.timerScale);
    widgetInputs.nameY.value = String(state.widgets.nameY);
    widgetInputs.crestY.value = String(state.widgets.crestY);
    widgetInputs.centerY.value = String(state.widgets.centerY);
    widgetInputs.menuY.value = String(state.widgets.menuY);
    widgetInputs.menuSize.value = String(state.widgets.menuScale);
    settingInputs.swipeDownMinus.checked = state.settings.swipeDownMinus;
    settingInputs.swipe.checked = state.settings.swipeScore;
    settingInputs.swipeArea.value = state.settings.swipeArea;
    settingInputs.askSetAward.checked = state.settings.askSetAward;
    settingInputs.voiceGoalEnabled.checked = state.settings.voiceGoalCommandsEnabled;
    settingInputs.setsEnabled.checked = state.settings.setsEnabled;
    settingInputs.pointsToSet.value = String(state.settings.pointsToSet);
    settingInputs.setAdvantage.value = String(state.settings.setAdvantage);
    settingInputs.setsToMatch.value = String(state.settings.setsToMatch);
    settingInputs.setAnimationsEnabled.checked = state.settings.setAnimationsEnabled;
    settingInputs.audioEnabled.checked = state.settings.audioEnabled;
    settingInputs.audioRate.value = String(state.settings.audioRate);
    settingInputs.audioVolume.value = String(state.settings.audioVolume);
    settingInputs.audioFormat.value = state.settings.audioFormat;
    settingInputs.countdownEnabled.checked = state.settings.countdownEnabled;
    if (state.settings.voiceGoalCommandsEnabled) {
        if (!isVoiceRecognitionSupported() || !startVoiceGoalRecognition()) {
            state.settings.voiceGoalCommandsEnabled = false;
            settingInputs.voiceGoalEnabled.checked = false;
            stopVoiceGoalRecognition();
        }
    } else {
        stopVoiceGoalRecognition();
    }
    syncSettingsTeamInputs();
}

function init() {
    initializeDefaults();
    renderAll();
    setupVoices();
    bindTimeEditorDrag();
    bindScoreGestures(el.scoreLeft, "left");
    bindScoreGestures(el.scoreRight, "right");
    bindSideSwipeGestures(el.sideLeft, "left");
    bindSideSwipeGestures(el.sideRight, "right");
    bindSetGestures(el.setsLeft, "left");
    bindSetGestures(el.setsRight, "right");
    bindMainActions();
    bindWidgetInputs();
    bindWidgetPreviewDrag();
    bindSettingsInputs();
    loadGoalSongs();
    window.addEventListener("resize", updateCrestScaling);
    window.addEventListener("resize", updateWidgetPreview);
    window.addEventListener("beforeunload", stopVoiceGoalRecognition);
}

init();


// goalsong preview buttons runtime patch
let gsPreviewAudio = null;
let gsPreviewBtn = null;

function stopGsPreview() {
    if (gsPreviewAudio) {
        gsPreviewAudio.pause();
        gsPreviewAudio.currentTime = 0;
        gsPreviewAudio = null;
    }
    if (gsPreviewBtn) {
        gsPreviewBtn.classList.remove("is-playing");
        gsPreviewBtn.innerHTML = "&#9654;";
        gsPreviewBtn = null;
    }
}

function toggleGsPreview(track, volume, duration, btn) {
    if (!track) {
        stopGsPreview();
        return;
    }
    if (gsPreviewBtn === btn) {
        stopGsPreview();
        return;
    }
    stopGsPreview();
    const srcEncoded = "goalsongs/" + encodeURIComponent(track);
    const srcRaw = "goalsongs/" + track;
    const audio = new Audio(srcEncoded);
    audio.volume = Math.max(0, Math.min(1, Number(volume) || 0.8));
    audio.currentTime = 0;
    audio.play().catch(() => {
        audio.src = srcRaw;
        audio.play().catch(() => {});
    });

    gsPreviewAudio = audio;
    gsPreviewBtn = btn;
    btn.classList.add("is-playing");
    btn.innerHTML = "&#9209;";

    const d = Number(duration);
    if (!Number.isNaN(d) && d >= 0) {
        window.setTimeout(() => {
            if (gsPreviewAudio === audio) {
                stopGsPreview();
            }
        }, Math.max(1, d) * 1000);
    }
}
function ensureGsPreviewButton(selectId, volumeId, durationId, buttonId) {
    const select = document.getElementById(selectId);
    if (!select) {
        return;
    }

    let btn = document.getElementById(buttonId);
    if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.id = buttonId;
        btn.className = "goalsong-preview-btn";
        btn.innerHTML = "&#9654;";
        btn.ariaLabel = "Podglad goalsonga";
        select.insertAdjacentElement("afterend", btn);
    }

    btn.addEventListener("click", () => {
        const volumeEl = document.getElementById(volumeId);
        const durationEl = document.getElementById(durationId);
        toggleGsPreview(select.value, volumeEl ? volumeEl.value : 0.8, durationEl ? durationEl.value : -1, btn);
    });
}
function bindGsPreviewRuntime() {
    ensureGsPreviewButton("team-goalsong-track", "team-goalsong-volume", "team-goalsong-duration", "team-goalsong-preview");
    ensureGsPreviewButton("default-goalsong-track-1", "default-goalsong-volume-1", "default-goalsong-duration-1", "default-goalsong-preview-1");
    ensureGsPreviewButton("default-goalsong-track-2", "default-goalsong-volume-2", "default-goalsong-duration-2", "default-goalsong-preview-2");

    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) {
        backdrop.addEventListener("click", stopGsPreview);
    }
}

bindGsPreviewRuntime();
function wrapGsInline(selectId, buttonId) {
    const select = document.getElementById(selectId);
    const btn = document.getElementById(buttonId);
    if (!select || !btn) {
        return;
    }
    if (select.parentElement && select.parentElement.classList.contains("goalsong-inline-wrap")) {
        return;
    }
    const wrap = document.createElement("span");
    wrap.className = "goalsong-inline-wrap";
    select.insertAdjacentElement("beforebegin", wrap);
    wrap.append(select);
    wrap.append(btn);
}

wrapGsInline("team-goalsong-track", "team-goalsong-preview");
wrapGsInline("default-goalsong-track-1", "default-goalsong-preview-1");
wrapGsInline("default-goalsong-track-2", "default-goalsong-preview-2");
