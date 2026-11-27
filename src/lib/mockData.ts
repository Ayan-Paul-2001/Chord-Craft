import { User, Lesson, LessonAccess, UserLessonProgress, Attendance, Product, Order, HomepageSection, Coupon, NoticeBoard, DeliveryFees, Course, CourseEnrollment } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'crs-01',
    title: 'Acoustic Fingerstyle Mastery',
    subtitle: 'Foundational Tone, Rhythm & Fingerstyle Artistry',
    description:
      'Build effortless P-I-M-A fingerstyle independence, CAGED fretboard fluency, clean chord voicings, and expressive acoustic solo arrangements from the ground up.',
    level: 'Beginner',
    price: 3500,
    originalPrice: 4500,
    duration: '8 Weeks',
    totalModules: 12,
    thumbnail:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      '12 HD Video Masterclasses & Drills',
      'Printable PDF TAB Workbooks & Backing Audio',
      'Weekly Mentor Feedback & Common Preview Clinics',
    ],
    instructorName: 'Julian Mercer',
    badge: 'Most Popular',
    isFeatured: true,
    isActive: true,
    order: 1,
    createdAt: '2025-01-05',
  },
  {
    id: 'crs-02',
    title: 'Electric Lead & Blues Phrasing',
    subtitle: 'Pentatonics, Bends, Vibrato & Legato Speed',
    description:
      'Command the electric fretboard with vocal pitch-accurate bending, soulful vibrato, connected pentatonic positions, and fluid 3-note-per-string legato phrasing.',
    level: 'Intermediate',
    price: 4800,
    originalPrice: 5800,
    duration: '10 Weeks',
    totalModules: 16,
    thumbnail:
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      '16 Studio Electric Lead Modules',
      'Loopable Blues & Rock Jam Backing Tracks',
      'Tone Sculpting & Expressive Improvisation Labs',
    ],
    instructorName: 'Julian Mercer',
    badge: 'Best Seller',
    isFeatured: true,
    isActive: true,
    order: 2,
    createdAt: '2025-01-12',
  },
  {
    id: 'crs-03',
    title: 'Neoclassical Sweep & Modal Virtuosity',
    subtitle: '5-String Sweep Arpeggios & Dorian Modal Fusion',
    description:
      'Push your technique to concert-ready levels with clean economy sweep picking, modal improvisation over modern progressions, and signature solo composition.',
    level: 'Advanced',
    price: 6200,
    originalPrice: 7500,
    duration: '12 Weeks',
    totalModules: 20,
    thumbnail:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      '20 Virtuoso Technique & Composition Modules',
      'Slow-to-Full Tempo Backing Tracks (70–140 BPM)',
      '1-on-1 Stage Readiness & Solo Critique',
    ],
    instructorName: 'Julian Mercer',
    badge: 'Conservatory Elite',
    isFeatured: true,
    isActive: true,
    order: 3,
    createdAt: '2025-01-20',
  },
  {
    id: 'crs-04',
    title: 'Studio Chord Craft & Songwriting',
    subtitle: 'Pro Triad Voicings, Embellishments & Arranging',
    description:
      'Transform ordinary chord progressions into lush studio guitar parts using close-voiced triads, double-stop melodies, and modern acoustic/electric arrangements.',
    level: 'All Levels',
    price: 4200,
    originalPrice: 5000,
    duration: '8 Weeks',
    totalModules: 14,
    thumbnail:
      'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      '14 Harmony & Arranging Masterclasses',
      'Real Session Chord Charts & TAB Sheets',
      'Songwriting Blueprints for Solo & Band Players',
    ],
    instructorName: 'Julian Mercer',
    badge: 'Studio Track',
    isFeatured: false,
    isActive: true,
    order: 4,
    createdAt: '2025-02-01',
  },
];

export const MOCK_COURSE_ENROLLMENTS: CourseEnrollment[] = [
  {
    id: 'ENR-2026-1001',
    studentId: 'usr-std-01',
    studentName: 'Tariq Hasan',
    studentEmail: 'tariq.hasan@gmail.com',
    studentMobile: '01819123456',
    courseId: 'crs-02',
    courseTitle: 'Electric Lead & Blues Phrasing',
    courseLevel: 'Intermediate',
    coursePrice: 4800,
    couponCode: '',
    couponDiscount: 0,
    totalAmount: 4800,
    paymentMethod: 'bKash',
    bKashSenderMobile: '01819123456',
    bKashTransactionId: 'BK9X4421A0',
    paymentStatus: 'Verified',
    enrollmentStatus: 'Approved',
    verifiedAt: '2025-02-15',
    createdAt: '2025-02-15',
  },
  {
    id: 'ENR-2026-1002',
    studentId: 'usr-std-02',
    studentName: 'Nusrat Jahan',
    studentEmail: 'nusrat.jahan@yahoo.com',
    studentMobile: '01712987654',
    courseId: 'crs-01',
    courseTitle: 'Acoustic Fingerstyle Mastery',
    courseLevel: 'Beginner',
    coursePrice: 3500,
    couponCode: 'CHORD10',
    couponDiscount: 350,
    totalAmount: 3150,
    paymentMethod: 'bKash',
    bKashSenderMobile: '01712987654',
    bKashTransactionId: 'BK7M9012C4',
    paymentStatus: 'Verified',
    enrollmentStatus: 'Approved',
    verifiedAt: '2025-03-01',
    createdAt: '2025-03-01',
  },
  {
    id: 'ENR-2026-1003',
    studentId: 'usr-std-06',
    studentName: 'Abrar Chowdhury',
    studentEmail: 'abrar.chowdhury@gmail.com',
    studentMobile: '01715112233',
    courseId: 'crs-01',
    courseTitle: 'Acoustic Fingerstyle Mastery',
    courseLevel: 'Beginner',
    coursePrice: 3500,
    couponCode: '',
    couponDiscount: 0,
    totalAmount: 3500,
    paymentMethod: 'bKash',
    bKashSenderMobile: '01715112233',
    bKashTransactionId: 'BK5Q8831Z9',
    paymentStatus: 'Pending',
    enrollmentStatus: 'Pending Verification',
    createdAt: '2025-04-18',
  },
];

