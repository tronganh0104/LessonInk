# First Real Lesson Validation Sprint Report

Date: 2026-05-30  
Project: LessonInk / MushroomLearning  
Scope: Desktop build readiness and first real lesson validation  
Constraint: No new product features; no stroke movement, lasso, resize, rotate, cloud, login, collaboration, AI, LMS, or UI redesign.

## Executive Summary

The sprint is blocked from completing full desktop QA because the local Windows machine does not currently have a detectable Visual Studio Build Tools installation with the MSVC linker and Windows SDK. Rust, Cargo, WebView2, Node, npm, and the Tauri CLI are present, but `npx tauri build` cannot produce a desktop binary until `link.exe` is available.

Web production build and unit tests pass. A fallback browser QA run verified that large PDF import uses the selected page range flow correctly in the built web app: a 35-page PDF defaulted to page range `1-5`, and importing produced a 5-page board.

Result: Desktop acceptance criteria are not fully met on this machine yet due to an environment blocker, not a confirmed product crash/data-loss bug.

## Environment

- OS: Windows 10.0.26200 x86_64
- Node: 22.17.1
- npm: 10.9.2
- Tauri CLI: 2.11.2
- Tauri Rust crate: 2.11.2
- WebView2: 148.0.3967.96
- rustc: 1.96.0 (2026-05-25)
- cargo: 1.96.0 (2026-05-25)
- Rust toolchain: stable-x86_64-pc-windows-msvc
- Missing: Visual Studio / VS Build Tools instance with MSVC and Windows SDK components

## Test Files

No real teacher-owned lesson PDFs were provided during the sprint. To exercise representative PDF shapes, synthetic teaching fixtures were generated under `.tmp-ui-qa/lesson-pdfs/`:

- `01-algebra-worksheet-3p.pdf`, 3 pages, 2,083 bytes
- `02-exam-practice-12p.pdf`, 12 pages, 6,153 bytes
- `03-slide-deck-8p.pdf`, 8 pages, 4,735 bytes
- `04-scanned-style-5p.pdf`, 5 pages, 5,118 bytes
- `05-long-textbook-35p.pdf`, 35 pages, 15,124 bytes

Important limitation: these are synthetic fixtures, not true real classroom PDFs. The acceptance item "test with 3-5 representative real teaching PDFs" remains partially unmet until real teacher PDFs are supplied.

## Commands Run

### Environment Check

Command:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npx tauri info
```

Result:

- Passed: Rust/Cargo detected
- Passed: WebView2 detected
- Failed: Visual Studio Build Tools with MSVC and SDK not detected

### Desktop Build

Command:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npx tauri build
```

Result:

- Vite frontend build started successfully when run with sufficient permissions.
- Cargo dependency build started.
- Failed at native link step:

```text
error: linker `link.exe` not found
note: msvc targets depend on the msvc linker but `link.exe` was not found
```

### Web Build

Command:

```powershell
npm run build
```

Result: Passed.

Notes:

- TypeScript build passed.
- Vite production build passed.
- Warning remains: main JS chunk is larger than 500 kB after minification.

### Unit Tests

Command:

```powershell
npm test
```

Result: Passed.

Summary:

- 15 test files passed
- 94 tests passed

## Manual / Browser QA Results

Because desktop build was blocked, full desktop manual QA could not be completed. A fallback QA pass was run against the local production preview at `http://127.0.0.1:4173/` using headless Edge/CDP.

### PDF Import: Large PDF With Selected Pages

File:

- `.tmp-ui-qa/lesson-pdfs/05-long-textbook-35p.pdf`

Steps:

1. Open local production preview.
2. Start a board.
3. Select `05-long-textbook-35p.pdf` through the PDF file input.
4. Observe import modal.
5. Keep default page range.
6. Click `Import`.

Expected:

- Modal detects total pages.
- Large PDF defaults to importing only needed pages.
- Import creates only selected pages.

Actual:

- Modal showed `Total pages: 35`.
- Modal showed large PDF guidance.
- `Page range` option was selected.
- Range input value was `1-5`.
- After clicking `Import`, board showed `PAGE 1 / 5`.

Result: Passed in web preview fallback.

Evidence:

