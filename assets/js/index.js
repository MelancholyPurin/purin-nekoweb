import { trackList } from './data/music-data.js';

document.addEventListener("DOMContentLoaded", function(){

    // Valid sections are whatever the navbar links to
    const validSections = Array.from(document.querySelectorAll(".main-navbar a"), a => a.dataset.section);

    function sectionFromHash() {
        const hash = window.location.hash.replace('#', '');
        return validSections.includes(hash) ? hash : 'home';
    }

    // The section being shown; the nav highlight, title bar, background and frame all follow it
    let currentSection = sectionFromHash();

    function setActiveNavLink(section) {
        document.querySelectorAll(".main-navbar a").forEach(function(link) {
            if(link.dataset.section === section) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
    }

    function loadSection(section) {
        currentSection = section;
        setActiveNavLink(section);
        setSectionBackground(section);
        updateSectionTitleBar(section);
        // replace() so the frame doesn't add its own history entries; only the URL hash should
        document.querySelector('.content-frame').contentWindow.location.replace(`sections/${section}.html`);
    }

    // Restore section from URL hash on load, defaulting to home. The frame starts empty
    // (no src in the HTML) so the page isn't fetched twice when the hash isn't home.
    const initialSection = currentSection;
    setActiveNavLink(initialSection);
    setSectionBackground(initialSection);
    if(initialSection !== 'home') updateSectionTitleBar(initialSection);
    document.querySelector('.content-frame').contentWindow.location.replace(`sections/${initialSection}.html`);

    // Back/forward buttons
    window.addEventListener('popstate', function() {
        const section = sectionFromHash();
        loadSection(section);
        // the nav highlight is the link's :focus style, so move focus to the page now shown
        document.querySelector(`.main-navbar a[data-section="${section}"]`).focus({ preventScroll: true });
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

    const track_name = document.querySelector(".songtitle-text");
    const playpause_btn = document.querySelector(".playpause-track button");
    const playpause_img = playpause_btn.querySelector("img");
    const seek_slider = document.querySelector(".seek_slider");
    const curr_time = document.querySelector(".current-time");
    const total_duration = document.querySelector(".total-duration");
    const curr_track = document.getElementById("music");

    // ~47px/s, what the old <marquee scrollamount="4"> moved at
    const MARQUEE_PX_PER_SECOND = 47;

    let track_index = 0;

    function formatTime(seconds) {
        const whole = Math.floor(seconds);
        return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
    }

    function resetValues() {
        curr_time.textContent = "0:00";
        total_duration.textContent = "0:00";
        seek_slider.value = 0;
    }

    function setTitle(text) {
        track_name.textContent = text;
        // the text starts at the right edge and leaves at the left; scale the duration to that distance
        track_name.style.animationDuration = (track_name.offsetWidth / MARQUEE_PX_PER_SECOND) + "s";
    }

    function loadTrack(index) {
        resetValues();
        curr_track.src = trackList[index].path;
        curr_track.load();
        setTitle("Track " + (index + 1) + "/" + trackList.length + ": " + trackList[index].name);
    }

    function showPlaying(playing) {
        playpause_img.src = playing ? "assets/images/musicplayer/pausebutton.png" : "assets/images/musicplayer/playpause.png";
        playpause_btn.setAttribute("aria-label", playing ? "Pause" : "Play");
    }

    function playTrack() {
        const attempt = curr_track.play();
        if(attempt) attempt.catch(function(err) {
            // AbortError = another load/pause interrupted this play(), which is expected on quick skips
            if(err.name !== "AbortError") setTitle("Couldn't play: " + trackList[track_index].name);
        });
    }

    function pauseTrack() {
        curr_track.pause();
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
        if(!isFinite(curr_track.duration)) return;
        curr_track.currentTime = curr_track.duration * (seek_slider.value / 100);
    }

    function seekUpdate() {
        if(!isFinite(curr_track.duration)) return;
        seek_slider.value = curr_track.currentTime * (100 / curr_track.duration);
        curr_time.textContent = formatTime(curr_track.currentTime);
        total_duration.textContent = formatTime(curr_track.duration);
    }

    playpause_btn.addEventListener("click", function() {
        if(curr_track.paused) playTrack(); else pauseTrack();
    });
    document.querySelector(".prev-track").addEventListener("click", prevTrack);
    document.querySelector(".next-track").addEventListener("click", nextTrack);
    seek_slider.addEventListener("change", seekTo);
    curr_track.addEventListener("play", function() { showPlaying(true); });
    curr_track.addEventListener("pause", function() { showPlaying(false); });
    curr_track.addEventListener("timeupdate", seekUpdate);
    curr_track.addEventListener("loadedmetadata", seekUpdate);
    curr_track.addEventListener("ended", nextTrack);
    curr_track.addEventListener("error", function() {
        showPlaying(false);
        setTitle("Couldn't load: " + trackList[track_index].name);
    });

    loadTrack(track_index);

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
            const section = link.dataset.section;
            if(section === currentSection) return;
            loadSection(section);
            // Update URL hash for deep linking
            history.pushState(null, '', `#${section}`);
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

    setCarouselSpeed(track);

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

    setCarouselSpeed(stampTrack);

    window.addEventListener("load", function() {
        setCarouselSpeed(track);
        setCarouselSpeed(stampTrack);
    });

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

let bgFadeTimer;

function setSectionBackground(section) {
    // Called both inside and outside the DOMContentLoaded handler, so kept at module scope
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

    // Restart the fade on every call so the most recent section always wins
    clearTimeout(bgFadeTimer);
    bgFadeTimer = setTimeout(function() {
        document.body.style.backgroundImage = newBg;
        overlay.style.opacity = 0;
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

const CAROUSEL_PX_PER_SECOND = 60;

function setCarouselSpeed(track) {
    track.style.animationDuration = (track.offsetWidth / 2 / CAROUSEL_PX_PER_SECOND) + "s";
}

// Appends the images twice so the track can loop seamlessly
function fillCarousel(track, dir, images, width, height) {
    [...images, ...images].forEach(img => {
        const el = document.createElement("img");
        el.src = dir + img;
        el.width = width;
        el.height = height;
        el.alt = ""; // decorative
        track.appendChild(el);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
