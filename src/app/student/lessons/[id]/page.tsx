'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  Check,
  Lock,
  ArrowLeft,
  Headphones,
  FileText,
  Video,
  Award,
  Phone,
  Clock,
  ChevronDown,
  BookOpen,
  Repeat,
  Copy,
  Gauge,
  GraduationCap,
  Layers,
} from 'lucide-react';
import {
  formatYouTubeEmbedUrl,
  formatGoogleDriveAudioUrl,
  formatGoogleDriveDownloadUrl,
  isValidMobile,
  isLessonUnlockedForStudent,
  findLessonProgressForStudent,
  matchesLessonIdentifier,
} from '@/lib/utils';

const emptySubscribe = () => () => {};

export default function StudentLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const {
    lessons,
    courses,
    users,
    currentUser,
    lessonAccess,
    lessonProgress,
    markLessonProgress,
    addToast,
    adminName,
  } = useStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const hasValidMobile = mounted ? isValidMobile(currentUser?.mobile || '') : true;
  const lesson = lessons.find((l) => l.id === lessonId || matchesLessonIdentifier(lessonId, l));

  const isUnlocked = lesson
    ? isLessonUnlockedForStudent(lesson, currentUser, users, lessonAccess)
    : false;

  const prog = lesson
    ? findLessonProgressForStudent(lesson, currentUser, users, lessonProgress)
    : undefined;
  const currentStatus: 'Unlocked' | 'In Progress' | 'Completed' =
    (prog?.status as 'Unlocked' | 'In Progress' | 'Completed') || 'Unlocked';

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Studio Audio Player state
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
    if (!audioRef.current || !lesson?.audioUrl) {
      addToast('No audio backing track available for this lesson.', 'info');
      return;
    }
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = isLooping;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          setIsPlayingAudio(false);
          addToast('Could not play audio track. Please check file permissions or link.', 'info');
          console.warn('Audio playback notice:', err);
        });
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) audioRef.current.loop = next;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
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
      <div className="p-8 text-center space-y-4">
        <h2 className="font-display text-2xl font-semibold text-white">Lesson Not Found</h2>
        <p className="text-xs text-zinc-400">The requested lesson does not exist in Chord &amp; Craft.</p>
        <Link href="/student/lessons" className="inline-block px-5 py-2.5 luxury-btn-primary font-bold text-xs rounded-xl">
          Return to Lessons List
        </Link>
      </div>
    );
  }

  if (!hasValidMobile && currentUser?.role === 'student') {
    return (
      <div className="space-y-8">
        <DashboardHeader
          title="Mobile Number Verification Required"
          subtitle="Complete your student profile to access lessons"
        />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6 luxury-glass border-amber-500/35 rounded-3xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Phone className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="eyebrow-pill">Profile Action Required</span>
            <h2 className="font-display text-3xl font-semibold text-white">11-Digit Mobile Number Missing</h2>
            <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
              Academy policy requires all registered students to have a valid 11-digit mobile contact number before accessing curriculum masterclasses, streaming backing tracks, or downloading TAB notation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/student/profile"
              className="px-6 py-3 rounded-xl luxury-btn-primary font-bold text-xs"
            >
              Update Mobile Number in Profile →
            </Link>
            <Link
              href="/student/lessons"
              className="px-5 py-3 rounded-xl luxury-btn-ghost text-zinc-300 font-bold text-xs"
            >
              Back to Lessons Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="space-y-8">
        <DashboardHeader title={`Lesson 0${lesson.lessonNumber} — Locked`} />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6 luxury-glass border-rose-500/30 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">Access Restricted</span>
            <h2 className="font-display text-3xl font-semibold text-white">{lesson.title}</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              This lesson is currently locked for your student profile. {adminName} unlocks lessons sequentially once earlier prerequisites are completed.
            </p>
          </div>
          <button
            onClick={() => router.push('/student/lessons')}
            className="px-6 py-3 rounded-xl luxury-btn-ghost text-white font-bold text-xs cursor-pointer"
          >
            ← Back to Available Lessons
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadTab = () => {
    if (!lesson.tabFileUrl) {
      addToast('No PDF tab document attached for this lesson.', 'info');
      return;
    }
    const downloadUrl = formatGoogleDriveDownloadUrl(lesson.tabFileUrl);
    window.open(downloadUrl, '_blank');
    addToast(`Opening ${lesson.title} Tab PDF...`, 'success');
  };

  const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0);
  const hasAudio = Boolean(lesson.audioUrl && lesson.audioUrl.trim().length > 0);
  const hasTabFile = Boolean(lesson.tabFileUrl && lesson.tabFileUrl.trim().length > 0);
  const hasTabText = Boolean(lesson.tabPreviewText && lesson.tabPreviewText.trim().length > 0);
  const hasTab = hasTabFile || hasTabText;
  const hasNotes = Boolean(lesson.instructorNotes && lesson.instructorNotes.trim().length > 0);
  const lessonCourse =
    lesson.courseId && lesson.courseId !== 'common'
      ? courses.find((c) => c.id === lesson.courseId) || null
      : null;
  const backToCourseHref = lessonCourse
    ? `/student/lessons?course=${encodeURIComponent(lessonCourse.id)}`
    : '/student/lessons?course=common';

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={`Lesson ${lesson.lessonNumber.toString().padStart(2, '0')} — ${lesson.title}`}
        subtitle={`${lessonCourse ? lessonCourse.title : 'Common Academy Class'} • ${lesson.level} Level • ${lesson.durationMinutes} Minutes`}
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        {/* Top Back & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={backToCourseHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-300 transition px-3.5 py-2 rounded-xl luxury-btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Lessons Catalog
            </Link>

            {lessonCourse ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/12 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>{lessonCourse.title}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>Common Preview Class</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <StatusBadge status={currentStatus} />

            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="px-4 py-2 rounded-xl luxury-btn-primary font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Update Status</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    statusDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-2rem))] p-1.5 rounded-2xl luxury-glass z-50 animate-scale-up space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-white/[0.08]">
                    Update Lesson Status
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'In Progress');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">In Progress</div>
                        <div className="text-[10px] text-zinc-400 font-normal">Currently practicing module</div>
                      </div>
                    </div>
                    {currentStatus === 'In Progress' && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'Completed');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Completed</div>
                        <div className="text-[10px] text-zinc-400 font-normal">Lesson mastered &amp; validated</div>
                      </div>
                    </div>
                    {currentStatus === 'Completed' && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'Unlocked');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'Unlocked'
                        ? 'bg-white/[0.08] text-zinc-200 border border-white/[0.12]'
                        : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/[0.06] text-zinc-400 shrink-0">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-300">Unlocked</div>
                        <div className="text-[10px] text-zinc-500 font-normal">Not started yet</div>
                      </div>
                    </div>
                    {currentStatus === 'Unlocked' && <Check className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cinema-Framed YouTube Player */}
        {hasVideo && (
          <div className="rounded-3xl luxury-glass gold-border-glow overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-b border-white/[0.07] bg-[#0b0a0e]/80">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-[0.16em]">
                <Video className="w-4 h-4" />
                <span>High Definition Masterclass Breakdown</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                {lesson.durationMinutes} min • {lesson.level}
              </span>
            </div>

            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full border-0"
                src={`${formatYouTubeEmbedUrl(lesson.videoUrl)}?autoplay=0&rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Audio Practice Deck & Interactive Guitar TAB Row */}
        {(hasAudio || hasTab) && (
          <div className={`grid grid-cols-1 ${hasAudio && hasTab ? 'lg:grid-cols-2' : ''} gap-7`}>
            {hasAudio && (
              <div className="p-6 rounded-3xl luxury-glass space-y-5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-[0.16em]">
                      <Headphones className="w-4 h-4" />
                      <span>Backing Track &amp; Practice Deck</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Studio Audio</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Practice along with the studio progression recorded for {lesson.title}. Adjust playback speed or enable loop mode below.
                  </p>
                </div>

                <audio
                  ref={audioRef}
                  src={formatGoogleDriveAudioUrl(lesson.audioUrl!)}
                  loop={isLooping}
                  onTimeUpdate={() => {
                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration);
                      audioRef.current.playbackRate = playbackRate;
                    }
                  }}
                  onEnded={() => {
                    if (!isLooping) {
                      setIsPlayingAudio(false);
                      setCurrentTime(0);
                    }
                  }}
                  onError={() => setIsPlayingAudio(false)}
                  className="hidden"
                />

                <div className="p-4 rounded-2xl bg-[#09090c] border border-white/[0.08] space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="w-12 h-12 rounded-2xl luxury-btn-primary flex items-center justify-center shrink-0 cursor-pointer"
                      aria-label={isPlayingAudio ? 'Pause backing track' : 'Play backing track'}
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 tabular-nums">
                        <span>{formatAudioTime(currentTime)}</span>
                        <span>{duration > 0 ? formatAudioTime(duration) : 'Audio Stream'}</span>
                      </div>
                      <div
                        onClick={handleSeek}
                        className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="bg-gradient-to-r from-amber-300 to-amber-500 h-full rounded-full transition-all duration-150"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : isPlayingAudio ? 50 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loop & Speed Bar */}
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
              </div>
            )}

            {hasTab && (
              <div className="p-6 rounded-3xl luxury-glass space-y-4 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-[0.16em]">
                    <FileText className="w-4 h-4" />
                    <span>Interactive Guitar TAB Sheet</span>
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

                    {hasTabFile && (
                      <button
                        type="button"
                        onClick={handleDownloadTab}
                        className="px-3.5 py-1.5 rounded-xl luxury-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {hasTabText ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#09090c] border border-white/[0.08] font-mono text-xs text-amber-200/95 overflow-x-auto whitespace-pre leading-relaxed select-all shadow-inner">
                    {lesson.tabPreviewText}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-2">
                    PDF Tab sheet is attached above. Click the download button to open or print.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mentor Notes */}
        {hasNotes && (
          <div className="p-5 sm:p-7 rounded-3xl luxury-glass space-y-3">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-white flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{adminName} — Mentor Notes &amp; Practice Focus</span>
            </h3>
            <p className="text-sm text-zinc-300 font-light leading-relaxed pl-0 sm:pl-7 whitespace-pre-line">
              {lesson.instructorNotes}
            </p>
          </div>
        )}

        {/* Fallback */}
        {!hasVideo && !hasAudio && !hasTab && !hasNotes && (
          <div className="p-12 rounded-3xl luxury-glass text-center space-y-3">
            <BookOpen className="w-10 h-10 text-amber-400/60 mx-auto" />
            <h3 className="font-display text-2xl font-semibold text-white">Curriculum Overview</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {lesson.description || 'Lesson materials and media will be updated soon by the academy instructor.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
