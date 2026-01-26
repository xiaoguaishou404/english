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

const BATCH_NOTES = [
  {
    subtitle: "英语的“骨架词”",
    summary:
      "功能词、基础动词、代词、介词、连接词构成句子骨架，不掌握就难以成句。",
    highlights: ["能看见句子结构", "不再被长句吓到"],
    outcome: "这是所有英语的地基。",
  },
  {
    subtitle: "高频动词补全 + 核心日常名词",
    summary:
      "人/物/时间/数量 + 高频动作动词 + 基础形容词与副词，进入真正能表达的区间。",
    highlights: ["听懂大量日常对话", "描述事情", "看懂英文界面/基础文档"],
    outcome: "能正常说人话。",
  },
  {
    subtitle: "生活场景 + 情绪状态",
    summary: "交通、健康、情绪、环境与物品等场景词集中出现，英语开始有画面感。",
    highlights: ["状态判断更自然", "日常生活场景基本无压力"],
    outcome: "已超过很多学了几年但词汇混乱的人。",
  },
  {
    subtitle: "中级英语分水岭",
    summary: "更成熟的形容词 + 抽象名词 + 工作/学习/系统表达进入主场。",
    highlights: ["可讨论", "可解释", "可表达观点"],
    outcome: "到 1000 词是很多非母语者的真实天花板。",
  },
  {
    subtitle: "思考型英语起点",
    summary: "偏书面但高频，新闻/说明文常见，抽象逻辑词开始集中出现。",
    highlights: ["从生活英语过渡到思考英语"],
    outcome: "完成这一层会出现能力跃迁。",
  },
  {
    subtitle: "抽象能力 + 工作/技术英语核心层",
    summary: "覆盖系统/项目/决策、抽象状态与变化、正式高频动词等专业语境。",
    highlights: ["专业文档基本无障碍"],
    outcome: "英语开始成为工具，而不是障碍。",
  },
  {
    subtitle: "高级但仍然常见",
    summary: "新闻、商务、公共讨论中的高频词集中出现。",
    highlights: ["阅读会突然变轻松"],
    outcome: "新闻/商务英文几乎无压力。",
  },
  {
    subtitle: "高频书面英语最后一层",
    summary: "完成 2000 词，覆盖约 92–94% 英文文本。",
    highlights: ["阅读速度明显提升", "剩下主要是低频词"],
    outcome: "这是书面英语覆盖率的重要里程碑。",
  },
  {
    subtitle: "一般常用词区间",
    summary: "不天天用，但阅读中经常遇到。",
    highlights: ["阅读英文文章几乎不查词"],
    outcome: "已完全超过普通应试英语。",
  },
  {
    subtitle: "低频但阅读常见",
    summary: "提升理解完整度，让文章没有卡点。",
    highlights: ["阅读接近母语材料"],
    outcome: "高频体系趋于完整。",
  },
  {
    subtitle: "精准表达层",
    summary: "看着高级，但并不生僻。",
    highlights: ["几乎不怕任何英文文本"],
    outcome: "表达与理解都更精确。",
  },
  {
    subtitle: "真正的收官",
    summary: "低频但高价值，偏学术/思想/精准语义。",
    highlights: ["认识即可", "英文阅读零死角"],
    outcome: "覆盖极少见但高价值的表达。",
  },
];

