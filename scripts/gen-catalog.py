"""Sinh catalog tra cuu cho dev: component/pipe/directive cua UI + route/helper cua API.

Chay tu thu muc goc cua kindi-ui:
    python scripts/gen-catalog.py            # tu tim ../kindi-api
    python scripts/gen-catalog.py <duong-dan-kindi-api>

Ket qua: src/app/pages/admin/settings/ui-gallery/catalog.data.ts
"""
import io
import json
import os
import re
import sys


UI_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.abspath(os.path.join(UI_ROOT, "..", "kindi-api"))
OUT = os.path.join(UI_ROOT, "src", "app", "pages", "admin", "settings", "ui-gallery", "catalog.data.ts")

COMPONENT_GROUPS = {
    "form": ["Button", "Input", "NgSelectWrapper", "Checkbox", "RadioGroup", "FilterDaterange",
             "ProvinceSelect", "SearchBy", "UserPicker", "MoneyInput"],
    "display": ["Badge", "BrandLogo", "JsonViewer", "BusinessInfo", "StatusTabs", "ProductList",
                "PaymentQr", "AccountCreatedNotice", "CodeList", "ShareToGroup", "LanguageSwitcher",
                "ContactFloating", "Pagination"],
    "feedback": ["Loading", "Toast", "Modal", "PurgeBar", "ChangeCredentialsForm"],
    "layout": ["AdminLayout", "AdminHeader", "AdminSidebar", "AdminFooter"],
}


def read(path):
    return io.open(path, encoding="utf-8", errors="replace").read()


def one_line(text):
    text = (text or "").replace("<summary>", "").replace("</summary>", "")
    text = re.sub(r"(?m)^\s*///\s?", "", text)
    return re.sub(r"\s+", " ", text).strip()


def xml_doc(text, index):
    """Lay comment <summary> ngay truoc vi tri index."""
    head = text[:index]
    m = None
    for m2 in re.finditer(r"///\s*<summary>\s*(.*?)\s*///\s*</summary>", head, re.S):
        m = m2
    return one_line(m.group(1)) if m else ""


def split_params(sig):
    out, depth, cur = [], 0, ""
    for ch in sig:
        if ch in "<([": depth += 1
        elif ch in ">)]": depth -= 1
        if ch == "," and depth == 0:
            out.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return [p for p in out if p]


# ---------------------------------------------------------------- UI
def scan_ui():
    base = os.path.join(UI_ROOT, "src", "app", "shared")
    items = {"components": [], "pipes": [], "directives": []}
    for kind, folder, key in (("component", "components", "components"), ("pipe", "pipes", "pipes"),
                              ("directive", "directives", "directives")):
        for root, _, files in os.walk(os.path.join(base, folder)):
            for f in sorted(files):
                if not f.endswith(".ts") or f.endswith(".spec.ts"):
                    continue
                p = os.path.join(root, f)
                t = read(p)
                if "standalone: true" not in t:
                    continue
                cls_m = re.search(r"export class (\w+)", t)
                if not cls_m:
                    continue
                cls = cls_m.group(1)
                path = os.path.relpath(p, UI_ROOT).replace("\\", "/")
                if kind == "component":
                    sel = re.search(r"selector:\s*'([^']+)'", t)
                    method = re.search(r"styleUrls:\s*\[([^\]]+)\]", t)
                    ins = []
                    for m in re.finditer(r"@Input\(([^)]*)\)\s*(\w+)\s*(?::\s*([^=;\n]+?))?\s*(?:=\s*([^;\n]+))?;", t):
                        ins.append({"name": m.group(2), "type": one_line(m.group(3)) or "any",
                                    "default": one_line(m.group(4)), "required": "required" in (m.group(1) or "")})
                    outs = [{"name": n, "type": ty.strip()} for n, ty in
                            re.findall(r"@Output\(\)\s*(\w+)\s*=\s*new EventEmitter<([^>]+)>", t)]
                    group = "display"
                    for g, names in COMPONENT_GROUPS.items():
                        if any(cls.startswith(n) for n in names):
                            group = g
                            break
                    items[key].append({
                        "kind": "component", "group": group, "class": cls,
                        "selector": sel.group(1) if sel else "", "path": path, "doc": xml_doc(t, cls_m.start()),
                        "inputs": ins, "outputs": outs, "hasStyle": bool(method),
                        "formControl": "ControlValueAccessor" in t,
                    })
                else:
                    tr = re.search(r"transform\(([^)]*?)\)\s*(?::\s*[^{]+)?\{", t, re.S)
                    prms, safe = [], False
                    if tr:
                        raw = split_params(one_line(tr.group(1)))
                        prms = raw
                        safe = all(("=" in x) or ("?" in x) for x in raw)
                    name = re.search(r"name:\s*'([^']+)'", t) or re.search(r"selector:\s*'([^']+)'", t)
                    items[key].append({
                        "kind": kind, "group": kind, "class": cls, "selector": name.group(1) if name else "",
                        "path": path, "doc": xml_doc(t, cls_m.start()), "inputs": [], "outputs": [],
                        "params": prms, "safeCall": safe, "hasStyle": False, "formControl": False,
                    })
    for k in items:
        items[k].sort(key=lambda x: x["class"])
    return items


