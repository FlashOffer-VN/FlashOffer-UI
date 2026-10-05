#!/usr/bin/env node
/**
 * Kiểm tra quy ước MOBILE của kindi-ui:
 *
 *  1. Mỗi file `<ten>.component.mobile.css` phải được khai trong `styleUrls` của một component
 *     — file không ai nạp là file chết (không báo lỗi ở đâu cả).
 *  2. Mỗi file `.component.mobile.css` phải có ít nhất một `@media (max-width: ...)`
 *     — không thì rule trong đó áp luôn cho desktop.
 *  3. `src/app.mobile.css` phải được nạp trong angular.json (build.options.styles).
 *
 * Và liệt kê (chỉ cảnh báo, không fail) những chỗ còn lệch quy ước để dọn dần:
 *  - `z-index: <số lớn hơn 1>` viết trực tiếp (phải dùng thang --z-* ở styles.css; 0/1/2/-1 là xếp lớp
 *    CỤC BỘ trong một component nên được phép).
 *  - breakpoint ngoài các mốc chuẩn 480 / 640 / 768 / 1023 / 1024 (1023 = layout đổi sidebar thành ngăn kéo;
 *    mốc 1200 ở vài màn admin là ngoại lệ cũ chưa dọn).
 *
 * Usage: npm run check:mobile
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const root = process.cwd();
const APP_DIR = resolve(root, 'src/app');
const CANONICAL = new Set(['480', '640', '768', '1023', '1024']);

function walk(dir, filter) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, filter));
    else if (filter(name)) out.push(p);
  }
  return out;
}

const tsFiles = walk(APP_DIR, (n) => n.endsWith('.ts'));
const cssFiles = walk(APP_DIR, (n) => n.endsWith('.css'));
const mobileFiles = cssFiles.filter((f) => f.endsWith('.component.mobile.css'));

const failures = [];

// 1 + 2: file mobile phải được nạp và phải có media query
const styleUrlsSources = tsFiles.map((f) => ({ f, src: readFileSync(f, 'utf8') }));
for (const file of mobileFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const name = rel.split('/').pop();
  const registered = styleUrlsSources.some(({ src }) => src.includes(name) && /styleUrls/.test(src));
  if (!registered) failures.push(`${rel}: không component nào nạp file này trong styleUrls`);

  const src = readFileSync(file, 'utf8');
  if (!/@media\s*\(max-width/.test(src)) {
    failures.push(`${rel}: thiếu @media (max-width: ...) — rule sẽ áp cho cả desktop`);
  }
}

// 3: app.mobile.css phải được nạp
const angularJson = resolve(root, 'angular.json');
if (!existsSync(angularJson) || !readFileSync(angularJson, 'utf8').includes('src/app.mobile.css')) {
  failures.push('angular.json: chưa nạp "src/app.mobile.css" trong build.options.styles');
}

// 3b: biến dùng chung phải được nạp qua styles.css
const stylesCss = resolve(root, 'src/styles.css');
if (!existsSync(stylesCss) || !readFileSync(stylesCss, 'utf8').includes("@import './variable.css'")) {
  failures.push("src/styles.css: thiếu @import './variable.css' (biến dùng chung chưa được nạp)");
}

// Cảnh báo: z-index viết trực tiếp + breakpoint lệch chuẩn
const rawZ = [];
const rawHex = [];
const oddBreakpoints = new Map();

// Mã màu viết trực tiếp trong component: nên khai token ở src/variable.css rồi dùng var(--*)
const HEX_RE = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/;
for (const file of cssFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      const z = line.match(/z-index:\s*(-?\d+)/);
      if (z && !['0', '1', '2', '-1'].includes(z[1])) rawZ.push(`${rel}:${i + 1} (z-index: ${z[1]})`);
      if (HEX_RE.test(line)) rawHex.push(`${rel}:${i + 1}`);
      const m = line.match(/@media\s*\(max-width:\s*(\d+)px\)/);
      if (m && !CANONICAL.has(m[1])) oddBreakpoints.set(m[1], (oddBreakpoints.get(m[1]) ?? 0) + 1);
    });
}
const tsAndTemplates = tsFiles.concat(walk(APP_DIR, (n) => n.endsWith('.html')));
for (const file of tsAndTemplates) {
  const rel = relative(root, file).replace(/\\/g, '/');
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      // z-index viết thẳng trong style/TS
      const z = line.match(/z-index:\s*(-?\d+)/);
      if (z && !['0', '1', '2', '-1'].includes(z[1])) rawZ.push(`${rel}:${i + 1} (z-index: ${z[1]})`);
      // lớp Tailwind z-<số> / z-[<số>] trong template
      if (/\bz-\[?\d/.test(line)) rawZ.push(`${rel}:${i + 1} (lớp z-* của Tailwind)`);
      if (HEX_RE.test(line)) rawHex.push(`${rel}:${i + 1}`);
    });
}

if (failures.length) {
  console.error(
    '❌ Quy ước mobile chưa đạt:\n' + failures.map((f) => `   - ${f}`).join('\n') +
      '\n\nXem cách chia file ở src/app.mobile.css và <component>.component.mobile.css.'
  );
  process.exit(1);
}

console.log(`✅ Quy ước mobile OK (${mobileFiles.length} file .component.mobile.css được nạp đúng).`);
if (rawZ.length) {
  console.log(`⚠️  ${rawZ.length} chỗ còn viết z-index trực tiếp (nên dùng var(--z-*)):\n   ` + rawZ.slice(0, 25).join('\n   ') + (rawZ.length > 25 ? `\n   ... và ${rawZ.length - 25} chỗ nữa` : ''));
}
if (rawHex.length) {
  console.log(`⚠️  ${rawHex.length} chỗ còn viết mã màu trực tiếp trong component (nên thêm token ở src/variable.css rồi dùng var(--*)):\n   ` + rawHex.slice(0, 12).join('\n   ') + (rawHex.length > 12 ? `\n   ... và ${rawHex.length - 12} chỗ nữa` : ''));
}
if (oddBreakpoints.size) {
  const list = [...oddBreakpoints.entries()].sort((a, b) => b[1] - a[1]).map(([px, n]) => `${px}px ×${n}`).join(', ');
  console.log(`⚠️  breakpoint ngoài mốc chuẩn (480/640/768/1023/1024): ${list}`);
}
