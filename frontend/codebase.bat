@echo off
REM Save as UTF-8 without BOM. Windows CMD CRLF line endings.
REM A leading BOM makes CMD fail on the first line (mojibake before @echo).
setlocal EnableDelayedExpansion

REM ============================================================================
REM PHARMACY FANTASY FRONTEND (WEB UI) - CODEBASE STATE CHECK & AUDIT PIPELINE
REM ============================================================================
REM Run from frontend: double-click or run codebase.bat from this directory.
REM
REM Pipeline - local full audit against package.json (pharmacy-fantasy-frontend):
REM   [0] CSS inventory if scripts\css-inventory.mjs exists,
REM   [1] clean + npm install,
REM   [2] GraphQL codegen (if codegen script exists),
REM   [3] Typecheck (tsc --noEmit),
REM   [4] Prettier check & auto-write (format:check / format),
REM   [5] ESLint check (next lint),
REM   [6] Unit tests (+ coverage report if runner available),
REM   [7] Best-practices checklist (if script exists),
REM   [8] Final format verification (Prettier),
REM   [9] Production build verification (next build),
REM   Optional dev server launch on port 3000.
REM
REM CLI Arguments:
REM   codebase.bat              Full 10-step audit pipeline
REM   codebase.bat ci           Full pipeline without dev prompt (CI mode)
REM   codebase.bat help         Display this help message and exit
REM   codebase.bat dev          Directly start Next.js dev server on :3000
REM   codebase.bat build        Run production build verification directly
REM   codebase.bat typecheck    Run TypeScript compiler check (tsc --noEmit)
REM   codebase.bat lint         Run Next.js ESLint check
REM   codebase.bat format       Run Prettier formatting
REM   codebase.bat test         Run unit test suite
REM   codebase.bat clean        Clean build artifacts (.next, dist, out)
REM
REM Optional environment variables:
REM   SKIP_CSS_INVENTORY=1      Skip step 0 (CSS inventory)
REM   SKIP_CLEAN_INSTALL=1      Skip step 1 (clean + npm install)
REM   SKIP_CODEGEN=1            Skip step 2 (GraphQL codegen)
REM   SKIP_TYPECHECK=1          Skip step 3 (Typecheck)
REM   SKIP_PRETTIER=1           Skip step 4 (Prettier format check)
REM   SKIP_LINT=1               Skip step 5 (ESLint)
REM   SKIP_TESTS=1              Skip step 6 (Unit tests)
REM   SKIP_TEST_COVERAGE=1      Step 6 runs tests only (no coverage report)
REM   SKIP_BEST_PRACTICES=1     Skip step 7 (Best practices)
REM   BEST_PRACTICES_NO_FAIL=1  Run best practices audit in report-only mode
REM   SKIP_FINAL_FORMAT=1       Skip step 8 (Final format)
REM   SKIP_BUILD=1              Skip step 9 (Production build)
REM   SKIP_DEV_PROMPT=1         Skip Y/N prompt to start dev server (CI/headless)
REM ============================================================================

set "FRONTEND_DIR=%~dp0"
set "ERROR_COUNT=0"
set "WARNING_COUNT=0"
set "START_TIME=%TIME%"
set "SECTION6_COVERAGE_STATUS=INCLUDED"