export const MOCK_ADMIN: User = {
  id: 'usr-admin-01',
  fullName: 'Julian Mercer',
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@chordandcraft.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
  role: 'admin',
  mobile: '+880 1711-000000',
  registrationDate: '2023-01-01',
  status: 'Active',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
};

export const MOCK_STUDENTS: User[] = [
  {
    id: 'usr-std-01',
    fullName: 'Tariq Hasan',
    email: 'tariq.hasan@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1819-123456',
    dateOfBirth: '1998-05-14',
    level: 'Intermediate',
    registrationDate: '2024-02-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: ['crs-01', 'crs-02'],
    selectedCourseId: 'crs-02',
  },
  {
    id: 'usr-std-02',
    fullName: 'Nusrat Jahan',
    email: 'nusrat.jahan@yahoo.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1712-987654',
    dateOfBirth: '2001-09-20',
    level: 'Beginner',
    registrationDate: '2024-03-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: ['crs-01'],
    selectedCourseId: 'crs-01',
  },
  {
    id: 'usr-std-03',
    fullName: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@outlook.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1911-456789',
    dateOfBirth: '1995-11-03',
    level: 'Advanced',
    registrationDate: '2023-11-10',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: ['crs-02', 'crs-03'],
    selectedCourseId: 'crs-03',
  },
  {
    id: 'usr-std-04',
    fullName: 'Farhan Kabir',
    email: 'farhan.kabir@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1680-334455',
    dateOfBirth: '2002-01-25',
    level: 'Beginner',
    registrationDate: '2024-04-12',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: ['crs-01', 'crs-04'],
    selectedCourseId: 'crs-01',
  },
  {
    id: 'usr-std-05',
    fullName: 'Sadiya Rahman',
    email: 'sadiya.r@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1552-889900',
    dateOfBirth: '1999-07-18',
    level: 'Intermediate',
    registrationDate: '2024-01-08',
    status: 'Inactive',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: ['crs-02'],
    selectedCourseId: 'crs-02',
  },
  {
    id: 'usr-std-06',
    fullName: 'Abrar Chowdhury',
    email: 'abrar.chowdhury@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1715-112233',
    dateOfBirth: '2003-08-12',
    level: 'Beginner',
    registrationDate: '2024-04-18',
    status: 'Pending',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: [],
    selectedCourseId: 'crs-01',
  },
  {
    id: 'usr-std-07',
    fullName: 'Mehnaz Tabassum',
    email: 'mehnaz.tabassum@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1844-998877',
    dateOfBirth: '2000-11-30',
    level: 'Intermediate',
    registrationDate: '2024-04-19',
    status: 'Pending',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    enrolledCourseIds: [],
    selectedCourseId: 'crs-02',
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lsn-01',
    title: 'Alternate Picking Fundamentals & Hand Synchronization',
    description: 'Master relaxed wrist-driven alternate picking mechanics, pick slanting, and clean string transitions across all six guitar strings with metronome drills.',
    level: 'Beginner',
    courseId: 'common',
    lessonNumber: 1,
    videoUrl: 'https://www.youtube.com/embed/q8SHmo1-dac',
    audioUrl: '/audio/lesson-01-alternate-picking-90bpm.wav',
    tabPreviewText: `  D U D U   D U D U   D U D U   D U D U
e|-----------------------------------------5-6-7-8-|
B|-------------------------------5-6-7-8-----------|
G|---------------------5-6-7-8---------------------|
D|-----------5-6-7-8-------------------------------|
A|---5-6-7-8---------------------------------------|
E|-5-6-7-8-----------------------------------------|`,
    tabFileUrl: '/tabs/lesson-01-alternate-picking.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 18,
    instructorNotes: 'Keep your picking wrist loose and angle the pick 15–20 degrees so it glides cleanly off the string. Start at 60 BPM and advance in 5 BPM increments only after 4 spotless cycles.',
    isPublic: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'lsn-02',
    title: 'Acoustic Fingerstyle Foundations & Arpeggio Patterns',
    description: 'Establish independent P-I-M-A right-hand finger assignment for resonant acoustic fingerpicking over timeless C, G, Am, and Fmaj7 chord progressions.',
    level: 'Beginner',
    courseId: 'common',
    lessonNumber: 2,
    videoUrl: 'https://www.youtube.com/embed/qQGP96XHBkg',
    audioUrl: '/audio/lesson-02-fingerstyle-85bpm.wav',
    tabPreviewText: `   C                G                Am               Fmaj7
e|-------0--------|-------3--------|-------0--------|-------0--------|
B|-----1---1------|-----0---0------|-----1---1------|-----1---1------|
G|---0-------0----|---0-------0----|---2-------2----|---2-------2----|
D|----------------|----------------|----------------|-3--------------|
A|-3--------------|----------------|-0--------------|----------------|
E|----------------|-3--------------|----------------|----------------|`,
    tabFileUrl: '/tabs/lesson-02-acoustic-fingerstyle.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 22,
    instructorNotes: 'Assign thumb (P) to bass strings 6-5-4, index (I) to G, middle (M) to B, and ring (A) to high E. Let every chord tone ring into the next note for rich acoustic sustain.',
    isPublic: true,
    createdAt: '2025-01-18',
  },
  {
    id: 'lsn-03',
    title: 'Minor Pentatonic Scale Patterns & Expressive Bending',
    description: 'Connect Position 1 & 2 of the A Minor Pentatonic scale while mastering pitch-accurate whole-step bends, release phrasing, and soulful blues vibrato.',
    level: 'Beginner',
    courseId: 'crs-02',
    lessonNumber: 3,
    videoUrl: 'https://www.youtube.com/embed/DCbqWevnhuo',
    audioUrl: '/audio/lesson-03-pentatonic-blues-95bpm.wav',
    tabPreviewText: `   Pos 1 Ascend          Slide to Pos 2       Full-Step Bend + Vibrato
e|-----------------5-8-|-8/10--8-------------|-----------------------|
B|-------------5-8-----|---------10--8-10b12-|-(12)~---10-8----------|
G|---------5-7---------|---------------------|--------------9~-------|
D|-----5-7-------------|---------------------|-----------------------|
A|-5-7-----------------|---------------------|-----------------------|
E|---------------------|---------------------|-----------------------|`,
    tabFileUrl: '/tabs/lesson-03-pentatonic-bending.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 28,
    instructorNotes: 'Play your target pitch first (fret 12 on B string), then bend fret 10 up to match it precisely. Stack your index and middle fingers behind your ring finger for strength and control.',
    isPublic: true,
    createdAt: '2025-01-25',
  },
  {
    id: 'lsn-04',
    title: 'CAGED System & Triad Inversions Across the Fretboard',
    description: 'Unlock complete fretboard visualization using interconnected CAGED chord shapes and major/minor triad inversions on the top three string sets.',
    level: 'Intermediate',
    courseId: 'crs-01',
    lessonNumber: 4,
    videoUrl: 'https://www.youtube.com/embed/L-0c5QTQ8Q0',
    audioUrl: '/audio/lesson-04-caged-triads-100bpm.wav',
    tabPreviewText: `   C Shape    A Shape    G Shape    E Shape    D Shape   (Key of C)
e|--0-------|--3-------|--8-------|--8-------|--12------|
B|--1-------|--5-------|--5-------|--8-------|--13------|
G|--0-------|--5-------|--5-------|--9-------|--12------|
D|--2-------|--5-------|--5-------|--10------|--10------|
A|--3-------|--3-------|--7-------|--10------|----------|
E|----------|----------|--8-------|--8-------|----------|`,
    tabFileUrl: '/tabs/lesson-04-caged-triads.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 35,
    instructorNotes: 'Memorize the root note positions for C, A, G, E, and D shapes across strings 6, 5, and 4, then voice-lead a I–IV–V progression staying inside frets 5 through 9.',
    isPublic: false,
    createdAt: '2025-02-01',
  },
  {
    id: 'lsn-05',
    title: 'Pro Triad Voicings & Melodic Chord Embellishments',
    description: 'Turn standard rhythm progressions into expressive studio guitar parts using close-voiced triads, sus4 hammer-ons, and tasteful double-stop fills.',
    level: 'Intermediate',
    courseId: 'crs-04',
    lessonNumber: 5,
    videoUrl: 'https://www.youtube.com/embed/c5-rukDUHA8',
    audioUrl: '/audio/lesson-05-triad-groove-105bpm.wav',
    tabPreviewText: `   G Triad + sus4     D/F# Triad        Em7 Embellish     C Add9 Double-Stop
e|--7--7h8p7--------|-----------------|-----------------|-------------------|
B|--8--------8------|--7--7h8p7-------|--8--8h10p8------|--8----------------|
G|--7----------7----|--7--------7-----|--7---------9----|--9--9h11p9--------|
D|------------------|--7--------------|--9--------------|--10--------10-----|
A|------------------|-----------------|-----------------|-------------------|
E|------------------|-----------------|-----------------|-------------------|`,
    tabFileUrl: '/tabs/lesson-05-pro-triads.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 30,
    instructorNotes: 'Target the 3rd and 5th of each chord when adding hammer-on embellishments. Mute unused bass strings lightly with your fretting index tip for studio-clean clarity.',
    isPublic: false,
    createdAt: '2025-02-10',
  },
  {
    id: 'lsn-06',
    title: 'Legato Technique: Smooth Hammer-Ons & Pull-Offs',
    description: 'Develop left-hand stamina, finger independence, and vocal speed using 3-note-per-string diatonic legato sequences with even note dynamics.',
    level: 'Intermediate',
    courseId: 'crs-02',
    lessonNumber: 6,
    videoUrl: 'https://www.youtube.com/embed/GV5Gyh9253E',
    audioUrl: '/audio/lesson-06-legato-workout-115bpm.wav',
    tabPreviewText: `   3-Note-Per-String Legato Sequence (Pick first note per string only)
e|----------------------------------------5h7h8p7p5--------------------|
B|--------------------------5h6h8p6p5----------------8p6p5-------------|
G|--------------4h5h7p5p4----------------------------------7p5p4-------|
D|--5h7p5--------------------------------------------------------7-----|
A|--------7------------------------------------------------------------|
E|---------------------------------------------------------------------|`,
    tabFileUrl: '/tabs/lesson-06-legato-mastery.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 34,
    instructorNotes: 'Keep your thumb centered behind the neck for effortless pinky reach. Pull off slightly downward toward the floor so unpicked notes match picked volume.',
    isPublic: false,
    createdAt: '2025-02-18',
  },
  {
    id: 'lsn-07',
    title: 'Sweep Picking Arpeggios & Neoclassical Speed Riffs',
    description: 'Master fluid 3-string and 5-string sweep picking economy motion, finger rolling, disciplined palm muting, and high-register tap extensions.',
    level: 'Advanced',
    courseId: 'crs-03',
    lessonNumber: 7,
    videoUrl: 'https://www.youtube.com/embed/oH6pZBheyXE',
    audioUrl: '/audio/lesson-07-sweep-arpeggios-120bpm.wav',
    tabPreviewText: `   A Minor 5-String Sweep (D D D D D h p U U U U)
e|------------12h17p12------------|------------12h16p12------------|
B|---------13----------13---------|---------12----------12---------|
G|------14----------------14------|------13----------------13------|
D|---14----------------------14---|---14----------------------14---|
A|-15--------------------------15-|-14--------------------------14-|
E|--------------------------------|--------------------------------|`,
    tabFileUrl: '/tabs/lesson-07-sweep-arpeggios.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 46,
    instructorNotes: 'Sweep picking is one continuous rest-stroke glide rather than separate strokes. Release each fretting finger immediately after sounding so notes remain crisp and separated.',
    isPublic: false,
    createdAt: '2025-03-01',
  },
  {
    id: 'lsn-08',
    title: 'Modal Improvisation: Dorian Mode & Pentatonic Fusion',
    description: 'Explore Dorian modal soloing over Dm7–G7 studio vamps, weaving the characteristic major 6th color tone seamlessly into modern lead phrasing.',
    level: 'Advanced',
    courseId: 'crs-03',
    lessonNumber: 8,
    videoUrl: 'https://www.youtube.com/embed/dJfV7DsTThc',
    audioUrl: '/audio/lesson-08-dorian-vamp-108bpm.wav',
    tabPreviewText: `   D Dorian Characteristic Phrase (Highlight B natural - Major 6th!)
e|-----------------10-12-13p12p10----------|----------------------------|
B|---------10-12-13---------------13-12~---|-10h12p10-------------------|
G|---10-12---------------------------------|----------12-10-12b14r12-10-|
D|-12--------------------------------------|----------------------------|
A|-----------------------------------------|----------------------------|
E|-----------------------------------------|----------------------------|`,
    tabFileUrl: '/tabs/lesson-08-modal-dorian.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 42,
    instructorNotes: 'Loop the Dm7–G7 backing track and land your melodic resolutions on the major 6th (B natural, fret 12 on B string) to hear the unmistakable luminous Dorian flavor.',
    isPublic: false,
    createdAt: '2025-03-15',
  },
];

