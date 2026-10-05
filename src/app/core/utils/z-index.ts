/**
 * Thang z-index dùng chung — xếp lớp các thành phần nổi (dialog, dropdown, toast…).
 *
 * Giá trị gốc khai báo MỘT chỗ ở `:root` trong `src/styles.css` (`--z-*`); file này chỉ
 * quản lý "tầng" của từng dialog đang mở để **dialog mở sau luôn nằm trên dialog mở trước**
 * (kể cả dialog lồng trong dialog). Overlay đặt:
 *   z-index: calc(var(--z-modal) + var(--modal-level, 0) * var(--z-modal-step));
 *
 * Thứ tự lớp (thấp → cao): nội dung app < nút nổi < sidebar/ngăn kéo < header
 *   < dialog cha < backdrop dialog con < dialog con < dropdown/menu nổi < toast < loading.
 */

/** Các tầng dialog đang mở (module-level — dùng chung cho mọi instance dialog). */
const activeLevels: number[] = [];

/** Cấp tầng thấp nhất còn trống cho một dialog vừa mở. */
export function acquireModalLevel(): number {
  let level = 0;
  while (activeLevels.includes(level)) level++;
  activeLevels.push(level);
  return level;
}

/** Trả tầng lại khi dialog đóng để dialog sau tái dùng tầng thấp nhất đang trống. */
export function releaseModalLevel(level: number): void {
  const index = activeLevels.indexOf(level);
  if (index >= 0) activeLevels.splice(index, 1);
}
