import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  // Lists from DB
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active section tab: 'questions' or 'topics'
  const [activeTab, setActiveTab] = useState('questions');

  // Question Form State
  const [qPrompt, setQPrompt] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState(false);

  // Topic Form State
  const [tName, setTName] = useState('');
  const [tSlug, setTSlug] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tActive, setTActive] = useState(true);
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [topicSuccess, setTopicSuccess] = useState(false);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [topicsRes, questionsRes] = await Promise.all([
        axios.get('/api/topics'),
        axios.get('/api/questions')
      ]);
      setTopics(topicsRes.data || []);
      setQuestions(questionsRes.data || []);
    } catch (err) {
      console.error('Failed to pull registry telemetry:', err);
      setError('System connection failure. Failed to read active node data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Question Creation
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qTopicId || !qPrompt || !qOptA || !qOptB || !qOptC || !qOptD) {
      setError('Telemetry incomplete: All question fields must be populated.');
      return;
    }

    setSubmittingQuestion(true);
    setError('');
    const optionsArray = [qOptA, qOptB, qOptC, qOptD];

    try {
      await axios.post('/api/questions', {
        topicId: qTopicId,
        prompt: qPrompt,
        options: optionsArray.join('|||'), // Store array as string to match simple String field schema
        correctAnswer: Number(qCorrect)
      });
      setQuestionSuccess(true);
      setQPrompt('');
      setQOptA('');
      setQOptB('');
      setQOptC('');
      setQOptD('');
      setQCorrect(0);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to inject question node into DB.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Handle Topic Creation
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!tName || !tSlug || !tDesc) {
      setError('Telemetry incomplete: All topic fields must be populated.');
      return;
    }

    setSubmittingTopic(true);
    setError('');

    try {
      await axios.post('/api/topics', {
        name: tName,
        slug: tSlug.toLowerCase().replace(/\s+/g, '-'),
        description: tDesc,
        active: tActive
      });
      setTopicSuccess(true);
      setTName('');
      setTSlug('');
      setTDesc('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to inject topic node into DB.');
    } finally {
      setSubmittingTopic(false);
    }
  };

  // Handle Seed / Reset Database
  const [seeding, setSeeding] = useState(false);
  const handleResetSeed = async () => {
    if (!window.confirm('WARNING: This will purge and seed default cyber trivia nodes. Proceed?')) return;
    setSeeding(true);
    try {
      // Create Default Science, History, Pop Culture topics & sample questions
      // Purge old first
      for (const t of topics) {
        await axios.delete(`/api/topics/${t._id}`);
      }
      for (const q of questions) {
        await axios.delete(`/api/questions/${q._id}`);
      }

      // 1. Science Topic
      const sciRes = await axios.post('/api/topics', {
        name: "Quantum Science",
        slug: "science",
        description: "Decipher particles, elemental waves, and deep space physics under hot pressure.",
        active: true
      });

      // 2. History Topic
      const histRes = await axios.post('/api/topics', {
        name: "Lost History",
        slug: "history",
        description: "Test your temporal speed on ancient empires, cold wars, and forgotten treaties.",
        active: true
      });

      // 3. Pop Culture Topic
      const popRes = await axios.post('/api/topics', {
        name: "Pop Culture",
        slug: "pop-culture",
        description: "Blast through music, retro gaming arcade milestones, and cult classic media.",
        active: true
      });

      const sciId = sciRes.data._id;
      const histId = histRes.data._id;
      const popId = popRes.data._id;

      // Seed Questions
      const questionsData = [
        // Science
        { topicId: sciId, prompt: "Which elementary particle acts as the quantum medium for the electromagnetic force?", options: "Gluon|||Photon|||Higgs Boson|||Z Boson", correctAnswer: 1 },
        { topicId: sciId, prompt: "What is the approximate speed of light in a vacuum?", options: "150,000 km/s|||299,792 km/s|||450,000 km/s|||1,080,000 km/s", correctAnswer: 1 },
        { topicId: sciId, prompt: "Which noble gas has the lowest boiling point of any element on Earth?", options: "Argon|||Neon|||Helium|||Radon", correctAnswer: 2 },
        { topicId: sciId, prompt: "What is the absolute temperature value of Absolute Zero?", options: "-273.15°C|||0°C|||-150°C|||-459°C", correctAnswer: 0 },
        // History
        { topicId: histId, prompt: "In which year did the legendary Western Roman Empire officially collapse?", options: "312 AD|||476 AD|||1066 AD|||1453 AD", correctAnswer: 1 },
        { topicId: histId, prompt: "Who was the first official Emperor of the Roman Empire?", options: "Julius Caesar|||Marcus Aurelius|||Nero|||Augustus", correctAnswer: 3 },
        { topicId: histId, prompt: "The Treaty of Versailles in 1919 officially concluded which major global conflict?", options: "World War I|||World War II|||The Napoleonic Wars|||The Seven Years' War", correctAnswer: 0 },
        // Pop Culture
        { topicId: popId, prompt: "What year did the original Arcade classic Pac-Man debut in North America?", options: "1978|||1980|||1982|||1985", correctAnswer: 1 },
        { topicId: popId, prompt: "Which futuristic Sci-Fi movie features the sinister AI mainframe known as 'HAL 9000'?", options: "Blade Runner|||Alien|||2001: A Space Odyssey|||The Matrix", correctAnswer: 2 },
        { topicId: popId, prompt: "Which electronic synthesizer band released the iconic cyber-track 'Blue Monday'?", options: "Depeche Mode|||New Order|||Kraftwerk|||The Cure", correctAnswer: 1 }
      ];

      for (const q of questionsData) {
        await axios.post('/api/questions', q);
      }

      alert('Database Synapses successfully reset & seeded!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to reset & seed database.');
    } finally {
      setSeeding(false);
    }
  };

  // Quick deletion handles
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`/api/questions/${id}`);
      fetchData();
    } catch (err) {
      setError('Could not delete question.');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Deleting this topic will leave orphaned questions. Proceed?')) return;
    try {
      await axios.delete(`/api/topics/${id}`);
      fetchData();
    } catch (err) {
      setError('Could not delete topic.');
    }
  };

  return (
    <div className="admin-page scanline-telemetry-overlay" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Dynamic scanline backdrop effect integrated */}
      <div className="cyber-grid-overlay"></div>

      {/* COMPACT HERO */}
      <section className="hero" style={{ padding: '40px 0 20px 0', minHeight: 'auto', background: 'none' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>⚡ CORE TERMINAL</span>
          <h1 style={{ margin: '10px 0' }}>CURATOR’S <span className="gradient-text">TERMINAL</span></h1>
          <p className="hero-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            System configuration console. Manage questions, forge new topics, and deploy high-speed brain teasers instantly.
          </p>
        </div>
      </section>

      {/* SECTION 1: SYSTEM TELEMETRY */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="grid grid-3">
            <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{topics.length}</div>
              <div className="stat-label">ACTIVE SECORS / TOPICS</div>
            </div>
            <div className="card" style={{ borderLeft: '3px solid var(--secondary)' }}>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>{questions.length}</div>
              <div className="stat-label">TOTAL INDEXED QUERIES</div>
            </div>
            <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>15s</div>
              <div className="stat-label">DEFAULT COUNTDOWN TICKER</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'rgba(21, 25, 30, 0.9)', borderColor: 'var(--border)' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>🚨 SYSTEM RECOVERY SEED</h3>
              <p style={{ margin: '5px 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Restore the default BrainSnap database with pre-configured high-velocity categories and questions.
              </p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={handleResetSeed} 
              disabled={seeding}
              style={{ boxShadow: '0 0 15px rgba(255, 46, 147, 0.3)' }}
            >
              {seeding ? 'PURGING & SEEDING...' : '⚡ RE-SEED DATA'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: DUAL CREATOR DRAWER */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>The Node <span className="gradient-text">Architect</span></h2>
            <p>Inject new pathways into the global mainframe. Ensure accurate answers and valid formatting.</p>
          </div>

          <div className="grid grid-2">
            {/* Create Question Panel */}
            <div className="card" style={{ background: 'rgba(21, 25, 30, 0.85)' }}>
              <div className="badge" style={{ backgroundColor: 'var(--primary)', color: '#000', fontWeight: 'bold', marginBottom: '15px' }}>NEW QUERY FORM</div>
              <h3 style={{ marginBottom: '20px' }}>Draft New Query Node</h3>

              {questionSuccess ? (
                <div className="alert alert-success" style={{ padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#00ff66', margin: '0 0 5px 0' }}>✓ Query Node Comitted!</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>The question has been pushed to the active database register.</p>
                  <button className="btn btn-ghost" style={{ marginTop: '15px', fontSize: '0.8rem' }} onClick={() => setQuestionSuccess(false)}>Draft Another</button>
                </div>
              ) : (
                <form onSubmit={handleCreateQuestion}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>SELECT THEME / SECTOR *</label>
                    <select 
                      value={qTopicId} 
                      onChange={(e) => setQTopicId(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                      required
                    >
                      <option value="">-- Choose Target Sector --</option>
                      {topics.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>QUESTION PROMPT *</label>
                    <textarea 
                      value={qPrompt} 
                      onChange={(e) => setQPrompt(e.target.value)}
                      placeholder="e.g. Which elementary particle acts as the quantum medium for electromagnetic force?"
                      rows="2"
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div className="grid grid-2" style={{ gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--muted)' }}>OPTION A *</label>
                      <input 
                        type="text" 
                        value={qOptA} 
                        onChange={(e) => setQOptA(e.target.value)} 
                        placeholder="Option A" 
                        style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--muted)' }}>OPTION B *</label>
                      <input 
                        type="text" 
                        value={qOptB} 
                        onChange={(e) => setQOptB(e.target.value)} 
                        placeholder="Option B" 
                        style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--muted)' }}>OPTION C *</label>
                      <input 
                        type="text" 
                        value={qOptC} 
                        onChange={(e) => setQOptC(e.target.value)} 
                        placeholder="Option C" 
                        style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--muted)' }}>OPTION D *</label>
                      <input 
                        type="text" 
                        value={qOptD} 
                        onChange={(e) => setQOptD(e.target.value)} 
                        placeholder="Option D" 
                        style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>CORRECT CHANNELS ANSWER *</label>
                    <select 
                      value={qCorrect} 
                      onChange={(e) => setQCorrect(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                    >
                      <option value={0}>Option A (First index)</option>
                      <option value={1}>Option B (Second index)</option>
                      <option value={2}>Option C (Third index)</option>
                      <option value={3}>Option D (Fourth index)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingQuestion}>
                    {submittingQuestion ? 'FORGING NODE...' : '⚡ COMMIT QUERY TO DATABASE'}
                  </button>
                </form>
              )}
            </div>

            {/* Create Topic Panel */}
            <div className="card" style={{ background: 'rgba(21, 25, 30, 0.85)' }}>
              <div className="badge" style={{ backgroundColor: 'var(--secondary)', color: '#fff', fontWeight: 'bold', marginBottom: '15px' }}>THEME CONFIG</div>
              <h3 style={{ marginBottom: '20px' }}>Draft New Sector Theme</h3>

              {topicSuccess ? (
                <div className="alert alert-success" style={{ padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#00ff66', margin: '0 0 5px 0' }}>✓ Sector Theme Activated!</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>The new category is now online for the public arena selection.</p>
                  <button className="btn btn-ghost" style={{ marginTop: '15px', fontSize: '0.8rem' }} onClick={() => setTopicSuccess(false)}>Draft Another</button>
                </div>
              ) : (
                <form onSubmit={handleCreateTopic}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>THEME NAME *</label>
                    <input 
                      type="text" 
                      value={tName} 
                      onChange={(e) => {
                        setTName(e.target.value);
                        setTSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      placeholder="e.g. Retro Arcade Classics"
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>URL SLUG (AUTO-GENERATED) *</label>
                    <input 
                      type="text" 
                      value={tSlug} 
                      onChange={(e) => setTSlug(e.target.value)}
                      placeholder="e.g. retro-arcade"
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>DESCRIPTION / SUBTEXT *</label>
                    <textarea 
                      value={tDesc} 
                      onChange={(e) => setTDesc(e.target.value)}
                      placeholder="Brief flashy overview hook for the selector hub..."
                      rows="3"
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="tActive" 
                      checked={tActive} 
                      onChange={(e) => setTActive(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="tActive" style={{ color: 'var(--text)', cursor: 'pointer' }}>Set active and live on home selector instantly</label>
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={submittingTopic}>
                    {submittingTopic ? 'DEPLOYING SECTOR...' : '🚀 DEPLOY ACTIVE SECTOR'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '20px', padding: '15px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: LIVE REGISTRY VIEW */}
      <section className="section" style={{ background: 'rgba(13, 15, 18, 0.4)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Database <span className="gradient-text">Query Register</span></h2>
            <p>Direct view into the system's live memory blocks. Edit state, or prune corrupted datasets.</p>
          </div>

          <div className="filter-bar" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
            <button 
              className={`filter-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              📖 INDEXED QUESTIONS ({questions.length})
            </button>
            <button 
              className={`filter-btn ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              🏷️ SECTOR CATEGORIES ({topics.length})
            </button>
          </div>

          {loading ? (
            <div className="skeleton-grid" style={{ display: 'grid', gap: '15px' }}>
              <div className="skeleton skeleton-card" style={{ height: '80px' }}></div>
              <div className="skeleton skeleton-card" style={{ height: '80px' }}></div>
              <div className="skeleton skeleton-card" style={{ height: '80px' }}></div>
            </div>
          ) : activeTab === 'questions' ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {questions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--muted)' }}>No questions found. Use the form above or Click [RE-SEED DATA] above to inject default ones.</p>
                </div>
              ) : (
                questions.map((q) => {
                  const categoryName = topics.find(t => t._id === q.topicId)?.name || 'Unknown Sector';
                  // Parse string representation of options
                  const parsedOptions = typeof q.options === 'string' ? q.options.split('|||') : q.options;

                  return (
                    <div key={q._id} className="card" style={{ borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <span className="pill" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)', marginBottom: '8px', fontSize: '0.75rem' }}>
                          SECTOR: {categoryName}
                        </span>
                        <h4 style={{ margin: '8px 0', fontSize: '1.1rem', color: '#fff' }}>{q.prompt}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '10px' }}>
                          {parsedOptions?.map((opt, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                padding: '6px 10px', 
                                background: idx === q.correctAnswer ? 'rgba(0, 240, 255, 0.15)' : 'var(--surface-2)', 
                                border: idx === q.correctAnswer ? '1px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: idx === q.correctAnswer ? 'var(--primary)' : 'var(--muted)'
                              }}
                            >
                              {idx === q.correctAnswer ? '✓ ' : ''}{opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleDeleteQuestion(q._id)}
                        style={{ color: 'var(--secondary)', padding: '5px 10px', fontSize: '0.85rem' }}
                      >
                        PRUNE
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {topics.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--muted)' }}>No theme sectors registered yet.</p>
                </div>
              ) : (
                topics.map((t) => (
                  <div key={t._id} className="card" style={{ borderLeft: '3px solid var(--secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0 }}>{t.name}</h3>
                        <span className="pill" style={{ backgroundColor: t.active ? 'rgba(0, 240, 255, 0.15)' : 'var(--surface-2)', color: t.active ? 'var(--primary)' : 'var(--muted)', fontSize: '0.75rem' }}>
                          {t.active ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{t.description}</p>
                      <small style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Slug Reference: <code>/quiz/{t.slug}</code></small>
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => handleDeleteTopic(t._id)}
                      style={{ color: 'var(--secondary)', padding: '5px 10px', fontSize: '0.85rem' }}
                    >
                      REMOVE SECTOR
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}