export const MOCK_LESSON_ACCESS: LessonAccess[] = [
  // Tariq Hasan (Intermediate student)
  { studentId: 'usr-std-01', lessonId: 'lsn-01', isUnlocked: true, unlockedAt: '2025-02-15' },
  { studentId: 'usr-std-01', lessonId: 'lsn-02', isUnlocked: true, unlockedAt: '2025-02-18' },
  { studentId: 'usr-std-01', lessonId: 'lsn-03', isUnlocked: true, unlockedAt: '2025-02-22' },
  { studentId: 'usr-std-01', lessonId: 'lsn-04', isUnlocked: true, unlockedAt: '2025-03-01' },
  { studentId: 'usr-std-01', lessonId: 'lsn-05', isUnlocked: true, unlockedAt: '2025-03-08' },
  { studentId: 'usr-std-01', lessonId: 'lsn-06', isUnlocked: true, unlockedAt: '2025-03-14' },
  { studentId: 'usr-std-01', lessonId: 'lsn-07', isUnlocked: false },
  { studentId: 'usr-std-01', lessonId: 'lsn-08', isUnlocked: false },

  // Nusrat Jahan (Beginner student)
  { studentId: 'usr-std-02', lessonId: 'lsn-01', isUnlocked: true, unlockedAt: '2025-03-01' },
  { studentId: 'usr-std-02', lessonId: 'lsn-02', isUnlocked: true, unlockedAt: '2025-03-08' },
  { studentId: 'usr-std-02', lessonId: 'lsn-03', isUnlocked: true, unlockedAt: '2025-03-15' },
  { studentId: 'usr-std-02', lessonId: 'lsn-04', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-05', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-06', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-07', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-08', isUnlocked: false },

  // Tanvir Ahmed (Advanced student - all unlocked)
  { studentId: 'usr-std-03', lessonId: 'lsn-01', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-02', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-03', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-04', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-05', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-06', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-07', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-08', isUnlocked: true },
];

export const MOCK_LESSON_PROGRESS: UserLessonProgress[] = [
  { studentId: 'usr-std-01', lessonId: 'lsn-01', status: 'Completed', completedAt: '2025-02-18' },
  { studentId: 'usr-std-01', lessonId: 'lsn-02', status: 'Completed', completedAt: '2025-02-24' },
  { studentId: 'usr-std-01', lessonId: 'lsn-03', status: 'Completed', completedAt: '2025-03-02' },
  { studentId: 'usr-std-01', lessonId: 'lsn-04', status: 'In Progress', lastAccessed: '2025-04-01' },
  { studentId: 'usr-std-01', lessonId: 'lsn-05', status: 'Unlocked' },
  { studentId: 'usr-std-01', lessonId: 'lsn-06', status: 'Unlocked' },
  { studentId: 'usr-std-01', lessonId: 'lsn-07', status: 'Locked' },
  { studentId: 'usr-std-01', lessonId: 'lsn-08', status: 'Locked' },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'att-01', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2025-04-05', status: 'Present', notes: 'Excellent technique on alternate picking exercises.' },
  { id: 'att-02', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2025-03-29', status: 'Present', notes: 'Worked on minor pentatonic bends.' },
  { id: 'att-03', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2025-03-22', status: 'Late', notes: '15 mins late due to traffic. Completed CAGED shapes.' },
  { id: 'att-04', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2025-03-15', status: 'Present' },
  { id: 'att-05', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2025-03-08', status: 'Excused', notes: 'Prior medical appointment notified in advance.' },
  { id: 'att-06', studentId: 'usr-std-02', studentName: 'Nusrat Jahan', date: '2025-04-05', status: 'Present', notes: 'Improving thumb posture and arpeggio flow.' },
  { id: 'att-07', studentId: 'usr-std-02', studentName: 'Nusrat Jahan', date: '2025-03-29', status: 'Absent', notes: 'No call received.' },
  { id: 'att-08', studentId: 'usr-std-03', studentName: 'Tanvir Ahmed', date: '2025-04-05', status: 'Present', notes: 'Mastered sweep picking at 140 BPM.' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-01',
    name: 'Chord & Craft Signature Heavy Picks (Pack of 12)',
    description: 'Precision 1.5mm sculpted Delrin guitar picks featuring champagne gold foil Chord & Craft crest embossing. Custom beveled edge for effortless alternate picking.',
    price: 650,
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80'],
    stock: 45,
    category: 'Accessories',
    isActive: true,
  },
  {
    id: 'prd-02',
    name: 'Chord & Craft Heritage Vintage Leather Strap',
    description: 'Handcrafted full-grain genuine leather guitar strap with plush suede backing. Adjustable length (42"-58") with brass hardware and reinforced pin holes.',
    price: 2450,
    images: ['https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=600&q=80'],
    stock: 18,
    category: 'Accessories',
    isActive: true,
  },
  {
    id: 'prd-03',
    name: 'Harmonic Guitar Academy Heavyweight Hoodie',
    description: 'Ultra-soft 380 GSM fleece hoodie in Obsidian Black with golden embroidered Chord & Craft rosette crest and minimalist fretboard sleeve detailing.',
    price: 3200,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'],
    stock: 24,
    category: 'Apparel',
    isActive: true,
  },
  {
    id: 'prd-04',
    name: 'Chord & Craft Masterclass Notation Workbook (Hardcover)',
    description: 'Comprehensive 180-page lay-flat notation & TAB workbook authored by Julian Mercer at Harmonic Guitar Academy. Includes CAGED maps, solo transcriptions, & studio drills.',
    price: 1850,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    stock: 30,
    category: 'Learning Material',
    isActive: true,
  },
  {
    id: 'prd-05',
    name: 'Chord & Craft Braided Studio Instrument Cable (10ft / 3m)',
    description: 'Low-capacitance oxygen-free copper braided instrument cable with gold-plated Neutrik 1/4" connectors for transparent studio tone.',
    price: 1600,
    images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'],
    stock: 12,
    category: 'Accessories',
    isActive: true,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2025-8841',
    studentId: 'usr-std-01',
    customerName: 'Tariq Hasan',
    customerMobile: '+880 1819-123456',
    customerEmail: 'tariq.hasan@gmail.com',
    deliveryAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2 },
      { product: MOCK_PRODUCTS[3], quantity: 1 },
    ],
    subtotal: 3150,
    totalAmount: 3230,
    paymentMethod: 'bKash',
    bKashTransactionId: 'BK9X7721A0',
    bKashSenderMobile: '01819123456',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    createdAt: '2025-04-06 14:30',
    notes: 'Please verify bKash payment.',
  },
  {
    id: 'ORD-2025-8790',
    studentId: 'usr-std-02',
    customerName: 'Nusrat Jahan',
    customerMobile: '+880 1712-987654',
    customerEmail: 'nusrat.jahan@yahoo.com',
    deliveryAddress: 'Flat 4B, Green Road, Dhanmondi, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[1], quantity: 1 },
    ],
    subtotal: 2450,
    totalAmount: 2530,
    paymentMethod: 'bKash',
    bKashTransactionId: 'BK8Y9912C3',
    bKashSenderMobile: '01712987654',
    paymentStatus: 'Verified',
    orderStatus: 'Processing',
    createdAt: '2025-04-02 11:15',
  },
  {
    id: 'ORD-2025-8622',
    studentId: 'usr-std-03',
    customerName: 'Tanvir Ahmed',
    customerMobile: '+880 1911-456789',
    customerEmail: 'tanvir.ahmed@outlook.com',
    deliveryAddress: 'Sector 4, Road 7, Uttara, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 1 },
      { product: MOCK_PRODUCTS[0], quantity: 1 },
    ],
    subtotal: 3850,
    totalAmount: 3930,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Delivered',
    createdAt: '2025-03-25 18:40',
  },
];

export const MOCK_CMS_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    title: 'Master the Art of Guitar with Julian Mercer',
    subtitle: 'Structured YouTube HD masterclasses, downloadable PDF tab sheets, studio backing tracks, and personalized mentorship at Harmonic Guitar Academy.',
    content: 'Elevate your musicality from foundational picking mechanics to expressive acoustic & electric artistry.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Explore Curriculum',
    buttonLink: '#curriculum',
    enabled: true,
    order: 1,
  },
  {
    id: 'sec-about',
    title: 'The Chord & Craft Philosophy',
    subtitle: 'Music is not merely memorizing shapes — it is tone, touch, & harmonic craft.',
    content: 'Chord & Craft was founded at Harmonic Guitar Academy by Julian Mercer to bridge mechanical precision and deeply expressive guitar playing. Every module refines rhythm, fretboard fluency, and musical storytelling.',
    imageUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80',
    enabled: true,
    order: 2,
  },
  {
    id: 'sec-instructor',
    title: 'Meet Your Mentor — Julian Mercer',
    subtitle: 'Session guitarist, composer, & Lead Mentor at Harmonic Guitar Academy.',
    content: 'With over two decades of studio sessions, live concert arrangements, and conservatory pedagogy, Julian Mercer brings clarity, warmth, and structured craftsmanship to help every guitarist discover their unmistakable voice.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    buttonText: 'View Student Testimonials',
    buttonLink: '#testimonials',
    enabled: true,
    order: 3,
  },
  {
    id: 'sec-process',
    title: 'The 4-Stage Learning Roadmap',
    subtitle: 'Proven conservatory pathway from absolute beginner to confident stage guitarist.',
    content: '1. Foundation & Picking Mechanics -> 2. Fingerstyle, CAGED & Triads -> 3. Expressive Legato & Phrasing -> 4. Sweep Arpeggios & Modal Mastery.',
    enabled: true,
    order: 4,
  },
  {
    id: 'sec-featured',
    title: 'Featured Academy Lessons',
    subtitle: 'Watch embedded HD YouTube demo lessons paired with playable studio backing tracks and downloadable PDF tabs.',
    content: 'Explore publicly unlocked demo lessons across Acoustic Fingerstyle, Alternate Picking, and Blues Pentatonic phrasing.',
    enabled: true,
    order: 5,
  },
  {
    id: 'sec-courses',
    title: 'Conservatory Guitar Courses',
    subtitle: 'Structured Programs',
    content:
      'Choose a dedicated guitar track tailored to your skill level. Unlock structured HD masterclasses, printable PDF TABs, studio backing tracks, and shared Common preview classes.',
    buttonText: 'Browse All Courses',
    buttonLink: '/courses',
    enabled: true,
    order: 6,
  },
  {
    id: 'sec-why',
    title: 'Why Study at Chord & Craft?',
    subtitle: 'A modern conservatory built for focused, measurable guitar mastery.',
    content: 'Curated YouTube HD masterclasses, downloadable PDF tab workbooks, studio backing tracks, and boutique academy gear.',
    enabled: true,
    order: 7,
  },
  {
    id: 'sec-testimonials',
    title: 'What Our Students Say',
    subtitle: 'Real stories from passionate guitarists at Harmonic Guitar Academy.',
    content: 'Over 500+ guitarists have elevated their craft with Chord & Craft.',
    enabled: true,
    order: 8,
  },
  {
    id: 'sec-merch',
    title: 'Official Chord & Craft Gear',
    subtitle: 'Signature picks, heritage leather straps, academy hoodies, and hardcover notation workbooks.',
    content: 'Studio-grade gear crafted for discerning guitarists.',
    buttonText: 'Shop Merchandise',
    buttonLink: '/merchandise',
    enabled: true,
    order: 9,
  },
  {
    id: 'sec-cta',
    title: 'Ready to Elevate Your Guitar Craft?',
    subtitle: 'Enroll at Harmonic Guitar Academy and unlock structured lessons, tabs, & mentorship.',
    content: 'Join Chord & Craft — Harmonic Guitar Academy today.',
    buttonText: 'Join Harmonic Academy',
    buttonLink: '/signup',
    enabled: true,
    order: 10,
  },
];