# ---------------------------------------------------------------- API
VERB = re.compile(r"\[Http(Get|Post|Put|Patch|Delete)(?:\(\s*\"([^\"]*)\"\s*\))?\]")


def scan_permission_codes():
    """Ten quyen trong enum -> ma P0xx."""
    f = os.path.join(API_ROOT, "src", "Kindi.API.Domain", "Enums", "PermissionCode.cs")
    out = {}
    if os.path.isfile(f):
        src = read(f)
        # enum so: ViewGroups = 70  ->  ma hien thi P070 (giong kindi-ui dang dung)
        for m in re.finditer(r"^\s*(\w+)\s*=\s*(\d+)\s*,", src, re.M):
            out[m.group(1)] = "P%03d" % int(m.group(2))
        for m in re.finditer(r"^\s*(\w+)\s*=\s*\"(P\d+)\"", src, re.M):
            out[m.group(1)] = m.group(2)
    return out


def scan_dtos():
    """DTO/Request/Response -> danh sach field (ten + kieu)."""
    root = os.path.join(API_ROOT, "src", "Kindi.API.Application", "DTOs")
    out = {}
    if not os.path.isdir(root):
        return out
    for dirpath, _, files in os.walk(root):
        for f in sorted(files):
            if not f.endswith(".cs"):
                continue
            t = read(os.path.join(dirpath, f))
            for m in re.finditer(r"public\s+(?:sealed\s+)?(?:class|record)\s+(\w+)\s*(?:\(([^)]*)\))?\s*(?::\s*[\w<>, \.]+)?\s*\{?", t):
                name, ctor = m.group(1), one_line(m.group(2))
                fields = []
                if ctor:
                    for prm in split_params(ctor):
                        bits = prm.split()
                        if len(bits) >= 2:
                            fields.append({"name": bits[-1], "type": bits[-2]})
                else:
                    body = t[m.end():m.end() + 4000]
                    for fm in re.finditer(r"public\s+([\w\.<>\[\]\?]+)\s+(\w+)\s*\{\s*get;\s*(?:set|init);", body):
                        fields.append({"name": fm.group(2), "type": fm.group(1)})
                if fields:
                    out[name] = fields
    return out


