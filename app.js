const STORAGE_KEYS = {
  progress: "progressByWordId",
  notes: "notesByWordId",
  lastVisited: "lastVisited",
};

const state = {
  data: null,
  selectedBatchId: null,
  selectedWordId: null,
  filter: "all",
  progressByWordId: {},
  notesByWordId: {},
};

const els = {
  batchList: document.getElementById("batchList"),
  wordList: document.getElementById("wordList"),
  batchTitle: document.getElementById("batchTitle"),
  batchRange: document.getElementById("batchRange"),
  batchProgress: document.getElementById("batchProgress"),
  overallProgress: document.getElementById("overallProgress"),
  filters: document.getElementById("filters"),
  wordPanel: document.getElementById("wordPanel"),
  wordText: document.getElementById("wordText"),
  wordBatch: document.getElementById("wordBatch"),
  toggleKnownBtn: document.getElementById("toggleKnownBtn"),
  wordNote: document.getElementById("wordNote"),
  continueBtn: document.getElementById("continueBtn"),
};

const loadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const saveStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadState = () => {
  state.progressByWordId = loadStorage(STORAGE_KEYS.progress, {});
  state.notesByWordId = loadStorage(STORAGE_KEYS.notes, {});
  const lastVisited = loadStorage(STORAGE_KEYS.lastVisited, null);
  if (lastVisited) {
    state.selectedBatchId = lastVisited.batchId || null;
    state.filter = lastVisited.filter || "all";
    state.selectedWordId = lastVisited.wordId || null;
  }
};

const saveLastVisited = () => {
  saveStorage(STORAGE_KEYS.lastVisited, {
    batchId: state.selectedBatchId,
    filter: state.filter,
    wordId: state.selectedWordId,
  });
};

const setFilterActive = () => {
  const buttons = els.filters.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === state.filter);
  });
};

const getBatchById = (batchId) =>
  state.data?.batches.find((batch) => batch.id === batchId);

const getKnownCount = (words) =>
  words.reduce(
    (count, word) =>
      state.progressByWordId[word.id]?.status === "known"
        ? count + 1
        : count,
    0
  );

const getOverallProgress = () => {
  const allWords = state.data?.batches.flatMap((batch) => batch.words) || [];
  const known = getKnownCount(allWords);
  return { known, total: allWords.length };
};

const renderOverallProgress = () => {
  const { known, total } = getOverallProgress();
  els.overallProgress.textContent = `${known} / ${total}`;
};

const renderBatchList = () => {
  if (!state.data) return;
  els.batchList.innerHTML = "";
  state.data.batches.forEach((batch) => {
    const known = getKnownCount(batch.words);
    const total = batch.words.length;
    const card = document.createElement("button");
    card.className = "batch-card";
    card.dataset.batchId = batch.id;
    card.innerHTML = `
      <div class="batch-card-title">${batch.title}</div>
      <div class="batch-card-range">${batch.range || "—"}</div>
      <div class="batch-card-progress">${known} / ${total}</div>
    `;
    if (batch.id === state.selectedBatchId) {
      card.classList.add("is-active");
    }
    els.batchList.appendChild(card);
  });
};

const applyWordFilter = (word) => {
  const isKnown = state.progressByWordId[word.id]?.status === "known";
  const note = state.notesByWordId[word.id]?.content?.trim();
  if (state.filter === "known") return isKnown;
  if (state.filter === "unknown") return !isKnown;
  if (state.filter === "noted") return Boolean(note);
  return true;
};

const renderBatchDetail = () => {
  const batch = getBatchById(state.selectedBatchId);
  if (!batch) {
    els.batchTitle.textContent = "请选择批次";
    els.batchRange.textContent = "—";
    els.batchProgress.textContent = "—";
    els.wordList.innerHTML =
      '<div class="placeholder">请选择批次后查看词表</div>';
    renderWordPanel(null);
    return;
  }

  const known = getKnownCount(batch.words);
  const total = batch.words.length;
  els.batchTitle.textContent = batch.title;
  els.batchRange.textContent = batch.range || "—";
  els.batchProgress.textContent = `进度 ${known} / ${total}`;

  els.wordList.innerHTML = "";
  const filteredWords = batch.words.filter(applyWordFilter);
  if (filteredWords.length === 0) {
    els.wordList.innerHTML =
      '<div class="placeholder">当前筛选没有结果</div>';
  } else {
    filteredWords.forEach((word) => {
      const isKnown = state.progressByWordId[word.id]?.status === "known";
      const hasNote = Boolean(state.notesByWordId[word.id]?.content?.trim());
      const item = document.createElement("button");
      item.className = "word-item";
      item.dataset.wordId = word.id;
      item.innerHTML = `
        <span class="word-text">${word.text}</span>
        <span class="word-status ${isKnown ? "is-known" : "is-unknown"}">
          ${isKnown ? "已掌握" : "未掌握"}
        </span>
        <span class="word-note ${hasNote ? "has-note" : ""}">
          ${hasNote ? "有备注" : ""}
        </span>
      `;
      if (word.id === state.selectedWordId) {
        item.classList.add("is-active");
      }
      els.wordList.appendChild(item);
    });
  }

  const selectedWord =
    batch.words.find((word) => word.id === state.selectedWordId) || null;
  renderWordPanel(selectedWord);
};