export const DEFAULT_DELIVERY_FEES: DeliveryFees = {
  insideDhaka: 80,
  outsideDhaka: 150,
};

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cpn-01',
    code: 'CHORD10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 500,
    isActive: true,
    description: '10% off on all official Chord & Craft accessories & apparel',
    usageCount: 14,
    createdAt: '2025-03-01',
  },
  {
    id: 'cpn-02',
    code: 'CRAFT200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1000,
    isActive: true,
    description: '৳200 flat discount on Harmonic Guitar Academy gear orders',
    usageCount: 8,
    createdAt: '2025-03-10',
  },
  {
    id: 'cpn-03',
    code: 'HARMONIC15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1200,
    maxDiscount: 750,
    isActive: true,
    description: '15% seasonal discount for enrolled Harmonic Guitar Academy students',
    usageCount: 5,
    createdAt: '2025-03-15',
  },
];

export const DEFAULT_NOTICE_BOARD: NoticeBoard = {
  isActive: true,
  title: '🎸 Live Masterclass with Mentor Julian Mercer!',
  message: 'Julian Mercer is hosting an interactive Tone, Phrasing & Q&A clinic this Friday at 8:00 PM at Harmonic Guitar Academy. Review your unlocked YouTube lessons and download the PDF TAB sheets beforehand!',
  type: 'announcement',
  badgeLabel: 'Announcement',
  badgeIcon: 'megaphone',
  accentColor: '#f59e0b',
  backgroundColor: '#141419',
  textColor: '#ffffff',
  updatedAt: '2026-11-26T10:00:00.000Z',
};

