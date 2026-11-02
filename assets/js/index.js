import { trackList } from './data/music-data.js';

document.addEventListener("DOMContentLoaded", function(){

    // Valid sections are whatever the navbar links to
    const validSections = Array.from(document.querySelectorAll(".main-navbar a"), a => a.dataset.section);

    function sectionFromHash() {
        const hash = window.location.hash.replace('#', '');
        return validSections.includes(hash) ? hash : 'home';
    }

    function loadSection(section) {
        setSectionBackground(section);
        updateSectionTitleBar(section);
        // replace() so the frame doesn't add its own history entries; only the URL hash should
        document.querySelector('.content-frame').contentWindow.location.replace(`sections/${section}.html`);
    }

    // Restore section from URL hash on load, defaulting to home
    const initialSection = sectionFromHash();
    setSectionBackground(initialSection);
    if(initialSection !== 'home') {
        document.querySelector('.content-frame').src = `sections/${initialSection}.html`;
        updateSectionTitleBar(initialSection);
    }

    // Back/forward buttons
    window.addEventListener('popstate', function() {
        loadSection(sectionFromHash());
    });

    // Randomly swap button carousel (top) and stamp carousel (bottom)
    if (Math.random() < 0.5) {
        document.querySelector("header").after(document.querySelector(".stamp-carousel-container"));
        document.querySelector(".layout-container").after(document.querySelector(".button-carousel-container"));
    }

    const quoteList = [
        "What isn't remembered never happened.",
        "A perfect life only exists in dreams.",
        "Take care of yourself.",
        "You have to be a little delusional to get what you want."
    ]
    const randomInt = Math.floor(Math.random() * quoteList.length);
    document.querySelector(".quote").textContent = quoteList[randomInt];

    let track_name = document.querySelector(".songtitle");
    let playpause_btn = document.querySelector(".playpause-track");
    let seek_slider = document.querySelector(".seek_slider");
    let curr_time = document.querySelector(".current-time");
    let total_duration = document.querySelector(".total-duration");

    let track_index = 0;
    let isPlaying = false;
    let updateTimer;
    let curr_track = document.getElementById("music");

    function resetValues() {
        curr_time.textContent = "0:00";
        total_duration.textContent = "0:00";
        seek_slider.value = 0;
    }

    function loadTrack(track_index) {
        clearInterval(updateTimer);
        resetValues();
        curr_track.src = trackList[track_index].path;
        curr_track.load();
        track_name.textContent = "Track " + (track_index + 1) + "/" + trackList.length + ": " + trackList[track_index].name;
        updateTimer = setInterval(seekUpdate, 1000);
        curr_track.onended = nextTrack;
    }

    playpause_btn.addEventListener('click', function(){
        if(isPlaying){ pauseTrack(); } else { playTrack(); }
    })
    document.querySelector(".prev-track").addEventListener('click', prevTrack);
    document.querySelector(".next-track").addEventListener('click', nextTrack);
    seek_slider.addEventListener('change', seekTo);

    function playTrack() {
        curr_track.play();
        isPlaying = true;
        playpause_btn.innerHTML = '<button class="player-button"><img src="assets/images/musicplayer/pausebutton.png" class="controlimg"></button>';
    }

    function pauseTrack() {
        curr_track.pause();
        isPlaying = false;
        playpause_btn.innerHTML = '<button class="player-button"><img src="assets/images/musicplayer/playpause.png" class="controlimg"></button>';
    }

    function nextTrack() {
        track_index = (track_index + 1) % trackList.length;
        loadTrack(track_index);
        playTrack();
    }

    function prevTrack() {
        track_index = (track_index - 1 + trackList.length) % trackList.length;
        loadTrack(track_index);
        playTrack();
    }

    function seekTo() {
        const seekto = curr_track.duration * (seek_slider.value / 100);
        curr_track.currentTime = seekto;
    }

    function seekUpdate() {
        if(!curr_track || isNaN(curr_track.duration)) return;
        let seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;
        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);
        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }

    loadTrack(track_index);

    let isNavTransitioning = false;

    function updateSectionTitleBar(section) {
        const sectionTitles = {
            home:      { text: "Home",           img: "assets/images/titles/door-home.webp",      img2: "assets/images/titles/madot-triangle.webp" },
            about:     { text: "About Me",        img: "assets/images/titles/door-about.webp",     img2: "assets/images/titles/madot-umbrella.webp" },
            minecraft: { text: "Minecraft World", img: "assets/images/titles/door-minecraft.webp", img2: "assets/images/titles/madot-flute.webp" },
            travel:    { text: "Travel Log",      img: "assets/images/titles/door-travel.webp",    img2: "assets/images/titles/madot-bicycle.png" },
            blog:      { text: "Blog",            img: "assets/images/titles/door-blog.webp",      img2: "assets/images/titles/madot-yuki.webp" },
            photofeed: { text: "Photo Feed",      img: "assets/images/titles/door-photofeed.webp", img2: "assets/images/titles/madot-witch.webp" },
            guestbook: { text: "Guestbook",       img: "assets/images/titles/door-guestbook.png",  img2: "assets/images/titles/madot-hand.webp" },
            music:     { text: "Vinyl Collection",     img: "assets/images/titles/door-dream.webp",     img2: "assets/images/titles/madot-hat.webp" },
            shrines:   { text: "Shrines",         img: "assets/images/titles/door-shrines.webp",   img2: "assets/images/titles/madot-knife.webp" },
            resources: { text: "Resources",       img: "assets/images/titles/door-resources.webp", img2: "assets/images/titles/madot-noface.webp" },
        };
        const bar = document.querySelector(".section-title-bar");
        updateSectionTitleBar.currentSection = section;
        bar.style.opacity = "0";
        setTimeout(function() {
            if(updateSectionTitleBar.currentSection === section){
                document.querySelector(".section-title-text").textContent = sectionTitles[section].text;
                document.getElementById("section-door-img").src = sectionTitles[section].img;
                document.getElementById("section-madotsuki-img").src = sectionTitles[section].img2 || "";
                bar.style.opacity = "1";
            }
        }, 250);
    }

    document.querySelectorAll(".main-navbar a").forEach(function(link){
        link.addEventListener("click", function(e){
            e.preventDefault();
            if(isNavTransitioning) return;
            isNavTransitioning = true;
            const section = link.dataset.section;
            loadSection(section);
            // Update URL hash for deep linking
            history.pushState(null, '', `#${section}`);
            setTimeout(function() {
                isNavTransitioning = false;
            }, 2000);
        });
    });

    const purinCount = 11;
    const purinImages = [];
    for(let i = 1; i <= purinCount; i++) {
        purinImages.push(`assets/images/pompompurin/purin${i}.webp`);
    }
    shuffle(purinImages);
    let currentPurinIndex = 0;
    function showPurinImg() {
        document.getElementById("pompompurin-img").src = purinImages[currentPurinIndex];
    }
    setInterval(function() {
        currentPurinIndex = (currentPurinIndex + 1) % purinImages.length;
        showPurinImg();
    }, 3000);
    showPurinImg();

    const buttonImages = [
        "3i.webp", "antinft.gif", "aperture.webp", "buttcertificate.gif", "chocoloaf.gif",
        "chrome-suck.gif", "cinna.gif", "cinnakawaii.gif", "college.gif", "companion.webp",
        "copland.webp", "cssdif.gif", "ditchsocial.gif", "dream-chobits.gif", "dream-diary.gif",
        "drpepper.gif", "ds.webp", "evangelion.gif", "eyes.gif", "fascist.webp",
        "flipnote.webp", "geocitieswww.gif", "google-stand.gif", "gordon.gif", "got_html.gif",
        "hatemac.webp", "hellontheweb.gif", "homebrew.webp", "insanity.gif", "lain.gif",
        "lain2.gif", "lurk-n-leech.gif", "kawaiiuniverse.gif", "mews.gif", "miku-approve.gif",
        "minecraft.gif", "n64.gif", "nclinux.gif", "newgrounds.gif", "newlambda.gif",
        "nintendo.gif", "noodle.gif", "nyan.gif", "pictochat.gif", "plasticlove.gif",
        "powered.gif", "powernavi.gif", "ralseismokingadart.gif", "rar_whit_move.gif", "rhc.gif",
        "scottgames.gif", "slava.gif", "sm_fever_button.gif", "stardew_valley.gif", "stockinganarchy.webp",
        "temptationstairway.webp", "train.gif", "trans.webp", "vocaloid.gif", "wii.gif",
        "wikipedia_ru.gif", "wikipedia.gif", "windose.webp", "yumenikki2.gif", "yumenikki3.gif"
    ]

    shuffle(buttonImages);
    const track = document.querySelector(".button-carousel-track");
    fillCarousel(track, "assets/images/buttons/", buttonImages, 88, 31);

    let scrollPos = 0;
    function autoScrollCarousel() {
        scrollPos += 1;
        if (scrollPos >= track.scrollWidth / 2) scrollPos = 0;
        track.style.transform = `translate3d(-${scrollPos}px, 0, 0)`;
        requestAnimationFrame(autoScrollCarousel);
    }
    autoScrollCarousel();

    const stampImages = [
        "aperture.webp", "backrooms.webp", "badapple.gif", "blacklagoon.webp", "bliss.webp",
        "broccoli.webp", "cocaine.webp", "delicat.webp", "eyes.webp", "face.webp",
        "gmod.webp", "hate.webp", "house.webp", "kitty.gif", "lain-dance.gif",
        "lainangy.gif", "lainstamp.webp", "lazer.gif", "leek.gif", "love.webp",
        "madoka.webp", "matrix.webp", "miku.gif", "minecraft.gif", "moon-stamp.webp",
        "nyancat.gif", "off.webp", "palestine.gif", "pacman.webp", "physmed.webp",
        "purin.webp", "purin2.gif", "purin3.gif", "rei.webp", "reiblush.gif",
        "sleepy.webp", "stars.gif", "stocking.gif", "talkingheads.webp", "terraria.gif",
        "tomato.webp", "trans.gif", "trans2.webp", "troll.gif", "undertale.gif",
        "undertale2.gif", "vocaloid.webp", "wii.webp", "yuri.webp", "yuri2.webp"
    ]

    shuffle(stampImages);
    const stampTrack = document.querySelector(".stamp-carousel-track");
    fillCarousel(stampTrack, "assets/images/stamps/", stampImages, 99, 56);

    let stampScrollPos = 0;
    function autoScrollStampCarousel() {
        stampScrollPos += 1;
        if (stampScrollPos >= stampTrack.scrollWidth / 2) stampScrollPos = 0;
        stampTrack.style.transform = `translate3d(-${stampScrollPos}px, 0, 0)`;
        requestAnimationFrame(autoScrollStampCarousel);
    }
    autoScrollStampCarousel();

    function syncMiddleHeight() {
        const leftHeight = document.querySelector(".column.left").offsetHeight;
        document.querySelector(".column.middle").style.height = leftHeight + "px";
    }

    function debounce(func, delay){
        let timeoutId;
        return function(...args){
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
        };
    }
    const debouncedSync = debounce(syncMiddleHeight, 250);
    window.addEventListener("load", debouncedSync);
    window.addEventListener("resize", debouncedSync);
})

