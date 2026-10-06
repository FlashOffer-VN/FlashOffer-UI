"""Chuyen <input type="checkbox"> noi bo sang <app-checkbox> cua app.

Chay: python scripts/convert-checkboxes.py [--apply]
Khong co --apply thi chi in ra thay doi du kien.
"""
import io
import os
import re
import sys

UI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPLY = "--apply" in sys.argv


def read(p):
    return io.open(p, encoding="utf-8", newline="").read()


def write(p, t):
    io.open(p, "w", encoding="utf-8", newline="").write(t)


# file -> (so lan thay, ham/ten thay doi)
TARGETS = [
    "src/app/pages/admin/business-fields/business-field-list.component.ts",
    "src/app/pages/admin/groups/group-list.component.html",
    "src/app/pages/admin/partner/partner-list.component.html",
    "src/app/pages/admin/permissions/permission-matrix.component.html",
    "src/app/pages/admin/permissions/user-permission.component.ts",
    "src/app/pages/admin/purchase-requests/purchase-request-list.component.html",
    "src/app/pages/admin/revenue/revenue-settings.component.ts",
    "src/app/pages/admin/settings/audit-log/audit-log-list.component.html",
    "src/app/pages/admin/settings/commission/commission-config.component.ts",
    "src/app/pages/admin/settings/general/general-settings-table.component.ts",
    "src/app/pages/admin/settings/membership/membership-tiers.component.ts",
    "src/app/pages/groups/detail/group-detail.component.html",
    "src/app/shared/components/share-to-group/share-to-group.component.html",
    "src/app/shared/components/user-picker/user-picker.component.ts",
]

# Handler nhan Event -> doi sang boolean (chi 4 cho, con lai da nhan boolean hoac khong tham so).
HANDLER_FIXES = {
    "src/app/pages/admin/partner/partner-list.component.ts": [
        ("toggleAll(event: Event): void {\r\n        this.selectedIds = (event.target as HTMLInputElement).checked ? this.partners.map(item => item.id) : [];",
         "toggleAll(checked: boolean): void {\r\n        this.selectedIds = checked ? this.partners.map(item => item.id) : [];"),
        ("toggleSelect(id: string, event: Event): void {", "toggleSelect(id: string, checked: boolean): void {"),
    ],
    "src/app/pages/admin/purchase-requests/purchase-request-list.component.ts": [
        ("toggleAll(event: Event): void {\r\n        this.selectedIds = (event.target as HTMLInputElement).checked ? this.requests.map(item => item.id) : [];",
         "toggleAll(checked: boolean): void {\r\n        this.selectedIds = checked ? this.requests.map(item => item.id) : [];"),
        ("toggleSelect(id: string, event: Event): void {", "toggleSelect(id: string, checked: boolean): void {"),
    ],
}

TAG = re.compile(r"<input[^>]*type=\"checkbox\"[^>]*>", re.S)


def to_component(tag: str) -> str:
    attrs = {}
    # dua tung thuoc tinh ra ngoai
    for m in re.finditer(r"(\[[^\]]+\]|\([^)]+\)|[:\w\-\*]+)(?:=\"([^\"]*)\")?", tag):
        name, val = m.group(1), m.group(2)
        if name in ("<input", "type", "class", "/"):
            continue
        attrs[name] = val
    parts = []
    if "[(ngModel)]" in attrs:
        parts.append(f'[(ngModel)]="{attrs["[(ngModel)]"]}"')
    for key in ("formControlName", "[formControlName]"):
        if key in attrs:
            parts.append(f'{key}="{attrs[key]}"')
    for key in ("[checked]", "[ngModel]"):
        if key in attrs:
            parts.append(f'[ngModel]="{attrs[key]}"')
    parts += [f'{k}="{v}"' if v is not None else k for k, v in attrs.items()
              if k in ("[indeterminate]", "[disabled]", "required")]
    # aria-label -> input ariaLabel cua app-checkbox (giu cho trinh doc man hinh)
    for key in ("[attr.aria-label]", "aria-label"):
        if key in attrs:
            val = attrs[key]
            parts.append(f'[ariaLabel]="{val}"' if key == "[attr.aria-label]" else f'[ariaLabel]="\'{val}\'"')
    # su kien: change/click -> ngModelChange (giu nguyen tham so)
    for key in ("(change)", "(click)", "(ngModelChange)"):
        if key in attrs:
            call = attrs[key]
            # click tren input truoc day chi de chan noi bot su kien: chuyen sang (click) chan tren host
            if key == "(click)" and "$event" in call:
                parts.append('(click)="$event.stopPropagation()"')
                call = re.sub(r",\s*\$event", "", call)
            parts.append(f'(ngModelChange)="{call}"')
    return "<app-checkbox " + " ".join(parts) + " />"


