import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Demo Interactive Question State
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState(null);
  const [demoFeedback, setDemoFeedback] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch active topics
        const topicsResponse = await axios.get('/api/topics');
        // Filter out inactive if any
        const activeTopics = (topicsResponse.data || []).filter(t => t.active !== false);
        setTopics(activeTopics);

        // Fetch leaders
        const leadersResponse = await axios.get('/api/leaderboards');
        // Sort by score descending, then time taken ascending
        const sortedLeaders = (leadersResponse.data || [])
          .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
          .slice(0, 5);
        setLeaderboard(sortedLeaders);
      } catch (err) {
        console.error('Error loading home data:', err);
        setError('Failed to sync with BrainSnap network. Displaying simulated sectors.');
        // Fallbacks for excellent UX if server is pristine but empty
        setTopics([
          { _id: '1', name: 'Science', slug: 'science', description: 'Quantum physics, evolutionary leap points, and astronomical chemistry.', active: true },
          { _id: '2', name: 'History', slug: 'history', description: 'Empire collapses, tactical masterminds, and revolutionary catalysts.', active: true },
          { _id: '3', name: 'Pop Culture', slug: 'pop-culture', description: 'Retro arcade legacies, cult classics, and music synthesizer peaks.', active: true }
        ]);
        setLeaderboard([
          { _id: 'l1', username: 'NEURAL_RAIDER', score: 1000, timeTaken: 38, topicName: 'Science' },
          { _id: 'l2', username: 'CHIP_DAMAGE', score: 950, timeTaken: 42, topicName: 'Pop Culture' },
          { _id: 'l3', username: 'SYNAPSE_88', score: 900, timeTaken: 45, topicName: 'History' },
          { _id: 'l4', username: 'GLITCH_LORD', score: 850, timeTaken: 51, topicName: 'Science' },
          { _id: 'l5', username: 'HEX_HACKER', score: 800, timeTaken: 49, topicName: 'Pop Culture' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDemoClick = (index) => {
    setSelectedDemoAnswer(index);
    if (index === 1) {
      setDemoFeedback('⚡ DIRECT HIT! +100 PTS. Photon is correct. Your synapses are synchronized.');
    } else {
      setDemoFeedback('❌ CIRCUIT BREAKER! Incorrect. Photon acts as the quantum medium. Overload imminent.');
    }
  };

  const scrollToArenas = (e) => {
    e.preventDefault();
    const target = document.getElementById('arena-hub');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-wrapper scanline-overlay">
      
      {/* 1. CYBER-GRID HERO CANOPY */}
      <section className="hero">
        <img 
          className="hero-bg" 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600" 
          alt="Futuristic neon gaming hub" 
        />
        <div className="container hero-content-alignment">
          <span className="eyebrow glow-text-cyan">⚡ ONLINE // PORTAL ACTIVE</span>
          <h1>
            Your brain has 15 seconds. Make them <span className="gradient-text">count</span>.
          </h1>
          <p className="hero-subtitle">
            A high-velocity, cyber-arcade trivia platform where intellectual speed meets electric competition. Select a domain, override the timer, and claim your legendary high-score status.
          </p>
          <div className="hero-actions">
            <a href="#arena-hub" onClick={scrollToArenas} className="btn btn-primary">
              <span className="btn-glow-pulse"></span>
              Snap Into Action
            </a>
            <Link to="/results" className="btn btn-secondary">
              View Global Records
            </Link>
          </div>

          <div className="hero-status-strip">
            <div className="status-item">
              <span className="status-bullet active-pulse"></span>
              <span className="status-label">GLOBAL SERVERS:</span>
              <span className="status-value">OPTIMIZED</span>
            </div>
            <div className="status-item">
              <span className="status-label">ACTIVE MIND-LINKS:</span>
              <span className="status-value text-primary">14,208</span>
            </div>
            <div className="status-item">
              <span className="status-label">AVERAGE SYNAPTIC SPEED:</span>
              <span className="status-value text-secondary">1.82 SECS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE ARENA HUB (Topic Selector) */}
      <section id="arena-hub" className="section arena-selector-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">CHOOSE YOUR BATTLEGROUND</span>
            <h2>Select a Domain and <span className="gradient-text">Start the Clock</span></h2>
            <p className="section-subtitle">
              Every category is loaded with rapid-fire questions. You will have exactly 15 seconds per node. Stay sharp, or get phased out.
            </p>
          </div>

          {loading ? (
            <div className="skeleton-grid grid-3">
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
            </div>
          ) : (
            <div className="grid grid-3">
              {topics.map((topic, index) => {
                // Generate a reliable decorative image based on index/slug
                const images = [
                  "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600"
                ];
                const cardImg = images[index % images.length];

                return (
                  <div key={topic._id || topic.slug} className="card glassmorphic-card interactive-hover">
                    <div className="card-image-wrapper">
                      <img src={cardImg} alt={topic.name} className="card-bg-image" />
                      <div className="category-tag-pill">{topic.name}</div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{topic.name}</h3>
                      <p className="card-description text-muted">
                        {topic.description || "Synthesizing rapid queries to challenge your brain cells."}
                      </p>
                      
                      <div className="card-meta-details">
                        <div className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          <span>15s Timer per node</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">🔥</span>
                          <span>10 Queries</span>
                        </div>
                      </div>

                      <Link to={`/quiz/${topic.slug}`} className="btn btn-primary btn-full-width">
                        <span className="btn-glow-pulse"></span>
                        LAUNCH COGNITIVE LINK
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. DYNAMIC INTERACTIVE PREVIEW COMPONENT */}
      <section className="section live-simulation-arena">
        <div className="container">
          <div className="feature-split">
            <div className="split-text">
              <span className="eyebrow glow-text-pink">SIMULATION DECK</span>
              <h2>Experience the <span className="gradient-text">Speed-Run</span></h2>
              <p>
                This is not your average slow-paced test. Under pressure, options glow, the countdown shrinks like a laser, and instant feedback burns into your memory banks.
              </p>
              
              <div className="countdown-laser-bar-container">
                <div className="countdown-laser-label">
                  <span>ACTIVE FUSION TIMER</span>
                  <span className="pulsing-seconds">04.12s</span>
                </div>
                <div className="countdown-laser-bar-outer">
                  <div className="countdown-laser-bar-fill animated-shrink-demo"></div>
                </div>
              </div>

              <div className="tactile-bullets">
                <div className="bullet-point">
                  <span className="bullet-indicator">✓</span>
                  <div>
                    <strong>Instant Response Feed:</strong> Every fraction of a second you save translates directly to premium multiplier points.
                  </div>
                </div>
                <div className="bullet-point">
                  <span className="bullet-indicator">✓</span>
                  <div>
                    <strong>Anti-Cheat Shield:</strong> Active window defocus checks ensure a pristine competitive ground.
                  </div>
                </div>
              </div>
            </div>

            <div className="split-visual">
              <div className="arcade-display-panel">
                <div className="arcade-hud-header">
                  <span className="hud-metric-label">MOCK SECTOR: QUANTUM</span>
                  <span className="hud-score-tally">MULTIPLIER: x2.5</span>
                </div>

                <div className="arcade-question-window">
                  <p className="arcade-query-prompt">
                    Which elementary particle acts as the quantum medium for the electromagnetic force?
                  </p>
                </div>

                <div className="arcade-answers-grid">
                  {[
                    { label: 'A) Gluon', index: 0 },
                    { label: 'B) Photon', index: 1 },
                    { label: 'C) Higgs Boson', index: 2 },
                    { label: 'D) Z Boson', index: 3 }
                  ].map((answer) => {
                    let btnClass = "arcade-answer-btn";
                    if (selectedDemoAnswer !== null) {
                      if (answer.index === 1) {
                        btnClass += " answer-success";
                      } else if (selectedDemoAnswer === answer.index) {
                        btnClass += " answer-failure";
                      } else {
                        btnClass += " answer-disabled";
                      }
                    }
                    return (
                      <button 
                        key={answer.index} 
                        onClick={() => handleDemoClick(answer.index)}
                        disabled={selectedDemoAnswer !== null}
                        className={btnClass}
                      >
                        {answer.label}
                      </button>
                    );
                  })}
                </div>

                {demoFeedback && (
                  <div className="alert alert-info demo-feedback-alert">
                    <p>{demoFeedback}</p>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => { setSelectedDemoAnswer(null); setDemoFeedback(''); }}
                      style={{ marginTop: '10px' }}
                    >
                      🔄 Reset Simulation Node
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE TERMINAL LEDGER (Leaderboard) */}
      <section className="section daily-champions-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">THE HALL OF SYNAPSES</span>
            <h2>Today's Undisputed <span className="gradient-text">Apex Competitors</span></h2>
            <p className="section-subtitle">
              The high-score ledger doesn't lie. Only those with absolute neural precision and flawless speed-running skills survive here.
            </p>
          </div>

          <div className="leaderboard-table-container glassmorphic-card">
            <div className="table-header-strip">
              <span className="col-rank">RANK</span>
              <span className="col-player">CHALLENGER</span>
              <span className="col-domain">DOMAIN ACTIVE</span>
              <span className="col-time">TIME TAKEN</span>
              <span className="col-score">FINAL SCORE</span>
            </div>

            <div className="leaderboard-rows-group">
              {leaderboard.length === 0 ? (
                <div className="empty-leaderboard-fallback">
                  <p className="text-muted">No cognitive scores reported yet. Be the first to claim a domain!</p>
                </div>
              ) : (
                leaderboard.map((player, idx) => {
                  let badge = null;
                  if (idx === 0) badge = "🥇";
                  else if (idx === 1) badge = "🥈";
                  else if (idx === 2) badge = "🥉";

                  return (
                    <div key={player._id || idx} className="leaderboard-row-item">
                      <div className="col-rank">
                        {badge ? <span className="rank-badge">{badge}</span> : <span className="rank-number">{idx + 1}</span>}
                      </div>
                      <div className="col-player font-space-grotesk">
                        <span className="player-avatar-symbol">⚡</span>
                        {player.username || "ANONYMOUS_MIND"}
                      </div>
                      <div className="col-domain">
                        <span className="pill pill-category">{player.topicName || "General Matrix"}</span>
                      </div>
                      <div className="col-time font-space-grotesk text-accent">
                        {player.timeTaken ? `${player.timeTaken}s` : 'N/A'}
                      </div>
                      <div className="col-score font-space-grotesk glow-text-cyan">
                        {player.score || 0} PTS
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="leaderboard-action-footer text-center">
            <p className="text-muted">Want to challenge their authority? Launch a sector above and record your high score.</p>
          </div>
        </div>
      </section>

      {/* 5. MECHANICS BREAKDOWNS (How It Works) */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">TRANSMISSION OVERVIEW</span>
            <h2>How to Navigate the <span className="gradient-text">Synapse Grid</span></h2>
            <p className="section-subtitle">
              Three simple protocols separate the system lords from the disconnected. Review your neural instructions:
            </p>
          </div>

          <div className="step-row">
            <div className="step card glassmorphic-card">
              <span className="step-num">01</span>
              <h3 className="font-space-grotesk">Infiltrate the Sector</h3>
              <p className="text-muted">
                Select your designated cognitive theme from the Arena Hub. Science, History, or Pop Culture await your command.
              </p>
            </div>

            <div className="step card glassmorphic-card">
              <span className="step-num">02</span>
              <h3 className="font-space-grotesk">Outrun the Laser Countdown</h3>
              <p className="text-muted">
                You have exactly 15 seconds per query. The faster your response confirmation, the higher your dynamic multiplier score.
              </p>
            </div>

            <div className="step card glassmorphic-card">
              <span className="step-num">03</span>
              <h3 className="font-space-grotesk">Anchor the Leaderboard</h3>
              <p className="text-muted">
                Submit your credentials post-run. Your score is securely integrated into the active daily global database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. IMMERSIVE GALLERY/SHOWCASE OF THE RETRO FUTURE */}
      <section className="section gallery-showcase-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow font-space-grotesk">RETRO VAPOR ATMOSPHERE</span>
            <h2>Synchronize with the <span className="gradient-text">Vibe</span></h2>
            <p className="section-subtitle">
              Step into high-energy physical spaces where adrenaline and knowledge merge.
            </p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600" alt="Neon glowing game zone" />
              <div className="gallery-item-overlay">
                <span className="gallery-tag">0x01 DECK SETUP</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1548685913-fe6578586b50?auto=format&fit=crop&q=80&w=600" alt="Arcade cabinet glows" />
              <div className="gallery-item-overlay">
                <span className="gallery-tag">0x02 ARCADE CORES</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600" alt="Futuristic electronics setup" />
              <div className="gallery-item-overlay">
                <span className="gallery-tag">0x03 ANALOG SYNTHS</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600" alt="Esports champion huddle" />
              <div className="gallery-item-overlay">
                <span className="gallery-tag">0x04 PRO LEAGUE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ARCADE CALL-TO-ACTION FOOTER BANNER */}
      <section className="container cta-section-wrapper">
        <div className="cta-section text-center glassmorphic-card">
          <span className="eyebrow glow-text-pink">SYSTEM CHALLENGE PROTOCOL</span>
          <h2 className="font-space-grotesk">Think you're fast enough? Prove it in the live arena.</h2>
          <p className="cta-paragraph text-muted">
            There is zero filler here. Pure trivia adrenaline. Click below to begin your first rapid sequence session immediately.
          </p>
          <div className="cta-button-row">
            <a href="#arena-hub" onClick={scrollToArenas} className="btn btn-primary btn-lg">
              <span className="btn-glow-pulse"></span>
              Claim Your Domain
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}