REM ANSI ESC (char 27) via PowerShell
set "ESC="
for /f "delims=" %%A in ('powershell -NoProfile -Command "Write-Output ([char]27)" 2^>nul') do set "ESC=%%A"
set "GREEN=%ESC%[92m"
set "RED=%ESC%[91m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "CYAN=%ESC%[96m"

REM ----------------------------------------------------------------------------
REM Subcommand Routing
REM ----------------------------------------------------------------------------
if /i "%~1"=="help" goto :help
if /i "%~1"=="--help" goto :help
if /i "%~1"=="-h" goto :help
if /i "%~1"=="/?" goto :help
if /i "%~1"=="ci" goto :cmd_ci
if /i "%~1"=="--ci" goto :cmd_ci
if /i "%~1"=="dev" goto :cmd_dev
if /i "%~1"=="build" goto :cmd_build
if /i "%~1"=="typecheck" goto :cmd_typecheck
if /i "%~1"=="lint" goto :cmd_lint
if /i "%~1"=="format" goto :cmd_format
if /i "%~1"=="test" goto :cmd_test
if /i "%~1"=="clean" goto :cmd_clean

goto :main

:color_echo
setlocal EnableDelayedExpansion
set "_ce_c=%~1"
set "_ce_t=x%~2"
set "_ce_t=!_ce_t:~1!"
echo !_ce_c!!_ce_t!
endlocal
goto :eof

:has_npm_script
set "HAS_NPM_SCRIPT=0"
findstr /i /c:"\"!NPM_SCRIPT!\":" "package.json" >nul 2>&1
if not errorlevel 1 (
  set "HAS_NPM_SCRIPT=1"
  goto :eof
)
findstr /i /c:"\"!NPM_SCRIPT!\"" "package.json" >nul 2>&1
if not errorlevel 1 set "HAS_NPM_SCRIPT=1"
goto :eof

:cmd_ci
set "SKIP_DEV_PROMPT=1"
goto :main

:help
echo.
call :color_echo "%CYAN%" "============================================================"
call :color_echo "%CYAN%" "  PHARMACY FANTASY FRONTEND - COMMAND LINE REFERENCE"
call :color_echo "%CYAN%" "============================================================"
echo.
echo Usage:
echo   codebase.bat [command]
echo.
echo Commands:
echo   (no arg)      Run full 10-step audit pipeline
echo   ci            Run full pipeline in CI mode (dev prompt skipped)
echo   help          Display this help reference
echo   dev           Start Next.js dev server on :3000
echo   build         Run production build verification directly
echo   typecheck     Run TypeScript compiler check (tsc --noEmit)
echo   lint          Run Next.js ESLint check
echo   format        Format code using Prettier
echo   test          Run unit test suite
echo   clean         Remove build artifacts (.next, out, dist)
echo.
echo Environment Variables (Auditing Overrides):
echo   SKIP_CSS_INVENTORY=1   Skip step [0] CSS inventory
echo   SKIP_CLEAN_INSTALL=1   Skip step [1] clean + npm install
echo   SKIP_CODEGEN=1         Skip step [2] GraphQL codegen
echo   SKIP_TYPECHECK=1       Skip step [3] TypeScript typecheck
echo   SKIP_PRETTIER=1        Skip step [4] Prettier format check
echo   SKIP_LINT=1            Skip step [5] ESLint check
echo   SKIP_TESTS=1           Skip step [6] Unit tests
echo   SKIP_TEST_COVERAGE=1   Skip coverage generation in step [6]
echo   SKIP_BEST_PRACTICES=1  Skip step [7] Best practices audit
echo   SKIP_FINAL_FORMAT=1    Skip step [8] Final format verification
echo   SKIP_BUILD=1           Skip step [9] Production build
echo   SKIP_DEV_PROMPT=1      Skip interactive prompt to start dev server
echo.
exit /b 0

:cmd_dev
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Starting Next.js development server on port 3000..."
call npm run dev
exit /b %errorlevel%

:cmd_build
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Running production build..."
call npm run build
exit /b %errorlevel%

:cmd_typecheck
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Running TypeScript typecheck..."
call npm run typecheck
exit /b %errorlevel%

:cmd_lint
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Running ESLint..."
call npm run lint
exit /b %errorlevel%

:cmd_format
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Running Prettier formatting..."
call npm run format
exit /b %errorlevel%

:cmd_test
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Running test suite..."
call npm run test
exit /b %errorlevel%

:cmd_clean
cd /d "%FRONTEND_DIR%"
call :color_echo "%CYAN%" "Cleaning build artifacts..."
set "NPM_SCRIPT=clean"
call :has_npm_script
if "!HAS_NPM_SCRIPT!"=="1" (
  call npm run clean
) else (
  if exist ".next" rmdir /s /q ".next" 2>nul
  if exist "out" rmdir /s /q "out" 2>nul
  if exist "dist" rmdir /s /q "dist" 2>nul
)
call :color_echo "%GREEN%" "Clean complete."
exit /b 0

:main
echo.
call :color_echo "%CYAN%" "============================================================"
call :color_echo "%CYAN%" "  PHARMACY FANTASY FRONTEND STATE CHECK"
call :color_echo "%CYAN%" "============================================================"
echo.

if not exist "%FRONTEND_DIR%package.json" (
    call :color_echo "%RED%" "ERROR: package.json not found under: %FRONTEND_DIR%"
    exit /b 1
)

cd /d "%FRONTEND_DIR%"
call :color_echo "%BLUE%" "Current directory: %CD%"
echo.

set "SECTION0_STATUS=SKIPPED"
set "SECTION1_STATUS=SKIPPED"
set "SECTION2_STATUS=SKIPPED"
set "SECTION3_STATUS=SKIPPED"
set "SECTION4_STATUS=SKIPPED"
set "SECTION5_STATUS=SKIPPED"
set "SECTION6_STATUS=SKIPPED"
set "SECTION7_STATUS=SKIPPED"
set "SECTION8_STATUS=SKIPPED"
set "SECTION9_STATUS=SKIPPED"

:: [0] CSS INVENTORY
if /i "%SKIP_CSS_INVENTORY%"=="1" (
  call :color_echo "%YELLOW%" "[0] CSS inventory skipped (SKIP_CSS_INVENTORY=1)"
  echo.
) else (
  call :color_echo "%CYAN%" "[0] CSS styling inventory..."
  echo ------------------------------------------------------------
  if exist "scripts\css-inventory.mjs" (
    call :color_echo "%BLUE%" "  Output: reports\css-inventory.txt"
    call node scripts\css-inventory.mjs
    if errorlevel 1 (
      call :color_echo "%YELLOW%" "  ! CSS inventory script exited with error"
      set "SECTION0_STATUS=WARNING"
      set /a WARNING_COUNT+=1
    ) else (
      set "SECTION0_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK CSS inventory written"
    )
  ) else (
    call :color_echo "%BLUE%" "  No scripts\css-inventory.mjs yet  -  skipped (MVP)."
    set "SECTION0_STATUS=SKIPPED"
  )
  echo.
)

:: [1] CLEAN & PREPARE
call :color_echo "%CYAN%" "[1/10] Cleaning and preparing..."
echo ------------------------------------------------------------
if /i "%SKIP_CLEAN_INSTALL%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_CLEAN_INSTALL=1)"
  set "SECTION1_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: npm install"
  call npm install
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION1_STATUS=FAILED"
    call :color_echo "%RED%" "  X npm install failed"
    goto :summary
  )
  call :color_echo "%GREEN%" "  OK Dependencies verified/installed"
  set "NPM_SCRIPT=clean:all"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="0" (
    set "NPM_SCRIPT=clean"
    call :has_npm_script
  )
  if "!HAS_NPM_SCRIPT!"=="0" (
    call :color_echo "%YELLOW%" "  No clean script  -  removing .next if present"
    if exist ".next" rmdir /s /q ".next" 2>nul
    set "SECTION1_STATUS=PASSED"
  ) else (
    call :color_echo "%YELLOW%" "  Running clean script..."
    call npm run clean
    if errorlevel 1 (
      set /a ERROR_COUNT+=1
      set "SECTION1_STATUS=FAILED"
      call :color_echo "%RED%" "  X Clean failed"
    ) else (
      set "SECTION1_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Clean completed"
    )
  )
)
echo.

