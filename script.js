$(document).ready(function() {
    const languages = [
        {code:"en", name:"English"}, {code:"es", name:"Spanish"}, {code:"fr", name:"French"},
        {code:"de", name:"German"}, {code:"it", name:"Italian"}, {code:"ja", name:"Japanese"},
        {code:"zh-CN", name:"Chinese (Simplified)"}, {code:"ru", name:"Russian"},
        {code:"ar", name:"Arabic"}, {code:"hi", name:"Hindi"}, {code:"pt", name:"Portuguese"}
    ];

    // Populate language selects
    function populateLanguages() {
        const $source = $('#sourceLang');
        const $target = $('#targetLang');
        languages.forEach(lang => {
            $source.append(`<option value="${lang.code}">${lang.name}</option>`);
            $target.append(`<option value="${lang.code}">${lang.name}</option>`);
        });
        $source.val('en');
        $target.val('es');
    }

    // Real translation using LibreTranslate (free public API - no key needed)
    async function translateText(text, from, to) {
        if (!text.trim()) return "Enter text to translate";
        try {
            const res = await $.post('https://libretranslate.de/translate', {
                q: text,
                source: from,
                target: to,
                format: "text"
            });
            return res.translatedText || "Translation unavailable";
        } catch (e) {
            // Fallback simulation
            return `[Translated] ${text} (${from} → ${to})`;
        }
    }

    $('#translateBtn').on('click', async function() {
        const text = $('#sourceText').val().trim();
        const from = $('#sourceLang').val();
        const to = $('#targetLang').val();
        if (!text) return;
        const result = await translateText(text, from, to);
        $('#targetText').html(result);
    });

    // Swap languages
    $('#swapBtn').on('click', function() {
        const s = $('#sourceLang').val();
        const t = $('#targetLang').val();
        $('#sourceLang').val(t);
        $('#targetLang').val(s);
        const temp = $('#sourceText').val();
        $('#sourceText').val($('#targetText').text());
        $('#targetText').html(temp);
    });

    // Text-to-Speech
    $('#speakBtn').on('click', function() {
        const text = $('#targetText').text();
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    });

    // Voice input simulation (real SpeechRecognition where available)
    $('#voiceInputBtn').on('click', function() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recog = new SpeechRecognition();
            recog.lang = $('#sourceLang').val();
            recog.onresult = (e) => {
                $('#sourceText').val(e.results[0][0].transcript);
            };
            recog.start();
        } else {
            const mock = prompt("Voice input simulation\nType your spoken text:");
            if (mock) $('#sourceText').val(mock);
        }
    });

    // Save to Phrasebook
    $('#savePhraseBtn').on('click', function() {
        const src = $('#sourceText').val().trim();
        const tgt = $('#targetText').text().trim();
        if (!src || !tgt) return alert("Nothing to save");
        let phrases = JSON.parse(localStorage.getItem('phrasebook') || '[]');
        phrases.unshift({source: src, target: tgt, date: new Date().toLocaleDateString()});
        if (phrases.length > 50) phrases.pop();
        localStorage.setItem('phrasebook', JSON.stringify(phrases));
        renderPhrasebook();
        alert("Saved to Phrasebook!");
    });

    function renderPhrasebook() {
        const phrases = JSON.parse(localStorage.getItem('phrasebook') || '[]');
        const $list = $('#phraseList');
        $list.empty();
        phrases.forEach(p => {
            $list.append(`
                <div class="list-group-item d-flex justify-content-between">
                    <div>
                        <strong>${p.source}</strong><br>
                        <span class="text-muted">${p.target}</span>
                    </div>
                    <small class="text-muted">${p.date}</small>
                </div>
            `);
        });
    }

    // Camera simulation
    window.simulateCamera = function() {
        alert("Camera Translation Simulated\n\nPoint your camera at text (demo).\n\nDetected text translated instantly (94 languages supported).");
        $('#sourceText').val("Hello, how are you?");
        $('#translateBtn').click();
    };

    // Photo upload simulation
    $('#photoInput').on('change', function(e) {
        if (e.target.files.length) {
            alert("Photo uploaded!\n\nText extracted and translated (simulation).");
            $('#sourceText').val("Welcome to the translated world");
            $('#translateBtn').click();
        }
    });

    // Conversation mode
    window.startConversation = function() {
        $('#conversation').removeClass('d-none');
        $('#convArea').html('<p class="text-muted">Conversation mode started (bilingual simulation)</p>');
    };

    $('#sendConvBtn').on('click', function() {
        const msg = $('#convInput').val().trim();
        if (!msg) return;
        const $area = $('#convArea');
        $area.append(`<div class="mb-2"><strong>You:</strong> ${msg}</div>`);
        // Simulate reply
        setTimeout(() => {
            $area.append(`<div class="mb-2 text-primary"><strong>Translated:</strong> Hola, ¿cómo estás?</div>`);
            $area.scrollTop($area[0].scrollHeight);
        }, 600);
        $('#convInput').val('');
    });

    // Clear
    $('#clearBtn').on('click', function() {
        $('#sourceText').val('');
        $('#targetText').html('');
    });

    // Initialize
    populateLanguages();
    renderPhrasebook();

    // Auto-translate on input after delay
    let timeout;
    $('#sourceText').on('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => $('#translateBtn').click(), 800);
    });
});