def scan_ui_helpers():
    """Ham tien ich dung chung phia UI (src/app/core/utils)."""
    d = os.path.join(UI_ROOT, "src", "app", "core", "utils")
    out = []
    if not os.path.isdir(d):
        return out
    for f in sorted(os.listdir(d)):
        if not f.endswith(".ts") or f.endswith(".spec.ts"):
            continue
        p = os.path.join(d, f)
        src = read(p)
        fns = []
        for m in re.finditer(r"export (?:async )?function\s+(\w+)\s*(?:<([^>]*)>)?\s*\(([^)]*)\)\s*(?::\s*([^\{]+))?\{", src):
            fns.append({"name": m.group(1), "generics": one_line(m.group(2)), "params": split_params(one_line(m.group(3))),
                        "returnType": one_line(m.group(4)) or "void", "doc": xml_doc(src, m.start())})
        consts = [c for c in re.findall(r"export const (\w+)", src)]
        if fns or consts:
            out.append({"file": f, "path": os.path.relpath(p, UI_ROOT).replace("\\", "/"),
                        "doc": one_line(re.search(r"^/\*\*(.*?)\*/", src, re.S).group(1)) if re.search(r"^/\*\*(.*?)\*/", src, re.S) else "",
                        "functions": fns, "consts": consts})
    return out


