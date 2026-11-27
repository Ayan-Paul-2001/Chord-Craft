import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '৳0';
  return `৳${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const year = parts[0];
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
      return `${months[monthIndex]} ${day}, ${year}`;
    }
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const raw = row[k];
            let cell =
              raw === null || raw === undefined
                ? ''
                : raw instanceof Date
                ? raw.toLocaleString()
                : String(raw);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Converts any YouTube URL format (standard watch URL, short URL, youtu.be, or video ID)
 * into a valid, embeddable YouTube iframe URL (https://www.youtube.com/embed/VIDEO_ID).
 */
export function formatYouTubeEmbedUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // Match 11-character YouTube ID from various URL patterns
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  );

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Handle raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  return trimmed;
}

/**
 * Extracts a Google Drive file ID from standard share/view URLs.
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{20,})/i
  );
  return match ? match[1] : null;
}

/**
 * Converts a Google Drive share link or external audio link into a reliable, CORS-enabled streaming URL.
 */
export function formatGoogleDriveAudioUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Local assets can be served directly
  if (trimmed.startsWith('/') && !trimmed.startsWith('/api/audio-proxy')) {
    return trimmed;
  }

  // Route external/Google Drive links through the server-side audio proxy
  return `/api/audio-proxy?url=${encodeURIComponent(trimmed)}`;
}

/**
 * Converts a Google Drive share link to a direct download or preview link for PDF tab files.
 */
export function formatGoogleDriveDownloadUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return trimmed;
}

/**
 * Cleans a mobile number by stripping out spaces, dashes, and international prefix (+880).
 */
export function cleanMobileNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('880') && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Pure Vanilla JavaScript validation for 11-digit mobile contact number.
 * Ensures the phone number is strictly 11 digits (e.g. 01712345678, 018..., 019...).
 */
export function isValidMobile(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = cleanMobileNumber(phone);
  return /^01[3-9]\d{8}$/.test(cleaned) || /^\d{11}$/.test(cleaned);
}

/**
 * Collects all normalized identifiers (MongoDB id, firebaseUid, email) for a user
 * by reconciling with the roster so access/progress records match reliably.
 */
export function getStudentIdentifiers(
  user: { id?: string; firebaseUid?: string; email?: string } | null,
  usersRoster: { id: string; firebaseUid?: string; email: string }[] = []
): string[] {
  if (!user) return [];

  const userEmailLower = user.email?.trim().toLowerCase();
  const rosterMatches = usersRoster.filter(
    (u) =>
      (user.id && (u.id === user.id || u.firebaseUid === user.id)) ||
      (user.firebaseUid && (u.firebaseUid === user.firebaseUid || u.id === user.firebaseUid)) ||
      (u.email && userEmailLower && u.email.trim().toLowerCase() === userEmailLower)
  );

  const raw = [
    user.id,
    user.firebaseUid,
    userEmailLower,
    ...rosterMatches.flatMap((m) => [m.id, m.firebaseUid, m.email?.trim().toLowerCase()]),
  ];

  return Array.from(
    new Set(
      raw
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim().toLowerCase())
    )
  );
}

/**
 * Matches a lessonAccess/lessonProgress lessonId against a Lesson object,
 * handling both MongoDB ObjectIds and legacy lsn-01 / lsn-1 mock IDs.
 */
export function matchesLessonIdentifier(
  recordLessonId: string | undefined,
  lesson: { id: string; lessonNumber: number }
): boolean {
  if (!recordLessonId) return false;
  if (recordLessonId === lesson.id) return true;
  const padded = `lsn-${String(lesson.lessonNumber).padStart(2, '0')}`;
  const unpadded = `lsn-${lesson.lessonNumber}`;
  return recordLessonId === padded || recordLessonId === unpadded;
}

/**
 * Resolves a student's enrolled course IDs across the currentUser object and usersRoster.
 */
export function getStudentEnrolledCourseIds(
  user: { id?: string; firebaseUid?: string; email?: string; enrolledCourseIds?: string[] } | null,
  usersRoster: { id: string; firebaseUid?: string; email: string; enrolledCourseIds?: string[] }[] = []
): string[] {
  if (!user) return [];
  const emailLower = user.email?.trim().toLowerCase();
  const rosterMatches = usersRoster.filter(
    (u) =>
      (user.id && (u.id === user.id || u.firebaseUid === user.id)) ||
      (user.firebaseUid && (u.firebaseUid === user.firebaseUid || u.id === user.firebaseUid)) ||
      (u.email && emailLower && u.email.trim().toLowerCase() === emailLower)
  );
  const combined = [
    ...(Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : []),
    ...rosterMatches.flatMap((m) => (Array.isArray(m.enrolledCourseIds) ? m.enrolledCourseIds : [])),
  ];
  return Array.from(
    new Set(combined.map((c) => String(c || '').trim()).filter(Boolean))
  );
}

/**
 * Helper to determine if a lesson is unlocked inside the Student Portal.
 * - Admin always has full access.
 * - Explicit Admin `lessonAccess` override always wins:
 *     `isUnlocked: true` permits a specific lecture (including from another course);
 *     `isUnlocked: false` explicitly locks a lecture.
 * - Without an explicit override:
 *     Common preview classes (`courseId === 'common'` or unset) are accessible to all active students.
 *     Course-specific lectures (`courseId` matching a course ID) are ONLY unlocked for students
 *     enrolled in that course — never leaked to unenrolled students via `isPublic`.
 * (Public homepage previews handle `lesson.isPublic` separately outside the student portal.)
 */
export function isLessonUnlockedForStudent(
  lesson: { id: string; lessonNumber: number; isPublic?: boolean; courseId?: string },
  user: { id?: string; firebaseUid?: string; email?: string; role?: string; enrolledCourseIds?: string[] } | null,
  usersRoster: { id: string; firebaseUid?: string; email: string; enrolledCourseIds?: string[] }[],
  lessonAccess: { studentId: string; lessonId: string; isUnlocked: boolean }[]
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const studentIdentifiers = getStudentIdentifiers(user, usersRoster);
  const enrolledCourseIds = getStudentEnrolledCourseIds(user, usersRoster);
  const lessonCourseId = (lesson.courseId || 'common').trim();
  const isCommonClass = !lessonCourseId || lessonCourseId.toLowerCase() === 'common';
  const isEnrolledInCourse = !isCommonClass && enrolledCourseIds.includes(lessonCourseId);

  const matchingRecords =
    studentIdentifiers.length === 0
      ? []
      : lessonAccess.filter(
          (la) =>
            studentIdentifiers.includes((la.studentId || '').trim().toLowerCase()) &&
            matchesLessonIdentifier(la.lessonId, lesson)
        );

  if (matchingRecords.length > 0) {
    // Prefer exact MongoDB lesson.id matches over legacy lsn-XX aliases
    const exactMatches = matchingRecords.filter((la) => la.lessonId === lesson.id);
    const effective = exactMatches.length > 0 ? exactMatches : matchingRecords;
    const explicitlyUnlocked = effective.some((la) => la.isUnlocked === true);
    if (explicitlyUnlocked) return true;
    // Explicit lock record (`isUnlocked: false`) blocks access
    return false;
  }

  // No explicit Admin override record:
  // Common preview classes are open to all active students; course lectures ONLY to enrolled course students
  if (isCommonClass) return true;
  if (isEnrolledInCourse) return true;
  return false;
}

/**
 * Finds a student's progress record for a lesson across all student & lesson ID aliases.
 */
export function findLessonProgressForStudent<
  T extends { studentId: string; lessonId: string; status: string }
>(
  lesson: { id: string; lessonNumber: number },
  user: { id?: string; firebaseUid?: string; email?: string } | null,
  usersRoster: { id: string; firebaseUid?: string; email: string }[],
  lessonProgress: T[]
): T | undefined {
  const studentIdentifiers = getStudentIdentifiers(user, usersRoster);
  if (studentIdentifiers.length === 0) return undefined;

  return (
    lessonProgress.find(
      (lp) =>
        studentIdentifiers.includes((lp.studentId || '').trim().toLowerCase()) &&
        lp.lessonId === lesson.id
    ) ||
    lessonProgress.find(
      (lp) =>
        studentIdentifiers.includes((lp.studentId || '').trim().toLowerCase()) &&
        matchesLessonIdentifier(lp.lessonId, lesson)
    )
  );
}

/**
 * Strictly validates an internal post-login redirect URL and enforces role isolation
 * so a student can NEVER be redirected into /admin/* and an admin can NEVER be
 * redirected into /student/*. Also prevents Open Redirect vulnerabilities.
 */
export function getSafeRoleRedirect(
  redirectUrl: string | null | undefined,
  role: 'admin' | 'student'
): string {
  const defaultDest = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  if (!redirectUrl || typeof redirectUrl !== 'string') return defaultDest;

  const trimmed = redirectUrl.trim();
  // Reject protocol-relative (//evil.com), external URLs, backslashes, or control characters
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\r\n]/.test(trimmed)
  ) {
    return defaultDest;
  }

  if (role === 'admin') {
    return trimmed === '/admin' || trimmed.startsWith('/admin/') ? trimmed : defaultDest;
  }

  // Student can NEVER land on /admin/*
  if (trimmed === '/admin' || trimmed.startsWith('/admin/')) {
    return defaultDest;
  }

  const allowedStudentPrefixes = ['/student/', '/payment-lobby', '/courses', '/cart', '/checkout', '/merchandise', '/lessons/'];
  if (trimmed === '/student' || allowedStudentPrefixes.some((p) => trimmed.startsWith(p))) {
    return trimmed;
  }

  return defaultDest;
}