:: [2] GRAPHQL CODEGEN
call :color_echo "%CYAN%" "[2/10] GraphQL Codegen..."
echo ------------------------------------------------------------
if /i "%SKIP_CODEGEN%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_CODEGEN=1)"
  set "SECTION2_STATUS=SKIPPED"
) else (
  set "NPM_SCRIPT=codegen"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="0" (
    call :color_echo "%BLUE%" "  No npm run codegen in this package  -  skipped."
    set "SECTION2_STATUS=SKIPPED"
  ) else (
    call :color_echo "%BLUE%" "  Regenerating GraphQL client types..."
    call :color_echo "%YELLOW%" "  Running: npm run codegen"
    call npm run codegen
    if errorlevel 1 (
      set "NPM_SCRIPT=codegen:local"
      call :has_npm_script
      if "!HAS_NPM_SCRIPT!"=="1" (
        call :color_echo "%YELLOW%" "  Retrying: npm run codegen:local..."
        call npm run codegen:local
      )
    )
    if errorlevel 1 (
      set /a WARNING_COUNT+=1
      set "SECTION2_STATUS=WARNING"
      call :color_echo "%YELLOW%" "  ! Codegen failed  -  continuing with existing generated types"
    ) else (
      set "SECTION2_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK GraphQL types regenerated"
    )
  )
)
echo.

