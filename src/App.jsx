import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Trash2, X, Check, ArrowRight, ArrowLeft, User, LogOut,
  Menu, ChevronRight, BadgeCheck, Loader2, Sparkles, ListChecks,
  Clock, Users, RotateCcw, Trophy, Brain
} from "lucide-react";

/* ---------------------------------------------------------------
   Seed data
--------------------------------------------------------------- */
const CATEGORIES = ["General Knowledge", "Science", "Movies", "Geography", "Sports", "History"];
const CATEGORY_EMOJI = {
  "General Knowledge": "🧠", "Science": "🧪", "Movies": "🎬",
  "Geography": "🌍", "Sports": "⚽", "History": "🏛️",
};
const DECOR_EMOJI = {
  "General Knowledge": ["✨", "💡", "🧠", "❓"], "Science": ["🧪", "🔬", "⚗️", "🧬"],
  "Movies": ["🎬", "🍿", "🎞️", "🎭"], "Geography": ["🌍", "🧭", "🗺️", "⛰️"],
  "Sports": ["⚽", "🏀", "🏆", "🎾"], "History": ["🏛️", "📜", "⚔️", "🗿"],
};

const SEED_QUIZZES = [
  { id: "Q-1", title: "World Capitals 101", category: "Geography", description: "How well do you know your world capitals?", createdBy: "team@quizly.app", createdByName: "Quizly Team", createdAt: Date.now() - 86400000 * 6,
    questions: [
      { id: "q1", text: "What is the capital of Japan?", options: ["Osaka", "Tokyo", "Kyoto", "Nagoya"], correctIndex: 1 },
      { id: "q2", text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctIndex: 2 },
      { id: "q3", text: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correctIndex: 3 },
      { id: "q4", text: "What is the capital of Egypt?", options: ["Cairo", "Alexandria", "Giza", "Luxor"], correctIndex: 0 },
      { id: "q5", text: "What is the capital of Brazil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correctIndex: 2 },
    ] },
  { id: "Q-2", title: "Science Basics", category: "Science", description: "A quick check of core science facts.", createdBy: "team@quizly.app", createdByName: "Quizly Team", createdAt: Date.now() - 86400000 * 4,
    questions: [
      { id: "q1", text: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correctIndex: 1 },
      { id: "q2", text: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2 },
      { id: "q3", text: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correctIndex: 1 },
      { id: "q4", text: "What planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 },
    ] },
  { id: "Q-3", title: "Movie Trivia Night", category: "Movies", description: "Test your knowledge of classic and modern films.", createdBy: "team@quizly.app", createdByName: "Quizly Team", createdAt: Date.now() - 86400000 * 2,
    questions: [
      { id: "q1", text: "Who directed 'Jurassic Park'?", options: ["James Cameron", "Steven Spielberg", "George Lucas", "Ridley Scott"], correctIndex: 1 },
      { id: "q2", text: "Which movie features the song 'Let It Go'?", options: ["Moana", "Frozen", "Tangled", "Encanto"], correctIndex: 1 },
      { id: "q3", text: "What is the highest-grossing film of all time (unadjusted)?", options: ["Titanic", "Avengers: Endgame", "Avatar", "Star Wars"], correctIndex: 2 },
      { id: "q4", text: "In which city is 'Inception' primarily set?", options: ["Paris", "Tokyo", "Multiple cities in dreams", "New York"], correctIndex: 2 },
    ] },
  { id: "Q-4", title: "Sports Quickfire", category: "Sports", description: "Fast facts across football, cricket, and more.", createdBy: "team@quizly.app", createdByName: "Quizly Team", createdAt: Date.now() - 86400000 * 8,
    questions: [
      { id: "q1", text: "How many players are on a football (soccer) team on the field?", options: ["9", "10", "11", "12"], correctIndex: 2 },
      { id: "q2", text: "In cricket, how many runs is a 'six'?", options: ["4", "5", "6", "7"], correctIndex: 2 },
      { id: "q3", text: "Which country has won the most FIFA World Cups?", options: ["Germany", "Argentina", "Brazil", "Italy"], correctIndex: 2 },
      { id: "q4", text: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], correctIndex: 1 },
    ] },
  { id: "Q-5", title: "Ancient Civilizations", category: "History", description: "From pyramids to empires — how much do you recall?", createdBy: "team@quizly.app", createdByName: "Quizly Team", createdAt: Date.now() - 86400000 * 10,
    questions: [
      { id: "q1", text: "The Great Pyramid of Giza was built for which pharaoh?", options: ["Tutankhamun", "Ramses II", "Khufu", "Akhenaten"], correctIndex: 2 },
      { id: "q2", text: "Which empire built the Colosseum?", options: ["Greek", "Roman", "Persian", "Ottoman"], correctIndex: 1 },
      { id: "q3", text: "The Great Wall was built primarily to protect which country?", options: ["Japan", "India", "China", "Mongolia"], correctIndex: 2 },
    ] },
];

const STORAGE_KEY = "quizmaker-data-v1";
const timeAgo = (ts) => {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
};
const uid = (p) => `${p}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-[999] animate-[toastin_0.25s_ease]">
      <div className="qz-toast flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg sm:max-w-sm">
        <Sparkles size={18} className="mt-0.5 shrink-0" style={{ color: "#FF8A4C" }} />
        <div className="text-sm leading-snug">{toast}</div>
      </div>
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  const tones = {
    default: { bg: "#E7F6F4", color: "#0B6E76" },
    orange: { bg: "#FFEDE1", color: "#B4542A" },
    green: { bg: "#E1F5EA", color: "#1D7A53" },
    red: { bg: "#FBE7E7", color: "#B33333" },
  };
  const t = tones[tone] || tones.default;
  return <span className="qz-pill" style={{ background: t.bg, color: t.color }}>{children}</span>;
}

function QuizCard({ quiz, attemptsCount, onOpen, onDelete, canManage }) {
  return (
    <div className="qz-card" onClick={() => onOpen(quiz.id)}>
      <div className="flex items-center justify-between">
        <span className="qz-emoji-badge">{CATEGORY_EMOJI[quiz.category] || "❓"}</span>
        <Pill>{quiz.category}</Pill>
      </div>
      <h3 className="qz-title mt-3 text-lg">{quiz.title}</h3>
      <p className="text-sm mt-1 line-clamp-2" style={{ color: "#5E7A7E" }}>{quiz.description}</p>
      <div className="mt-4 flex items-center gap-4 text-xs" style={{ color: "#5E7A7E" }}>
        <span className="flex items-center gap-1"><ListChecks size={14} /> {quiz.questions.length} questions</span>
        <span className="flex items-center gap-1"><Users size={14} /> {attemptsCount} attempt{attemptsCount !== 1 ? "s" : ""}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "#8AA3A6" }}>by {quiz.createdByName}</span>
        {canManage ? (
          <button onClick={(e) => { e.stopPropagation(); onDelete(quiz.id); }} className="qz-icon-btn" style={{ color: "#E15554" }}>
            <Trash2 size={15} />
          </button>
        ) : (
          <span className="qz-linkbtn text-sm">Start <ArrowRight size={14} /></span>
        )}
      </div>
    </div>
  );
}

function AuthModal({ onClose, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onLogin({ name: name.trim(), email: email.trim().toLowerCase() });
  };
  return (
    <div className="qz-modal-backdrop" onClick={onClose}>
      <div className="qz-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qz-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="flex items-center gap-2 mb-1">
          <Brain size={20} style={{ color: "#FF8A4C" }} />
          <h2 className="qz-title text-xl">Quick sign-in</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "#5E7A7E" }}>
          Demo login — just tell us who you are so we can save your quizzes and scores.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="qz-field"><span>Full name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aditi Rao" required /></label>
          <label className="qz-field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required /></label>
          <button type="submit" className="qz-btn-primary mt-2">Continue <ArrowRight size={16} /></button>
        </form>
      </div>
    </div>
  );
}

function Navbar({ view, setView, session, setShowAuth, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (v) => { setView(v); setMenuOpen(false); };
  return (
    <header className="qz-nav">
      <div className="qz-nav-inner">
        <button className="flex items-center gap-2" onClick={() => nav("home")}>
          <div className="qz-logo"><Brain size={18} /></div>
          <span className="qz-title text-lg" style={{ color: "#fff" }}>Quizly</span>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => nav("home")} className={`qz-navlink ${view === "home" ? "qz-navlink-active" : ""}`}>Home</button>
          <button onClick={() => nav("listing")} className={`qz-navlink ${view === "listing" ? "qz-navlink-active" : ""}`}>Browse quizzes</button>
          <button onClick={() => nav("create")} className={`qz-navlink ${view === "create" ? "qz-navlink-active" : ""}`}>Create a quiz</button>
          {session && <button onClick={() => nav("mine")} className={`qz-navlink ${view === "mine" ? "qz-navlink-active" : ""}`}>My activity</button>}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className="qz-mono text-xs" style={{ color: "#B9E4DE" }}>{session.name}</span>
              <button onClick={logout} className="qz-btn-ghost"><LogOut size={14} /> Log out</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="qz-btn-ghost"><User size={14} /> Log in</button>
          )}
        </div>
        <button className="md:hidden" style={{ color: "#fff" }} onClick={() => setMenuOpen((m) => !m)}><Menu size={22} /></button>
      </div>
      {menuOpen && (
        <div className="qz-nav-mobile">
          <button onClick={() => nav("home")}>Home</button>
          <button onClick={() => nav("listing")}>Browse quizzes</button>
          <button onClick={() => nav("create")}>Create a quiz</button>
          {session && <button onClick={() => nav("mine")}>My activity</button>}
          {session ? <button onClick={logout}>Log out ({session.name})</button> : <button onClick={() => { setShowAuth(true); setMenuOpen(false); }}>Log in</button>}
        </div>
      )}
    </header>
  );
}

function HomePage({ quizzes, attempts, onOpen, setView }) {
  return (
    <div>
      <section className="qz-hero">
        <div className="qz-dotpattern" />
        <div className="qz-hero-inner">
          <Pill tone="orange">{quizzes.length} quizzes live right now</Pill>
          <h1 className="qz-display mt-4">Make a quiz.<br />Take a quiz.<br />Know instantly.</h1>
          <p className="mt-4 text-base sm:text-lg max-w-lg mx-auto" style={{ color: "#DFF4F0" }}>
            Build multiple-choice quizzes in minutes, share them, and get scored the moment you finish.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="qz-btn-primary" onClick={() => setView("create")}>
              <Plus size={16} /> Create a quiz
            </button>
            <button className="qz-btn-secondary" onClick={() => setView("listing")}>
              Take a quiz <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="qz-section">
        <div className="flex items-end justify-between mb-5">
          <h2 className="qz-title text-2xl">Popular quizzes</h2>
          <button onClick={() => setView("listing")} className="qz-linkbtn">See all <ChevronRight size={16} /></button>
        </div>
        <div className="qz-grid">
          {quizzes.slice(0, 6).map((q) => (
            <QuizCard key={q.id} quiz={q} attemptsCount={attempts.filter((a) => a.quizId === q.id).length} onOpen={onOpen} />
          ))}
        </div>
      </section>

      <section className="qz-section qz-howitworks">
        <h2 className="qz-title text-2xl mb-6">How it works</h2>
        <div className="qz-grid-3">
          {[
            { icon: Plus, title: "Build your quiz", body: "Add a title, category, and as many questions as you like — each with four options and one correct answer." },
            { icon: ListChecks, title: "Take it question by question", body: "Answer one question at a time with a progress bar tracking how far you've come." },
            { icon: Trophy, title: "See your score instantly", body: "Get your final score and a full answer review the moment you finish." },
          ].map((f, i) => (
            <div key={i} className="qz-feature">
              <f.icon size={20} style={{ color: "#FF8A4C" }} />
              <h3 className="qz-title text-base mt-3">{f.title}</h3>
              <p className="text-sm mt-1" style={{ color: "#5E7A7E" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ListingPage({ quizzes, attempts, onOpen }) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const kw = keyword.trim().toLowerCase();
      const matchKw = !kw || q.title.toLowerCase().includes(kw) || q.description.toLowerCase().includes(kw);
      const matchCat = !category || q.category === category;
      return matchKw && matchCat;
    });
  }, [quizzes, keyword, category]);

  return (
    <div className="qz-section">
      <h1 className="qz-title text-2xl mb-1">Browse quizzes</h1>
      <p className="text-sm mb-5" style={{ color: "#5E7A7E" }}>{filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} available</p>
      <div className="qz-filterbar">
        <div className="qz-searchfield">
          <Search size={16} />
          <input placeholder="Search quizzes" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="qz-empty">No quizzes match that search yet.</div>
      ) : (
        <div className="qz-grid">
          {filtered.map((q) => (
            <QuizCard key={q.id} quiz={q} attemptsCount={attempts.filter((a) => a.quizId === q.id).length} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateQuizPage({ session, onCreate, setView, showToast, setShowAuth }) {
  const blankQ = () => ({ id: uid("tmp"), text: "", options: ["", "", "", ""], correctIndex: 0 });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([blankQ()]);

  const updateQ = (id, patch) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const updateOption = (id, idx, val) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, options: q.options.map((o, i) => (i === idx ? val : o)) } : q)));
  const addQuestion = () => setQuestions((qs) => [...qs, blankQ()]);
  const removeQuestion = (id) => setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));

  const submit = (e) => {
    e.preventDefault();
    if (!session) { showToast("Log in to publish your quiz."); setShowAuth(true); return; }
    if (!title.trim()) return showToast("Give your quiz a title first.");
    const cleaned = questions.map((q) => ({ ...q, text: q.text.trim(), options: q.options.map((o) => o.trim()) }));
    const invalid = cleaned.some((q) => !q.text || q.options.some((o) => !o));
    if (invalid) return showToast("Fill in every question and all four options.");
    onCreate({
      id: uid("Q"),
      title: title.trim(),
      category,
      description: description.trim() || "A quiz built with Quizly.",
      createdBy: session.email,
      createdByName: session.name,
      createdAt: Date.now(),
      questions: cleaned.map((q, i) => ({ id: `q${i + 1}`, text: q.text, options: q.options, correctIndex: q.correctIndex })),
    });
  };

  return (
    <div className="qz-section" style={{ maxWidth: 780 }}>
      <h1 className="qz-title text-2xl mb-1">Create a quiz</h1>
      <p className="text-sm mb-6" style={{ color: "#5E7A7E" }}>Add your questions below — you can add as many as you like.</p>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="qz-panel">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="qz-field sm:col-span-2"><span>Quiz title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. World Capitals 101" required /></label>
            <label className="qz-field"><span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="qz-field"><span>Description</span><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line about your quiz" /></label>
          </div>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="qz-panel">
            <div className="flex items-center justify-between mb-3">
              <span className="qz-title text-sm">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(q.id)} className="qz-icon-btn" style={{ color: "#E15554" }}><Trash2 size={15} /></button>
              )}
            </div>
            <label className="qz-field mb-3"><span>Question text</span>
              <input value={q.text} onChange={(e) => updateQ(q.id, { text: e.target.value })} placeholder="Type your question" required />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className="qz-option-input">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQ(q.id, { correctIndex: oi })}
                  />
                  <span className="qz-letter">{LETTERS[oi]}</span>
                  <input
                    className="qz-option-text"
                    value={opt}
                    onChange={(e) => updateOption(q.id, oi, e.target.value)}
                    placeholder={`Option ${LETTERS[oi]}`}
                    required
                  />
                </label>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "#8AA3A6" }}>Select the radio next to the correct answer.</p>
          </div>
        ))}

        <button type="button" onClick={addQuestion} className="qz-btn-secondary self-start">
          <Plus size={16} /> Add another question
        </button>

        <button type="submit" className="qz-btn-primary self-start">
          Publish quiz <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

function TakeQuizPage({ quiz, session, onFinish, setView }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [selected, setSelected] = useState(null);

  if (!quiz) return <div className="qz-section">Quiz not found. <button className="qz-linkbtn" onClick={() => setView("listing")}>Back to quizzes</button></div>;

  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;
  const decor = DECOR_EMOJI[quiz.category] || ["✨", "⭐", "❓", "💡"];

  const choose = (i) => setSelected(i);
  const next = () => {
    if (selected === null) return;
    const nextAnswers = [...answers];
    nextAnswers[idx] = selected;
    setAnswers(nextAnswers);
    if (isLast) {
      const score = nextAnswers.reduce((sum, a, i) => sum + (a === quiz.questions[i].correctIndex ? 1 : 0), 0);
      onFinish({ quiz, answers: nextAnswers, score });
    } else {
      setIdx(idx + 1);
      setSelected(null);
    }
  };
  const back = () => {
    if (idx === 0) return;
    setIdx(idx - 1);
    setSelected(answers[idx - 1]);
  };

  return (
    <div className="qz-take-wrap">
      <div className="qz-decor" style={{ top: "8%", left: "4%" }}>{decor[0]}</div>
      <div className="qz-decor" style={{ top: "18%", right: "6%" }}>{decor[1]}</div>
      <div className="qz-decor" style={{ bottom: "14%", left: "8%" }}>{decor[2]}</div>
      <div className="qz-decor" style={{ bottom: "8%", right: "4%" }}>{decor[3]}</div>
      <div className="qz-dotpattern qz-dotpattern-light" />
      <div className="qz-take-card">
        <div className="qz-progress-track"><div className="qz-progress-fill" style={{ width: `${((idx + (selected !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }} /></div>
        <div className="flex items-center justify-between mt-4 mb-2">
          <span className="qz-mono text-xs uppercase tracking-wide" style={{ color: "#8AA3A6" }}>Question {idx + 1}/{quiz.questions.length}</span>
          <Pill>{quiz.category}</Pill>
        </div>
        <h2 className="qz-title text-xl sm:text-2xl mt-2 mb-6" style={{ lineHeight: 1.3 }}>{q.text}</h2>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button key={i} className={`qz-option ${selected === i ? "qz-option-selected" : ""}`} onClick={() => choose(i)}>
              <span className="qz-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-7">
          <button onClick={back} disabled={idx === 0} className="qz-btn-ghost-light"><ArrowLeft size={15} /> Back</button>
          <button onClick={next} disabled={selected === null} className="qz-btn-primary">
            {isLast ? "Finish quiz" : "Next"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ result, setView, onOpen }) {
  if (!result) return <div className="qz-section">No results yet. <button className="qz-linkbtn" onClick={() => setView("listing")}>Take a quiz</button></div>;
  const { quiz, answers, score } = result;
  const total = quiz.questions.length;
  const pct = Math.round((score / total) * 100);
  const tone = pct >= 70 ? "green" : pct >= 40 ? "orange" : "red";
  return (
    <div className="qz-section" style={{ maxWidth: 720 }}>
      <div className="qz-panel text-center">
        <Trophy size={30} style={{ color: "#FF8A4C", margin: "0 auto" }} />
        <h1 className="qz-title text-2xl mt-3">{quiz.title} — Results</h1>
        <div className="qz-score-big mt-4">{score}<span style={{ fontSize: "0.4em", color: "#8AA3A6" }}>/{total}</span></div>
        <Pill tone={tone}>{pct}% correct</Pill>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button className="qz-btn-secondary" onClick={() => setView("listing")}><RotateCcw size={15} /> Try another quiz</button>
          <button className="qz-btn-primary" onClick={() => onOpen(quiz.id)}>Retake this quiz <ArrowRight size={16} /></button>
        </div>
      </div>

      <h2 className="qz-title text-lg mt-8 mb-3">Answer review</h2>
      <div className="flex flex-col gap-3">
        {quiz.questions.map((q, i) => {
          const yourAns = answers[i];
          const isCorrect = yourAns === q.correctIndex;
          return (
            <div key={q.id} className="qz-review-row">
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? <Check size={16} style={{ color: "#1D7A53" }} /> : <X size={16} style={{ color: "#B33333" }} />}
                <span className="qz-title text-sm">{i + 1}. {q.text}</span>
              </div>
              <div className="text-xs flex flex-col gap-1 ml-6">
                <span style={{ color: isCorrect ? "#1D7A53" : "#B33333" }}>
                  Your answer: {LETTERS[yourAns]}. {q.options[yourAns]}
                </span>
                {!isCorrect && (
                  <span style={{ color: "#5E7A7E" }}>Correct answer: {LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyActivityPage({ session, quizzes, attempts, onOpen, onDelete, setView }) {
  const myQuizzes = quizzes.filter((q) => q.createdBy === session.email);
  const myAttempts = attempts.filter((a) => a.email === session.email);
  return (
    <div className="qz-section">
      <h1 className="qz-title text-2xl mb-1">My activity</h1>
      <p className="text-sm mb-6" style={{ color: "#5E7A7E" }}>Signed in as {session.name} ({session.email})</p>
      <div className="qz-dash-grid">
        <div className="qz-panel">
          <h2 className="qz-title text-lg mb-4">Quizzes I've created ({myQuizzes.length})</h2>
          {myQuizzes.length === 0 ? (
            <div className="qz-empty">You haven't published a quiz yet. <button className="qz-linkbtn inline" onClick={() => setView("create")}>Create one →</button></div>
          ) : (
            <div className="flex flex-col gap-3">
              {myQuizzes.map((q) => (
                <div key={q.id} className="qz-row">
                  <div>
                    <div className="qz-title text-sm">{q.title}</div>
                    <div className="text-xs" style={{ color: "#8AA3A6" }}>{q.questions.length} questions · {attempts.filter((a) => a.quizId === q.id).length} attempts</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onOpen(q.id)} className="qz-linkbtn text-sm">Preview</button>
                    <button onClick={() => onDelete(q.id)} className="qz-icon-btn" style={{ color: "#E15554" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="qz-panel">
          <h2 className="qz-title text-lg mb-4">My attempts ({myAttempts.length})</h2>
          {myAttempts.length === 0 ? (
            <div className="qz-empty">No attempts yet. <button className="qz-linkbtn inline" onClick={() => setView("listing")}>Browse quizzes →</button></div>
          ) : (
            <div className="flex flex-col gap-3">
              {myAttempts.slice().reverse().map((a) => {
                const q = quizzes.find((x) => x.id === a.quizId);
                return (
                  <div key={a.id} className="qz-row-col">
                    <div className="flex items-center justify-between">
                      <span className="qz-title text-sm">{q?.title || "Removed quiz"}</span>
                      <Pill tone={a.score / a.total >= 0.7 ? "green" : "orange"}>{a.score}/{a.total}</Pill>
                    </div>
                    <span className="text-xs" style={{ color: "#8AA3A6" }}>{timeAgo(a.completedAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [view, setView] = useState("home");
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); }, []);

  const persist = useCallback((nextQuizzes, nextAttempts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quizzes: nextQuizzes, attempts: nextAttempts }));
    } catch (err) { console.error("Storage save failed:", err); }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setQuizzes(parsed.quizzes?.length ? parsed.quizzes : SEED_QUIZZES);
        setAttempts(parsed.attempts || []);
      } else {
        setQuizzes(SEED_QUIZZES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ quizzes: SEED_QUIZZES, attempts: [] }));
      }
    } catch (err) {
      setQuizzes(SEED_QUIZZES);
    } finally {
      setLoading(false);
    }
  }, []);

  const openQuiz = (id) => { setSelectedQuizId(id); setView("take"); window.scrollTo?.(0, 0); };

  const handleCreate = (quiz) => {
    const next = [quiz, ...quizzes];
    setQuizzes(next);
    persist(next, attempts);
    showToast("Quiz published! It's now live for others to take.");
    setView("listing");
  };

  const handleDeleteQuiz = (id) => {
    const next = quizzes.filter((q) => q.id !== id);
    setQuizzes(next);
    persist(next, attempts);
  };

  const handleFinishQuiz = ({ quiz, answers, score }) => {
    const attempt = {
      id: uid("A"), quizId: quiz.id,
      email: session?.email || "guest@quizly.app",
      name: session?.name || "Guest",
      score, total: quiz.questions.length, completedAt: Date.now(),
    };
    const next = [...attempts, attempt];
    setAttempts(next);
    persist(quizzes, next);
    setLastResult({ quiz, answers, score });
    setView("results");
  };

  const logout = () => { setSession(null); setView("home"); };
  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId) || null;

  if (loading) {
    return (
      <div className="qz-root qz-loading">
        <style>{STYLES}</style>
        <Loader2 className="animate-spin" size={28} style={{ color: "#FF8A4C" }} />
      </div>
    );
  }

  return (
    <div className="qz-root">
      <style>{STYLES}</style>
      <Navbar view={view} setView={setView} session={session} setShowAuth={setShowAuth} logout={logout} />

      {view === "home" && <HomePage quizzes={quizzes} attempts={attempts} onOpen={openQuiz} setView={setView} />}
      {view === "listing" && <ListingPage quizzes={quizzes} attempts={attempts} onOpen={openQuiz} />}
      {view === "create" && <CreateQuizPage session={session} onCreate={handleCreate} setView={setView} showToast={showToast} setShowAuth={setShowAuth} />}
      {view === "take" && selectedQuiz && <TakeQuizPage quiz={selectedQuiz} session={session} onFinish={handleFinishQuiz} setView={setView} />}
      {view === "results" && <ResultsPage result={lastResult} setView={setView} onOpen={openQuiz} />}
      {view === "mine" && session && <MyActivityPage session={session} quizzes={quizzes} attempts={attempts} onOpen={openQuiz} onDelete={handleDeleteQuiz} setView={setView} />}

      <footer className="qz-footer">
        <div className="flex items-center gap-2">
          <Brain size={16} style={{ color: "#FF8A4C" }} />
          <span className="qz-title text-sm" style={{ color: "#fff" }}>Quizly</span>
        </div>
        <span className="text-xs" style={{ color: "#9CC9C3" }}>Demo quiz maker · data is shared across everyone viewing this artifact</span>
      </footer>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={(s) => { setSession(s); setShowAuth(false); showToast(`Welcome, ${s.name}!`); }} />
      )}
      <Toast toast={toast} />
    </div>
  );
}

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

const STYLES = `
${FONT_IMPORT}
.qz-root { font-family: 'Inter', sans-serif; background: #F3FBF9; color: #10333A; min-height: 100vh; }
.qz-loading { display:flex; align-items:center; justify-content:center; height: 100vh; }
.qz-display { font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: clamp(2rem, 5.5vw, 3.2rem); line-height: 1.08; color: #fff; }
.qz-title { font-family: 'Baloo 2', sans-serif; font-weight: 700; color: #10333A; }
.qz-mono { font-family: 'IBM Plex Mono', monospace; }
.qz-nav { background: #0B6E76; position: sticky; top: 0; z-index: 50; }
.qz-nav-inner { max-width: 1180px; margin: 0 auto; padding: 14px 20px; display:flex; align-items:center; justify-content:space-between; gap: 16px; }
.qz-logo { width: 32px; height: 32px; border-radius: 9px; background: #FF8A4C; color: #fff; display:flex; align-items:center; justify-content:center; }
.qz-navlink { font-size: 14px; color: #BFE9E3; padding: 6px 2px; border-bottom: 2px solid transparent; }
.qz-navlink-active { color: #fff; border-color: #FF8A4C; }
.qz-nav-mobile { display:flex; flex-direction:column; background:#0B6E76; border-top: 1px solid #1A8A8F; padding: 8px 20px 16px; }
.qz-nav-mobile button { text-align:left; color:#E3F7F3; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #187F84; }
.qz-btn-primary { display:flex; align-items:center; justify-content:center; gap:8px; background:#FF8A4C; color:#fff; font-weight:700; font-family:'Baloo 2',sans-serif; font-size:14px; padding:11px 20px; border-radius:12px; transition: background .15s, transform .1s; }
.qz-btn-primary:hover:not(:disabled) { background:#E56A2E; }
.qz-btn-primary:disabled { opacity: 0.5; }
.qz-btn-secondary { display:flex; align-items:center; justify-content:center; gap:8px; background:#fff; color:#0B6E76; font-weight:700; font-family:'Baloo 2',sans-serif; font-size:14px; padding:11px 20px; border-radius:12px; border: 2px solid #0B6E76; }
.qz-btn-ghost { display:flex; align-items:center; gap:6px; color:#E3F7F3; font-size:13px; padding: 8px 10px; border-radius:8px; border: 1px solid #1A8A8F; }
.qz-btn-ghost:hover { background:#0E828B; }
.qz-btn-ghost-light { display:flex; align-items:center; gap:6px; color:#5E7A7E; font-size:13px; font-weight:600; padding: 8px 10px; }
.qz-btn-ghost-light:disabled { opacity: 0.3; }
.qz-linkbtn { display:inline-flex; align-items:center; gap:4px; font-size:14px; font-weight:700; color:#0B6E76; font-family:'Baloo 2',sans-serif; }
.qz-icon-btn { padding:6px; border-radius:8px; }
.qz-icon-btn:hover { background:#F1F3F4; }
.qz-hero { position:relative; overflow:hidden; background: linear-gradient(135deg,#0B6E76 0%, #1AA6A0 60%, #3FC7BC 100%); padding: 64px 20px 70px; text-align:center; }
.qz-hero-inner { position:relative; max-width: 720px; margin:0 auto; z-index:2; }
.qz-dotpattern { position:absolute; inset:0; background-image: radial-gradient(rgba(255,255,255,0.18) 1.5px, transparent 1.5px); background-size: 22px 22px; opacity:0.5; }
.qz-section { max-width: 1180px; margin: 0 auto; padding: 48px 20px; }
.qz-howitworks { padding-top: 0; }
.qz-grid { display:grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 640px) { .qz-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 960px) { .qz-grid { grid-template-columns: 1fr 1fr 1fr; } }
.qz-grid-3 { display:grid; grid-template-columns: 1fr; gap:16px; }
@media (min-width: 768px) { .qz-grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
.qz-feature { background:#fff; border:1px solid #E0EFEC; border-radius:14px; padding:18px; }
.qz-card { background:#fff; border:1px solid #E0EFEC; border-radius:16px; padding:18px; cursor:pointer; transition: box-shadow .15s, transform .15s; }
.qz-card:hover { box-shadow: 0 12px 28px -14px rgba(11,110,118,0.35); transform: translateY(-2px); }
.qz-emoji-badge { font-size: 26px; }
.qz-pill { display:inline-block; font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; }
.qz-empty { padding: 28px; text-align:center; color:#8AA3A6; background:#fff; border:1px dashed #D6E7E4; border-radius:14px; font-size:14px; }
.qz-filterbar { display:flex; flex-direction:column; gap:10px; margin-bottom: 20px; }
@media (min-width: 640px) { .qz-filterbar { flex-direction:row; } }
.qz-searchfield { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #DCE9E7; border-radius:10px; padding:9px 12px; flex:1; }
.qz-searchfield input { border:none; outline:none; font-size:14px; width:100%; }
.qz-searchfield svg { color:#8AA3A6; }
.qz-filterbar select { background:#fff; border:1px solid #DCE9E7; border-radius:10px; padding:9px 12px; font-size:14px; }
.qz-panel { background:#fff; border:1px solid #E0EFEC; border-radius:16px; padding:20px; }
.qz-field { display:flex; flex-direction:column; gap:5px; font-size:13px; font-weight:600; color:#3A4756; }
.qz-field input, .qz-field select, .qz-field textarea { font-family:'Inter',sans-serif; font-weight:400; border:1px solid #DCE9E7; border-radius:9px; padding:10px 12px; font-size:14px; outline:none; color:#10333A; }
.qz-field input:focus, .qz-field select:focus { border-color:#FF8A4C; }
.qz-option-input { display:flex; align-items:center; gap:8px; border:1px solid #DCE9E7; border-radius:10px; padding:8px 10px; }
.qz-option-input input[type=radio] { accent-color:#0B6E76; width:16px; height:16px; flex-shrink:0; }
.qz-option-text { border:none !important; outline:none; font-size:13px; flex:1; padding:2px !important; }
.qz-letter { width:26px; height:26px; border-radius:50%; background:#E7F6F4; color:#0B6E76; font-family:'Baloo 2',sans-serif; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qz-dash-grid { display:grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 900px) { .qz-dash-grid { grid-template-columns: 1fr 1fr; } }
.qz-row { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#F7FBFA; border-radius:10px; }
.qz-row-col { display:flex; flex-direction:column; gap:2px; padding:10px 12px; background:#F7FBFA; border-radius:10px; }
.qz-take-wrap { position:relative; min-height: 70vh; display:flex; align-items:center; justify-content:center; padding: 50px 16px; overflow:hidden; background: linear-gradient(160deg,#DFF6F1 0%, #9FE3D8 100%); }
.qz-dotpattern-light { background-image: radial-gradient(rgba(11,110,118,0.12) 1.5px, transparent 1.5px); background-size: 20px 20px; }
.qz-decor { position:absolute; font-size: 42px; opacity: 0.5; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.08)); animation: float 5s ease-in-out infinite; }
.qz-decor:nth-child(2) { animation-delay: 1s; }
.qz-decor:nth-child(3) { animation-delay: 2s; }
.qz-decor:nth-child(4) { animation-delay: 0.5s; }
@keyframes float { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-12px); } }
.qz-take-card { position:relative; z-index:2; background:#fff; border-radius:20px; padding: 28px; width:100%; max-width: 620px; box-shadow: 0 30px 60px -20px rgba(11,60,60,0.3); }
.qz-progress-track { height:8px; background:#EAF2F1; border-radius:999px; overflow:hidden; }
.qz-progress-fill { height:100%; background: linear-gradient(90deg,#0B6E76,#3FC7BC); transition: width .3s ease; }
.qz-option { display:flex; align-items:center; gap:12px; text-align:left; background:#F7FBFA; border:2px solid transparent; border-radius:12px; padding:13px 14px; font-size:14px; transition: border-color .15s, background .15s; }
.qz-option:hover { background:#EFF8F6; }
.qz-option-selected { border-color:#0B6E76; background:#E7F6F4; }
.qz-option-selected .qz-letter { background:#0B6E76; color:#fff; }
.qz-score-big { font-family:'Baloo 2',sans-serif; font-weight:800; font-size: 3rem; color:#0B6E76; }
.qz-review-row { background:#fff; border:1px solid #E0EFEC; border-radius:12px; padding:14px 16px; }
.qz-modal-backdrop { position:fixed; inset:0; background:rgba(11,60,60,0.5); display:flex; align-items:center; justify-content:center; z-index: 200; padding: 16px; }
.qz-modal { background:#fff; border-radius:16px; padding:26px; width:100%; max-width:420px; position:relative; }
.qz-modal-close { position:absolute; top:14px; right:14px; color:#8AA3A6; }
.qz-toast { background:#0B6E76; color:#fff; border:1px solid #1A8A8F; }
@keyframes toastin { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:translateY(0);} }
.qz-footer { background:#0B6E76; padding:24px 20px; display:flex; flex-direction:column; gap:6px; align-items:center; text-align:center; }
`;