def scan_api():
    api = {"controllers": [], "extensions": [], "middlewares": [], "dtos": {}, "permissionCodes": {}}
    if not os.path.isdir(API_ROOT):
        return api
    perm_codes = scan_permission_codes()
    api["permissionCodes"] = perm_codes
    api["dtos"] = scan_dtos()

    ctrl_dirs = [os.path.join(API_ROOT, "src", "Kindi.API.WebApi", "Controllers")]
    files = []
    for d in ctrl_dirs:
        for root, _, fs in os.walk(d):
            files += [os.path.join(root, f) for f in sorted(fs) if f.endswith("Controller.cs")]

    for p in files:
        t = read(p)
        cls_m = re.search(r"public class (\w+Controller)\s*:\s*([\w<>, \.]*)", t)
        if not cls_m:
            continue
        cls, inherit = cls_m.group(1), cls_m.group(2).strip()
        route = ""
        for m in re.finditer(r"\[Route\(\"([^\"]+)\"\)\]", t):
            route = m.group(1)
        version = ""
        m = re.search(r"\[ApiVersion\(\"([^\"]+)\"\)\]", t)
        if m:
            version = m.group(1)
        name = cls[:-10]
        base = route.replace("[controller]", name)
        if "{version:apiVersion}" in base:
            # API version "1.0" duoc the hien tren duong dan la "v1" (giong kindi-ui dang goi).
            base = base.replace("{version:apiVersion}", (version or "1").split(".")[0] or "1")
        crud_dto = ""
        m = re.search(r"CrudControllerBase<\s*[\w\.]+\s*,\s*([\w\.]+)\s*>", inherit)
        if m:
            crud_dto = m.group(1)
        crud = "CrudControllerBase" in inherit

        actions = []
        for m in VERB.finditer(t):
            verb, tmpl = m.group(1).upper(), (m.group(2) or "")
            sig = re.search(r"public\s+(?:virtual\s+)?(?:async\s+)?(?:Task<)?([\w\.<>\[\]?]+)>?\s+(\w+)\s*\(([^)]*)\)", t[m.end():])
            if not sig:
                continue
            ret, method, params = sig.group(1).replace(">", "").strip(), sig.group(2), one_line(sig.group(3))
            req = []
            for prm in split_params(params):
                prm = re.sub(r"\[([^\]]+)\]\s*", "", prm).strip()
                if not prm:
                    continue
                bits = prm.split()
                if len(bits) >= 2:
                    req.append({"name": bits[-1], "type": bits[-2].split(".")[-1]})
            window = t[max(0, m.start() - 600):m.end() + 100]
            pm = re.search(r"HasPermission\(\s*(?:PermissionCode|Permission)\.(\w+)\s*\)", window)
            perm = pm.group(1) if pm else ""
            rm = re.search(r"\[Authorize\(\s*Roles\s*=\s*([^\)]+)\)\]", window)
            roles = one_line(rm.group(1)).replace("RoleConstants.", "") if rm else ""
            actions.append({
                "verb": verb, "path": (base + ("/" + tmpl if tmpl else "")).rstrip("/"),
                "method": method, "doc": xml_doc(t, m.start()), "request": req,
                "requestDto": next((x["type"] for x in req if x["type"].endswith(("Request", "Dto"))), crud_dto),
                "response": ret, "permission": perm,
                "permissionCode": perm_codes.get(perm, ""), "roles": roles,
                "anonymous": "AllowAnonymous" in window,
            })
        actions.sort(key=lambda a: (a["path"], a["verb"]))
        api["controllers"].append({
            "name": name, "class": cls, "base": base, "version": version, "crud": crud, "crudDto": crud_dto,
            "inherit": inherit, "path": os.path.relpath(p, API_ROOT).replace("\\", "/"),
            "doc": xml_doc(t, cls_m.start()), "actions": actions,
            "anonymous": "AllowAnonymous" in t[:cls_m.end() + 300],
            "authorize": ("[Authorize]" in t[:cls_m.end() + 300]) or bool(
                re.search(r"HasPermission\(", t[cls_m.end():cls_m.end() + 20000])),
        })

    # helpers / extensions
    for folder in (("src", "Kindi.API.Application", "Common", "Extensions"),
                   ("src", "Kindi.API.Application", "Common", "Helpers")):
        d = os.path.join(API_ROOT, *folder)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if not f.endswith(".cs"):
                continue
            p = os.path.join(d, f)
            t = read(p)
            cls_m = re.search(r"public static class (\w+)", t)
            if not cls_m:
                continue
            methods = []
            for m in re.finditer(r"public static\s+([\w\.<>\[\]?\(\) ,:]+?)\s+(\w+)\s*(?:<([^>]+)>)?\s*\(([^)]*)\)", t):
                methods.append({
                    "returnType": one_line(m.group(1)), "name": m.group(2),
                    "generics": one_line(m.group(3)), "params": split_params(one_line(m.group(4))),
                    "doc": xml_doc(t, m.start()),
                })
            api["extensions"].append({
                "class": cls_m.group(1), "path": os.path.relpath(p, API_ROOT).replace("\\", "/"),
                "doc": xml_doc(t, cls_m.start()), "methods": methods,
            })

    for f in sorted(os.listdir(os.path.join(API_ROOT, "src", "Kindi.API.WebApi", "Middlewares"))):
        if not f.endswith(".cs"):
            continue
        p = os.path.join(API_ROOT, "src", "Kindi.API.WebApi", "Middlewares", f)
        t = read(p)
        cls_m = re.search(r"public class (\w+)", t)
        if cls_m:
            api["middlewares"].append({
                "class": cls_m.group(1), "path": os.path.relpath(p, API_ROOT).replace("\\", "/"),
                "doc": xml_doc(t, cls_m.start()),
            })
    return api


def ts(value, indent=0):
    return json.dumps(value, ensure_ascii=False).replace("\n", "\n")