:: [3] TYPE CHECKING
call :color_echo "%CYAN%" "[3/10] Type checking..."
echo ------------------------------------------------------------
if /i "%SKIP_TYPECHECK%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_TYPECHECK=1)"
  set "SECTION3_STATUS=SKIPPED"
) else (
  set "NPM_SCRIPT=typecheck"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="1" (
    call :color_echo "%YELLOW%" "  Running: npm run typecheck"
    call npm run typecheck
  ) else (
    call :color_echo "%YELLOW%" "  Running: npx tsc --noEmit"
    call npx tsc --noEmit
  )
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION3_STATUS=FAILED"
    call :color_echo "%RED%" "  X Type check failed"
  ) else (
    set "SECTION3_STATUS=PASSED"
    call :color_echo "%GREEN%" "  OK Type check passed"
  )
)
echo.

:: [4] PRETTIER CHECK & AUTO-FIX
call :color_echo "%CYAN%" "[4/10] Prettier (format check)..."
echo ------------------------------------------------------------
if /i "%SKIP_PRETTIER%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_PRETTIER=1)"
  set "SECTION4_STATUS=SKIPPED"
) else (
  set "NPM_SCRIPT=format:check"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="0" (
    call :color_echo "%BLUE%" "  No format:check script yet  -  skipped (MVP)."
    set "SECTION4_STATUS=SKIPPED"
  ) else (
    call :color_echo "%YELLOW%" "  Running: npm run format:check"
    call npm run format:check
    if errorlevel 1 (
      set /a WARNING_COUNT+=1
      set "SECTION4_STATUS=WARNING"
      call :color_echo "%YELLOW%" "  Prettier found issues  -  running: npm run format"
      call npm run format
      if errorlevel 1 (
        set /a ERROR_COUNT+=1
        set "SECTION4_STATUS=FAILED"
        call :color_echo "%RED%" "  X Prettier format failed"
      ) else (
        call npm run format:check
        if errorlevel 1 (
          set /a ERROR_COUNT+=1
          set "SECTION4_STATUS=FAILED"
          call :color_echo "%RED%" "  X Prettier check still failing after write"
        ) else (
          set "SECTION4_STATUS=WARNING_FIXED"
          call :color_echo "%GREEN%" "  OK Prettier formatted and verified"
        )
      )
    ) else (
      set "SECTION4_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Prettier check passed"
    )
  )
)
echo.

:: [5] LINTING
call :color_echo "%CYAN%" "[5/10] Linting..."
echo ------------------------------------------------------------
if /i "%SKIP_LINT%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_LINT=1)"
  set "SECTION5_STATUS=SKIPPED"
) else (
  if not exist "node_modules\eslint\package.json" (
    set /a WARNING_COUNT+=1
    set "SECTION5_STATUS=WARNING"
    call :color_echo "%YELLOW%" "  ! eslint package not installed  -  add eslint + config, or set SKIP_LINT=1"
  ) else (
    call :color_echo "%YELLOW%" "  Running: npm run lint"
    call npm run lint
    if errorlevel 1 (
      set /a ERROR_COUNT+=1
      set "SECTION5_STATUS=FAILED"
      call :color_echo "%RED%" "  X Linting errors found"
      set "NPM_SCRIPT=lint:fix"
      call :has_npm_script
      if "!HAS_NPM_SCRIPT!"=="1" (
        call npm run lint:fix
        if not errorlevel 1 (
          call npm run lint
          if not errorlevel 1 (
            set /a ERROR_COUNT-=1
            set "SECTION5_STATUS=WARNING_FIXED"
            call :color_echo "%GREEN%" "  OK Linting issues resolved"
          )
        )
      )
    ) else (
      set "SECTION5_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK No linting errors"
    )
  )
)
echo.