CHECKBOX_IMPORT = "import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';"
NGMODEL_IMPORT = "import { FormsModule } from '@angular/forms';"


def fix_imports(ts_path, template_text):
    """Them import CheckboxComponent (+ FormsModule khi can) va khai bao trong imports[]."""
    if not os.path.isfile(ts_path):
        print("  !! khong thay component .ts:", ts_path)
        return
    t = read(ts_path)
    eol = "\r\n" if "\r\n" in t else "\n"
    changed = []

    if "CheckboxComponent" not in t:
        m = list(re.finditer(r"(?m)^import .*\r?\n", t))
        if m:
            insert_at = m[-1].end()
            t = t[:insert_at] + CHECKBOX_IMPORT + eol + t[insert_at:]
            changed.append("import Checkbox")

    if re.search(r"\[\(?ngModel\)?\]", template_text) and "FormsModule" not in t:
        m = list(re.finditer(r"(?m)^import .*\r?\n", t))
        if m:
            insert_at = m[-1].end()
            t = t[:insert_at] + NGMODEL_IMPORT + eol + t[insert_at:]
            changed.append("import FormsModule")

    m = re.search(r"imports:\s*\[([^\]]*)\]", t, re.S)
    if m and "CheckboxComponent" not in m.group(1):
        inner = m.group(1).rstrip()
        sep = "" if inner.rstrip().endswith(",") else ","
        t = t[:m.start(1)] + inner + sep + eol + "        CheckboxComponent" + eol + "    " + t[m.end(1):]
        changed.append("imports[]")
    if m and "FormsModule" not in m.group(1) and any("ngModel" in x for x in changed):
        pass
    if changed and APPLY:
        write(ts_path, t)
    print(f"  -> {os.path.relpath(ts_path, UI)}: {', '.join(changed) if changed else 'khong can them'}")


def main():
    changed = 0
    for rel in TARGETS:
        p = os.path.join(UI, rel)
        if not os.path.isfile(p):
            print("KHONG THAY", rel)
            continue
        t = read(p)
        eol = "\r\n" if "\r\n" in t else "\n"
        hits = 0

        def repl(m):
            nonlocal hits
            hits += 1
            return to_component(m.group(0))

        new = TAG.sub(repl, t)
        # Ghi template TRUOC, roi moi bo sung import (fix_imports doc lai file tu dia).
        if APPLY and new != t:
            write(p, new)
            changed += hits
        if hits:
            print(f"{rel}: {hits} checkbox")
            if p.endswith(".html"):
                cand = p.replace(".html", ".ts")
                ts_path = cand if os.path.isfile(cand) else p
            else:
                ts_path = p
            fix_imports(ts_path, new)

        for rel2, fixes in HANDLER_FIXES.items():
            if rel2 != rel:
                continue
            t2 = read(p)
            for old, newtxt in fixes:
                old_e, new_e = old.replace("\n", eol), newtxt.replace("\n", eol)
                if old_e in t2:
                    t2 = t2.replace(old_e, new_e, 1)
                    print(f"  -> doi handler: {new_e.splitlines()[0][:80]}")
                else:
                    print(f"  !! khong thay handler: {old_e.splitlines()[0][:80]}")
            if APPLY:
                write(p, t2)
    print(f"\n{'Da ap dung' if APPLY else 'Du kien'}: {changed} cho")


if __name__ == "__main__":
    main()
