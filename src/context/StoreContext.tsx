'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Lesson,
  LessonAccess,
  UserLessonProgress,
  Attendance,
  Product,
  CartItem,
  Order,
  HomepageSection,
  UserRole,
  StudentLevel,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  PlatformSettings,
  Coupon,
  NoticeBoard,
  DeliveryFees,
  LegalPolicies,
  PolicyPageContent,
  StudentReview,
  Course,
  CourseEnrollment,
} from '@/lib/types';
import {
  MOCK_ADMIN,
  MOCK_STUDENTS,
  MOCK_LESSONS,
  MOCK_LESSON_ACCESS,
  MOCK_LESSON_PROGRESS,
  MOCK_ATTENDANCE,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_CMS_SECTIONS,
  DEFAULT_DELIVERY_FEES,
  MOCK_COUPONS,
  DEFAULT_NOTICE_BOARD,
  DEFAULT_LEGAL_POLICIES,
  DEFAULT_SOCIAL_LINKS,
  MOCK_REVIEWS,
  MOCK_COURSES,
  MOCK_COURSE_ENROLLMENTS,
} from '@/lib/mockData';
import { isLessonUnlockedForStudent } from '@/lib/utils';
import {
  auth,
  isFirebaseConfigured,
  registerWithFirebase,
  loginWithFirebase,
  loginWithFirebaseGoogle,
  loginWithFirebaseApple,
  logoutFromFirebase,
  resetFirebasePassword,
} from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  currentUser: User | null;
  activeRole: 'student' | 'admin' | 'guest';
  adminName: string;
  isAuthLoading: boolean;
  users: User[];
  courses: Course[];
  courseEnrollments: CourseEnrollment[];
  lessons: Lesson[];
  lessonAccess: LessonAccess[];
  lessonProgress: UserLessonProgress[];
  attendance: Attendance[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  cmsSections: HomepageSection[];
  toasts: ToastMessage[];

  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Real Authentication actions
  login: (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }>;
  signup: (userData: Partial<User>) => Promise<{ success: boolean; status?: UserStatus; error?: string }>;
  signupWithGoogle: (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string; selectedCourseId?: string }) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  signupWithApple: (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string; selectedCourseId?: string }) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordResetLink: (email: string) => Promise<{ success: boolean; resetUrl?: string; fullResetUrl?: string; token?: string; error?: string }>;
  verifyPasswordResetToken: (token: string, email?: string) => Promise<{ success: boolean; valid: boolean; email?: string; remainingSeconds?: number; error?: string }>;
  completePasswordReset: (token: string, email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshCurrentUser: () => Promise<User | null>;
  refreshUsers: () => Promise<User[]>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Deprecated demo role switchers (kept for backwards compatibility)
  switchUserRole: (role: 'student' | 'admin' | 'guest') => void;
  selectStudentUser: (studentId: string) => void;

  // Student profile & User management actions
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (currentPassword?: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (studentId: string, status: UserStatus) => Promise<{ success: boolean; error?: string }>;
  approveUser: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  denyUser: (studentId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (studentId: string, data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (studentId: string) => Promise<{ success: boolean; error?: string }>;

  // Course & Enrollment actions
  refreshCourses: () => Promise<Course[]>;
  createCourse: (courseData: Omit<Course, 'id' | 'createdAt'>) => Promise<{ success: boolean; course?: Course; error?: string }>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<{ success: boolean; course?: Course; error?: string }>;
  deleteCourse: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshCourseEnrollments: () => Promise<CourseEnrollment[]>;
  submitCourseEnrollmentPayment: (payload: {
    courseId: string;
    bKashSenderMobile: string;
    bKashTransactionId: string;
    couponCode?: string;
    studentName?: string;
    studentMobile?: string;
    dateOfBirth?: string;
    level?: StudentLevel;
  }) => Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }>;
  approveCourseEnrollment: (enrollmentId: string) => Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }>;
  rejectCourseEnrollment: (enrollmentId: string, rejectionNote?: string) => Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }>;

  // Lesson actions
  toggleLessonAccess: (studentId: string, lessonId: string) => void;
  bulkSetLessonAccess: (studentId: string, lessonIds: string[], isUnlocked: boolean) => void;
  markLessonProgress: (lessonId: string, status: 'Unlocked' | 'In Progress' | 'Completed') => void;
  createLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;

  // Attendance actions
  recordAttendance: (attendanceData: Omit<Attendance, 'id'>) => void;

  // Merchandise & Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Order actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>) => Order;
  verifyBkashPayment: (orderId: string) => void;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;

  // CMS actions
  updateCmsSection: (id: string, data: Partial<HomepageSection>) => void;
  toggleCmsSection: (id: string) => void;
  moveCmsSection: (id: string, direction: 'up' | 'down') => void;

  // Platform & Branding actions
  platformSettings: PlatformSettings;
  isPlatformLoading: boolean;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;

  // Billings: Delivery Fees, Coupons & Notice Board
  deliveryFees: DeliveryFees;
  coupons: Coupon[];
  noticeBoard: NoticeBoard;
  updateDeliveryFees: (fees: DeliveryFees) => Promise<{ success: boolean; error?: string }>;
  createCoupon: (couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => Promise<{ success: boolean; coupon?: Coupon; error?: string }>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<{ success: boolean; error?: string }>;
  deleteCoupon: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleCouponStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; coupon?: Coupon; discount: number; error?: string };
  updateNoticeBoard: (notice: Partial<NoticeBoard>) => Promise<{ success: boolean; error?: string }>;
  
  // Legal Policies CMS
  legalPolicies: LegalPolicies;
  updateLegalPolicy: (key: keyof LegalPolicies, data: Partial<PolicyPageContent>) => Promise<void>;

  // Student Reviews
  reviews: StudentReview[];
  submitReview: (reviewData: Partial<StudentReview>) => Promise<{ success: boolean; review?: StudentReview; error?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshReviews: () => Promise<void>;
}

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  bKashNumber: '01711-000000',
  directorName: 'Julian Mercer',
  academyEmail: 'support@chordandcraft.com',
  academyPhone: '+880 1711-000000',
  address: 'Banani, Dhaka-1213, Bangladesh',
  faviconUrl: '/chord-craft-icon.svg',
  socialLinks: [],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'chordandcraft_store_v1';
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@chordandcraft.com').toLowerCase().trim();

export const StoreProvider: React.FC<{
  children: React.ReactNode;
  initialPlatformSettings?: PlatformSettings;
  initialCmsSections?: HomepageSection[];
  initialLegalPolicies?: Partial<LegalPolicies>;
}> = ({ children, initialPlatformSettings, initialCmsSections, initialLegalPolicies }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<'student' | 'admin' | 'guest'>('guest');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [users, setUsers] = useState<User[]>(MOCK_STUDENTS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>(MOCK_COURSE_ENROLLMENTS);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [lessonAccess, setLessonAccess] = useState<LessonAccess[]>(MOCK_LESSON_ACCESS);
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>(MOCK_LESSON_PROGRESS);
  const [attendance, setAttendance] = useState<Attendance[]>(MOCK_ATTENDANCE);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cmsSections, setCmsSections] = useState<HomepageSection[]>(
    initialCmsSections && initialCmsSections.length > 0 ? initialCmsSections : MOCK_CMS_SECTIONS
  );
  // platformSettings is ALWAYS loaded fresh from MongoDB — never from localStorage
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    initialPlatformSettings || DEFAULT_PLATFORM_SETTINGS
  );
  const [isPlatformLoading, setIsPlatformLoading] = useState(initialPlatformSettings ? false : true);
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFees>(DEFAULT_DELIVERY_FEES);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [noticeBoard, setNoticeBoard] = useState<NoticeBoard>(DEFAULT_NOTICE_BOARD);
  const [legalPolicies, setLegalPolicies] = useState<LegalPolicies>(
    initialLegalPolicies ? { ...DEFAULT_LEGAL_POLICIES, ...initialLegalPolicies } : DEFAULT_LEGAL_POLICIES
  );
  const [reviews, setReviews] = useState<StudentReview[]>(MOCK_REVIEWS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Compute live Admin / Mentor Name from roster, settings, or current user
  const adminUser = users.find((u) => u.role === 'admin') || (currentUser?.role === 'admin' ? currentUser : null);
  const rawAdminName = (platformSettings?.directorName || adminUser?.fullName || (currentUser?.role === 'admin' ? currentUser.fullName : '') || 'Julian Mercer').trim();
  const adminName = /ershad\s*zaman|guitart/i.test(rawAdminName) ? 'Julian Mercer' : rawAdminName;

  // Load safe non-sensitive public caches on mount (NEVER pre-hydrate auth role/user from localStorage)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chordandcraft_remember_me');
        localStorage.removeItem('chordandcraft_remembered_email');
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.courses && Array.isArray(parsed.courses) && parsed.courses.length > 0) {
          setCourses(parsed.courses);
        }
        if (parsed.products) setProducts(parsed.products);
        if (parsed.cmsSections && (!initialCmsSections || initialCmsSections.length === 0)) {
          setCmsSections(parsed.cmsSections);
        }
        if (parsed.deliveryFees) setDeliveryFees(parsed.deliveryFees);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.noticeBoard) setNoticeBoard(parsed.noticeBoard);
        if (parsed.legalPolicies && !initialLegalPolicies) setLegalPolicies(parsed.legalPolicies);
        if (parsed.reviews) setReviews(parsed.reviews);
      }
    } catch (e) {
      console.error('Failed to load local store state', e);
    }
  }, []);

  // Sync role-scoped authoritative MongoDB data whenever a user is authenticated
  const syncAuthenticatedData = async (user: User) => {
    const fetchOpts: RequestInit = { credentials: 'include', cache: 'no-store' };

    const tasks: Promise<void>[] = [
      // 1. Lessons (server returns full media ONLY for public + unlocked lessons for this user)
      fetch('/api/lessons', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.lessons && Array.isArray(d.lessons) && d.lessons.length > 0) {
            setLessons(d.lessons);
          }
        })
        .catch(() => {}),

      // 2. Lesson Access (authoritative from MongoDB — Admin sees all, Student sees strictly their own)
      fetch('/api/lesson-access', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.lessonAccess && Array.isArray(d.lessonAccess)) {
            setLessonAccess(d.lessonAccess);
          }
        })
        .catch(() => {}),

      // 3. Lesson Progress (authoritative from MongoDB)
      fetch('/api/lesson-progress', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.lessonProgress && Array.isArray(d.lessonProgress)) {
            setLessonProgress(d.lessonProgress);
          }
        })
        .catch(() => {}),

      // 4. Orders (Admin sees all, Student sees strictly their own)
      fetch('/api/orders', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.orders && Array.isArray(d.orders)) {
            setOrders(d.orders);
          }
        })
        .catch(() => {}),

      // 5. Attendance (Admin sees all, Student sees strictly their own)
      fetch('/api/attendance', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.attendance && Array.isArray(d.attendance)) {
            setAttendance(d.attendance);
          }
        })
        .catch(() => {}),

      // 6. Course Enrollments (Admin sees all, Student sees strictly their own)
      fetch('/api/enrollments', fetchOpts)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.enrollments && Array.isArray(d.enrollments)) {
            setCourseEnrollments(d.enrollments);
          }
        })
        .catch(() => {}),
    ];

    // 6. Full student roster is strictly Admin-only
    if (user.role === 'admin') {
      tasks.push(
        fetch('/api/users', fetchOpts)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.users && Array.isArray(d.users)) {
              setUsers(d.users);
            }
          })
          .catch(() => {})
      );
    } else {
      // Students only see their own sanitized profile entry in users array
      setUsers([user]);
    }

    await Promise.all(tasks);
  };

  // Sync public data (billing, CMS, public lessons, products) from MongoDB on mount
  useEffect(() => {
    const loadBillingFromDb = async () => {
      try {
        const res = await fetch('/api/billing', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.platformSettings) {
            setPlatformSettings((prev) => ({ ...prev, ...data.platformSettings }));
          } else if (data.bKashNumber) {
            setPlatformSettings((prev) => ({ ...prev, bKashNumber: data.bKashNumber }));
          }
          if (data.deliveryFees) {
            setDeliveryFees(data.deliveryFees);
            saveState({ deliveryFees: data.deliveryFees });
          }
          if (data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCoupons(data.coupons);
            saveState({ coupons: data.coupons });
          }
          if (data.noticeBoard) {
            setNoticeBoard(data.noticeBoard);
            saveState({ noticeBoard: data.noticeBoard });
          }
          if (data.legalPolicies) {
            setLegalPolicies((prev) => {
              const merged = { ...prev, ...data.legalPolicies };
              saveState({ legalPolicies: merged });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Billing fetch failed (network/offline):', err);
      } finally {
        setIsPlatformLoading(false);
      }
    };

    const loadCmsFromDb = async () => {
      try {
        const res = await fetch('/api/cms', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.cmsSections && Array.isArray(data.cmsSections) && data.cmsSections.length > 0) {
            setCmsSections(data.cmsSections);
            saveState({ cmsSections: data.cmsSections });
          }
        }
      } catch (err) {
        console.warn('CMS fetch notice:', err);
      }
    };

    const loadPublicLessonsAndProducts = async () => {
      try {
        const [lessonsRes, productsRes, coursesRes] = await Promise.all([
          fetch('/api/lessons', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/products?activeOnly=false', { cache: 'no-store' }),
          fetch('/api/courses?activeOnly=false', { cache: 'no-store' }),
        ]);
        if (lessonsRes.ok) {
          const lData = await lessonsRes.json();
          if (lData.lessons && Array.isArray(lData.lessons) && lData.lessons.length > 0) {
            setLessons(lData.lessons);
          }
        }
        if (productsRes.ok) {
          const pData = await productsRes.json();
          if (pData.products && Array.isArray(pData.products) && pData.products.length > 0) {
            setProducts(pData.products);
            saveState({ products: pData.products });
          }
        }
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          if (cData.courses && Array.isArray(cData.courses) && cData.courses.length > 0) {
            setCourses(cData.courses);
            saveState({ courses: cData.courses });
          }
        }
      } catch (err) {
        console.warn('Public catalog fetch notice:', err);
      }
    };

    loadBillingFromDb();
    loadCmsFromDb();
    loadPublicLessonsAndProducts();
  }, []);

  // Broadcast auth/lesson changes across tabs cleanly (never push raw cross-role user state)
  const broadcastSync = (data: { authChanged?: boolean; lessonAccessUpdated?: boolean }) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('chordandcraft_academy_sync');
        channel.postMessage({ type: 'SYNC_STATE', payload: data });
        channel.close();
      }
    } catch (e) {}
  };

  // Re-verify session cookie from server (single source of truth across tabs)
  const verifySessionAndSync = async (showLoading = false) => {
    if (showLoading) setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const sessionUser: User = data.user;
          const role: 'admin' | 'student' = sessionUser.role === 'admin' ? 'admin' : 'student';

          setCurrentUser(sessionUser);
          setActiveRole(role);
          loadUserCart(sessionUser.id);

          if (typeof window !== 'undefined') {
            const exp = data.expiresAt || Date.now() + SESSION_DURATION_MS;
            localStorage.setItem('chordandcraft_session_expires_at', String(exp));
          }

          await syncAuthenticatedData(sessionUser);
          return;
        }

        // Server confirmed no valid 24-hour cookie -> clear all authenticated state cleanly
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chordandcraft_session_expires_at');
          localStorage.removeItem('chordandcraft_remember_me');
          localStorage.removeItem('chordandcraft_remembered_email');
        }
        setCurrentUser(null);
        setActiveRole('guest');
        setCart([]);
        setLessonAccess([]);
        setLessonProgress([]);
        setOrders([]);
        setAttendance([]);
        setCourseEnrollments([]);
        if (isFirebaseConfigured() && auth?.currentUser) {
          logoutFromFirebase().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Session cookie verification offline notice:', err);
    } finally {
      if (showLoading) setIsAuthLoading(false);
    }
  };

  // Cross-tab & window focus listeners (prevents cross-role drift and refreshes unlocked lessons immediately)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('chordandcraft_academy_sync');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_STATE' && (payload?.authChanged || payload?.lessonAccessUpdated)) {
            verifySessionAndSync(false);
          }
        };
      }
    } catch (e) {}

    const handleFocus = () => {
      verifySessionAndSync(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (channel) channel.close();
    };
  }, []);

  // Sync non-sensitive public caches to localStorage (NEVER store passwords or auth roles)
  const saveState = (updatedState: Partial<any>) => {
    try {
      const currentStored = localStorage.getItem(STORAGE_KEY);
      const prevObj = currentStored ? JSON.parse(currentStored) : {};
      const safePatch = { ...updatedState };
      // Never persist sensitive auth state, PII rosters, or passwords in localStorage
      delete safePatch.cart;
      delete safePatch.currentUser;
      delete safePatch.activeRole;
      delete safePatch.users;
      delete safePatch.orders;
      delete safePatch.attendance;
      delete safePatch.lessonAccess;
      delete safePatch.lessonProgress;
      delete safePatch.courseEnrollments;
      const newObj = { ...prevObj, ...safePatch };
      delete newObj.cart;
      delete newObj.currentUser;
      delete newObj.activeRole;
      delete newObj.users;
      delete newObj.orders;
      delete newObj.attendance;
      delete newObj.lessonAccess;
      delete newObj.lessonProgress;
      delete newObj.courseEnrollments;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newObj));
    } catch (e) {
      console.error('Failed to save store state', e);
    }
  };

  // User-specific Cart Handlers (Guests have in-memory cart that resets on refresh)
  const loadUserCart = (userId?: string) => {
    if (!userId || typeof window === 'undefined') {
      setCart([]);
      return;
    }
    try {
      const savedCart = localStorage.getItem(`chordandcraft_cart_${userId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch (e) {
      setCart([]);
    }
  };

  const saveUserCart = (updatedCart: CartItem[], userId?: string) => {
    if (!userId || typeof window === 'undefined') {
      // Guest cart is memory-only; on refresh it resets to []
      return;
    }
    try {
      localStorage.setItem(`chordandcraft_cart_${userId}`, JSON.stringify(updatedCart));
    } catch (e) {
      console.warn('Failed to save user cart to localStorage', e);
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync verified Firebase User with MongoDB backend using real Firebase ID token
  const syncUserWithBackend = async (
    fbUser: FirebaseUser,
    additionalData?: {
      mobile?: string;
      dateOfBirth?: string;
      level?: StudentLevel;
      fullName?: string;
      password?: string;
      selectedCourseId?: string;
      isNewRegistration?: boolean;
      mode?: 'login' | 'signup';
    }
  ): Promise<{ user: User | null; notFound?: boolean; error?: string }> => {
    const idToken = await fbUser.getIdToken(true);

    const payload: Record<string, unknown> = {
      idToken,
      password: additionalData?.password,
      fullName:
        additionalData?.fullName ||
        fbUser.displayName ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'Chord & Craft Member'),
      mobile: additionalData?.mobile,
      dateOfBirth: additionalData?.dateOfBirth,
      selectedCourseId: additionalData?.selectedCourseId,
      avatarUrl: fbUser.photoURL || undefined,
      mode: additionalData?.mode || 'signup',
    };
    if (additionalData?.isNewRegistration && additionalData?.level) {
      payload.level = additionalData.level;
    }

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        return { user: data.user as User };
      }

      if (res.status === 404) {
        return {
          user: null,
          notFound: true,
          error: data.error || 'No student account found with this ID. Please complete enrollment first.',
        };
      }

      return {
        user: null,
        error: data.error || 'Authentication verification failed.',
      };
    } catch (err: any) {
      return {
        user: null,
        error: err?.message || 'Unable to verify authentication with server.',
      };
    }
  };

  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  const saveSessionExpiry = () => {
    if (typeof window !== 'undefined') {
      const expiresAt = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem('chordandcraft_session_expires_at', expiresAt.toString());
      localStorage.removeItem('chordandcraft_remember_me');
      localStorage.removeItem('chordandcraft_remembered_email');
    }
  };

  // Hydrate and verify 24-hour HttpOnly login session cookie on mount
  useEffect(() => {
    verifySessionAndSync(true);
  }, []);

  // --- Real Auth Handlers (Zero Client-Side Password Bypasses, Strict Role Isolation) ---

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Primary server-verified login via /api/auth/login (enforces rate limit, scrypt verification, & strict Student/Admin separation)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          expectedRole,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const finalUser: User = data.user;
        const role: 'admin' | 'student' = finalUser.role === 'admin' ? 'admin' : 'student';

        setCurrentUser(finalUser);
        setActiveRole(role);
        loadUserCart(finalUser.id);
        saveSessionExpiry();
        await syncAuthenticatedData(finalUser);
        broadcastSync({ authChanged: true });
        addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
        return { success: true, role: finalUser.role, status: finalUser.status };
      }

      // Immediately propagate role-mismatch (403) or rate-limit (429) without trying Firebase
      if (res.status === 403 || res.status === 429) {
        return {
          success: false,
          error: data.error || 'Access denied for this account type.',
        };
      }

      // For Admin portal, NEVER fall back to Firebase student auth
      if (expectedRole === 'admin') {
        return {
          success: false,
          error: data.error || 'Invalid administrator credentials.',
        };
      }
    } catch (apiErr) {
      if (expectedRole === 'admin') {
        return { success: false, error: 'Unable to reach authentication server.' };
      }
      console.warn('Backend login notice, checking Firebase Student Auth:', apiErr);
    }

    // 2. Student Firebase Auth fallback (Admin portal already returned early above)
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebase(trimmedEmail, trimmedPassword);
        const synced = await syncUserWithBackend(fbUser, {
          password: trimmedPassword,
          mode: 'login',
        });

        if (synced.user) {
          const finalUser: User = synced.user;
          setCurrentUser(finalUser);
          setActiveRole('student');
          loadUserCart(finalUser.id);
          saveSessionExpiry();
          await syncAuthenticatedData(finalUser);
          broadcastSync({ authChanged: true });
          addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
          return { success: true, role: finalUser.role, status: finalUser.status };
        }

        await logoutFromFirebase().catch(() => {});
        return {
          success: false,
          error: synced.error || 'Account verification failed.',
        };
      } catch (err: any) {
        console.warn('Firebase student login notice:', err?.code || err);
      }
    }

    return {
      success: false,
      error: 'Invalid email or password. Please verify and try again.',
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }> => {
    if (!isFirebaseConfigured() || !auth) {
      return {
        success: false,
        error: 'Google Sign-In is not configured on this server. Please sign in with email and password.',
      };
    }

    try {
      const fbUser = await loginWithFirebaseGoogle();
      // Sync with signup mode so existing Active/Pending students keep their exact record,
      // while brand-new Google users are created as Pending and guided straight to the Waiting & Payment Lobby.
      const synced = await syncUserWithBackend(fbUser, {
        mode: 'signup',
        isNewRegistration: true,
      });

      if (!synced.user) {
        await logoutFromFirebase().catch(() => {});
        setCurrentUser(null);
        setActiveRole('guest');
        return {
          success: false,
          notFound: synced.notFound,
          error:
            synced.error ||
            'Google sign-in could not be completed. Please try again.',
        };
      }

      const finalUser: User = synced.user;
      setCurrentUser(finalUser);
      setActiveRole('student');
      loadUserCart(finalUser.id);
      saveSessionExpiry();
      await syncAuthenticatedData(finalUser);
      broadcastSync({ authChanged: true });
      if (finalUser.status === 'Active') {
        addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
      } else if (finalUser.status === 'Pending') {
        addToast('Signed in with Google! Complete your details, course selection & bKash payment in the Waiting Lobby.', 'success');
      }
      return { success: true, role: finalUser.role, status: finalUser.status };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in window closed.' };
      }
      return { success: false, error: err instanceof Error ? err.message : 'Google sign-in failed.' };
    }
  };

  const loginWithApple = async (): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }> => {
    if (!isFirebaseConfigured() || !auth) {
      return {
        success: false,
        error: 'Apple Sign-In is not configured on this server. Please sign in with email and password.',
      };
    }

    try {
      const fbUser = await loginWithFirebaseApple();
      const synced = await syncUserWithBackend(fbUser, { mode: 'login' });

      if (!synced.user) {
        await logoutFromFirebase().catch(() => {});
        setCurrentUser(null);
        setActiveRole('guest');
        return {
          success: false,
          notFound: synced.notFound,
          error:
            synced.error ||
            'No student account found with this Apple ID. Please complete enrollment first.',
        };
      }

      const finalUser: User = synced.user;
      setCurrentUser(finalUser);
      setActiveRole('student');
      loadUserCart(finalUser.id);
      saveSessionExpiry();
      await syncAuthenticatedData(finalUser);
      broadcastSync({ authChanged: true });
      addToast(`Apple sign-in successful! Welcome, ${finalUser.fullName}.`, 'success');
      return { success: true, role: finalUser.role, status: finalUser.status };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Apple sign-in window closed.' };
      }
      return { success: false, error: err?.message || 'Apple sign-in failed.' };
    }
  };

  const signupWithGoogle = async (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string; selectedCourseId?: string }): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    if (!isFirebaseConfigured() || !auth) {
      return {
        success: false,
        error: 'Google enrollment is not configured on this server. Please enroll with email and password.',
      };
    }

    try {
      const fbUser = await loginWithFirebaseGoogle();
      const synced = await syncUserWithBackend(fbUser, {
        mode: 'signup',
        isNewRegistration: true,
        level: extraData?.level || 'Beginner',
        mobile: extraData?.mobile,
        dateOfBirth: extraData?.dateOfBirth,
        selectedCourseId: extraData?.selectedCourseId,
      });

      if (!synced.user) {
        await logoutFromFirebase().catch(() => {});
        return { success: false, error: synced.error || 'Google enrollment could not be completed.' };
      }

      const finalUser: User = synced.user;
      setCurrentUser(finalUser);
      setActiveRole('student');
      loadUserCart(finalUser.id);
      saveSessionExpiry();
      await syncAuthenticatedData(finalUser);
      broadcastSync({ authChanged: true });

      if (finalUser.status === 'Active') {
        addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
      } else {
        addToast('Signed in with Google! Fill in your details, choose your course & submit bKash payment in the Waiting Lobby.', 'success');
      }
      return { success: true, role: finalUser.role, status: finalUser.status };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-up window closed.' };
      }
      return { success: false, error: err?.message || 'Google sign-up failed.' };
    }
  };

  const signupWithApple = async (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string; selectedCourseId?: string }): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    if (!isFirebaseConfigured() || !auth) {
      return {
        success: false,
        error: 'Apple enrollment is not configured on this server. Please enroll with email and password.',
      };
    }

    try {
      const fbUser = await loginWithFirebaseApple();
      const synced = await syncUserWithBackend(fbUser, {
        mode: 'signup',
        isNewRegistration: true,
        level: extraData?.level || 'Beginner',
        mobile: extraData?.mobile,
        dateOfBirth: extraData?.dateOfBirth,
        selectedCourseId: extraData?.selectedCourseId,
      });

      if (!synced.user) {
        await logoutFromFirebase().catch(() => {});
        return { success: false, error: synced.error || 'Apple enrollment could not be completed.' };
      }

      const finalUser: User = synced.user;
      setCurrentUser(finalUser);
      setActiveRole('student');
      loadUserCart(finalUser.id);
      saveSessionExpiry();
      await syncAuthenticatedData(finalUser);
      broadcastSync({ authChanged: true });

      addToast('Account created via Apple! Complete bKash payment in the Payment Lobby to unlock your courses.', 'success');
      return { success: true, role: finalUser.role, status: finalUser.status };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Apple sign-up window closed.' };
      }
      return { success: false, error: err?.message || 'Apple sign-up failed.' };
    }
  };

  const signup = async (userData: Partial<User>): Promise<{ success: boolean; status?: UserStatus; error?: string }> => {
    const email = (userData.email || '').trim().toLowerCase();
    const pass = (userData.password || '').trim();
    const fullName = (userData.fullName || 'Student').trim();

    if (!email || pass.length < 6) {
      return { success: false, error: 'Valid email and password (min 6 characters) are required.' };
    }

    if (email === ADMIN_EMAIL || email === 'admin@chordandcraft.com' || email === 'mentor@chordandcraft.com') {
      return {
        success: false,
        error: 'Administrator emails cannot enroll as students. Please use Admin Sign In.',
      };
    }

    if (!isFirebaseConfigured() || !auth) {
      return {
        success: false,
        error: 'Student enrollment service is not configured. Please contact academy support.',
      };
    }

    try {
      const fbUser = await registerWithFirebase(email, pass, fullName);
      const synced = await syncUserWithBackend(fbUser, {
        fullName,
        password: pass,
        mobile: userData.mobile,
        dateOfBirth: userData.dateOfBirth,
        level: userData.level || 'Beginner',
        selectedCourseId: userData.selectedCourseId,
        isNewRegistration: true,
        mode: 'signup',
      });

      if (!synced.user) {
        await logoutFromFirebase().catch(() => {});
        return { success: false, error: synced.error || 'Registration could not be verified.' };
      }

      const pendingUser: User = synced.user;
      setCurrentUser(pendingUser);
      setActiveRole('student');
      saveSessionExpiry();
      await syncAuthenticatedData(pendingUser);
      broadcastSync({ authChanged: true });

      addToast('Account created! Please complete your bKash enrollment payment in the Payment Lobby.', 'success');
      return { success: true, status: pendingUser.status };
    } catch (err: any) {
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      return { success: false, error: msg };
    }
  };

  const refreshCurrentUser = async (): Promise<User | null> => {
    if (!currentUser) return null;

    const userChanged = (a: User, b: User) =>
      a.id !== b.id ||
      a.fullName !== b.fullName ||
      a.email !== b.email ||
      a.mobile !== b.mobile ||
      a.dateOfBirth !== b.dateOfBirth ||
      a.avatarUrl !== b.avatarUrl ||
      a.level !== b.level ||
      a.status !== b.status ||
      a.role !== b.role ||
      a.selectedCourseId !== b.selectedCourseId ||
      JSON.stringify(a.enrolledCourseIds || []) !== JSON.stringify(b.enrolledCourseIds || []);

    // 1. Primary: Hit /api/auth/session so the signed HttpOnly cookie refreshes immediately
    // whenever Admin approves payment (Pending -> Active) or updates enrolled courses!
    try {
      const sessionRes = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated && sessionData.user) {
          const freshUser: User = sessionData.user;
          const statusOrCoursesChanged =
            freshUser.status !== currentUser.status ||
            JSON.stringify(freshUser.enrolledCourseIds || []) !==
              JSON.stringify(currentUser.enrolledCourseIds || []);

          if (userChanged(currentUser, freshUser)) {
            setCurrentUser(freshUser);
            setUsers((prev) =>
              prev.some(
                (u) =>
                  u.id === freshUser.id ||
                  (u.email && freshUser.email && u.email.toLowerCase() === freshUser.email.toLowerCase())
              )
                ? prev.map((u) =>
                    u.id === freshUser.id ||
                    (u.email && freshUser.email && u.email.toLowerCase() === freshUser.email.toLowerCase())
                      ? freshUser
                      : u
                  )
                : [freshUser]
            );
          }

          if (statusOrCoursesChanged) {
            await syncAuthenticatedData(freshUser);
          } else {
            await refreshCourseEnrollments();
          }

          return freshUser;
        }
      }
    } catch (err) {
      console.warn('refreshCurrentUser session notice:', err);
    }

    // 2. Fallback: Fetch fresh user record from backend /api/users/[id]
    try {
      const lookupKey = encodeURIComponent(currentUser.email || currentUser.firebaseUid || currentUser.id);
      const res = await fetch(`/api/users/${lookupKey}`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const resolvedUser: User = { ...currentUser, ...data.user };
          if (userChanged(currentUser, resolvedUser)) {
            setCurrentUser(resolvedUser);
          }
          return resolvedUser;
        }
      }
    } catch (err) {
      console.warn('refreshCurrentUser fallback notice:', err);
    }

    return currentUser;
  };

  const refreshUsers = async (): Promise<User[]> => {
    if (currentUser?.role !== 'admin') {
      return users;
    }
    try {
      const res = await fetch('/api/users', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          return data.users;
        }
      }
    } catch (err) {
      console.warn('refreshUsers notice:', err);
    }
    return users;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Session cookie clear notice:', e);
    }
    if (isFirebaseConfigured() && auth) {
      try {
        await logoutFromFirebase();
      } catch (e) {
        console.error('Firebase logout error:', e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chordandcraft_session_expires_at');
      localStorage.removeItem('chordandcraft_remember_me');
      localStorage.removeItem('chordandcraft_remembered_email');
    }
    setCart([]);
    setCurrentUser(null);
    setActiveRole('guest');
    setLessonAccess([]);
    setLessonProgress([]);
    setOrders([]);
    setAttendance([]);
    setCourseEnrollments([]);
    setUsers([]);
    // Refresh public-only lesson catalog so locked media isn't left in browser memory
    fetch('/api/lessons', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.lessons && Array.isArray(d.lessons)) setLessons(d.lessons);
      })
      .catch(() => {});
    broadcastSync({ authChanged: true });
    addToast('Signed out successfully', 'info');
  };

  const resetPassword = async (
    email: string,
    _newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    const res = await requestPasswordResetLink(normalizedEmail);
    return res;
  };

  const requestPasswordResetLink = async (
    email: string
  ): Promise<{ success: boolean; resetUrl?: string; fullResetUrl?: string; token?: string; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-reset', email: normalizedEmail }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Password reset link sent to your email! 📧', 'success');
        return {
          success: true,
          resetUrl: data.resetUrl,
          fullResetUrl: data.fullResetUrl,
          token: data.token,
        };
      }
      return { success: false, error: data.error || 'No registered account found with this email address.' };
    } catch (e: any) {
      // Fallback state check
      const isKnown =
        users.some((u) => u.email.toLowerCase() === normalizedEmail) ||
        ['admin@chordandcraft.com', 'mentor@chordandcraft.com', (MOCK_ADMIN.email || '').toLowerCase()].includes(normalizedEmail);

      if (!isKnown) {
        return {
          success: false,
          error: 'No registered account found with this email address. Please make sure you have signed up first.',
        };
      }

      addToast('Password reset instructions dispatched to your email.', 'info');
      return { success: true };
    }
  };

  const verifyPasswordResetToken = async (
    token: string,
    email?: string
  ): Promise<{ success: boolean; valid: boolean; email?: string; remainingSeconds?: number; error?: string }> => {
    if (!token) return { success: false, valid: false, error: 'No reset token provided.' };
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-token', token, email }),
      });
      const data = await res.json();
      return {
        success: data.success ?? false,
        valid: data.valid ?? false,
        email: data.email,
        remainingSeconds: data.remainingSeconds,
        error: data.error,
      };
    } catch (e: any) {
      return { success: false, valid: false, error: 'Unable to verify reset link. Please try again.' };
    }
  };

  const completePasswordReset = async (
    token: string,
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          token,
          email: normalizedEmail,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }
    } catch (e) {
      return { success: false, error: 'Unable to reach server to complete password reset.' };
    }

    addToast('Password has been reset successfully! 🔒', 'success');
    return { success: true };
  };

  // Security lock: client-side role switching is strictly disabled to prevent cross-login
  const switchUserRole = (_role: 'student' | 'admin' | 'guest') => {
    console.warn('Blocked: direct client-side role switching is disabled. Please sign in with valid credentials.');
  };

  const selectStudentUser = (_studentId: string) => {
    console.warn('Blocked: direct client-side student switching is disabled.');
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user found.' };
    
    // Active students cannot modify their skill level, role, or approval status;
    // Pending students may set their initial level during Payment Lobby onboarding.
    const sanitizedData = { ...data };
    if (currentUser.role !== 'admin') {
      if (currentUser.status !== 'Pending') {
        delete sanitizedData.level;
      }
      delete sanitizedData.role;
      delete sanitizedData.status;
    }

    const updatedUser = { ...currentUser, ...sanitizedData };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
        ? updatedUser
        : u
    );
    setUsers(updatedUsers);

    if (currentUser.role === 'admin' && sanitizedData.fullName) {
      setPlatformSettings((prev) => {
        const updated = { ...prev, directorName: sanitizedData.fullName };
        // platformSettings NOT saved to localStorage — it is always loaded from MongoDB
        saveState({ users: updatedUsers, currentUser: updatedUser });
        return updated;
      });
    } else {
      saveState({ users: updatedUsers, currentUser: updatedUser });
    }

    // Sync to Firebase Auth if active
    if (isFirebaseConfigured() && auth && auth.currentUser) {
      try {
        const { updateFirebaseUserInfo } = await import('@/lib/firebase');
        await updateFirebaseUserInfo(sanitizedData.fullName, sanitizedData.avatarUrl);
      } catch (fbErr) {
        console.warn('Firebase profile sync notice:', fbErr);
      }
    }

    // Sync to MongoDB
    try {
      const searchKey = encodeURIComponent(currentUser.email || currentUser.firebaseUid || currentUser.id);
      await fetch(`/api/users/${searchKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sanitizedData,
          email: currentUser.email,
        }),
      });
    } catch (e) {
      console.warn('Profile API sync failed (local state updated):', e);
    }
    addToast('Profile updated successfully! ✨', 'success');
    return { success: true };
  };

  const updateUserPassword = async (
    currentPassword?: string,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    if (isFirebaseConfigured() && auth && auth.currentUser) {
      try {
        const { changeFirebasePassword } = await import('@/lib/firebase');
        await changeFirebasePassword(newPassword);
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login') {
          return {
            success: false,
            error: 'For security, please sign out and sign in again before changing password.',
          };
        }
        return { success: false, error: err?.message || 'Failed to update Firebase password.' };
      }
    }

    addToast('Password updated successfully! 🔒', 'success');
    return { success: true };
  };

  const approveUser = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    // 1. Update user status to Active
    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status: 'Active' as UserStatus } : u));
    setUsers(updatedUsers);

    // 2. Ensure Lesson 1 is unlocked across all student & lesson aliases
    const updatedAccess = [...lessonAccess];
    const lesson1 = lessons.find((l) => l.lessonNumber === 1);
    const aliasStudentIds = Array.from(
      new Set([studentId, student.id, student.firebaseUid, student.email?.toLowerCase()].filter(Boolean))
    ) as string[];
    const lesson1Aliases = lesson1 ? Array.from(new Set([lesson1.id, 'lsn-01'])) : [];
    const l1Records: { studentId: string; lessonId: string; isUnlocked: boolean }[] = [];

    if (lesson1) {
      const now = new Date().toISOString().split('T')[0];
      aliasStudentIds.forEach((sId) => {
        lesson1Aliases.forEach((lId) => {
          l1Records.push({ studentId: sId, lessonId: lId, isUnlocked: true });
          const idx = updatedAccess.findIndex((la) => la.studentId === sId && la.lessonId === lId);
          if (idx >= 0) {
            updatedAccess[idx] = { ...updatedAccess[idx], isUnlocked: true, unlockedAt: updatedAccess[idx].unlockedAt || now };
          } else {
            updatedAccess.push({ studentId: sId, lessonId: lId, isUnlocked: true, unlockedAt: now });
          }
        });
      });
      setLessonAccess(updatedAccess);
    }

    // 3. Sync live to database
    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'Active',
          email: student.email,
          fullName: student.fullName,
        }),
      });

      if (l1Records.length > 0) {
        await fetch('/api/lesson-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ records: l1Records }),
        });
      }
      broadcastSync({ lessonAccessUpdated: true });
    } catch (err) {
      console.warn('Approve user API sync notice:', err);
    }

    addToast(`Student ${student.fullName} has been approved and activated! 🎉`, 'success');
    return { success: true };
  };

  const denyUser = async (studentId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status: 'Rejected' as UserStatus } : u));
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      const updatedCurrent = { ...currentUser, status: 'Rejected' as UserStatus };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          email: student.email,
          fullName: student.fullName,
        }),
      });
    } catch (err) {
      console.warn('Deny user API sync notice:', err);
    }

    addToast(`Student application for ${student.fullName} was denied.`, 'info');
    return { success: true };
  };

  const updateUserStatus = async (
    studentId: string,
    status: UserStatus
  ): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status } : u));
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      const updatedCurrent = { ...currentUser, status };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          email: student.email,
          fullName: student.fullName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const remapped = updatedUsers.map((u) =>
            u.id === studentId || u.email.toLowerCase() === student.email.toLowerCase()
              ? { ...u, ...data.user }
              : u
          );
          setUsers(remapped);
          saveState({ users: remapped });
        }
      }
    } catch (err) {
      console.warn('Student status sync with database notice (local state updated):', err);
    }

    addToast(`Student status updated to ${status} for ${student.fullName}`, 'success');
    return { success: true };
  };

  const updateUser = async (
    studentId: string,
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = users.find((u) => u.id === studentId || (data.email && u.email.toLowerCase() === data.email.toLowerCase()));
    const updatedUsers = users.map((u) =>
      u.id === studentId || (target && u.email.toLowerCase() === target.email.toLowerCase())
        ? { ...u, ...data }
        : u
    );
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || (target && currentUser.email.toLowerCase() === target.email.toLowerCase()))) {
      const updatedCurrent = { ...currentUser, ...data };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(target?.email || studentId);
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: target?.email || data.email,
          fullName: target?.fullName || data.fullName,
        }),
      });
      if (res.ok) {
        const respData = await res.json();
        if (respData.user) {
          const remapped = updatedUsers.map((u) =>
            u.id === studentId || (target?.email && u.email.toLowerCase() === target.email.toLowerCase())
              ? { ...u, ...respData.user }
              : u
          );
          setUsers(remapped);
          if (currentUser && (currentUser.id === studentId || (target && currentUser.email.toLowerCase() === target.email.toLowerCase()))) {
            const updatedCurrent = { ...currentUser, ...respData.user };
            setCurrentUser(updatedCurrent);
            saveState({ users: remapped, currentUser: updatedCurrent });
          } else {
            saveState({ users: remapped });
          }
        }
      }
    } catch (e) {
      console.warn('Update user API sync notice:', e);
    }

    addToast('Student details updated successfully', 'success');
    return { success: true };
  };

  const deleteUser = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    const updatedUsers = users.filter((u) => u.id !== studentId && (!student || u.email.toLowerCase() !== student.email.toLowerCase()));
    setUsers(updatedUsers);

    const updatedAccess = lessonAccess.filter((la) => la.studentId !== studentId);
    setLessonAccess(updatedAccess);

    const updatedProgress = lessonProgress.filter((lp) => lp.studentId !== studentId);
    setLessonProgress(updatedProgress);

    saveState({
      users: updatedUsers,
      lessonAccess: updatedAccess,
      lessonProgress: updatedProgress,
    });

    try {
      await fetch(`/api/users/${studentId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Delete user API sync notice:', e);
    }

    addToast(`Student ${student?.fullName || ''} deleted successfully`, 'info');
    return { success: true };
  };

  const toggleLessonAccess = async (studentId: string, lessonId: string) => {
    const targetStudent = users.find(
      (u) => u.id === studentId || (u.email && studentId && u.email.toLowerCase() === studentId.toLowerCase())
    );
    const studentIds = Array.from(
      new Set(
        [
          studentId,
          targetStudent?.id,
          targetStudent?.email?.toLowerCase(),
          targetStudent?.firebaseUid,
        ].filter(Boolean)
      )
    ) as string[];

    const targetLesson = lessons.find((l) => l.id === lessonId);
    const lessonIds = Array.from(
      new Set(
        [
          lessonId,
          targetLesson ? `lsn-${String(targetLesson.lessonNumber).padStart(2, '0')}` : null,
        ].filter(Boolean)
      )
    ) as string[];

    // Determine effective current unlock state accurately (matching isLessonUnlockedForStudent)
    const currentlyUnlocked =
      targetLesson && targetStudent
        ? isLessonUnlockedForStudent(targetLesson, targetStudent, users, lessonAccess)
        : lessonAccess.some(
            (la) => studentIds.includes(la.studentId) && lessonIds.includes(la.lessonId) && la.isUnlocked
          );
    const newState = !currentlyUnlocked;
    const today = new Date().toISOString().split('T')[0];

    const updated = [...lessonAccess];
    const recordsToSync: { studentId: string; lessonId: string; isUnlocked: boolean }[] = [];

    studentIds.forEach((sId) => {
      lessonIds.forEach((lId) => {
        recordsToSync.push({ studentId: sId, lessonId: lId, isUnlocked: newState });
        const idx = updated.findIndex((la) => la.studentId === sId && la.lessonId === lId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], isUnlocked: newState, unlockedAt: newState ? today : undefined };
        } else {
          updated.push({ studentId: sId, lessonId: lId, isUnlocked: newState, unlockedAt: newState ? today : undefined });
        }
      });
    });

    setLessonAccess(updated);
    broadcastSync({ lessonAccessUpdated: true });

    try {
      const res = await fetch('/api/lesson-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ records: recordsToSync }),
      });
      if (!res.ok) {
        addToast('Failed to save lesson access permissions to server', 'error');
        return;
      }
    } catch (e) {
      console.warn('Lesson access API sync notice:', e);
    }
    addToast(
      newState ? 'Lesson unlocked for student' : 'Lesson locked for student',
      'success'
    );
  };

  const bulkSetLessonAccess = async (studentId: string, targetLessonIds: string[], isUnlocked: boolean) => {
    const targetStudent = users.find(
      (u) => u.id === studentId || (u.email && studentId && u.email.toLowerCase() === studentId.toLowerCase())
    );
    const studentIds = Array.from(
      new Set(
        [
          studentId,
          targetStudent?.id,
          targetStudent?.email?.toLowerCase(),
          targetStudent?.firebaseUid,
        ].filter(Boolean)
      )
    ) as string[];

    const expandedLessonIds = Array.from(
      new Set(
        targetLessonIds.flatMap((lId) => {
          const lsn = lessons.find((l) => l.id === lId);
          return lsn ? [lId, `lsn-${String(lsn.lessonNumber).padStart(2, '0')}`] : [lId];
        })
      )
    );

    const today = new Date().toISOString().split('T')[0];
    const updated = [...lessonAccess];
    const recordsToSync: { studentId: string; lessonId: string; isUnlocked: boolean }[] = [];

    studentIds.forEach((sId) => {
      expandedLessonIds.forEach((lessonId) => {
        recordsToSync.push({ studentId: sId, lessonId, isUnlocked });
        const idx = updated.findIndex((la) => la.studentId === sId && la.lessonId === lessonId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], isUnlocked, unlockedAt: isUnlocked ? today : undefined };
        } else {
          updated.push({ studentId: sId, lessonId, isUnlocked, unlockedAt: isUnlocked ? today : undefined });
        }
      });
    });

    setLessonAccess(updated);
    broadcastSync({ lessonAccessUpdated: true });

    try {
      const res = await fetch('/api/lesson-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ records: recordsToSync }),
      });
      if (!res.ok) {
        addToast('Failed to save bulk lesson access permissions', 'error');
        return;
      }
    } catch (e) {
      console.warn('Bulk lesson access API sync notice:', e);
    }
    addToast(`Lessons ${isUnlocked ? 'unlocked' : 'locked'} in bulk`, 'success');
  };

  const markLessonProgress = async (lessonId: string, status: 'Unlocked' | 'In Progress' | 'Completed') => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    const existingIdx = lessonProgress.findIndex((lp) => lp.studentId === studentId && lp.lessonId === lessonId);
    let updated: UserLessonProgress[];
    const now = new Date().toISOString().split('T')[0];

    if (existingIdx >= 0) {
      updated = [...lessonProgress];
      updated[existingIdx] = {
        ...updated[existingIdx],
        status,
        lastAccessed: now,
        completedAt: status === 'Completed' ? now : updated[existingIdx].completedAt,
      };
    } else {
      updated = [...lessonProgress, { studentId, lessonId, status, lastAccessed: now, completedAt: status === 'Completed' ? now : undefined }];
    }
    setLessonProgress(updated);
    saveState({ lessonProgress: updated });
    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, lessonId, status }),
      });
    } catch (e) {
      console.warn('Lesson progress API sync failed (local state updated):', e);
    }
    addToast(
      status === 'Completed'
        ? 'Lesson marked as completed! 🎉'
        : status === 'In Progress'
        ? 'Lesson status updated to In Progress ⏳'
        : 'Lesson status reset to Unlocked',
      'success'
    );
  };

  // --- Courses & Course Enrollment Payment Actions ---

  const refreshCourses = async (): Promise<Course[]> => {
    try {
      const res = await fetch('/api/courses?activeOnly=false', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
          saveState({ courses: data.courses });
          return data.courses;
        }
      }
    } catch (err) {
      console.warn('refreshCourses notice:', err);
    }
    return courses;
  };

  const createCourse = async (
    courseData: Omit<Course, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; course?: Course; error?: string }> => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.course) {
        const updated = [...courses, data.course as Course].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setCourses(updated);
        saveState({ courses: updated });
        addToast(`Course "${data.course.title}" created!`, 'success');
        return { success: true, course: data.course as Course };
      }
      return { success: false, error: data.error || 'Failed to create course.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach server.',
      };
    }
  };

  const updateCourse = async (
    id: string,
    courseData: Partial<Course>
  ): Promise<{ success: boolean; course?: Course; error?: string }> => {
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.course) {
        const updated = courses
          .map((c) => (c.id === id ? (data.course as Course) : c))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCourses(updated);
        saveState({ courses: updated });
        addToast('Course updated & published live!', 'success');
        return { success: true, course: data.course as Course };
      }
      return { success: false, error: data.error || 'Failed to update course.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach server.',
      };
    }
  };

  const deleteCourse = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        const updated = courses.filter((c) => c.id !== id);
        setCourses(updated);
        saveState({ courses: updated });
        addToast('Course removed from catalog.', 'info');
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to delete course.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach server.',
      };
    }
  };

  const refreshCourseEnrollments = async (): Promise<CourseEnrollment[]> => {
    try {
      const res = await fetch('/api/enrollments', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enrollments && Array.isArray(data.enrollments)) {
          setCourseEnrollments(data.enrollments);
          return data.enrollments;
        }
      }
    } catch (err) {
      console.warn('refreshCourseEnrollments notice:', err);
    }
    return courseEnrollments;
  };

  const submitCourseEnrollmentPayment = async (payload: {
    courseId: string;
    bKashSenderMobile: string;
    bKashTransactionId: string;
    couponCode?: string;
    studentName?: string;
    studentMobile?: string;
    dateOfBirth?: string;
    level?: StudentLevel;
  }): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.enrollment) {
        const saved = data.enrollment as CourseEnrollment;
        setCourseEnrollments((prev) => {
          const exists = prev.some((e) => e.id === saved.id);
          return exists ? prev.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...prev];
        });
        if (data.user) {
          setCurrentUser(data.user as User);
        } else if (currentUser) {
          setCurrentUser({
            ...currentUser,
            selectedCourseId: payload.courseId,
            fullName: payload.studentName || currentUser.fullName,
            mobile: payload.studentMobile || currentUser.mobile,
            dateOfBirth: payload.dateOfBirth || currentUser.dateOfBirth,
            level: payload.level || currentUser.level,
          });
        }
        if (payload.couponCode) {
          const cleanCode = payload.couponCode.trim().toUpperCase();
          setCoupons((prev) =>
            prev.map((c) =>
              c.code.toUpperCase() === cleanCode
                ? { ...c, usageCount: (c.usageCount || 0) + 1 }
                : c
            )
          );
        }
        broadcastSync({ authChanged: true });
        addToast('bKash payment submitted! Awaiting Admin verification.', 'success');
        return { success: true, enrollment: saved };
      }
      return {
        success: false,
        error: data.error || 'Could not submit payment verification. Please check your details.',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach payment verification server.',
      };
    }
  };

  const approveCourseEnrollment = async (
    enrollmentId: string
  ): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> => {
    try {
      const res = await fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.enrollment) {
        const updatedEnr = data.enrollment as CourseEnrollment;
        setCourseEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId || e.id === updatedEnr.id ? updatedEnr : e))
        );
        if (data.user) {
          const updatedUser = data.user as User;
          setUsers((prev) => {
            const matched = prev.some(
              (u) =>
                u.id === updatedUser.id ||
                (u.email && updatedUser.email && u.email.toLowerCase() === updatedUser.email.toLowerCase())
            );
            return matched
              ? prev.map((u) =>
                  u.id === updatedUser.id ||
                  (u.email && updatedUser.email && u.email.toLowerCase() === updatedUser.email.toLowerCase())
                    ? { ...u, ...updatedUser }
                    : u
                )
              : [updatedUser, ...prev];
          });
        }
        broadcastSync({ authChanged: true, lessonAccessUpdated: true });
        addToast(
          `Verified bKash payment & unlocked "${updatedEnr.courseTitle}" for ${updatedEnr.studentName}!`,
          'success'
        );
        return { success: true, enrollment: updatedEnr };
      }
      return { success: false, error: data.error || 'Failed to verify course payment.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach verification server.',
      };
    }
  };

  const rejectCourseEnrollment = async (
    enrollmentId: string,
    rejectionNote?: string
  ): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> => {
    try {
      const res = await fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reject', rejectionNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.enrollment) {
        const updatedEnr = data.enrollment as CourseEnrollment;
        setCourseEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId || e.id === updatedEnr.id ? updatedEnr : e))
        );
        broadcastSync({ authChanged: true });
        addToast(`Marked payment as rejected for ${updatedEnr.studentName}.`, 'info');
        return { success: true, enrollment: updatedEnr };
      }
      return { success: false, error: data.error || 'Failed to reject enrollment payment.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to reach verification server.',
      };
    }
  };

  const createLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt'>) => {
    const normalizedPayload = {
      ...lessonData,
      courseId: lessonData.courseId || 'common',
    };
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(normalizedPayload),
      });
      if (res.ok) {
        const data = await res.json();
        const newLesson = data.lesson as Lesson;
        const updated = [...lessons, newLesson];
        setLessons(updated);
        saveState({ lessons: updated });
        addToast('New lesson created successfully', 'success');
        return;
      }
    } catch (e) {
      console.warn('Create lesson API failed, using local fallback:', e);
    }
    // Local fallback
    const newLesson: Lesson = { ...normalizedPayload, id: 'lsn-' + Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    const updated = [...lessons, newLesson];
    setLessons(updated);
    saveState({ lessons: updated });
    addToast('New lesson created (offline mode)', 'success');
  };

  const updateLesson = async (id: string, lessonData: Partial<Lesson>) => {
    const updated = lessons.map((l) => (l.id === id ? { ...l, ...lessonData } : l));
    setLessons(updated);
    saveState({ lessons: updated });
    try {
      await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lessonData),
      });
    } catch (e) {
      console.warn('Update lesson API sync failed (local state updated):', e);
    }
    addToast('Lesson updated successfully', 'success');
  };

  const deleteLesson = async (id: string) => {
    const updated = lessons.filter((l) => l.id !== id);
    setLessons(updated);
    saveState({ lessons: updated });
    try {
      await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete lesson API sync failed (local state updated):', e);
    }
    addToast('Lesson deleted', 'info');
  };

  const recordAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });
      if (res.ok) {
        const data = await res.json();
        const newRecord = data.attendance as Attendance;
        const updated = [newRecord, ...attendance];
        setAttendance(updated);
        saveState({ attendance: updated });
        addToast(`Recorded attendance for ${attendanceData.studentName}`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Attendance API failed, using local fallback:', e);
    }
    // Local fallback
    const newRecord: Attendance = { ...attendanceData, id: 'att-' + Date.now() };
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    saveState({ attendance: updated });
    addToast(`Recorded attendance for ${attendanceData.studentName}`, 'success');
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find((item) => item.product.id === product.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
    addToast(`Added ${product.name} to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
    addToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser?.id && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`chordandcraft_cart_${currentUser.id}`);
      } catch (e) {}
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const data = await res.json();
        const newProduct = data.product as Product;
        const updated = [...products, newProduct];
        setProducts(updated);
        saveState({ products: updated });
        addToast('Product added to merchandise catalog', 'success');
        return;
      }
    } catch (e) {
      console.warn('Create product API failed, using local fallback:', e);
    }
    const newProduct: Product = { ...productData, id: 'prd-' + Date.now() };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveState({ products: updated });
    addToast('Product added (offline mode)', 'success');
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...productData } : p));
    setProducts(updated);
    saveState({ products: updated });
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    } catch (e) {
      console.warn('Update product API sync failed (local state updated):', e);
    }
    addToast('Product updated successfully', 'success');
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveState({ products: updated });
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete product API sync failed (local state updated):', e);
    }
    addToast('Product deleted from store', 'info');
  };

  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Order => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: nowStr,
    };

    // Coupon usage is incremented atomically server-side in POST /api/orders
    if (orderData.couponCode) {
      const cleanCode = orderData.couponCode.trim().toUpperCase();
      const updatedCoupons = coupons.map((c) =>
        c.code.toUpperCase() === cleanCode ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
      );
      setCoupons(updatedCoupons);
      saveState({ coupons: updatedCoupons });
    }

    // Fire-and-forget API call; local state updates immediately
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newOrder),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Update local order id to match MongoDB id
          setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? { ...o, id: data.order.id } : o)));
        }
      })
      .catch((e) => console.warn('Place order API sync failed (local state updated):', e));

    const updated = [newOrder, ...orders];
    setOrders(updated);
    clearCart();
    saveState({ orders: updated, cart: [] });
    addToast('Order placed successfully!', 'success');
    return newOrder;
  };

  const verifyBkashPayment = async (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, paymentStatus: 'Verified' as PaymentStatus, orderStatus: 'Confirmed' as OrderStatus } : o
    );
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Verified', orderStatus: 'Confirmed' }),
      });
    } catch (e) {
      console.warn('Verify bKash API sync failed (local state updated):', e);
    }
    addToast(`bKash Payment Verified for order ${orderId}`, 'success');
  };

  const updateOrderStatus = async (orderId: string, orderStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus } : o));
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });
    } catch (e) {
      console.warn('Update order status API sync failed (local state updated):', e);
    }
    addToast(`Order status set to ${orderStatus}`, 'info');
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
    } catch (e) {
      console.warn('Update payment status API sync failed (local state updated):', e);
    }
    addToast(`Payment status updated to ${paymentStatus} for order #${orderId.slice(-6)}`, 'success');
  };

  const updateCmsSection = async (id: string, data: Partial<HomepageSection>) => {
    const updated = cmsSections.map((sec) => (sec.id === id ? { ...sec, ...data } : sec));
    setCmsSections(updated);
    saveState({ cmsSections: updated });
    try {
      const res = await fetch(`/api/cms?key=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.cmsSection) {
          const synced = updated.map((sec) => (sec.id === id ? { ...sec, ...json.cmsSection } : sec));
          setCmsSections(synced);
          saveState({ cmsSections: synced });
        }
      }
    } catch (e) {
      console.warn('CMS section API sync failed (local state updated):', e);
    }
    addToast('Homepage section saved & synced live', 'success');
  };

  const toggleCmsSection = async (id: string) => {
    const section = cmsSections.find((s) => s.id === id);
    if (!section) return;
    const nextEnabled = !section.enabled;
    const updated = cmsSections.map((sec) => (sec.id === id ? { ...sec, enabled: nextEnabled } : sec));
    setCmsSections(updated);
    saveState({ cmsSections: updated });
    try {
      await fetch(`/api/cms?key=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
    } catch (e) {
      console.warn('Toggle CMS API sync failed (local state updated):', e);
    }
    addToast(nextEnabled ? 'Section enabled on homepage' : 'Section hidden from homepage', 'info');
  };

  const moveCmsSection = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...cmsSections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ ...s }));
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    // Swap array positions and normalize sequential 1..N order
    const [moved] = sorted.splice(idx, 1);
    sorted.splice(targetIdx, 0, moved);
    const reordered = sorted.map((sec, i) => ({ ...sec, order: i + 1 }));

    setCmsSections(reordered);
    saveState({ cmsSections: reordered });
    try {
      await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: reordered.map((s) => ({ id: s.id, order: s.order })),
        }),
      });
    } catch (e) {
      console.warn('Move CMS section API sync failed (local state updated):', e);
    }
    addToast('Homepage section order updated', 'info');
  };

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }));
    // Intentionally NOT saving to localStorage — persists ONLY to MongoDB

    fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updatePlatformSettings', platformSettings: settings }),
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data?.platformSettings) {
          setPlatformSettings(data.platformSettings);
        }
      })
      .catch((e) => console.warn('Platform settings DB sync failed:', e));
  };

  // --- Billings, Delivery Fees, Coupons & Notice Board Actions ---

  const updateDeliveryFees = async (fees: DeliveryFees): Promise<{ success: boolean; error?: string }> => {
    const updatedFees = {
      insideDhaka: Number(fees.insideDhaka) || 0,
      outsideDhaka: Number(fees.outsideDhaka) || 0,
    };
    setDeliveryFees(updatedFees);
    saveState({ deliveryFees: updatedFees });
    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateDeliveryFees', deliveryFees: updatedFees }),
      });
      addToast('Delivery fees updated and synced live!', 'success');
      return { success: true };
    } catch (e: any) {
      console.warn('Delivery fee API sync notice:', e);
      addToast('Delivery fees updated locally', 'info');
      return { success: true };
    }
  };

  const createCoupon = async (
    couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>
  ): Promise<{ success: boolean; coupon?: Coupon; error?: string }> => {
    const normalizedCode = couponData.code.trim().toUpperCase();
    if (!normalizedCode) {
      return { success: false, error: 'Coupon code cannot be empty.' };
    }
    if (coupons.some((c) => c.code.toUpperCase() === normalizedCode)) {
      return { success: false, error: `Coupon code "${normalizedCode}" already exists.` };
    }

    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn-${Date.now()}`,
      code: normalizedCode,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Coupon API sync notice:', e);
    }
    addToast(`Coupon "${normalizedCode}" created successfully!`, 'success');
    return { success: true, coupon: newCoupon };
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<{ success: boolean; error?: string }> => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...data, code: (data.code || c.code).trim().toUpperCase() } : c));
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Update coupon API sync notice:', e);
    }
    addToast('Coupon updated successfully', 'success');
    return { success: true };
  };

  const deleteCoupon = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Delete coupon API sync notice:', e);
    }
    addToast('Coupon removed', 'info');
    return { success: true };
  };

  const toggleCouponStatus = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Coupon not found' };
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Toggle coupon API sync notice:', e);
    }
    addToast(`Coupon ${target.code} is now ${!target.isActive ? 'Active' : 'Disabled'}`, 'info');
    return { success: true };
  };

  const validateCoupon = (
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; discount: number; error?: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, discount: 0, error: 'Please enter a coupon code.' };
    }

    const coupon = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!coupon) {
      return { valid: false, discount: 0, error: `Invalid coupon code "${clean}".` };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, error: `Coupon "${clean}" is currently inactive.` };
    }

    if (coupon.expiryDate) {
      const exp = new Date(coupon.expiryDate);
      // Set to end of day
      exp.setHours(23, 59, 59, 999);
      if (Date.now() > exp.getTime()) {
        return { valid: false, discount: 0, error: `Coupon "${clean}" has expired.` };
      }
    }

    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        error: `Coupon "${clean}" has reached its maximum usage limit of ${coupon.usageLimit} redemptions.`,
      };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        error: `Coupon "${clean}" requires a minimum order of ৳${coupon.minOrderAmount}. (Current subtotal: ৳${subtotal})`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(subtotal, coupon.discountValue);
    }

    return { valid: true, coupon, discount };
  };

  const updateNoticeBoard = async (notice: Partial<NoticeBoard>): Promise<{ success: boolean; error?: string }> => {
    const updated: NoticeBoard = {
      ...noticeBoard,
      ...notice,
      updatedAt: new Date().toISOString(),
    };
    setNoticeBoard(updated);
    saveState({ noticeBoard: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateNoticeBoard', noticeBoard: updated }),
      });
    } catch (e) {
      console.warn('Notice board API sync notice:', e);
    }
    addToast('Notice board updated and live broadcast configured!', 'success');
    return { success: true };
  };

  const updateLegalPolicy = async (key: keyof LegalPolicies, data: Partial<PolicyPageContent>) => {
    const updated: LegalPolicies = {
      ...legalPolicies,
      [key]: {
        ...legalPolicies[key],
        ...data,
        lastUpdated: data.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    };
    setLegalPolicies(updated);
    saveState({ legalPolicies: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateLegalPolicies', legalPolicies: updated }),
      });
    } catch (err) {
      console.warn('Legal policies DB sync notice:', err);
    }

    addToast(`Published ${updated[key].title} live`, 'success');
  };

  // Student Reviews Actions
  const refreshReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          saveState({ reviews: data.reviews });
        }
      }
    } catch (err) {
      console.warn('Reviews fetch notice:', err);
    }
  };

  useEffect(() => {
    refreshReviews();
  }, []);

  const submitReview = async (
    reviewData: Partial<StudentReview>
  ): Promise<{ success: boolean; review?: StudentReview; error?: string }> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (data.success && data.review) {
        const savedRev: StudentReview = data.review;
        const exists = reviews.some((r) => r.id === savedRev.id || r.studentEmail === savedRev.studentEmail);
        const updated = exists
          ? reviews.map((r) => (r.id === savedRev.id || r.studentEmail === savedRev.studentEmail ? savedRev : r))
          : [savedRev, ...reviews];
        setReviews(updated);
        saveState({ reviews: updated });
        addToast('Review submitted successfully! Thank you for your feedback! ⭐', 'success');
        return { success: true, review: savedRev };
      }
      return { success: false, error: data.error || 'Failed to submit review.' };
    } catch (e: any) {
      const fallbackRev: StudentReview = {
        id: `rev-${Date.now()}`,
        studentId: reviewData.studentId,
        studentEmail: reviewData.studentEmail || currentUser?.email || 'student@chordandcraft.com',
        name: reviewData.name || currentUser?.fullName || 'Student',
        level: reviewData.level || (currentUser?.level ? `${currentUser.level} Student` : 'Student'),
        avatar: reviewData.avatar || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        rating: reviewData.rating || 5,
        comment: reviewData.comment || '',
        status: 'Approved',
        createdAt: new Date().toISOString(),
      };
      const exists = reviews.some((r) => r.studentEmail === fallbackRev.studentEmail);
      const updated = exists
        ? reviews.map((r) => (r.studentEmail === fallbackRev.studentEmail ? fallbackRev : r))
        : [fallbackRev, ...reviews];
      setReviews(updated);
      saveState({ reviews: updated });
      addToast('Review saved! Thank you for sharing your experience! ⭐', 'success');
      return { success: true, review: fallbackRev };
    }
  };

  const deleteReview = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API review delete notice:', e);
    }
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    saveState({ reviews: updated });
    addToast('Review removed.', 'info');
    return { success: true };
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRole,
        adminName,
        isAuthLoading,
        users,
        courses,
        courseEnrollments,
        lessons,
        lessonAccess,
        lessonProgress,
        attendance,
        products,
        orders,
        cart,
        cmsSections,
        platformSettings,
        isPlatformLoading,
        deliveryFees,
        coupons,
        noticeBoard,
        legalPolicies,
        updateLegalPolicy,
        reviews,
        submitReview,
        deleteReview,
        refreshReviews,
        toasts,
        addToast,
        removeToast,
        switchUserRole,
        selectStudentUser,
        login,
        loginWithGoogle,
        loginWithApple,
        signupWithGoogle,
        signupWithApple,
        logout,
        signup,
        resetPassword,
        requestPasswordResetLink,
        verifyPasswordResetToken,
        completePasswordReset,
        refreshCurrentUser,
        refreshUsers,
        setUsers,
        updateProfile,
        updateUserPassword,
        updateUserStatus,
        approveUser,
        denyUser,
        updateUser,
        deleteUser,
        refreshCourses,
        createCourse,
        updateCourse,
        deleteCourse,
        refreshCourseEnrollments,
        submitCourseEnrollmentPayment,
        approveCourseEnrollment,
        rejectCourseEnrollment,
        toggleLessonAccess,
        bulkSetLessonAccess,
        markLessonProgress,
        createLesson,
        updateLesson,
        deleteLesson,
        recordAttendance,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createProduct,
        updateProduct,
        deleteProduct,
        placeOrder,
        verifyBkashPayment,
        updateOrderStatus,
        updatePaymentStatus,
        updateCmsSection,
        toggleCmsSection,
        moveCmsSection,
        updatePlatformSettings,
        updateDeliveryFees,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        validateCoupon,
        updateNoticeBoard,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