def main():
    ui = scan_ui()
    api = scan_api()
    ui["helpers"] = scan_ui_helpers()
    payload = {"generatedFrom": "kindi-ui src/app/shared + src/app/core/utils + kindi-api Controllers/Extensions",
               "ui": ui, "api": api}
    with io.open(os.path.join(UI_ROOT, "catalog-raw.json"), "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    header = ("// SINH TU DONG - dung scripts/gen-catalog.py de tao lai, khong sua tay.\n"
              "// Nguon: src/app/shared (UI) + kindi-api Controllers/Extensions/Helpers.\n\n"
              "export interface CatalogInput { name: string; type: string; default: string; required: boolean; }\n"
              "export interface CatalogOutput { name: string; type: string; }\n"
              "export interface CatalogItem {\n"
              "    kind: 'component' | 'pipe' | 'directive';\n"
              "    group: string;\n"
              "    class: string;\n"
              "    selector: string;\n"
              "    path: string;\n"
              "    doc: string;\n"
              "    inputs: CatalogInput[];\n"
              "    outputs: CatalogOutput[];\n"
              "    params?: string[];\n"
              "    safeCall?: boolean;\n"
              "    formControl?: boolean;\n"
              "    hasStyle?: boolean;\n"
              "}\n"
              "export interface ApiAction {\n"
              "    verb: string;\n"
              "    path: string;\n"
              "    method: string;\n"
              "    doc: string;\n"
              "    request: { name: string; type: string }[];\n"
              "    requestDto: string;\n"
              "    response: string;\n"
              "    permission: string;\n"
              "    permissionCode?: string;\n"
              "    roles?: string;\n"
              "    anonymous?: boolean;\n"
              "}\n"
              "export interface ApiController {\n"
              "    name: string;\n"
              "    class: string;\n"
              "    base: string;\n"
              "    version: string;\n"
              "    crud: boolean;\n"
              "    crudDto: string;\n"
              "    inherit: string;\n"
              "    path: string;\n"
              "    doc: string;\n"
              "    actions: ApiAction[];\n"
              "    anonymous?: boolean;\n"
              "    authorize?: boolean;\n"
              "}\n"
              "export interface ApiExtension {\n"
              "    class: string;\n"
              "    path: string;\n"
              "    doc: string;\n"
              "    methods: { returnType: string; name: string; generics: string; params: string[]; doc: string }[];\n"
              "}\n"
              "export interface ApiCatalog {\n"
              "    generatedFrom: string;\n"
              "    ui: { components: CatalogItem[]; pipes: CatalogItem[]; directives: CatalogItem[] };\n"
              "    api: { controllers: ApiController[]; extensions: ApiExtension[]; middlewares: { class: string; path: string; doc: string }[] };\n"
              "}\n\n"
              "export interface UiHelperFn { name: string; generics: string; params: string[]; returnType: string; doc: string; }\n"
              "export interface UiHelper { file: string; path: string; doc: string; functions: UiHelperFn[]; consts: string[]; }\n\n"
              "export interface DtoField { name: string; type: string; }\n\n"
              "export const UI_COMPONENTS: CatalogItem[] = ")
    body = (ts(ui["components"]) + ";\n\nexport const UI_PIPES: CatalogItem[] = " + ts(ui["pipes"])
            + ";\n\nexport const UI_DIRECTIVES: CatalogItem[] = " + ts(ui["directives"])
            + ";\n\nexport const UI_HELPERS: UiHelper[] = " + ts(ui["helpers"])
            + ";\n\nexport const API_CONTROLLERS: ApiController[] = " + ts(api["controllers"])
            + ";\n\nexport const API_EXTENSIONS: ApiExtension[] = " + ts(api["extensions"])
            + ";\n\nexport const API_MIDDLEWARES: { class: string; path: string; doc: string }[] = " + ts(api["middlewares"])
            + ";\n\nexport const API_DTOS: { [name: string]: DtoField[] } = " + ts(api["dtos"])
            + ";\n\nexport const API_PERMISSION_CODES: { [name: string]: string } = " + ts(api["permissionCodes"])
            + ";\n")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(header + body)
    print("ghi:", os.path.relpath(OUT, UI_ROOT))
    print("UI:", len(ui["components"]), "component |", len(ui["pipes"]), "pipe |", len(ui["directives"]), "directive")
    print("UI helper:", len(ui["helpers"]), "file |", sum(len(h["functions"]) for h in ui["helpers"]), "ham")
    print("API:", len(api["controllers"]), "controller |",
          sum(len(c["actions"]) for c in api["controllers"]), "endpoint |",
          len(api["extensions"]), "lop helper/extension |", len(api["middlewares"]), "middleware")


if __name__ == "__main__":
    main()
