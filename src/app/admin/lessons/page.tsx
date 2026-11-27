'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Lesson, StudentLevel } from '@/lib/types';
import { BookOpen, Plus, Search, Edit3, Trash2, X, Upload, Loader2, Image as ImageIcon, Sparkles, GraduationCap, Layers } from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';
import { formatYouTubeEmbedUrl, formatGoogleDriveAudioUrl, formatGoogleDriveDownloadUrl } from '@/lib/utils';

export default function AdminLessonsPage() {
  const { lessons, courses, createLesson, updateLesson, deleteLesson, adminName } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<StudentLevel>('Beginner');
  const [courseId, setCourseId] = useState<string>('common');
  const [lessonNumber, setLessonNumber] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tabFileUrl, setTabFileUrl] = useState('');
  const [tabPreviewText, setTabPreviewText] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [instructorNotes, setInstructorNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Image Upload states
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isDeletingThumbnail, setIsDeletingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLevel('Beginner');
    setCourseId('common');
    setLessonNumber(lessons.length + 1);
    setDurationMinutes(20);
    setVideoUrl('');
    setAudioUrl('');
    setTabFileUrl('');
    setTabPreviewText('');
    setThumbnail('');
    setInstructorNotes('');
    setIsPublic(false);
    setUploadError('');
    setEditingLesson(null);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    setUploadError('');

    try {
      const res = await uploadImageToCloudinary(file, 'chord_and_craft/lessons');
      if (res.url) {
        setThumbnail(res.url);
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload lesson thumbnail to Cloudinary.'
      );
    } finally {
      setIsUploadingThumbnail(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveThumbnail = async () => {
    if (!thumbnail) return;

    setIsDeletingThumbnail(true);
    setUploadError('');

    try {
      if (isCloudinaryUrl(thumbnail)) {
        await deleteImageFromCloudinary(thumbnail);
      }
      setThumbnail('');
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to delete thumbnail from Cloudinary.'
      );
    } finally {
      setIsDeletingThumbnail(false);
    }
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description);
    setLevel(lesson.level);
    setCourseId(lesson.courseId || 'common');
    setLessonNumber(lesson.lessonNumber);
    setDurationMinutes(lesson.durationMinutes);
    setVideoUrl(lesson.videoUrl);
    setAudioUrl(lesson.audioUrl || '');
    setTabFileUrl(lesson.tabFileUrl || '');
    setTabPreviewText(lesson.tabPreviewText || '');
    setThumbnail(lesson.thumbnail || '');
    setInstructorNotes(lesson.instructorNotes || '');
    setIsPublic(!!lesson.isPublic);
    setIsCreateOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const normalizedVideoUrl = videoUrl?.trim() ? formatYouTubeEmbedUrl(videoUrl.trim()) : '';
    const normalizedAudioUrl = audioUrl?.trim() ? formatGoogleDriveAudioUrl(audioUrl.trim()) : '';
    const normalizedTabFileUrl = tabFileUrl?.trim() ? formatGoogleDriveDownloadUrl(tabFileUrl.trim()) : '';
    const normalizedTabPreviewText = tabPreviewText?.trim() || '';
    const normalizedInstructorNotes = instructorNotes?.trim() || '';

    if (editingLesson) {
      updateLesson(editingLesson.id, {
        title,
        description,
        level,
        courseId: courseId || 'common',
        lessonNumber: Number(lessonNumber),
        videoUrl: normalizedVideoUrl,
        audioUrl: normalizedAudioUrl,
        tabFileUrl: normalizedTabFileUrl,
        tabPreviewText: normalizedTabPreviewText,
        thumbnail,
        durationMinutes: Number(durationMinutes),
        instructorNotes: normalizedInstructorNotes,
        isPublic,
      });
    } else {
      createLesson({
        title,
        description,
        level,
        courseId: courseId || 'common',
        lessonNumber: Number(lessonNumber),
        videoUrl: normalizedVideoUrl,
        audioUrl: normalizedAudioUrl,
        tabFileUrl: normalizedTabFileUrl,
        tabPreviewText: normalizedTabPreviewText,
        thumbnail,
        durationMinutes: Number(durationMinutes),
        instructorNotes: normalizedInstructorNotes,
        isPublic,
      });
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const getCourseLabel = (cId?: string) => {
    if (!cId || cId === 'common') return 'Common Class (All Students)';
    const matched = courses.find((c) => c.id === cId);
    return matched ? matched.title : cId;
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || lesson.level === selectedLevel;
    const lessonCourse = lesson.courseId || 'common';
    const matchesCourse =
      selectedCourseFilter === 'All' || lessonCourse === selectedCourseFilter;
    return matchesSearch && matchesLevel && matchesCourse;
  });

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Curriculum Lesson Management"
        subtitle="Create, update, and manage video masterclasses, audio backings, & TAB sheet attachments."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl portal-surface">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search curriculum modules..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto justify-between sm:justify-end">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="h-11 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-4 text-xs font-medium cursor-pointer flex-1 sm:flex-initial max-w-[230px]"
            >
              <option value="All">All Courses &amp; Common</option>
              <option value="common">Common (All Students)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-11 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-4 text-xs font-medium cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="h-11 px-4 sm:px-5 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Lesson</span>
            </button>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="p-4 sm:p-6 lg:p-7 rounded-3xl portal-surface space-y-5">
          <h3 className="portal-heading text-xl sm:text-2xl text-white flex items-center gap-2.5 border-b border-white/[0.07] pb-4">
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Academy Curriculum Modules ({filteredLessons.length})</span>
          </h3>

          {filteredLessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="No Lessons Found"
              description="No curriculum lessons match your filter query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4 whitespace-nowrap">#</th>
                    <th className="pb-3 px-4">Title &amp; Description</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Course / Track</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Level</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Media Attachments</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Duration</th>
                    <th className="pb-3 px-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredLessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        #{lesson.lessonNumber.toString().padStart(2, '0')}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white leading-snug">{lesson.title}</p>
                          {lesson.isPublic && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              Homepage
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{lesson.description}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {!lesson.courseId || lesson.courseId === 'common' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-semibold bg-emerald-500/12 text-emerald-300 border border-emerald-500/30">
                            <Layers className="w-3 h-3" />
                            <span>Common (All)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-amber-500/12 text-amber-200 border border-amber-400/30 max-w-[180px] truncate">
                            <GraduationCap className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{getCourseLabel(lesson.courseId)}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={lesson.level} size="sm" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {lesson.videoUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">Video</span>}
                          {lesson.audioUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">Audio</span>}
                          {lesson.tabFileUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">TAB</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-300 whitespace-nowrap">{lesson.durationMinutes}m</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(lesson)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition cursor-pointer"
                            title="Edit Lesson"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingLessonId(lesson.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="luxury-glass gold-border-glow rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92dvh] overflow-y-auto animate-scale-up">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
              <div>
                <h3 className="portal-heading text-2xl sm:text-3xl text-white leading-tight">
                  {editingLesson ? 'Edit Curriculum Lesson' : 'Create New Curriculum Lesson'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure lesson metadata, YouTube embed, backing audio, and downloadable PDF TAB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Group 1: Module Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                    Module Details
                  </span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      Lesson Number <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={lessonNumber}
                      onChange={(e) => setLessonNumber(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm tabular-nums"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      Level Tier <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as StudentLevel)}
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">Duration (Mins)</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Course Assignment <span className="text-amber-400">*</span></span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm cursor-pointer"
                  >
                    <option value="common">
                      Common Class — Previewable by All Enrolled Students
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.level})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-500">
                    Choose a specific course to restrict lectures to enrolled students of that course, or select Common Class so every active student can preview it.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Lesson Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Minor Pentatonic Soloing & Pitch Bends"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed breakdown of what students will learn..."
                    className="w-full p-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Group 2: Media & Resources */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                    Media &amp; Resources
                  </span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      YouTube Video URL
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setVideoUrl(formatYouTubeEmbedUrl(e.target.value));
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Accepts standard YouTube links, shorts, or embed URLs (auto-converted).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      Backing Audio URL (.wav / .mp3 / Drive)
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setAudioUrl(formatGoogleDriveAudioUrl(e.target.value));
                        }
                      }}
                      placeholder="/audio/backing.wav or Drive link"
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Google Drive share links or direct audio files.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      PDF TAB Sheet URL
                    </label>
                    <input
                      type="text"
                      value={tabFileUrl}
                      onChange={(e) => setTabFileUrl(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setTabFileUrl(formatGoogleDriveDownloadUrl(e.target.value));
                        }
                      }}
                      placeholder="/tabs/lesson.pdf or Drive link"
                      className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 font-mono text-xs"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Google Drive PDF link or local /tabs/ path.
                    </p>
                  </div>

                  {/* Thumbnail Cover Image Upload */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-zinc-200">
                        Thumbnail Cover Image
                      </label>
                      {thumbnail && (
                        <button
                          type="button"
                          disabled={isDeletingThumbnail || isUploadingThumbnail}
                          onClick={handleRemoveThumbnail}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isDeletingThumbnail ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Removing...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2.5">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt="Thumbnail"
                          className="w-11 h-11 rounded-xl object-cover border border-amber-400/35 shrink-0 bg-zinc-900"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#09090d] border border-white/[0.09] flex items-center justify-center text-zinc-500 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}

                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={thumbnail}
                          onChange={(e) => setThumbnail(e.target.value)}
                          placeholder="https://res.cloudinary.com/..."
                          className="w-full h-11 pl-3.5 pr-24 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 font-mono text-xs"
                        />
                        <button
                          type="button"
                          disabled={isUploadingThumbnail}
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingThumbnail ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploadingThumbnail ? '...' : 'Upload'}</span>
                        </button>
                      </div>
                    </div>

                    {uploadError && (
                      <p className="text-[11px] text-rose-400 font-medium">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: TAB & Mentor Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                    TAB Notation &amp; Mentor Notes
                  </span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    ASCII TAB Preview Notation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={tabPreviewText}
                    onChange={(e) => setTabPreviewText(e.target.value)}
                    placeholder={'E|------------------|\nB|------------------|\n...'}
                    className="w-full p-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-amber-300 placeholder:text-zinc-600 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Mentor {adminName} Practice Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={instructorNotes}
                    onChange={(e) => setInstructorNotes(e.target.value)}
                    placeholder="Key practice takeaways, metronome BPM targets, and phrasing tips..."
                    className="w-full p-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Homepage Public Preview Tick Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-amber-400/25 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="isPublicLesson" className="text-sm font-semibold text-white flex items-center gap-2 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Publish to Homepage (Public Free Preview)</span>
                  </label>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Showcases this lesson publicly on the landing page for prospective students &amp; visitors.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isPublicLesson"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-amber-500 cursor-pointer accent-amber-500 shrink-0"
                />
              </div>

              <div className="pt-5 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-11 px-5 rounded-xl luxury-btn-ghost text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs cursor-pointer"
                >
                  {editingLesson ? 'Save Lesson Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingLessonId}
        title="Delete Curriculum Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete Lesson"
        isDestructive
        onConfirm={() => {
          if (deletingLessonId) deleteLesson(deletingLessonId);
        }}
        onClose={() => setDeletingLessonId(null)}
      />
    </div>
  );
}
