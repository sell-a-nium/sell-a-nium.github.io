const PASSWORD = "donotshare";

(function () {
  if (localStorage.getItem("coursePass") === PASSWORD) return;

  for (let i = 0; i < 3; i++) {
    let p = prompt("Enter course password:");

    if (p === PASSWORD) {
      localStorage.setItem("coursePass", PASSWORD);
      return;
    }
  }

  document.body.innerHTML =
    "<h2 style='text-align:center;margin-top:20%'>Access Denied</h2>";
  throw new Error("Blocked");
})();

let flat = [];
let current = 0;

let lastLecture = parseInt(localStorage.getItem("lastLecture"));

fetch("course.json")
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("title").innerText = data.course_title;

    let list = document.getElementById("playlist");

    data.sections.forEach((sec) => {
      let s = document.createElement("div");
      s.className = "section";
      s.innerHTML = `
  <span>${sec.title}</span>
  <span class="arrow">▶</span>
`;

      list.appendChild(s);

      let container = document.createElement("div");
      container.className = "lecture-container";

      // collapsed by default
      container.classList.remove("open");

      s.onclick = () => {
        document.querySelectorAll(".lecture-container").forEach((c) => {
          if (c !== container) c.classList.remove("open");
        });

        document.querySelectorAll(".arrow").forEach((a) => {
          if (a !== s.querySelector(".arrow")) a.classList.remove("open");
        });

        container.classList.toggle("open");
        s.querySelector(".arrow").classList.toggle("open");
      };

      list.appendChild(container);

      sec.lectures.forEach((l) => {
        flat.push(l);

        let d = document.createElement("div");
        d.className = "lecture";
        d.innerText = l.id + " " + l.title;

        d.onclick = () => play(flat.indexOf(l), false);

        container.appendChild(d);
      });
    });

    if (!isNaN(lastLecture)) {
      play(lastLecture, true);
    }
  });

function play(i, autoLoad = false) {
  current = i;

  localStorage.setItem("lastLecture", i);

  let lec = flat[i];

  document.getElementById("videoTitle").innerText = lec.title;
  document.getElementById("playerFrame").src = lec.video;

  showDocs(lec);

  const downloadBtn = document.getElementById("downloadBtn");
  const fileId = lec.video.split("/d/")[1].split("/")[0];
  downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;

  // highlight active
  const lectures = document.querySelectorAll(".lecture");
  lectures.forEach((x) => x.classList.remove("active"));
  lectures[i].classList.add("active");

  let lectureEl = lectures[i];
  let container = lectureEl.parentElement;
  let playlist = document.getElementById("playlist");

  // close all
  document.querySelectorAll(".lecture-container").forEach((c) => {
    c.classList.remove("open");
  });

  document.querySelectorAll(".arrow").forEach((a) => {
    a.classList.remove("open");
  });

  // open current section
  container.classList.add("open");

  let sectionHeader = container.previousElementSibling;

  if (sectionHeader) {
    let arrow = sectionHeader.querySelector(".arrow");
    if (arrow) arrow.classList.add("open");
  }

  // Only scroll on auto-load (page refresh), not on manual clicks
  if (autoLoad) {
    let rect = lectureEl.getBoundingClientRect();
    let parentRect = playlist.getBoundingClientRect();

    let offset = rect.top - parentRect.top + playlist.scrollTop;

    playlist.scrollTo({
      top: offset - 40,
      behavior: "smooth",
    });
  }
}

function showDocs(lec) {
  let d = document.getElementById("docs");

  d.innerHTML = "<b>Resources</b><br>";

  if (!lec.docs || !lec.docs.length) {
    d.innerHTML += "No resources";
    return;
  }

  lec.docs.forEach((doc) => {
    let a = document.createElement("a");

    // handle new format
    if (typeof doc === "object") {
      a.href = doc.url;
      a.innerText = doc.name;
    } else {
      // fallback for old json
      a.href = doc;
      a.innerText = doc.split("/").pop();
    }

    a.target = "_blank";

    d.appendChild(a);
    d.appendChild(document.createElement("br"));
  });
}

document.getElementById("nextBtn").onclick = () => {
  if (current < flat.length - 1) {
    play(current + 1, false);
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (current > 0) {
    play(current - 1, false);
  }
};

const btn = document.getElementById("themeToggle");

let theme = localStorage.getItem("theme");

// Apply saved theme
if (theme === "light") {
  document.body.classList.add("light");
  btn.textContent = "☀";
} else {
  btn.textContent = "🌙";
}

btn.onclick = () => {
  document.body.classList.toggle("light");

  let isLight = document.body.classList.contains("light");

  localStorage.setItem("theme", isLight ? "light" : "dark");

  // Change icon
  btn.textContent = isLight ? "☀" : "🌙";
};

const toggleBtn = document.getElementById("toggleAll");

let expanded = false;

toggleBtn.onclick = () => {
  expanded = !expanded;

  document.querySelectorAll(".lecture-container").forEach((c) => {
    c.classList.toggle("open", expanded);
  });

  document.querySelectorAll(".arrow").forEach((a) => {
    a.classList.toggle("open", expanded);
  });

  toggleBtn.innerText = expanded ? "Collapse All" : "Expand All";
};

const search = document.getElementById("search");
const noResults = document.getElementById("noResults");

search.oninput = () => {
  let val = search.value.toLowerCase().trim();
  let found = false;

  document.querySelectorAll(".section").forEach((section) => {
    let container = section.nextElementSibling;
    let sectionText = section.innerText.toLowerCase();

    let sectionMatch = sectionText.includes(val);

    let lectureMatchFound = false;

    container.querySelectorAll(".lecture").forEach((lec) => {
      let text = lec.innerText.toLowerCase();

      if (text.includes(val) || sectionMatch) {
        lec.style.display = "block";
        lectureMatchFound = true;
        found = true;
      } else {
        lec.style.display = "none";
      }
    });

    if (sectionMatch || lectureMatchFound) {
      section.style.display = "flex";
      container.style.display = "block";
      container.classList.add("open");
      section.querySelector(".arrow").classList.add("open");
    } else {
      section.style.display = "none";
      container.style.display = "none";
      container.classList.remove("open");
    }
  });

  if (val === "") {
    document.querySelectorAll(".section").forEach((section) => {
      let container = section.nextElementSibling;

      section.style.display = "flex";
      container.style.display = "block";

      container.querySelectorAll(".lecture").forEach((lec) => {
        lec.style.display = "block";
      });

      container.classList.remove("open");
      section.querySelector(".arrow").classList.remove("open");
    });

    noResults.style.display = "none";
  }

  noResults.style.display = found ? "none" : "block";
};