:: [6] UNIT TESTS
call :color_echo "%CYAN%" "[6/10] Running tests..."
echo ------------------------------------------------------------
if /i "%SKIP_TESTS%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_TESTS=1)"
  set "SECTION6_STATUS=SKIPPED"
  set "SECTION6_COVERAGE_STATUS=N/A"
) else (
  set "NPM_SCRIPT=test"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="0" (
    call :color_echo "%BLUE%" "  No npm run test script  -  skipped (MVP)."
    set "SECTION6_STATUS=SKIPPED"
    set "SECTION6_COVERAGE_STATUS=N/A"
  ) else (
    if not exist "node_modules\.bin\jest.cmd" if not exist "node_modules\.bin\vitest.cmd" (
      call :color_echo "%BLUE%" "  Test runner (jest/vitest) not yet installed  -  skipped (MVP)."
      set "SECTION6_STATUS=SKIPPED"
      set "SECTION6_COVERAGE_STATUS=N/A"
    ) else (
      if /i "%SKIP_TEST_COVERAGE%"=="1" (
        call :color_echo "%YELLOW%" "  Running: npm run test"
        set "SECTION6_COVERAGE_STATUS=SKIPPED"
        call npm run test
      ) else (
        set "NPM_SCRIPT=test:coverage"
        call :has_npm_script
        if "!HAS_NPM_SCRIPT!"=="1" (
          call :color_echo "%BLUE%" "  HTML report: coverage\index.html"
          call :color_echo "%YELLOW%" "  Running: npm run test:coverage"
          call npm run test:coverage
        ) else (
          call :color_echo "%YELLOW%" "  Running: npm run test"
          set "SECTION6_COVERAGE_STATUS=SKIPPED"
          call npm run test
        )
      )
      if errorlevel 1 (
        set /a ERROR_COUNT+=1
        set "SECTION6_STATUS=FAILED"
        call :color_echo "%RED%" "  X Tests failed"
        if /i not "%SKIP_TEST_COVERAGE%"=="1" set "SECTION6_COVERAGE_STATUS=FAILED"
      ) else (
        set "SECTION6_STATUS=PASSED"
        call :color_echo "%GREEN%" "  OK All tests passed"
        if /i not "%SKIP_TEST_COVERAGE%"=="1" (
          if "!SECTION6_COVERAGE_STATUS!"=="INCLUDED" (
            set "SECTION6_COVERAGE_STATUS=PASSED"
            if exist "coverage\index.html" (
              call :color_echo "%GREEN%" "  OK Coverage report: coverage\index.html"
            )
          )
        )
      )
    )
  )
)
echo.

:: [7] BEST PRACTICES
if /i "%SKIP_BEST_PRACTICES%"=="1" (
  call :color_echo "%YELLOW%" "[7/10] Best practices skipped (SKIP_BEST_PRACTICES=1)"
  set "SECTION7_STATUS=SKIPPED"
  echo.
) else (
  if exist "scripts\check-best-practices.mjs" (
    call :color_echo "%CYAN%" "[7/10] Next.js best-practices checklist..."
    echo ------------------------------------------------------------
    call :color_echo "%BLUE%" "  Running scripts\check-best-practices.mjs"
    set "BP_ARGS="
    if not "!BEST_PRACTICES_THRESHOLD!"=="" set "BP_ARGS=!BP_ARGS! --threshold !BEST_PRACTICES_THRESHOLD!"
    if /i "!BEST_PRACTICES_FORMAT!"=="text" set "BP_ARGS=!BP_ARGS! --format text"
    if /i "!BEST_PRACTICES_FORMAT!"=="json" set "BP_ARGS=!BP_ARGS! --format json"
    if /i "!BEST_PRACTICES_FORMAT!"=="both" set "BP_ARGS=!BP_ARGS! --format both"
    if /i "%BEST_PRACTICES_NO_FAIL%"=="1" (
      call node scripts\check-best-practices.mjs --no-fail !BP_ARGS!
    ) else (
      call node scripts\check-best-practices.mjs !BP_ARGS!
    )
    if errorlevel 1 (
      set /a ERROR_COUNT+=1
      set "SECTION7_STATUS=FAILED"
      call :color_echo "%RED%" "  X Best-practices score below threshold or script error"
    ) else (
      set "SECTION7_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Best-practices check passed"
    )
    echo.
  ) else (
    call :color_echo "%BLUE%" "[7/10] Best practices  -  scripts\check-best-practices.mjs not present; skipped (MVP)"
    set "SECTION7_STATUS=SKIPPED"
    echo.
  )
)