function setSectionBackground(section) {
    // Called both inside and outside the DOMContentLoaded handler, so kept at module scope
    const isBgTransitioningRef = setSectionBackground;
    if(isBgTransitioningRef._transitioning) return;
    isBgTransitioningRef._transitioning = true;

    const backgrounds = {
        home:      "url('assets/images/backgrounds/home-bg.gif')",
        about:     "url('assets/images/backgrounds/about-bg.webp')",
        minecraft: "url('assets/images/backgrounds/minecraft-bg.png')",
        travel:    "url('assets/images/backgrounds/travel-bg.webp')",
        blog:      "url('assets/images/backgrounds/blog-bg.jpg')",
        photofeed: "url('assets/images/backgrounds/photofeed-bg.jpg')",
        guestbook: "url('assets/images/backgrounds/guestbook-bg.webp')",
        music:     "url('assets/images/backgrounds/dream-bg.jpg')",
        shrines:   "url('assets/images/backgrounds/shrines-bg.webp')",
        resources: "url('assets/images/backgrounds/resources-bg.webp')",
    };

    const newBg = backgrounds[section] || "";
    const overlay = document.querySelector(".bg-fade-overlay");

    overlay.style.backgroundImage = newBg;
    overlay.style.opacity = 1;

    setTimeout(function() {
        document.body.style.backgroundImage = newBg;
        overlay.style.opacity = 0;
        isBgTransitioningRef._transitioning = false;
    }, 2000);
}

function generateCalendar(selector) {
    const container = document.querySelector(selector);
    if(!container){
        console.warn(`Container '${selector}' not found.`);
        return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];
    container.innerHTML = `
        <div class="calendar-header">${monthNames[month]} ${year}</div>
        <div class="calendar-grid">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
    `;
    const grid = document.createElement("div");
    grid.className = "calendar-grid";
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement("div"));
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = day;
        if (day === today) { dayDiv.classList.add("calendar-today"); }
        grid.appendChild(dayDiv);
    }
    container.appendChild(grid);
}

generateCalendar(".calendar");

// Appends the images twice so the track can loop seamlessly
function fillCarousel(track, dir, images, width, height) {
    [...images, ...images].forEach(img => {
        const el = document.createElement("img");
        el.src = dir + img;
        el.width = width;
        el.height = height;
        el.alt = img;
        track.appendChild(el);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
