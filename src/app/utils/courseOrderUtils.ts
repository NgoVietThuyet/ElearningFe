/**
 * courseOrderUtils.ts
 * Quản lý thứ tự lộ trình khóa học toàn hệ thống qua localStorage.
 * Chỉ ADMIN có quyền ghi; tất cả role đọc để hiển thị / kiểm tra điều kiện mở khóa.
 *
 * Storage key: "edusmart.courseOrder"
 * Format: Record<courseId (string), orderNumber (number)>
 * Ví dụ: { "3": 1, "7": 2, "1": 3 }
 */

const STORAGE_KEY = "edusmart.courseOrder";

// ─── Read ────────────────────────────────────────────────────────────────────

/** Trả về map { courseId → orderNumber }. Nếu chưa có dữ liệu trả về {}. */
export function getCourseOrderMap(courses?: any[]): Record<number, number> {
  if (courses && courses.length > 0) {
    const result: Record<number, number> = {};
    for (const c of courses) {
      if (c.sortOrder && c.sortOrder > 0) {
        result[c.id] = c.sortOrder;
      }
    }
    return result;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    // Convert string keys → number keys
    const result: Record<number, number> = {};
    for (const key of Object.keys(parsed)) {
      result[Number(key)] = parsed[key];
    }
    return result;
  } catch {
    return {};
  }
}

/** Trả về orderNumber của 1 khóa học cụ thể. undefined = chưa được xếp thứ tự. */
export function getCourseOrder(courseId: number): number | undefined {
  return getCourseOrderMap()[courseId];
}

// ─── Write (Admin only) ───────────────────────────────────────────────────────

/** Lưu toàn bộ map { courseId → orderNumber } vào localStorage. */
export function saveCourseOrderMap(map: Record<number, number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Nhận vào mảng courseId theo thứ tự mong muốn (index 0 = Bài 1, index 1 = Bài 2...).
 * Tự động tạo map và lưu.
 */
export function saveCourseOrderFromArray(orderedIds: number[]): void {
  const map: Record<number, number> = {};
  orderedIds.forEach((id, index) => {
    map[id] = index + 1; // 1-indexed
  });
  saveCourseOrderMap(map);
}

/** Xóa toàn bộ thứ tự đã lưu (reset). */
export function clearCourseOrder(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

/**
 * Sắp xếp danh sách khóa học theo order đã lưu.
 * Khóa học chưa được xếp thứ tự sẽ xếp sau cùng (theo id tăng dần).
 */
export function sortCoursesByOrder(courses: any[]): any[] {
  const orderMap = getCourseOrderMap(courses);
  return [...courses].sort((a, b) => {
    const orderA = orderMap[a.id] ?? Infinity;
    const orderB = orderMap[b.id] ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.id - b.id; // tiebreaker
  });
}

// ─── Prerequisite logic ───────────────────────────────────────────────────────

/**
 * Kiểm tra khóa học tại vị trí `courseIndex` trong mảng đã sort có được mở khóa không.
 *
 * Quy tắc:
 * - Khóa học đầu tiên (index 0) → luôn mở.
 * - Khóa học chưa có order → luôn mở (không thuộc lộ trình bắt buộc).
 * - Khóa học có order → mở nếu khóa học liền trước đạt 100%.
 *
 * @param courseIndex  Vị trí trong mảng sortedCourses
 * @param sortedCourses  Mảng courses đã sort theo order
 * @param progressMap  { courseId → progressPercent (0-100) } từ student API
 */
export function isCourseUnlocked(
  courseIndex: number,
  sortedCourses: any[],
  progressMap: Record<number, number>
): boolean {
  if (courseIndex === 0) return true;

  const orderMap = getCourseOrderMap(sortedCourses);
  const thisCourse = sortedCourses[courseIndex];

  // Nếu khóa học này chưa được xếp thứ tự → không bị khóa
  if (thisCourse && orderMap[thisCourse.id] === undefined) return true;

  const prevCourse = sortedCourses[courseIndex - 1];
  if (!prevCourse) return true;

  // Nếu khóa học trước chưa xếp thứ tự → không khóa cái sau
  if (orderMap[prevCourse.id] === undefined) return true;

  const prevProgress = progressMap[prevCourse.id] ?? 0;
  return prevProgress >= 100;
}

/**
 * Trả về tên khóa học cần hoàn thành trước (để hiển thị trong tooltip / toast).
 * null nếu không có điều kiện.
 */
export function getPrerequisiteCourseName(
  courseIndex: number,
  sortedCourses: any[]
): string | null {
  if (courseIndex === 0) return null;
  const prev = sortedCourses[courseIndex - 1];
  return prev?.title ?? null;
}

/**
 * Trả về progress (%) của khóa học trước đó.
 * Dùng để hiển thị "Hoàn thành thêm X% nữa để mở khóa".
 */
export function getPreviousCourseProgress(
  courseIndex: number,
  sortedCourses: any[],
  progressMap: Record<number, number>
): number {
  if (courseIndex === 0) return 100;
  const prev = sortedCourses[courseIndex - 1];
  if (!prev) return 100;
  return progressMap[prev.id] ?? 0;
}