:: [8] FINAL FORMAT
if /i "%SKIP_FINAL_FORMAT%"=="1" (
  call :color_echo "%YELLOW%" "[8/10] Final format skipped (SKIP_FINAL_FORMAT=1)"
  set "SECTION8_STATUS=SKIPPED"
  echo.
) else (
  set "NPM_SCRIPT=format"
  call :has_npm_script
  if "!HAS_NPM_SCRIPT!"=="0" (
    call :color_echo "%BLUE%" "[8/10] Final format  -  no format script yet; skipped (MVP)"
    set "SECTION8_STATUS=SKIPPED"
    echo.
  ) else (
    call :color_echo "%CYAN%" "[8/10] Final format verification (Prettier via npm)..."
    echo ------------------------------------------------------------
    call :color_echo "%YELLOW%" "  Running: npm run format"
    call npm run format
    if errorlevel 1 (
      set /a WARNING_COUNT+=1
      set "SECTION8_STATUS=WARNING"
    ) else (
      set "SECTION8_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Final formatting applied"
    )
    echo.
  )
)

:: [9] PRODUCTION BUILD CHECK
call :color_echo "%CYAN%" "[9/10] Production build check..."
echo ------------------------------------------------------------
if /i "%SKIP_BUILD%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_BUILD=1)"
  set "SECTION9_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: npm run build"
  call npm run build
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION9_STATUS=FAILED"
    call :color_echo "%RED%" "  X Build failed"
  ) else (
    if exist ".next" (
      set "SECTION9_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Build successful"
    ) else (
      set /a ERROR_COUNT+=1
      set "SECTION9_STATUS=FAILED"
      call :color_echo "%RED%" "  X .next directory not found"
    )
  )
)
echo.

:summary
echo.
call :color_echo "%CYAN%" "============================================================"
call :color_echo "%CYAN%" "  SUMMARY"
call :color_echo "%CYAN%" "============================================================"
echo.
set "END_TIME=%TIME%"
call :color_echo "%BLUE%" "Section Status:"
echo   [0] CSS inventory:                  !SECTION0_STATUS!
echo   [1] Cleanup and Preparation:        !SECTION1_STATUS!
echo   [2] GraphQL Codegen:                !SECTION2_STATUS!
echo   [3] Type Checking:                  !SECTION3_STATUS!
echo   [4] Prettier:                       !SECTION4_STATUS!
echo   [5] Linting:                        !SECTION5_STATUS!
echo   [6] Testing + Coverage:             !SECTION6_STATUS!  (!SECTION6_COVERAGE_STATUS!)
echo   [7] Best Practices:                 !SECTION7_STATUS!
echo   [8] Final Format:                   !SECTION8_STATUS!
echo   [9] Build Verification:             !SECTION9_STATUS!
echo.

if %ERROR_COUNT% EQU 0 (
    call :color_echo "%GREEN%" "  OK All checks passed!"
    if %WARNING_COUNT% GTR 0 call :color_echo "%YELLOW%" "  Found %WARNING_COUNT% warning(s)"
) else (
    call :color_echo "%RED%" "  X Found %ERROR_COUNT% error(s)"
    if %WARNING_COUNT% GTR 0 call :color_echo "%YELLOW%" "  Found %WARNING_COUNT% warning(s)"
    echo.
    call :color_echo "%YELLOW%" "  Please fix the errors before proceeding."
)
echo.
call :print_next_steps

