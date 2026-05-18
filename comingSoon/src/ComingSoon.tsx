import React, { useEffect, useRef, useState } from 'react';
import './ComingSoon.css';
import hackathonLogo from './assets/hackathon_logo2026-DUlc7zPj.png';
import { supabase } from './supabase';
import PhotoGallery from './PhotoGallery';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ComingSoon: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollGuide, setShowScrollGuide] = useState(true);

  const t1Ref = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form check logic
  useEffect(() => {
    if (window.location.search.includes("reset")) {
      localStorage.removeItem("kuht_waitlist_joined");
      localStorage.removeItem("kuht_waitlist_name");
      localStorage.removeItem("kuht_waitlist_email");
      localStorage.removeItem("kuht_waitlist_message");
    }

    if (localStorage.getItem("kuht_waitlist_joined") === "1") {
      setIsJoined(true);
      setFullName(localStorage.getItem("kuht_waitlist_name") || "");
      setEmail(localStorage.getItem("kuht_waitlist_email") || "");
      setSuccessMessage(localStorage.getItem("kuht_waitlist_message") || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = fullName.trim();
    const emailTrim = email.trim().toLowerCase();

    if (!nameTrim) {
      setIsError(true);
      document.getElementById('signup-name')?.focus();
      return;
    }
    if (!EMAIL_RE.test(emailTrim)) {
      setIsError(true);
      document.getElementById('signup-email')?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('coming_soon_signups')
        .insert([{ full_name: nameTrim, email: emailTrim }]);

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          throw new Error('DUPLICATE');
        }
        throw new Error(error.message);
      }

      const message = `You are on the waitlist ${nameTrim}`;

      localStorage.setItem("kuht_waitlist_joined", "1");
      localStorage.setItem("kuht_waitlist_name", nameTrim);
      localStorage.setItem("kuht_waitlist_email", emailTrim);
      localStorage.setItem("kuht_waitlist_message", message);
      setIsJoined(true);
      setSuccessMessage(message);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'DUPLICATE') {
        setErrorMessage("Your email is already on the waitlist!");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("kuht_waitlist_joined");
    localStorage.removeItem("kuht_waitlist_name");
    localStorage.removeItem("kuht_waitlist_email");
    localStorage.removeItem("kuht_waitlist_message");
    setFullName("");
    setEmail("");
    setIsJoined(false);
    setIsError(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Character scramble effect
  useEffect(() => {
    const el = t1Ref.current;
    if (!el) return;

    const original = el.dataset.text || el.textContent || 'KeanUHackThis';
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>/|{}[]';

    const scramble = () => {
      let frame = 0;
      const total = original.length * 3;
      const id = setInterval(() => {
        if (!el) { clearInterval(id); return; }
        el.textContent = original.split('').map((ch, i) => {
          if (!/[a-zA-Z]/.test(ch)) return ch;
          if (i < Math.floor(frame / 3)) return ch;
          return pool[Math.floor(Math.random() * pool.length)];
        }).join('');
        if (++frame > total) { el.textContent = original; clearInterval(id); }
      }, 28);
    };

    const timeoutId = setTimeout(scramble, 2800);
    const intervalId = setInterval(scramble, 3500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Particle field effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, pts: any[] = [];
    let mx = -9999, my = -9999, t = 0;
    let rafId: number | null = null, resizeTimer: any = null;

    const seed = () => {
      const n = Math.max(50, Math.min(100, Math.floor(W * H / 14000)));
      pts = [];
      for (let i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.2 + 0.25, l: Math.random() * 0.6 + 0.3,
          ph: Math.random() * Math.PI * 2, type: Math.random() > 0.5 ? 0 : 1
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const frame = () => {
      t += 0.006;
      ctx.clearRect(0, 0, W, H);
      const D = Math.min(130, Math.max(80, W * 0.07)), D2 = D * D;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const fx = mx - p.x, fy = my - p.y, fd = fx * fx + fy * fy;
        if (fd < 20000) { const f = (1 - fd / 20000) * 0.0005; p.vx += fx * f; p.vy += fy * f; }
        p.vx *= 0.993; p.vy *= 0.993;
        p.x += p.vx + Math.sin(t + p.ph) * 0.05;
        p.y += p.vy + Math.cos(t * 0.65 + p.ph) * 0.05;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < D2) {
            const k = 1 - Math.sqrt(d2) / D, a = k * k * 0.38 * Math.min(p.l, q.l);
            ctx.strokeStyle = (p.type === q.type)
              ? (p.type === 0 ? "rgba(48,96,200," + a + ")" : "rgba(217,194,122," + (a * 0.7) + ")")
              : "rgba(140,165,220," + (a * 0.40) + ")";
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }

        const pulse = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.2 + p.ph));
        ctx.fillStyle = p.type === 0
          ? "rgba(48,96,200," + (p.l * 0.90 * pulse) + ")"
          : "rgba(217,194,122," + (p.l * 0.75 * pulse) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else {
        if (!rafId) { rafId = requestAnimationFrame(frame); }
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };

    const handleMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const handleMouseLeave = () => { mx = -9999; my = -9999; };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
    };
  }, []);

  const firstName = fullName ? fullName.split(" ")[0] : "";
  const joinedLabel = successMessage || (firstName ? `// ${firstName} · ${email}` : `// ${email}`);

  return (
    <div className="coming-soon-container">
      <div className="aurora"></div>
      <canvas id="bg" ref={canvasRef}></canvas>

      {/* Floating Scroll Guide */}
      <div className={`scroll-guide ${showScrollGuide ? 'visible' : 'hidden'}`}>
        <div className="scroll-guide-inner">
          <span>scroll down for our last hackathon photos</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
      </div>

      <div 
        className="page"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop > 50 && showScrollGuide) {
            setShowScrollGuide(false);
          } else if (e.currentTarget.scrollTop <= 50 && !showScrollGuide) {
            setShowScrollGuide(true);
          }
        }}
      >
        {/* announce bar */}
        <div className="announce">
          <span className="rule"></span>
          <span>// Waitlist is open &middot; Registration opens Fall 2026</span>
          <span className="rule"></span>
        </div>

        {/* hero */}
        <main className="hero">
          {/* left: logo */}
          <div className="hero-logo">
            <img src={hackathonLogo} alt="KeanUHackThis Cougar" />
          </div>

          {/* right: content */}
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="t1" data-text="KeanUHackThis," ref={t1Ref}>KeanUHackThis</span>
              <span className="t2">Redefined.</span>
              <span className="t3">Spring 2027.</span>
            </h1>

            <div className="event-meta">
              <span className="meta-chip accent">// Spring 2027</span>
              <span className="meta-chip">Kean University, NJ</span>
              <span className="meta-chip">24 Hours</span>
              <span className="meta-chip">Free Entry</span>
              <span className="meta-chip">All Majors</span>
            </div>

            <p className="hero-desc">
              Completely free. 24-hour overnight hackathon at Kean University.
              Open to all undergrad and grad students 18+, every major, every experience level.
              When registration opens, you will be emailed registration information.
            </p>

            <div className="cta-wrap" id="cta-wrap">
              <form 
                className={`signup-form ${isError ? 'error' : ''}`} 
                id="signup" 
                noValidate
                onSubmit={handleSubmit}
              >
                <input 
                  type="text" 
                  id="signup-name" 
                  name="fullName" 
                  placeholder="Full name" 
                  required 
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setIsError(false);
                    setErrorMessage("");
                  }}
                  disabled={isJoined || isSubmitting}
                />
                <input 
                  type="email" 
                  id="signup-email" 
                  name="email" 
                  placeholder="Email address" 
                  required 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsError(false);
                    setErrorMessage("");
                  }}
                  disabled={isJoined || isSubmitting}
                />
                <div className="form-actions">
                  {isJoined ? (
                    <>
                      <span className="wc-rule"></span>
                      <span className="wc-text">{joinedLabel}</span>
                      <button type="button" className="wc-reset" onClick={handleReset}>↩ reset</button>
                      <span className="wc-rule"></span>
                    </>
                  ) : (
                    <button type="submit" className="btn-amber" id="signup-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending…' : 'Join waitlist →'}
                    </button>
                  )}
                  <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLScmMw0Noebqr39XY5PMUeYOhC0F8jpGAUtZhYthNRdqT9KaeA/viewform?usp=publish-editor" className="btn-outline">Sponsor us</a>
                  <a target="_blank" href="https://keanuhackthis-ten.vercel.app/" className="btn-outline">KeanUHackThis 2026</a>
                </div>
              </form>
              {errorMessage && <p className="signup-error-text" style={{ color: '#ff4d4d', marginTop: '10px', fontSize: '0.9rem', fontWeight: 500 }}>{errorMessage}</p>}
              <p className="signup-note">// No spam &mdash; one email when registration open.</p>
            </div>

            <div className="socials">
              <a href="https://www.instagram.com/keanuniversity/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://x.com/KeanUniversity" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/school/kean-university/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="https://www.kean.edu/" target="_blank" rel="noopener noreferrer" aria-label="Kean University">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                </svg>
              </a>
            </div>
          </div>
        </main>

        {/* photo gallery */}
        <PhotoGallery />

        {/* footer */}
        <footer className="site-footer">
          <span>&copy; 2027 KeanUHackThis &middot; <a href="https://www.kean.edu/" target="_blank" rel="noopener noreferrer">Kean University</a></span>
          <span><a href="mailto:acmkeanchapter@kean.edu">acmkeanchapter@kean.edu</a></span>
        </footer>
      </div>
    </div>
  );
};

export default ComingSoon;
