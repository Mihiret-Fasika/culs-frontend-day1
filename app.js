// Loads the herbs from data/herbs.json and shows each one as a card.
// Click a herb's name to open its own page: index.html#basil
// The herb page has a picture, two buttons and three tabs
// (Care & Growing, Culinary & Tea Uses, Video Guide).

const list = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const intro = document.querySelector(".intro")
const herbsSection = document.querySelector("#herbs")
const aboutSection = document.querySelector("#about")

// The herb page lives in a section that JavaScript adds, so index.html stays small.
const herbPage = document.createElement("section")
herbPage.id = "herb"
herbPage.setAttribute("aria-live", "polite")
herbPage.style.display = "none"
herbsSection.after(herbPage)

let herbs = []

async function loadJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load ${response.url}: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

const loadHerbs = () => loadJson("data/herbs.json")
const loadHerb = id => loadJson(`data/${id}.json`)

function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function link(href, text, className = "") {
  const a = document.createElement("a")
  a.href = href
  a.textContent = text
  if (className) a.className = className
  return a
}

// "Basil" -> "basil", used in the address: index.html#basil
function slug(herb) {
  return herb.name.toLowerCase().replaceAll(" ", "-")
}

function card(herb) {
  const name = element("h3", "name", "")
  name.append(link(`#${slug(herb)}`, herb.name))

  const item = element("li", "card", "")
  item.append(
    name,
    element("p", "latin", herb.latin),
    element("p", "use", herb.use),
    element("p", "life", herb.life))
  return item
}

function showList() {
  herbPage.style.display = "none"
  intro.style.display = ""
  herbsSection.style.display = ""
  aboutSection.style.display = ""
  document.title = "The Little Herb Garden"
}

function showPage(...children) {
  herbPage.replaceChildren(link("#herbs", "← All herbs", "back"), ...children)
  intro.style.display = "none"
  herbsSection.style.display = "none"
  aboutSection.style.display = "none"
  herbPage.style.display = ""
  window.scrollTo(0, 0)
}

function heading(text) {
  const h = element("h2", "name", text)
  h.tabIndex = -1 // lets us move keyboard focus to the new page
  return h
}

// ---------- Picture, with a "Switch to ..." shortcut ----------

function herbImage(herb) {
  const figure = document.createElement("figure")
  figure.className = "herb-figure"
  const img = document.createElement("img")
  img.src = herb.image
  img.alt = herb.imageAlt
  img.width = 480
  img.height = 360
  // If the picture is missing, drop the figure instead of showing a broken icon.
  img.addEventListener("error", () => figure.remove())
  figure.append(img)

  const index = herbs.findIndex(h => slug(h) === slug(herb))
  if (herbs.length > 1 && index !== -1) {
    const next = herbs[(index + 1) % herbs.length]
    figure.append(link(`#${slug(next)}`, `⟳ Switch to ${next.name}`, "switch"))
  }
  return figure
}

// ---------- Saving herbs in "My Garden" (kept in this browser) ----------

function savedHerbs() {
  try {
    return JSON.parse(localStorage.getItem("my-garden")) || []
  } catch {
    return []
  }
}

function toggleSaved(id) {
  const saved = savedHerbs()
  const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]
  try {
    localStorage.setItem("my-garden", JSON.stringify(next))
  } catch {
    // Storage may be blocked; the button still reacts for this visit.
  }
  return next.includes(id)
}

function saveButton(id) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "button outline"
  const paint = saved => {
    button.textContent = saved ? "🔖 Saved to My Garden" : "🔖 Save to My Garden"
    button.setAttribute("aria-pressed", String(saved))
  }
  paint(savedHerbs().includes(id))
  button.addEventListener("click", () => paint(toggleSaved(id)))
  return button
}

// ---------- Tabs ----------

// Accepts a text or a list of texts and returns paragraphs or a bullet list.
function content(value, fallback) {
  const wrapper = document.createElement("div")
  if (Array.isArray(value) && value.length) {
    const ul = document.createElement("ul")
    ul.className = "tab-list"
    for (const item of value) {
      const li = document.createElement("li")
      li.textContent = item
      ul.append(li)
    }
    wrapper.append(ul)
  } else {
    wrapper.append(element("p", "tab-text", value || fallback))
  }
  return wrapper
}

// Accepts a bare id ("abc123XYZ_-") or any normal YouTube link
// (watch?v=..., youtu.be/..., /shorts/..., /embed/...) and returns the id.
function youtubeId(value) {
  if (!value) return ""
  const text = String(value).trim()
  if (/^[\w-]{11}$/.test(text)) return text
  try {
    const url = new URL(text)
    if (url.hostname === "youtu.be") return url.pathname.slice(1, 12)
    const fromQuery = url.searchParams.get("v")
    if (fromQuery) return fromQuery
    const match = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/)
    return match ? match[1] : ""
  } catch {
    return ""
  }
}