if %ERROR_COUNT% EQU 0 (
    if defined SKIP_DEV_PROMPT (
      set "_sdp=%SKIP_DEV_PROMPT: =%"
      if /i "!_sdp!"=="1" (
        call :color_echo "%BLUE%" "  Dev prompt skipped (SKIP_DEV_PROMPT=1)"
        goto :end
      )
    )
    call :color_echo "%CYAN%" "  Start development server on :3000? (Y/N)"
    choice /C YN /N /M ""
    if errorlevel 2 goto :end
    if errorlevel 1 goto :dev_server
    goto :end
)
goto :end

:print_next_steps
setlocal EnableDelayedExpansion
set "NEXT_TIP_COUNT=0"
call :color_echo "%CYAN%" "============================================================"
call :color_echo "%CYAN%" "  NEXT STEPS"
call :color_echo "%CYAN%" "============================================================"
echo.

if /i "!SECTION0_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [0] CSS inventory warning:"
  echo       Open reports/css-inventory.txt and inspect warnings
  echo.
) else if /i "!SECTION0_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [0] CSS inventory failed:"
  echo       Fix CSS errors and re-run node scripts/css-inventory.mjs
  echo.
)

if /i "!SECTION1_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [1] Cleanup/install failed:"
  echo       Fix npm install or npm run clean, then re-run codebase.bat
  echo.
)

if /i "!SECTION2_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [2] GraphQL codegen warning:"
  echo       Ensure GraphQL backend is running or schema file exists
  echo.
) else if /i "!SECTION2_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [2] GraphQL codegen failed:"
  echo       Run: npm run codegen
  echo.
)

if /i "!SECTION3_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [3] Typecheck failed:"
  echo       Run: npm run typecheck
  echo       Fix reported TypeScript errors, then re-run
  echo.
)

if /i "!SECTION4_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [4] Prettier failed:"
  echo       Run: npm run format
  echo       Then: npm run format:check
  echo.
) else if /i "!SECTION4_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [4] Prettier warning:"
  echo       Run: npm run format then npm run format:check
  echo.
)

if /i "!SECTION5_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [5] Lint failed:"
  echo       Run: npm run lint
  echo       Fix ESLint errors, then re-run
  echo.
) else if /i "!SECTION5_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [5] Lint warning:"
  echo       Install eslint + config, or set SKIP_LINT=1 for local-only
  echo.
)

if /i "!SECTION6_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [6] Tests failed:"
  echo       Run: npm run test
  if /i "!SECTION6_COVERAGE_STATUS!"=="FAILED" echo       Inspect coverage output
  echo.
)

if /i "!SECTION7_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [7] Best practices failed:"
  echo       Fix reported best practices issues, or set BEST_PRACTICES_NO_FAIL=1
  echo.
)

if /i "!SECTION8_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [8] Final format warning:"
  echo       Re-run: npm run format
  echo.
) else if /i "!SECTION8_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [8] Final format failed:"
  echo       Re-run: npm run format
  echo.
)

if /i "!SECTION9_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [9] Build failed:"
  echo       Run: npm run build
  echo       Fix Next.js build errors, then re-run
  echo.
)

if !NEXT_TIP_COUNT! EQU 0 (
  call :color_echo "%GREEN%" "  No blocking follow-ups. Optional: npm run dev on :3000."
  echo.
)
endlocal
goto :eof

:dev_server
echo.
call :color_echo "%CYAN%" "[10/10] Starting development server..."
call :color_echo "%BLUE%" "  http://localhost:3000  -  Press Ctrl+C to stop"
echo.
call npm run dev

:end
echo.
call :color_echo "%CYAN%" "============================================================"
call :color_echo "%CYAN%" "  CHECK COMPLETE"
call :color_echo "%CYAN%" "============================================================"
echo.
if %ERROR_COUNT% GTR 0 (exit /b 1) else (exit /b 0)