- Screenshot: `.tmp-ui-qa/validation-import-selected-pages-cdp.png`

## Acceptance Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| `npx tauri build` works on machine with Rust/Cargo installed | Blocked | Rust/Cargo installed, but MSVC linker missing. |
| Desktop app opens successfully | Not run | No desktop binary produced. |
| Import selected PDF pages works in desktop build | Not run | Verified only in web preview fallback. |
| Add/move text works in desktop build | Not run | Requires desktop binary. Unit coverage exists for text movement domain logic. |
| Save/reopen works | Not run | Requires desktop binary and Tauri file APIs. |
| Autosave/recovery works after forced close | Not run | Requires desktop runtime QA. Unit coverage exists for autosave helpers. |
| Export PNG/PDF works after simulated lesson | Not run | Requires desktop build for acceptance. |
| No blocker data-loss or crash bugs | Unknown | No desktop runtime available; no blocker product bug observed in web fallback. |
| Final report includes files, steps, results, bugs, recommended fixes | Passed | This report. |

## Issue Log

### Blocker: Desktop Build Cannot Link Because MSVC `link.exe` Is Missing

Severity: Blocker  
Area: Environment / Tauri desktop build  

Evidence:

- `npx tauri info` reports no Visual Studio or VS Build Tools instance with MSVC and SDK components.
- `npx tauri build` fails with `error: linker link.exe not found`.

Impact:

- Cannot produce desktop executable.
- Cannot complete desktop QA for save/open/export/autosave/recovery.
- Blocks release validation.

Recommended fix:

1. Install Visual Studio Build Tools 2022 with:
   - `Microsoft.VisualStudio.Workload.VCTools`
   - MSVC v143 C++ build tools
   - Windows 10/11 SDK
   - C++ CMake tools for Windows if prompted/recommended
2. Restart terminal after install.
3. Verify:

```powershell
where.exe link
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npx tauri info
```

4. Re-run:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npx tauri build
```

### High: Real Classroom PDF Validation Not Yet Complete

Severity: High  
Area: QA data quality  

Evidence:

- No teacher-owned real PDFs were available.
- Synthetic fixtures were used as fallback.

Impact:

- Cannot confidently validate scanned PDFs, publisher worksheets, Vietnamese fonts, embedded images, large file sizes, or real lesson formatting.

Recommended fix:

- Collect 3-5 real PDFs:
  - 1 short worksheet, 1 exam practice file, 1 slide-style PDF, 1 scanned/photo PDF, 1 long textbook/chapter excerpt.
- Re-run import, annotation, save/reopen, autosave/recovery, and export after desktop build works.

### Medium: Large JS Bundle Warning

Severity: Medium  
Area: Performance / startup  

Evidence:

- `npm run build` warns that `assets/index-*.js` is larger than 500 kB after minification.

Impact:

- May affect initial load time, especially with PDF tooling bundled eagerly.
- Not a release blocker for desktop MVP, but worth tracking.

Recommended fix:

- Defer until after validation blocker is fixed.
- Consider code-splitting PDF import/export paths later.

### Low: Vite/Vitest OXC/Esbuild Deprecation Warnings

Severity: Low  
Area: Build configuration  

Evidence:

- Test run prints warnings about `vite:react-babel` esbuild options being deprecated and OXC options taking precedence.

Impact:

- No current functional failure.
- May require config cleanup later.

Recommended fix:

- Schedule build config cleanup after desktop validation is green.

## Recommended Next Steps

1. Fix the Windows desktop build environment by installing the Visual Studio Build Tools C++ workload and Windows SDK.
2. Re-run `npx tauri info` and `npx tauri build`.
3. Once the desktop binary opens, run the blocked desktop QA checklist:
   - Import selected pages from 3-5 real PDFs.
   - Add and move text.
   - Save `.mushroomlearning`, close app, reopen file.
   - Verify autosave/recovery after forced close.
   - Run a 45-90 minute simulated lesson.
   - Export PNG/PDF after the simulated lesson.
4. Do not start new product features until the above desktop validation is complete.

## Release Decision

Recommendation: Do not treat the desktop build as release-ready yet.

Reason: the current blocker is environment-level, but it prevents verifying the core desktop promises: open, save, reopen, autosave recovery, and export in the packaged app.
