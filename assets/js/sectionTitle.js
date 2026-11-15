import { getSection } from "./data/sections.js";

const id = location.pathname.split("/").pop().replace(/\.html$/, "");
const section = getSection(id);

if (section) {
    const wrap = document.createElement("section");
    wrap.className = "sectionTitleWrap";

    const bar = document.createElement("div");
    bar.className = "sectionTitleBar";

    const door = document.createElement("img");
    door.className = "doorImg";
    door.src = section.door;
    door.alt = "";

    const heading = document.createElement("h2");
    heading.className = "crt sectionTitleText";
    heading.textContent = section.title;

    const madotsuki = document.createElement("img");
    madotsuki.className = "madotsukiImg";
    madotsuki.src = section.madotsuki;
    madotsuki.alt = "";

    bar.append(door, heading, madotsuki);
    wrap.append(bar);
    document.body.prepend(wrap);
}