export const DEFAULT_LEGAL_POLICIES: import('./types').LegalPolicies = {
  privacyPolicy: {
    title: 'Privacy Policy',
    subtitle: 'How Chord & Craft protects your personal learning data, account credentials, & privacy.',
    lastUpdated: 'November 2026',
    content: `### 1. Academy Privacy Commitment
At **Chord & Craft (Harmonic Guitar Academy)**, we respect and safeguard the privacy of every student, guitarist, and website visitor. This policy explains what information we collect, how it is utilized for your musical education, and your confidentiality rights.

### 2. Information We Collect
When you register for an academy student account or order merchandise, we may collect:
- **Personal Identification**: Full name, contact email address, mobile phone number, and date of birth.
- **Musical Skill Level**: Selected guitar proficiency (Beginner, Intermediate, Advanced) to customize your curriculum roadmap.
- **Academic Progress Data**: Practice log timestamps, lesson completion statuses, attendance records, and mentor feedback.
- **Order & Transaction Data**: Shipping addresses, selected delivery zones, applied coupon codes, and bKash transaction identifiers. We do **not** store raw credit/debit card numbers.

### 3. How We Use Your Data
- To authenticate your student login and provide access to unlocked masterclasses, studio backing tracks, and interactive tabs.
- To process and ship official Chord & Craft merchandise and apparel to your doorstep.
- To notify you regarding upcoming live Q&A sessions, module unlock approvals, and academy announcements.
- To maintain security and prevent unauthorized account sharing.

### 4. 24-Hour Session Cookie Retention
When you sign in to Chord & Craft, an encrypted HttpOnly session cookie keeps you signed in continuously for 24 hours so you do not need to log in repeatedly across page refreshes or visits. After 24 hours of issuance (or immediately when you click Sign Out), the session cookie automatically expires for your security.

### 5. Third-Party Integrations
We partner with trusted service providers strictly to power our platform:
- **Firebase Authentication & Cloud**: Secure Google OAuth and email verification services.
- **YouTube & Cloudinary CDN**: High-definition video streaming, media delivery, and asset hosting.
- **MongoDB Atlas**: Encrypted database infrastructure.

### 6. Your Data Rights
You may update your profile information at any time from your student portal. To request full account deletion or data export, contact our administrative team at **support@chordandcraft.com**.`,
  },
  termsOfService: {
    title: 'Terms of Service',
    subtitle: 'Student enrollment agreements, curriculum copyright, & Harmonic Guitar Academy code of conduct.',
    lastUpdated: 'November 2026',
    content: `### 1. Acceptance of Terms
By accessing **Chord & Craft**, registering as a student at **Harmonic Guitar Academy**, or purchasing official merchandise, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.

### 2. Student Enrollment & Account Verification
- Registration requires valid personal details including full legal name, active mobile number, and email address.
- All new student registrations undergo administrative review by academy mentors.
- Accounts with **"Pending"** status will gain access to curriculum modules once enrollment verification is completed by the administration.
- You are responsible for maintaining the confidentiality of your account credentials. Account sharing or credential distribution is strictly prohibited.

### 3. Intellectual Property & Copyright
All educational video lessons, custom PDF TAB notation files, studio backing tracks, and learning roadmaps curated on Chord & Craft are the exclusive intellectual property of **Chord & Craft** and **Harmonic Guitar Academy**.
- Content is licensed strictly for personal, non-commercial guitar practice by the registered student.
- Republishing, re-distributing, or commercially broadcasting academy lesson materials without prior written consent is prohibited.

### 4. Merchandise Orders & Deliveries
- Merchandise prices are listed in Bangladeshi Taka (৳ BDT) and include applicable platform charges.
- Standard delivery timelines: **24–48 Hours** for Inside Dhaka and **2–4 Business Days** for Outside Dhaka.
- Defective or damaged merchandise items are eligible for free replacement within **7 days** of delivery.

### 5. Code of Conduct & Academic Integrity
Students are expected to maintain respectful behavior within academy communities, live masterclasses, and mentor Q&A sessions. Harassment, disruptive conduct, or academic dishonesty may lead to account suspension.`,
  },
  bkashFaq: {
    title: 'bKash Payment FAQ',
    subtitle: 'Step-by-step guidance for course enrollment payments, gear purchases, & TrxID verification.',
    lastUpdated: 'November 2026',
    content: `### 1. How do I pay using bKash?
Paying for your Chord & Craft merchandise or academy enrollment is simple and fast:
1. Open your **bKash App** on your smartphone.
2. Select **"Send Money"** (or Payment if using a merchant QR code).
3. Enter our official Harmonic Guitar Academy Number: **01711-000000** (Personal / Merchant).
4. Enter the exact **Total Payable Amount** shown at checkout.
5. In the reference field, you can write your **Name** or **Order ID**.
6. Enter your bKash PIN and tap & hold to complete the transaction.
7. Copy the **Transaction ID (TrxID)** (e.g. \`9J28DA10K\`) and paste it into the TrxID field on the Chord & Craft checkout screen.

### 2. How long does bKash verification take?
- Once you submit your order with the TrxID, our billing department verifies the transaction against our live merchant ledger.
- Verification is typically completed within **15 to 30 minutes** during normal academy hours (9:00 AM – 10:00 PM BST).
- You can check your order status under **My Orders** in the student portal.

### 3. What if I entered the wrong TrxID or made a typo?
Don't worry! If you accidentally entered an incorrect TrxID or sender phone number:
- Reach out to our billing support immediately via WhatsApp/Phone at **+880 1711-000000** or email **support@chordandcraft.com**.
- Provide your Order ID, student email, and the correct screenshot of your bKash transaction.
- Our admin team will manually match and update your payment status to **Verified**.

### 4. Are delivery fees included in the bKash payment?
Yes! Our dynamic checkout automatically calculates the delivery charge:
- **Inside Dhaka**: ৳80 delivery charge.
- **Outside Dhaka**: ৳150 nationwide delivery charge.
- The total amount shown on the checkout screen is the exact final amount you need to send via bKash.

### 5. What is the refund policy for bKash payments?
- If an ordered merchandise item is out of stock, a 100% full refund is issued back to your bKash account within **24 hours**.
- Course fee adjustments and cancellation inquiries can be submitted directly to our administrative office.`,
  },
};