function videoPanel(herb) {
  const box = document.createElement("div")
  box.className = "video-card"
  box.append(element("h3", "video-title", herb.videoTitle || `How to grow ${herb.name}`))

  const frame = document.createElement("div")
  frame.className = "video-frame"

  // herb.video can be a YouTube id or a full YouTube link.
  const videoId = youtubeId(herb.video)

  if (videoId) {
    const iframe = document.createElement("iframe")
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
    iframe.title = herb.videoTitle || `${herb.name} video guide`
    iframe.loading = "lazy"
    iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture"
    iframe.allowFullscreen = true
    frame.append(iframe)
  } else {
    const query = encodeURIComponent(`how to grow ${herb.name}`)
    frame.classList.add("empty")
    frame.append(
      element("p", "video-note", "No video has been added for this herb yet."),
      link(`https://www.youtube.com/results?search_query=${query}`, "Search YouTube", "button light"))
  }

  box.append(frame)
  return box
}

function tabs(herb) {
  const definitions = [
    { id: "care", label: "Care & Growing",
      panel: () => content(herb.care, herb.description) },
    { id: "culinary", label: "Culinary & Tea Uses",
      panel: () => content(herb.culinary, herb.use) },
    { id: "video", label: "Video Guide",
      panel: () => videoPanel(herb) }
  ]

  const wrapper = document.createElement("div")
  wrapper.className = "tabs"

  const bar = document.createElement("div")
  bar.className = "tab-bar"
  bar.setAttribute("role", "tablist")

  const panel = document.createElement("div")
  panel.className = "tab-panel"
  panel.setAttribute("role", "tabpanel")
  panel.tabIndex = 0

  const buttons = definitions.map(def => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "tab"
    button.id = `tab-${def.id}`
    button.textContent = def.label
    button.setAttribute("role", "tab")
    button.setAttribute("aria-controls", "tab-panel")
    button.addEventListener("click", () => select(def.id))
    return button
  })
  panel.id = "tab-panel"

  function select(id, focus = false) {
    definitions.forEach((def, i) => {
      const on = def.id === id
      buttons[i].setAttribute("aria-selected", String(on))
      buttons[i].tabIndex = on ? 0 : -1
      if (on) {
        panel.replaceChildren(def.panel())
        panel.setAttribute("aria-labelledby", buttons[i].id)
        if (focus) buttons[i].focus()
      }
    })
  }

  // Left and right arrow keys move between the tabs.
  bar.addEventListener("keydown", event => {
    const current = buttons.findIndex(b => b.getAttribute("aria-selected") === "true")
    let target = current
    if (event.key === "ArrowRight") target = (current + 1) % buttons.length
    else if (event.key === "ArrowLeft") target = (current - 1 + buttons.length) % buttons.length
    else return
    event.preventDefault()
    select(definitions[target].id, true)
  })

  bar.append(...buttons)
  wrapper.append(bar, panel)
  select("care")
  wrapper.select = select
  return wrapper
}

// ---------- The herb page ----------

async function showHerb(id) {
  const summary = herbs.find(herb => slug(herb) === id)

  if (!summary) {
    const h = heading("Unknown herb")
    showPage(h, element("p", "use", "There is no such herb in this garden."))
    h.focus()
    return
  }

  let herb
  try {
    herb = await loadHerb(id)
  } catch (error) {
    console.error(error)
    const h = heading(summary.name)
    showPage(h, element("p", "use", "Sorry, this herb's page could not be loaded."))
    h.focus()
    return
  }

  // The visitor may have clicked somewhere else while we were loading.
  if (decodeURIComponent(location.hash.slice(1)) !== id) return

  const h = heading(herb.name)
  const herbTabs = tabs(herb)

  const careButton = document.createElement("button")
  careButton.type = "button"
  careButton.className = "button solid"
  careButton.textContent = "Growing & Care ↓"
  careButton.addEventListener("click", () => {
    herbTabs.select("care")
    herbTabs.scrollIntoView({ behavior: "smooth" })
  })

  const actions = document.createElement("div")
  actions.className = "actions"
  actions.append(careButton, saveButton(id))

  const text = document.createElement("div")
  text.className = "herb-text"
  text.append(
    h,
    element("p", "latin", herb.latin),
    element("p", "life", herb.life),
    element("p", "use", herb.use),
    element("p", "description", herb.description),
    actions)

  const layout = document.createElement("div")
  layout.className = "herb-layout"
  layout.append(herbImage(herb), text)

  showPage(layout, herbTabs)
  document.title = `${herb.name} – The Little Herb Garden`
  h.focus()
}

// The address decides what we show.
function route() {
  const id = decodeURIComponent(location.hash.slice(1))
  const sections = ["", "herbs", "visit", "about"]

  if (sections.includes(id)) {
    showList()
    if (id) document.getElementById(id).scrollIntoView()
  } else {
    showHerb(id)
  }
}

async function show() {
  try {
    herbs = await loadHerbs()
  } catch (error) {
    console.error(error)
    count.textContent = "Sorry, the herbs could not be loaded."
    return
  }
  list.replaceChildren(...herbs.map(card))
  count.textContent = `${herbs.length} herbs grow here.`
  route()
}

window.addEventListener("hashchange", route)
show()