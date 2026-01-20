const notes = [
  {
    id: "note-1",
    title: "笔记一：科研计划的三步法",
    date: "2024-05-12",
    file: "notes/research-plan.md"
  },
  {
    id: "note-2",
    title: "笔记二：阅读论文的高效流程",
    date: "2024-06-02",
    file: "notes/paper-reading.md"
  }
];

const blogPosts = [
  {
    id: "blog-1",
    title: "学术杂谈｜科研与情绪管理",
    date: "2024-06-10",
    tags: ["情绪", "科研节奏"],
    file: "blog/emotion.md"
  },
  {
    id: "blog-2",
    title: "学术杂谈｜灵感从哪里来",
    date: "2024-06-18",
    tags: ["灵感", "阅读"],
    file: "blog/inspiration.md"
  }
];

const notesList = document.getElementById("notes-list");
const notesContent = document.getElementById("notes-content");
const notesSearch = document.getElementById("notes-search");
const notesSearchBtn = document.getElementById("notes-search-btn");
const blogForum = document.getElementById("blog-forum");
const blogSearch = document.getElementById("blog-search");
const blogSearchBtn = document.getElementById("blog-search-btn");

const markdownToHtml = (markdown) => {
  const lines = markdown.split("\n");
  const htmlLines = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      htmlLines.push("</ul>");
      inList = false;
    }
  };

  lines.forEach((line) => {
    if (line.startsWith("# ")) {
      flushList();
      htmlLines.push(`<h3>${line.replace("# ", "")}</h3>`);
    } else if (line.startsWith("## ")) {
      flushList();
      htmlLines.push(`<h4>${line.replace("## ", "")}</h4>`);
    } else if (line.match(/^\d+\./)) {
      if (!inList) {
        htmlLines.push("<ul>");
        inList = true;
      }
      htmlLines.push(`<li>${line.replace(/^\d+\./, "").trim()}</li>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        htmlLines.push("<ul>");
        inList = true;
      }
      htmlLines.push(`<li>${line.replace("- ", "")}</li>`);
    } else if (line.startsWith("> ")) {
      flushList();
      htmlLines.push(`<p><em>${line.replace("> ", "")}</em></p>`);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      htmlLines.push(`<p>${formatted}</p>`);
    }
  });

  flushList();
  return htmlLines.join("\n");
};

const fetchMarkdown = async (file) => {
  const response = await fetch(file);
  return response.text();
};

const hydrateContent = async () => {
  const noteContents = await Promise.all(notes.map((note) => fetchMarkdown(note.file)));
  noteContents.forEach((content, index) => {
    notes[index].content = content;
  });

  const blogContents = await Promise.all(blogPosts.map((post) => fetchMarkdown(post.file)));
  blogContents.forEach((content, index) => {
    blogPosts[index].content = content;
  });
};

const renderNotesList = () => {
  notesList.innerHTML = "";
  notes.forEach((note) => {
    const item = document.createElement("div");
    item.className = "note-item";
    item.dataset.noteId = note.id;
    item.innerHTML = `<strong>${note.title}</strong><div class="note-meta">${note.date}</div>`;
    item.addEventListener("click", () => selectNote(note.id));
    notesList.appendChild(item);
  });
};

const renderNoteContent = (note) => {
  notesContent.innerHTML = `
    <div class="note-detail">
      ${markdownToHtml(note.content)}
    </div>
  `;
};

const selectNote = (noteId) => {
  const note = notes.find((item) => item.id === noteId);
  if (!note) return;
  document.querySelectorAll(".note-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.noteId === noteId);
  });
  renderNoteContent(note);
  notesContent.scrollIntoView({ behavior: "smooth", block: "start" });
};

const renderBlogPosts = () => {
  blogForum.innerHTML = "";
  blogPosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "forum-post";
    card.id = post.id;
    card.innerHTML = `
      <h3>${post.title}</h3>
      <div class="forum-meta">
        <span>发布日期：${post.date}</span>
        <span>标签：${post.tags.join(" / ")}</span>
      </div>
      ${markdownToHtml(post.content)}
    `;
    blogForum.appendChild(card);
  });
};

const searchInNotes = () => {
  const query = notesSearch.value.trim().toLowerCase();
  if (!query) return;
  const match = notes.find((note) =>
    [note.title, note.content].some((text) => text.toLowerCase().includes(query))
  );
  if (match) {
    selectNote(match.id);
  } else {
    notesContent.innerHTML = `<p class="placeholder">没有找到包含“${query}”的笔记内容。</p>`;
  }
};

const searchInBlog = () => {
  const query = blogSearch.value.trim().toLowerCase();
  if (!query) return;
  const match = blogPosts.find((post) =>
    [post.title, post.content, post.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
  if (match) {
    const target = document.getElementById(match.id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 2000);
    }
  } else {
    blogForum.insertAdjacentHTML(
      "afterbegin",
      `<p class="placeholder">没有找到包含“${query}”的博客内容。</p>`
    );
  }
};

notesSearchBtn.addEventListener("click", searchInNotes);
notesSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchInNotes();
});

blogSearchBtn.addEventListener("click", searchInBlog);
blogSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchInBlog();
});

const init = async () => {
  await hydrateContent();
  renderNotesList();
  renderBlogPosts();
  if (notes[0]) {
    selectNote(notes[0].id);
  }
};

init();