export const DEFAULT_SOCIAL_LINKS: import('./types').SocialMediaLink[] = [
  { id: 'soc-1', platform: 'youtube', label: 'YouTube Channel', url: 'https://youtube.com/@chordandcraft', isEnabled: true },
  { id: 'soc-2', platform: 'facebook', label: 'Facebook Page', url: 'https://facebook.com/chordandcraft.academy', isEnabled: true },
  { id: 'soc-3', platform: 'instagram', label: 'Instagram Profile', url: 'https://instagram.com/chordandcraft.academy', isEnabled: true },
  { id: 'soc-4', platform: 'spotify', label: 'Spotify Sessions', url: 'https://open.spotify.com', isEnabled: false },
  { id: 'soc-5', platform: 'whatsapp', label: 'WhatsApp Helpline', url: 'https://wa.me/8801711000000', isEnabled: false },
  { id: 'soc-6', platform: 'tiktok', label: 'TikTok Channel', url: '', isEnabled: false },
  { id: 'soc-7', platform: 'soundcloud', label: 'SoundCloud Jams', url: '', isEnabled: false },
  { id: 'soc-8', platform: 'twitter', label: 'X (Twitter)', url: '', isEnabled: false },
];

export const MOCK_REVIEWS: import('./types').StudentReview[] = [
  {
    id: 'rev-01',
    studentId: 'usr-std-01',
    studentEmail: 'tariq.hasan@gmail.com',
    name: 'Tariq Hasan',
    level: 'Intermediate Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    comment: 'Julian Mercer’s alternate picking module changed my playing completely within 3 weeks. The downloadable PDF tabs and backing tracks are crystal clear.',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'rev-02',
    studentId: 'usr-std-02',
    studentEmail: 'nusrat.jahan@yahoo.com',
    name: 'Nusrat Jahan',
    level: 'Beginner Student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    comment: 'As a beginner, I struggled with string buzz and finger fatigue. Chord & Craft’s acoustic fingerstyle lesson gave me relaxed posture and warm tone immediately!',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-22T14:30:00Z',
  },
  {
    id: 'rev-03',
    studentId: 'usr-std-03',
    studentEmail: 'tanvir.ahmed@outlook.com',
    name: 'Tanvir Ahmed',
    level: 'Advanced Soloist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    comment: 'The 5-string sweep arpeggio breakdown at Harmonic Guitar Academy gave me the precision and clarity I needed for recording studio lead tracks.',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-25T09:15:00Z',
  },
  {
    id: 'rev-04',
    studentId: 'usr-std-04',
    studentEmail: 'ayanpaul246@gmail.com',
    name: 'Ayan Paul',
    level: 'Beginner Student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
    comment: 'Learning CAGED triads and pentatonic bending with mentor Julian Mercer has been inspiring. The Chord & Craft dashboard makes tracking progress effortless!',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-26T16:45:00Z',
  },
  {
    id: 'rev-05',
    studentId: 'usr-std-05',
    studentEmail: 'samiul.islam@gmail.com',
    name: 'Samiul Islam',
    level: 'Intermediate Student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    comment: 'The Dorian modal phrasing lessons and Harmonic Guitar Academy clinic feedback helped me craft expressive solos with genuine dynamic control.',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-27T11:20:00Z',
  },
];