const renderWordPanel = (word) => {
  const empty = els.wordPanel.querySelector(".panel-empty");
  const content = els.wordPanel.querySelector(".panel-content");
  if (!word) {
    empty.classList.remove("is-hidden");
    content.classList.add("is-hidden");
    return;
  }

  empty.classList.add("is-hidden");
  content.classList.remove("is-hidden");
  els.wordText.textContent = word.text;
  const batch = getBatchById(state.selectedBatchId);
  els.wordBatch.textContent = batch ? batch.title : "—";

  const isKnown = state.progressByWordId[word.id]?.status === "known";
  els.toggleKnownBtn.textContent = isKnown ? "取消已掌握" : "标记已掌握";
  els.wordNote.value = state.notesByWordId[word.id]?.content || "";
};

const setSelectedBatch = (batchId) => {
  state.selectedBatchId = batchId;
  const batch = getBatchById(batchId);
  const firstWord = batch?.words[0];
  state.selectedWordId = firstWord ? firstWord.id : null;
  saveLastVisited();
  renderBatchList();
  renderBatchDetail();
};

const setSelectedWord = (wordId) => {
  state.selectedWordId = wordId;
  saveLastVisited();
  renderBatchDetail();
};

const toggleKnown = () => {
  if (!state.selectedWordId) return;
  const current = state.progressByWordId[state.selectedWordId];
  if (current?.status === "known") {
    delete state.progressByWordId[state.selectedWordId];
  } else {
    state.progressByWordId[state.selectedWordId] = {
      status: "known",
      updatedAt: Date.now(),
    };
  }
  saveStorage(STORAGE_KEYS.progress, state.progressByWordId);
  renderBatchList();
  renderBatchDetail();
  renderOverallProgress();
};

const updateNote = (value) => {
  if (!state.selectedWordId) return;
  if (!value.trim()) {
    delete state.notesByWordId[state.selectedWordId];
  } else {
    state.notesByWordId[state.selectedWordId] = {
      content: value,
      updatedAt: Date.now(),
    };
  }
  saveStorage(STORAGE_KEYS.notes, state.notesByWordId);
  renderBatchDetail();
};

const bindEvents = () => {
  els.batchList.addEventListener("click", (event) => {
    const target = event.target.closest(".batch-card");
    if (!target) return;
    setSelectedBatch(target.dataset.batchId);
  });

  els.wordList.addEventListener("click", (event) => {
    const target = event.target.closest(".word-item");
    if (!target) return;
    setSelectedWord(target.dataset.wordId);
  });

  els.filters.addEventListener("click", (event) => {
    const target = event.target.closest(".filter-btn");
    if (!target) return;
    state.filter = target.dataset.filter;
    setFilterActive();
    saveLastVisited();
    renderBatchDetail();
  });

  els.toggleKnownBtn.addEventListener("click", toggleKnown);

  els.wordNote.addEventListener("input", (event) => {
    updateNote(event.target.value);
  });

  els.continueBtn.addEventListener("click", () => {
    if (state.selectedBatchId) {
      setSelectedBatch(state.selectedBatchId);
      return;
    }
    const firstBatch = state.data?.batches[0];
    if (firstBatch) {
      setSelectedBatch(firstBatch.id);
    }
  });
};

const init = async () => {
  loadState();
  try {
    const response = await fetch("./data/words.json");
    if (!response.ok) throw new Error("无法加载词表数据");
    state.data = await response.json();
  } catch (error) {
    els.wordList.innerHTML =
      '<div class="placeholder">无法加载数据，请使用本地服务器打开</div>';
    return;
  }

  renderOverallProgress();
  setFilterActive();
  renderBatchList();

  if (state.selectedBatchId) {
    renderBatchDetail();
  }

  bindEvents();
};

init();