const els = {
  batchList: document.getElementById("batchList"),
  wordList: document.getElementById("wordList"),
  batchTitle: document.getElementById("batchTitle"),
  batchCount: document.getElementById("batchCount"),
  batchProgress: document.getElementById("batchProgress"),
  batchSubtitle: document.getElementById("batchSubtitle"),
  batchSummary: document.getElementById("batchSummary"),
  batchHighlights: document.getElementById("batchHighlights"),
  batchOutcome: document.getElementById("batchOutcome"),
  overallProgress: document.getElementById("overallProgress"),
  filters: document.getElementById("filters"),
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
  state.data?.batches.find((batch) => batch.title === batchId);

const getKnownCount = (words) =>
  words.reduce(
    (count, word) =>
      state.progressByWordId[word.id]?.status === "known" ? count + 1 : count,
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
    card.dataset.batchId = batch.title;
    card.innerHTML = `
      <span class="batch-card-title">${batch.title}</span>
      <span class="batch-card-progress">${known}/${total}</span>
    `;
    if (batch.title === state.selectedBatchId) {
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
    els.batchCount.textContent = "—";
    els.batchProgress.textContent = "—";
    els.batchSubtitle.textContent = "";
    els.batchSummary.textContent = "";
    els.batchHighlights.innerHTML = "";
    els.batchOutcome.textContent = "";
    els.wordList.innerHTML =
      '<div class="placeholder">请选择批次后查看词表</div>';
    return;
  }

  const known = getKnownCount(batch.words);
  const total = batch.words.length;
  els.batchTitle.textContent = batch.title;
  els.batchCount.textContent = `共 ${total} 词`;
  els.batchProgress.textContent = `进度 ${known} / ${total}`;
  els.batchSubtitle.textContent = batch.subtitle || "";
  els.batchSummary.textContent = batch.summary || "";
  els.batchHighlights.innerHTML = batch.highlights
    .map((item) => `<li>${item}</li>`)
    .join("");
  els.batchOutcome.textContent = batch.outcome || "";

  els.wordList.innerHTML = "";
  const filteredWords = batch.words.filter(applyWordFilter).sort((a, b) => {
    const aProgress = state.progressByWordId[a.id];
    const bProgress = state.progressByWordId[b.id];
    const aKnown = aProgress?.status === "known";
    const bKnown = bProgress?.status === "known";

    if (aKnown !== bKnown) return aKnown ? 1 : -1;

    // 如果都是已掌握，则按 updatedAt 时间戳排序，后标记的（时间戳大）在后面
    if (aKnown && bKnown) {
      return (aProgress.updatedAt || 0) - (bProgress.updatedAt || 0);
    }

    return 0; // 都是未掌握，保持原词表顺序
  });
  if (filteredWords.length === 0) {
    els.wordList.innerHTML = '<div class="placeholder">当前筛选没有结果</div>';
  } else {
    filteredWords.forEach((word) => {
      const isKnown = state.progressByWordId[word.id]?.status === "known";
      const noteContent = state.notesByWordId[word.id]?.content || "";
      const item = document.createElement("div");
      item.className = "word-item";
      item.tabIndex = 0; 
      item.dataset.wordId = word.id;
      item.innerHTML = `
        <div class="word-info">
          <span class="word-text">${word.text}</span>
          <span class="word-status ${isKnown ? "is-known" : "is-unknown"}">
            ${isKnown ? "已掌握" : "未掌握"}
          </span>
        </div>
        <div class="word-note-container">
          <span class="word-note-display">${noteContent}</span>
          <input 
            type="text"
            class="word-note-input" 
            placeholder="添加备注..."
            value="${noteContent}"
          />
        </div>
      `;
      els.wordList.appendChild(item);
    });
  }
};

const setSelectedBatch = (batchId) => {
  state.selectedBatchId = batchId;
  saveLastVisited();
  renderBatchList();
  renderBatchDetail();
};

const toggleKnown = (wordId) => {
  const targetWordId = wordId || state.selectedWordId;
  if (!targetWordId) return;

  const current = state.progressByWordId[targetWordId];
  if (current?.status === "known") {
    delete state.progressByWordId[targetWordId];
  } else {
    state.progressByWordId[targetWordId] = {
      status: "known",
      updatedAt: Date.now(),
    };
  }
  saveStorage(STORAGE_KEYS.progress, state.progressByWordId);
  renderBatchList();
  renderBatchDetail();
  renderOverallProgress();
};

const updateNote = (wordId, value) => {
  if (!wordId) return;
  if (!value.trim()) {
    delete state.notesByWordId[wordId];
  } else {
    state.notesByWordId[wordId] = {
      content: value,
      updatedAt: Date.now(),
    };
  }
  saveStorage(STORAGE_KEYS.notes, state.notesByWordId);
};

const bindEvents = () => {
  els.batchList.addEventListener("click", (event) => {
    const target = event.target.closest(".batch-card");
    if (!target) return;
    setSelectedBatch(target.dataset.batchId);
  });

  els.wordList.addEventListener("contextmenu", (event) => {
    const target = event.target.closest(".word-item");
    if (!target) return;
    // 如果是在输入框内部右键，允许显示默认菜单
    if (event.target.tagName === "INPUT") return;
    
    event.preventDefault();
    toggleKnown(target.dataset.wordId);
  });

  els.wordList.addEventListener("input", (event) => {
    if (event.target.classList.contains("word-note-input")) {
      const wordItem = event.target.closest(".word-item");
      if (wordItem) {
        const wordId = wordItem.dataset.wordId;
        const value = event.target.value;
        updateNote(wordId, value);
        
        // 同步更新显示文本
        const display = wordItem.querySelector(".word-note-display");
        if (display) display.textContent = value;
      }
    }
  });

  els.filters.addEventListener("click", (event) => {
    const target = event.target.closest(".filter-btn");
    if (!target) return;
    state.filter = target.dataset.filter;
    setFilterActive();
    saveLastVisited();
    renderBatchDetail();
  });
};

const init = async () => {
  loadState();
  try {
    const response = await fetch("./data/words.json");
    if (!response.ok) throw new Error("无法加载词表数据");
    const rawData = await response.json();
    // 转换数据：为每个单词添加 id 和 text 属性
    const batches = rawData.map((words, index) => {
      const title = `第 ${index + 1} 批`;
      const note = BATCH_NOTES[index] || {};
      return {
        title,
        subtitle: note.subtitle || "",
        summary: note.summary || "",
        highlights: note.highlights || [],
        outcome: note.outcome || "",
        words: words.map((word) => ({
          id: `${title}-${word}`,
          text: word,
        })),
      };
    });
    state.data = { batches };
  } catch (error) {
    els.wordList.innerHTML =
      '<div class="placeholder">无法加载数据，请使用本地服务器打开</div>';
    return;
  }

  renderOverallProgress();
  setFilterActive();

  if (!state.selectedBatchId && state.data?.batches.length > 0) {
    setSelectedBatch(state.data.batches[0].title);
  } else {
    renderBatchList();
    if (state.selectedBatchId) {
      renderBatchDetail();
    }
  }

  bindEvents();
};

init();
