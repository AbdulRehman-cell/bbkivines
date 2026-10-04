import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function QuizArena() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();

  // Component States
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [startTime, setStartTime] = useState(null);
  const [answersLog, setAnswersLog] = useState([]); // tracks correct/incorrect details
  
  // App system states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio/Beats feedback simulation state (tactile retro visual cues)
  const [soundFeedback, setSoundFeedback] = useState('SYSTEM READY');
  const timerRef = useRef(null);

  // Fetch Topic and related Questions
  useEffect(() => {
    let active = true;
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');
        
        // Fetch topics to match the slug
        const topicsRes = await axios.get('/api/topics');
        const matchedTopic = topicsRes.data.find(t => t.slug === topicSlug || t._id === topicSlug);
        
        if (!matchedTopic) {
          throw new Error('Requested cyber sector could not be routed.');
        }

        if (active) {
          setTopic(matchedTopic);
        }

        // Fetch questions for this topic
        const questionsRes = await axios.get('/api/questions');
        const filteredQuestions = questionsRes.data.filter(q => q.topicId === matchedTopic._id);
        
        if (filteredQuestions.length === 0) {
          throw new Error('This sector currently lacks query nodes. Please populate it in the terminal.');
        }

        // Shuffle or limit to 10 questions for maximum intensity
        const selectedQuestions = filteredQuestions.slice(0, 10);

        if (active) {
          setQuestions(selectedQuestions);
          setStartTime(Date.now());
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setErrorMsg(err.message || 'Failed to load high-velocity quiz node data.');
          setIsLoading(false);
        }
      }
    };

    fetchQuizData();
    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [topicSlug]);

  // Handle countdown timer
  useEffect(() => {
    if (isLoading || questions.length === 0 || hasAnswered) return;

    setTimer(15);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isLoading, questions, hasAnswered]);

  // Handle user taking too long
  const handleTimeOut = () => {
    setSelectedOption(-1); // special indicator for skipped/timed out
    setHasAnswered(true);
    setSoundFeedback('⚠️ SYNAPSE LOCKOUT - TIME EXPIRED');
    
    const currentQuestion = questions[currentIndex];
    setAnswersLog(prev => [
      ...prev,
      {
        questionPrompt: currentQuestion.prompt,
        userSelection: 'TIME_EXPIRED',
        correctAnswerText: currentQuestion.options ? currentQuestion.options[currentQuestion.correctAnswer] : 'Unknown',
        isCorrect: false
      }
    ]);
  };

  // User click on option
  const handleOptionSelect = (optionIndex) => {
    if (hasAnswered) return; // Prevent double answering

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(optionIndex);
    setHasAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    let addedPoints = 0;
    if (isCorrect) {
      // Speed multiplier bonus: faster answers earn more
      addedPoints = Math.round(100 + (timer * 6.6));
      setScore(prev => prev + addedPoints);
      setSoundFeedback(`✨ CONNECTED! +${addedPoints} PTS`);
    } else {
      setSoundFeedback('💥 SYSTEM ERROR - INACCURATE FREQUENCY');
    }

    // Convert options text cleanly
    let rawOptions = [];
    if (typeof currentQuestion.options === 'string') {
      try {
        rawOptions = JSON.parse(currentQuestion.options);
      } catch (e) {
        rawOptions = currentQuestion.options.split(',').map(o => o.trim());
      }
    } else {
      rawOptions = currentQuestion.options || [];
    }

    setAnswersLog(prev => [
      ...prev,
      {
        questionPrompt: currentQuestion.prompt,
        userSelection: rawOptions[optionIndex] || 'Invalid Answer',
        correctAnswerText: rawOptions[currentQuestion.correctAnswer] || 'Correct',
        isCorrect: isCorrect
      }
    ]);
  };

  // Move to next question or complete quiz
  const handleNextStep = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setSoundFeedback('NEURAL GRID LINKED - RESOLVING QUERY...');
    } else {
      // Complete and route to results
      const endTime = Date.now();
      const totalTimeTaken = Math.round((endTime - startTime) / 1000);
      const finalAccuracy = Math.round((answersLog.filter(x => x.isCorrect).length / questions.length) * 100);

      // Store results in localStorage so Results page can pick it up
      const sessionData = {
        score,
        totalQuestions: questions.length,
        accuracy: finalAccuracy,
        timeTaken: totalTimeTaken,
        topicName: topic?.name || 'Cyber Arena',
        topicId: topic?._id,
        answersLog
      };
      
      localStorage.setItem('brainsnap_last_session', JSON.stringify(sessionData));
      
      // Route immediately
      navigate('/results');
    }
  };

  // Safely parse options array from string or list
  const getParsedOptions = (questionObj) => {
    if (!questionObj) return [];
    if (Array.isArray(questionObj.options)) return questionObj.options;
    if (typeof questionObj.options === 'string') {
      try {
        return JSON.parse(questionObj.options);
      } catch (e) {
        return questionObj.options.split(',').map(o => o.trim());
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '40px' }}>
          <div className="skeleton skeleton-text" style={{ height: '40px', width: '60%', margin: '0 auto 20px' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '120px', marginBottom: '20px' }}></div>
          <p className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Syncing Synaptic Buffers...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '40px', border: '1.5px solid var(--secondary)' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>CRITICAL SYSTEM INTERRUPT</span>
          <h2 style={{ margin: '15px 0' }}>COULD NOT START ARENA</h2>
          <div className="alert alert-error" style={{ marginBottom: '30px' }}>
            {errorMsg}
          </div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Return to Sector Select</Link>
            <Link to="/admin" className="btn btn-secondary">Curator Terminal</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const parsedOptions = getParsedOptions(currentQuestion);
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Compute laser countdown color state
  const laserColor = timer > 8 ? 'var(--primary)' : timer > 4 ? 'var(--accent)' : 'var(--secondary)';

  return (
    <div>
      {/* 1. Header Banner */}
      <section className="hero" style={{ padding: '40px 0 20px' }}>
        <div className="container">
          <span className="eyebrow">LIVE COMBAT SIMULATOR</span>
          <h1>
            ARENA: <span className="gradient-text">{topic?.name?.toUpperCase() || 'UNKNOWN SECTOR'}</span>
          </h1>
          <p className="hero-subtitle">
            {topic?.description || 'Synchronize your mental speed to claim the high score.'}
          </p>
        </div>
      </section>

      {/* 2. Main Game HUD and Question Chamber */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          
          {/* Real-time Telemetry Overlay Box */}
          <div className="card" style={{ marginBottom: '24px', background: 'rgba(21, 25, 30, 0.9)', position: 'relative', overflow: 'hidden' }}>
            {/* Retro Scanline Overlay Motif */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
              backgroundSize: '100% 4px',
              pointerEvents: 'none',
              zIndex: 2
            }}></div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary)', fontWeight: '700' }}>
                  NODE {currentIndex + 1} OF {questions.length}
                </span>
              </div>
              
              {/* Telemetry log state ticker */}
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                TELEMETRY FEED: <span style={{ color: hasAnswered ? 'var(--primary)' : 'var(--accent)' }}>{soundFeedback}</span>
              </div>

              <div>
                <span className="stat-label" style={{ marginRight: '8px' }}>ENERGY CORE:</span>
                <span className="stat-value" style={{ color: 'var(--accent)', fontSize: '1.4rem' }}>{score} PTS</span>
              </div>
            </div>

            {/* Micro progress status tracker */}
            <div style={{ background: 'var(--surface-2)', height: '6px', borderRadius: '3px', position: 'relative', marginBottom: '20px' }}>
              <div 
                style={{ 
                  background: 'var(--primary)', 
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  borderRadius: '3px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>

            {/* Active Countdown Laser-bar Motif */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>SYNAPTIC LOCK TIMER</span>
                <span style={{ color: laserColor, fontWeight: '700', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {timer} SECONDS REMAINING
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{
                    height: '100%',
                    width: `${(timer / 15) * 100}%`,
                    background: `linear-gradient(90deg, ${laserColor}, var(--secondary))`,
                    transition: 'width 1s linear',
                    boxShadow: `0 0 10px ${laserColor}`
                  }}
                />
              </div>
            </div>

            {/* Active Question node */}
            <div className="card" style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', padding: '30px', marginBottom: '25px', position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>INCOMING CORE QUERY</span>
              <h2 style={{ fontSize: '1.8rem', marginTop: '10px', lineHeight: '1.4' }}>
                {currentQuestion?.prompt}
              </h2>
            </div>

            {/* Matrix Selection Grid (Answer Options) */}
            <div className="grid grid-2" style={{ gap: '15px' }}>
              {parsedOptions.map((option, index) => {
                // Determine highlight style states
                let borderStyle = '1.5px solid var(--border)';
                let backgroundStyle = 'rgba(21, 25, 30, 0.6)';
                let textAccent = 'var(--text)';
                let glowEffect = 'none';

                if (hasAnswered) {
                  if (index === currentQuestion.correctAnswer) {
                    // Flash vibrant neon green/cyan for correct answer
                    borderStyle = '1.5px solid #10B981';
                    backgroundStyle = 'rgba(16, 185, 129, 0.15)';
                    textAccent = '#10B981';
                    glowEffect = '0 0 15px rgba(16, 185, 129, 0.3)';
                  } else if (selectedOption === index) {
                    // Flash neon hot pink for wrong option selection
                    borderStyle = '1.5px solid var(--secondary)';
                    backgroundStyle = 'rgba(255, 46, 147, 0.15)';
                    textAccent = 'var(--secondary)';
                    glowEffect = '0 0 15px rgba(255, 46, 147, 0.3)';
                  } else {
                    // Dim non-selected options
                    backgroundStyle = 'rgba(21, 25, 30, 0.2)';
                    textAccent = 'var(--muted)';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={hasAnswered}
                    className="btn btn-ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '20px',
                      borderRadius: '8px',
                      border: borderStyle,
                      background: backgroundStyle,
                      color: textAccent,
                      fontSize: '1.05rem',
                      fontFamily: 'inherit',
                      width: '100%',
                      cursor: hasAnswered ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: glowEffect
                    }}
                  >
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '4px', 
                      background: 'var(--surface-2)', 
                      marginRight: '15px',
                      fontWeight: 'bold',
                      color: hasAnswered && index === currentQuestion.correctAnswer ? '#10B981' : 'var(--primary)',
                      border: '1px solid var(--border)'
                    }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span style={{ flex: 1 }}>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Next Sequence Trigger Panel */}
            {hasAnswered && (
              <div className="cta-section" style={{ marginTop: '30px', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text)' }}>
                    {selectedOption === currentQuestion.correctAnswer ? '✓ Connection Verified' : '✗ Signal Degraded'}
                  </h4>
                  <p style={{ margin: '5px 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {selectedOption === currentQuestion.correctAnswer 
                      ? 'Synced with the main core database correctly.' 
                      : `The correct target frequency was option: ${parsedOptions[currentQuestion.correctAnswer]}`
                    }
                  </p>
                </div>
                <button 
                  onClick={handleNextStep} 
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                >
                  {currentIndex + 1 === questions.length ? 'COMPLETE SCAN' : 'NEXT NODE ⚡'}
                </button>
              </div>
            )}

          </div>

          {/* Quick exit option */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/" className="btn btn-ghost" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              ◄ EMERGENCY EXIT (ABORT SIMULATION)
            </Link>
          </div>

        </div>
      </section>

      {/* 3. Competitive Game Mechanics Grid section */}
      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">TACTILE PROTOCOLS</span>
            <h2>Rules of the Synapse Ring</h2>
            <p>Every second spent processing choices impacts your score potential. Outsmart the system framework.</p>
          </div>

          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: 'var(--primary)' }}>⏱</div>
              <h3>15-Second Decay</h3>
              <p>Your mental bandwidth is throttled. Decisions must be dispatched prior to the countdown limit, or the system experiences lockout.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: 'var(--secondary)' }}>🔥</div>
              <h3>Velocity Multiplier</h3>
              <p>Correct responses executed within the first 5 seconds trigger heavy score multipliers, fueling your ascent on the leaderboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: 'var(--accent)' }}>🔒</div>
              <h3>No Rewrite Allowed</h3>
              <p>Once a option query is selected, the database immediately locks transmission. Double check your targeting parameters.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}