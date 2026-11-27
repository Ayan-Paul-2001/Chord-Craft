'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  Headphones,
  FileText,
  Video,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Repeat,
  Copy,
  Check,
  Gauge,
  Lock,
} from 'lucide-react';
import {
  formatYouTubeEmbedUrl,
  formatGoogleDriveAudioUrl,
  formatGoogleDriveDownloadUrl,
  isLessonUnlockedForStudent,
  matchesLessonIdentifier,
} from '@/lib/utils';

export default function PublicLessonDetailPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const { lessons, users, lessonAccess, currentUser, adminName, addToast } = useStore();

  const lesson = lessons.find((l) => l.id === lessonId || matchesLessonIdentifier(lessonId, l));

  // Audio Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copiedTab, setCopiedTab] = useState(false);

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleAudio = () => {
    if (!audioRef.current || !lesson?.audioUrl) return;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = isLooping;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.error('Audio play error:', e));
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
  };

  const handleCopyTab = () => {
    if (!lesson?.tabPreviewText) return;
    navigator.clipboard.writeText(lesson.tabPreviewText);
    setCopiedTab(true);
    addToast('Guitar TAB copied to clipboard!', 'success');
    setTimeout(() => setCopiedTab(false), 2000);
  };

  if (!lesson) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5 pt-24">
        <div className="p-8 rounded-3xl luxury-glass max-w-md space-y-4">
          <h2 className="font-display text-3xl font-semibold text-white">Masterclass Not Found</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The lesson you are looking for does not exist or has been relocated.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 luxury-btn-primary font-bold text-xs rounded-xl"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Strict access check: non-public lessons require Admin or an Active Student with explicit unlock
  const canViewLesson =
    Boolean(lesson.isPublic) ||
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'student' &&
      currentUser.status === 'Active' &&
      isLessonUnlockedForStudent(lesson, currentUser, users, lessonAccess));

  if (!canViewLesson) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center pt-16">
        <div className="p-8 sm:p-10 rounded-3xl luxury-glass border border-rose-500/30 max-w-lg w-full space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/12 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-rose-400 font-bold">
              Members-Only Curriculum Module
            </span>
            <h2 className="font-display text-3xl font-semibold text-white">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              This module is private to enrolled Harmonic Guitar Academy students once unlocked by {adminName}.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser ? (
              <Link
                href={currentUser.role === 'admin' ? '/admin/lessons' : '/student/lessons'}
                className="px-6 py-3 rounded-xl luxury-btn-primary font-bold text-xs"
              >
                Go to My Unlocked Lessons
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-3 rounded-xl luxury-btn-ghost text-zinc-200 font-bold text-xs"
                >
                  Student Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-xl luxury-btn-primary font-bold text-xs"
                >
                  Enroll in Academy
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0);
  const hasAudio = Boolean(lesson.audioUrl && lesson.audioUrl.trim().length > 0);
  const hasTabFile = Boolean(lesson.tabFileUrl && lesson.tabFileUrl.trim().length > 0);
  const hasTabText = Boolean(lesson.tabPreviewText && lesson.tabPreviewText.trim().length > 0);
  const hasTab = hasTabFile || hasTabText;
  const hasNotes = Boolean(lesson.instructorNotes && lesson.instructorNotes.trim().length > 0);

  const embedUrl = hasVideo && lesson.videoUrl ? formatYouTubeEmbedUrl(lesson.videoUrl) : '';
  const downloadUrl = hasTabFile && lesson.tabFileUrl ? formatGoogleDriveDownloadUrl(lesson.tabFileUrl) : '';

  return (
    <div className="min-h-screen text-zinc-100 font-sans pt-6 sm:pt-10 pb-14 sm:pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Back Breadcrumb */}
        <div>
          <Link
            href="/#lessons"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-300 transition px-3.5 py-2 rounded-xl luxury-btn-ghost"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Featured Lessons</span>
          </Link>
        </div>

        {/* Masterclass Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
              Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}
            </span>
            <StatusBadge status={lesson.level} />
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lesson.isPublic ? 'Free Public Preview' : 'Unlocked Member Module'}</span>
            </span>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 sm:ml-auto tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} Minutes
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] font-semibold text-white tracking-tight leading-[1.08]">
            {lesson.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-3xl">
            {lesson.description}
          </p>
        </div>

        {/* Cinema-Framed YouTube Video Masterclass Player */}
        {hasVideo && embedUrl && (
          <div className="rounded-3xl luxury-glass gold-border-glow overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-b border-white/[0.07] bg-[#0b0a0e]/80">
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 font-semibold uppercase tracking-[0.16em]">
                <Video className="w-4 h-4" />
                <span>YouTube HD Masterclass Studio</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Mentor: {adminName}
              </span>
            </div>

            <div className="relative aspect-video bg-black">
              <iframe
                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1`}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Audio Practice Deck & Interactive Guitar TAB Sheet */}
        {(hasAudio || hasTab) && (
          <div className={`grid grid-cols-1 ${hasAudio && hasTab ? 'lg:grid-cols-2' : ''} gap-7`}>
            {/* Studio Audio Practice Deck */}
            {hasAudio && lesson.audioUrl && (
              <div className="p-6 sm:p-7 rounded-3xl luxury-glass space-y-5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 font-bold uppercase tracking-[0.16em]">
                      <Headphones className="w-4 h-4" />
                      <span>Practice Backing Deck</span>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-300">
                      Studio WAV
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Jam along with {adminName}&apos;s chord progression track. Toggle Loop or slow tempo down to 0.75x while learning new phrases.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#09090c] border border-white/[0.08] space-y-4">
                  <audio
                    ref={audioRef}
                    src={formatGoogleDriveAudioUrl(lesson.audioUrl)}
                    loop={isLooping}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => {
                      setDuration(e.currentTarget.duration);
                      e.currentTarget.playbackRate = playbackRate;
                    }}
                    onEnded={() => {
                      if (!isLooping) setIsPlayingAudio(false);
                    }}
                    preload="metadata"
                  />

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="w-12 h-12 rounded-2xl luxury-btn-primary flex items-center justify-center cursor-pointer shrink-0"
                      aria-label={isPlayingAudio ? 'Pause backing track' : 'Play backing track'}
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          const newTime = Number(e.target.value);
                          setCurrentTime(newTime);
                          if (audioRef.current) audioRef.current.currentTime = newTime;
                        }}
                        aria-label="Backing track progress"
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400 tabular-nums">
                        <span>{formatAudioTime(currentTime)}</span>
                        <span>{formatAudioTime(duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guitarist Loop & Tempo Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={handleToggleLoop}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                        isLooping
                          ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{isLooping ? 'Loop On' : 'Loop Off'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-zinc-500 mr-0.5" />
                      {[0.75, 1, 1.25].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition cursor-pointer tabular-nums ${
                            playbackRate === spd
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mentor Notes */}
                {hasNotes && (
                  <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-400/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mentor Tip • {adminName}</span>
                    </div>
                    <p className="text-xs text-zinc-200/90 italic leading-relaxed whitespace-pre-line">
                      &ldquo;{lesson.instructorNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Guitar TAB Sheet & PDF Download */}
            {hasTab && (
              <div className="p-6 sm:p-7 rounded-3xl luxury-glass space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 font-bold uppercase tracking-[0.16em]">
                      <FileText className="w-4 h-4" />
                      <span>Curriculum TAB Notation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasTabText && (
                        <button
                          type="button"
                          onClick={handleCopyTab}
                          className="px-3 py-1.5 rounded-xl luxury-btn-ghost text-zinc-200 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedTab ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy TAB</span>
                            </>
                          )}
                        </button>
                      )}

                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3.5 py-1.5 rounded-xl luxury-btn-primary text-xs font-bold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF TAB</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Study the fretboard notation below or download the formatted Harmonic Guitar Academy PDF worksheet:
                  </p>
                </div>

                {hasTabText ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#09090c] border border-white/[0.08] font-mono text-xs text-amber-200/95 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                    {lesson.tabPreviewText}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-2">
                    PDF Tab sheet is attached above. Click the download button to open or print.
                  </p>
                )}

                <div className="text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.07]">
                  <span>Tuning: Standard (E A D G B E)</span>
                  <span className="text-amber-300">Chord &amp; Craft Sheet</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback if lesson has no media attachments */}
        {!hasVideo && !hasAudio && !hasTab && !hasNotes && (
          <div className="p-8 sm:p-12 rounded-3xl luxury-glass text-center space-y-3">
            <BookOpen className="w-10 h-10 text-amber-400/60 mx-auto" />
            <h3 className="font-display text-2xl font-semibold text-white">Curriculum Overview</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {lesson.description || 'Lesson materials and media will be updated soon by the academy instructor.'}
            </p>
          </div>
        )}

        {/* Bottom Call to Action for Logged Out Visitors */}
        {!currentUser && (
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl luxury-glass gold-border-glow flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl text-center md:text-left">
              <div className="eyebrow-pill">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ready for the full experience?</span>
              </div>
              <h3 className="font-display text-2xl sm:text-4xl font-semibold text-white leading-tight">
                Unlock Structured Masterclasses &amp; Live Mentorship
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Join Chord &amp; Craft at Harmonic Guitar Academy to track your lesson progress, access all 8 curriculum modules, and receive personalized mentor guidance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl luxury-btn-ghost text-zinc-200 font-bold text-xs text-center"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl luxury-btn-primary font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <span>Join Academy Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
