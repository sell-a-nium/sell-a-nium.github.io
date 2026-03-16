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

    document.body.innerHTML = "<h2 style='text-align:center;margin-top:20%'>Access Denied</h2>";
    throw new Error("Blocked");

})();


let flat = []
let current = 0

let lastLecture = parseInt(localStorage.getItem("lastLecture"))

fetch("course.json")
    .then(r => r.json())
    .then(data => {

        document.getElementById("title").innerText = data.course_title

        let list = document.getElementById("playlist")

        data.sections.forEach(sec => {

            let s = document.createElement("div")
            s.className = "section"
            s.innerText = sec.title

            list.appendChild(s)

            let container = document.createElement("div")

            s.onclick = () => {

                container.style.display =
                    container.style.display === "none" ? "block" : "none"

            }

            list.appendChild(container)

            sec.lectures.forEach(l => {

                flat.push(l)

                let d = document.createElement("div")
                d.className = "lecture"
                d.innerText = l.id + " " + l.title

                d.onclick = () => play(flat.indexOf(l))

                container.appendChild(d)

            })

        })

        if (!isNaN(lastLecture)) {
            play(lastLecture)
        }

    })

function play(i) {

    current = i

    localStorage.setItem("lastLecture", i)

    let lec = flat[i]

    document.getElementById("videoTitle").innerText = lec.title

    document.getElementById("playerFrame").src = lec.video

    showDocs(lec)

    document.querySelectorAll(".lecture").forEach(x => x.classList.remove("active"))
    document.querySelectorAll(".lecture")[i].classList.add("active")

    document.querySelectorAll(".lecture")[i].scrollIntoView({ block: "center" })

}

function showDocs(lec) {

    let d = document.getElementById("docs")

    d.innerHTML = "<b>Resources</b><br>"

    if (!lec.docs || !lec.docs.length) {
        d.innerHTML += "No resources"
        return
    }

    lec.docs.forEach(doc => {

        let a = document.createElement("a")

        // handle new format
        if (typeof doc === "object") {
            a.href = doc.url
            a.innerText = doc.name
        }
        else {
            // fallback for old json
            a.href = doc
            a.innerText = doc.split("/").pop()
        }

        a.target = "_blank"

        d.appendChild(a)
        d.appendChild(document.createElement("br"))

    })

}

document.getElementById("nextBtn").onclick = () => {

    if (current < flat.length - 1) {
        play(current + 1)
    }

}

document.getElementById("prevBtn").onclick = () => {

    if (current > 0) {
        play(current - 1)
    }

}

const btn = document.getElementById("themeToggle")

let theme = localStorage.getItem("theme")

// Apply saved theme
if (theme === "light") {
    document.body.classList.add("light")
    btn.textContent = "☀"
} else {
    btn.textContent = "🌙"
}

btn.onclick = () => {

    document.body.classList.toggle("light")

    let isLight = document.body.classList.contains("light")

    localStorage.setItem("theme", isLight ? "light" : "dark")

    // Change icon
    btn.textContent = isLight ? "☀" : "🌙"
}
