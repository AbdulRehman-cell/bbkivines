import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to retrieve stats from location state or fallback to local storage
  const [stats, setStats] = useState(() => {
    if (location.state?.score !== undefined) {
      // Save to localStorage in case of refresh
      const s = {
        score: location.state.score,
        totalQuestions: location.state.totalQuestions || 10,
        timeTaken: location.state.timeTaken || 0,
        topicName: location.state.topicName || 'General Practice',
        topicSlug: location.state.topicSlug || '',
        answersLog: location.state.answersLog || []
      };
      localStorage.setItem('latest_brainsnap_result', JSON.stringify(s));
      return s;
    }
    const saved = localStorage.getItem('latest_brainsnap_result');
    return saved ? JSON.parse(saved) : {
      score: 0,
      totalQuestions: 10,
      timeTaken: 0,
      topicName: 'Science Sector',
      topicSlug: '',
      answersLog: []
    };
  });

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [topScores, setTopScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);

  // Compute stats
  const correctCount = stats.answersLog?.filter(log => log.isCorrect)?.length ?? 0;
  const accuracyPercent = stats.totalQuestions > 0 ? Math.round((correctCount / stats.totalQuestions) * 100) : 0;

  // Determine Neural Designation
  let evaluationTitle = "CIRCUIT BREAKER";
  let evaluationClass = "text-accent";
  let evalDescription = "Solid intellectual performance. You have stable neural networks, but speed up your processors to beat the masterminds.";
  if (accuracyPercent >= 90) {
    evaluationTitle = "NEURAL OVERLORD";
    evaluationClass = "gradient-text";
    evalDescription = "Flawless cognitive execution. You calculated equations, recalled facts, and navigated time dilation like a seasoned arcade champion.";
  } else if (accuracyPercent < 50) {
    evaluationTitle = "SYSTEM CRASH";
    evaluationClass = "text-secondary";
    evalDescription = "Thermal breakdown in the brain core. Sync your memory modules, read up on the topics, and attempt a clean reboot.";
  }

  // Fetch top leaderboard entries for this topic to show competitive parity
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setScoresLoading(true);
        const response = await axios.get('/api/leaderboards');
        // Sort by score descending, then time taken ascending
        const data = response.data || [];
        const sorted = data.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
        setTopScores(sorted.slice(0, 5));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setScoresLoading(false);
      }
    };
    fetchLeaderboard();
  }, [success]);

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('You must input an operator alias to sync score.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/leaderboards', {
        username: username.trim(),
        score: stats.score,
        timeTaken: stats.timeTaken,
        topicName: stats.topicName,
        date: new Date()
      });
      setSuccess(true);
      setUsername('');
    } catch (err) {
      console.error(err);
      setError('Critical telemetry drop: Failed to commit score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="results-page container" style={{ paddingBottom: '80px' }}>
      
      {/* Scanline telemetry overlay styling simulated inside this frame */}
      <div className="scanline-overlay"></div>

      {/* Hero Canopy Banner */}
      <section className="hero" style={{ padding: '3rem 0 2rem 0', minHeight: 'auto', marginBottom: '2rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>[ SESSION DEBRIEF COMPLETE ]</span>
          <h1 style={{ margin: '10px 0' }}>
            System <span className={evaluationClass}>{evaluationTitle}</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
            {evalDescription}
          </p>
        </div>
      </section>

      <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
        {/* Metric block 1 */}
        <div className="card text-center" style={{ border: '1.5px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }}></div>
          <span className="eyebrow" style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>SYNAPTIC SCORE</span>
          <h2 className="stat-value" style={{ color: 'var(--primary)', fontSize: '3rem', margin: '10px 0' }}>
            {stats.score} <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>PTS</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
            Estimated peak velocity performance
          </p>
        </div>

        {/* Metric block 2 */}
        <div className="card text-center" style={{ border: '1.5px solid var(--secondary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--secondary)' }}></div>
          <span className="eyebrow" style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>SYSTEM ACCURACY</span>
          <h2 className="stat-value" style={{ color: 'var(--secondary)', fontSize: '3rem', margin: '10px 0' }}>
            {accuracyPercent}%
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
            {correctCount} correct out of {stats.totalQuestions} questions
          </p>
        </div>

        {/* Metric block 3 */}
        <div className="card text-center" style={{ border: '1.5px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent)' }}></div>
          <span className="eyebrow" style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>TOTAL TIMER LOG</span>
          <h2 className="stat-value" style={{ color: 'var(--accent)', fontSize: '3rem', margin: '10px 0' }}>
            {stats.timeTaken}s
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
            Average of {stats.timeTaken ? (stats.timeTaken / (stats.totalQuestions || 10)).toFixed(1) : 0}s per prompt
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '32px', alignItems: 'start' }}>
        
        {/* Left column: Score Syncing & Control Board */}
        <div>
          <section className="section" style={{ padding: '24px', background: 'rgba(21, 25, 30, 0.8)', border: '1.5px solid var(--border)', borderRadius: '8px', marginBottom: '24px' }}>
            <span className="eyebrow" style={{ color: 'var(--primary)' }}>LEDGER REGISTRY</span>
            <h3 style={{ marginTop: '5px', marginBottom: '15px' }}>Sync Your Score to Ledger</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '20px' }}>
              Broadcast your cognitive prowess to other cyber-intellects on the global network. Enter your operator handle to instantly lock in your result.
            </p>

            {success ? (
              <div className="alert alert-success" style={{ padding: '20px', borderRadius: '4px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ color: '#10b981', margin: '0 0 10px 0' }}>✓ INTELLECT SYNCED SUCCESSFULLY</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Your score of <strong>{stats.score} pts</strong> has been written to the master terminal. Check the leaderboard below to review your position.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScoreSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Operator Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEURAL_GLITCH_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    maxLength={20}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginBottom: '15px', color: 'var(--secondary)' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {loading ? 'TRANSMITTING TELEMETRY...' : 'COMMIT TO LEDGER'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
              {stats.topicSlug ? (
                <Link to={`/quiz/${stats.topicSlug}`} className="btn btn-secondary" style={{ flex: '1', textAlign: 'center' }}>
                  RE-ENTER ARENA
                </Link>
              ) : (
                <Link to="/" className="btn btn-secondary" style={{ flex: '1', textAlign: 'center' }}>
                  CHOOSE NEW ARENA
                </Link>
              )}
              <Link to="/" className="btn btn-ghost" style={{ flex: '1', textAlign: 'center', border: '1px solid var(--border)' }}>
                RETURN TO BASE
              </Link>
            </div>
          </section>

          {/* Leaderboard panel preview */}
          <section className="section" style={{ padding: '24px', background: 'rgba(21, 25, 30, 0.8)', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>COMMUNITY STANDINGS</span>
            <h3 style={{ marginTop: '5px', marginBottom: '15px' }}>Top Synaptic Operators</h3>

            {scoresLoading ? (
              <div className="skeleton-text" style={{ height: '150px' }}>Loading real-time database standings...</div>
            ) : topScores.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No registered score runs found. Be the first to commit a record!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topScores.map((leader, index) => {
                  let badge = "👾";
                  if (index === 0) badge = "🥇";
                  if (index === 1) badge = "🥈";
                  if (index === 2) badge = "🥉";

                  return (
                    <div 
                      key={leader._id || index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{badge}</span>
                        <div>
                          <strong style={{ color: 'var(--text)' }}>{leader.username}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {leader.topicName || 'General Arena'}
                          </span>
                        </div>
                      </div>
                      <div style={{ text_align: 'right' }}>
                        <strong style={{ color: 'var(--primary)', display: 'block' }}>{leader.score} PTS</strong>
                        <small style={{ color: 'var(--muted)' }}>{leader.timeTaken}s</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Interactive Synaptic Mapping (Review Ledger) */}
        <div>
          <section className="section" style={{ padding: '24px', background: 'rgba(21, 25, 30, 0.8)', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>SYNAPTIC MAPPING</span>
            <h3 style={{ marginTop: '5px', marginBottom: '5px' }}>Query Node Analysis</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '20px' }}>
              Review your tactical options against correct system database variables.
            </p>

            {stats.answersLog && stats.answersLog.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats.answersLog.map((log, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '16px', 
                      background: 'var(--surface-2)', 
                      borderRadius: '6px', 
                      borderLeft: `4px solid ${log.isCorrect ? 'var(--primary)' : 'var(--secondary)'}` 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="eyebrow" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        NODE 0{index + 1}
                      </span>
                      <span className="tag" style={{ 
                        background: log.isCorrect ? 'rgba(0,240,255,0.1)' : 'rgba(255,46,147,0.1)',
                        color: log.isCorrect ? 'var(--primary)' : 'var(--secondary)',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {log.isCorrect ? 'VERIFIED' : 'FAILED'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 500 }}>{log.questionPrompt}</p>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ color: log.isCorrect ? 'var(--primary)' : 'var(--muted)' }}>
                        <strong>Your choice:</strong> {log.userSelection || 'No Answer (Timeout)'}
                      </div>
                      {!log.isCorrect && (
                        <div style={{ color: 'var(--accent)', marginTop: '4px' }}>
                          <strong>Correct:</strong> {log.correctAnswerText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center" style={{ padding: '40px 20px', border: '1.5px dashed var(--border)' }}>
                <p style={{ color: 'var(--muted)', margin: 0 }}>
                  No question-by-question telemetry was recorded for this session. Complete a standard arena run to map your synapses.
                </p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '15px' }}>
                  LAUNCH ARENA
                </Link>
              </div>
            )}
          </section>
        </div>

      </div>

    </div>
  );
}