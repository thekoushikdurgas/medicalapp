@echo off
REM Save as UTF-8 without BOM. A leading BOM makes CMD fail on the first line (mojibake before @echo).
REM Use setlocal EnableDelayedExpansion below. Wrong spelling breaks this script on Windows CMD.
setlocal EnableDelayedExpansion
set "ARG1=%~1"

REM ========================================
REM PHARMACY FANTASY BACKEND (FASTAPI) - CODEBASE STATE CHECK
REM ========================================
REM Run from backend folder: double-click or run codebase.bat from this directory.
REM
REM Modes:
REM   codebase.bat              Full state check (steps 0-9 below)
REM   codebase.bat 0            Regenerate tests/schema_snapshot.graphql (+ snapshot test)
REM   codebase.bat snapshot     Same as 0
REM   codebase.bat help         Show modes
REM
REM Full pipeline steps:
REM   0 Source inventory (parity with app CSS inventory)
REM   1 pip install
REM   2 Environment validation (validate_env.py)
REM   3 mypy (typecheck)
REM   4 black --check (format)
REM   4b Prettier: npx prettier --check / write (Markdown, JSON, YAML, etc.)
REM   5 ruff check (lint)
REM   6 pytest (+ coverage by default; SKIP_TEST_COVERAGE=1 to skip --cov)
REM   7 scripts\check_best_practices.py (checklist, .api-checker-config.json)
REM   8 black app/ scripts/ tests/ (final format & auto-repair)
REM   9 pip check + import smoke (build / install integrity)
REM
REM Optional environment variables:
REM   SKIP_CSS_INVENTORY=1       Skip step 0 source inventory
REM   SKIP_PIP_INSTALL=1         Skip step 1
REM   SKIP_CODEGEN=1             Skip step 2 (validate_env.py)
REM   ENV_VALIDATE_NO_FAIL=1     validate_env failures -> warning only
REM   SKIP_MYPY=1                Skip step 3
REM   MYPY_STRICT=1              mypy failure increments ERROR_COUNT (default: warning only)
REM   SKIP_FORMAT_CHECK=1        Skip step 4 black --check
REM   SKIP_PRETTIER=1            Skip step 4b Prettier
REM   SKIP_LINT=1                Skip step 5 ruff
REM   SKIP_TESTS=1               Skip step 6
REM   SKIP_TEST_COVERAGE=1       Step 6: pytest without --cov=app (faster local runs)
REM   SKIP_BEST_PRACTICES=1      Skip step 7
REM   BEST_PRACTICES_NO_FAIL=1   Pass --no-fail to check_best_practices.py
REM   BEST_PRACTICES_THRESHOLD=N --threshold (default 80 in script)
REM   BEST_PRACTICES_FORMAT=text or json or both
REM   SKIP_FINAL_FORMAT=1        Skip step 8 black write
REM   SKIP_BUILD=1               Skip step 9 pip check / import smoke
REM   API_PORT=8000              Local dev server port (default: 8000)
REM ========================================

set "BACKEND_DIR=%~dp0"
set "ERROR_COUNT=0"
set "WARNING_COUNT=0"
set "START_TIME=%TIME%"
set "SECTION6_COVERAGE_STATUS=SKIPPED"

REM ANSI ESC (char 27). Avoid "prompt $E | cmd" — on some Windows builds it captures prompt text.
set "ESC="
for /f "delims=" %%A in ('powershell -NoProfile -Command "Write-Output ([char]27)" 2^>nul') do set "ESC=%%A"
set "GREEN=%ESC%[92m"
set "RED=%ESC%[91m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "CYAN=%ESC%[96m"

goto :main

:color_echo
setlocal EnableDelayedExpansion
REM Prefix/strip: CMD treats values starting with "=" as part of the name (breaks separator lines of "=").
set "_ce_c=%~1"
set "_ce_t=x%~2"
set "_ce_t=!_ce_t:~1!"
echo !_ce_c!!_ce_t!
endlocal
goto :eof

:main
echo.
call :color_echo "%CYAN%" "========================================"
call :color_echo "%CYAN%" "  PHARMACY FANTASY BACKEND STATE CHECK"
call :color_echo "%CYAN%" "========================================"
echo.

if not exist "%BACKEND_DIR%app\main.py" (
    call :color_echo "%RED%" "ERROR: app\main.py not found under: %BACKEND_DIR%"
    exit /b 1
)

cd /d "%BACKEND_DIR%"
call :color_echo "%BLUE%" "Current directory: %CD%"
set "PY_EXTRA="
set "PY=python"

if exist "venv\Scripts\python.exe" (
  set "PY=!CD!\venv\Scripts\python.exe"
  "!PY!" -c "import sys" 2>nul
  if not errorlevel 1 (
    call :color_echo "%BLUE%" "Using venv Python: !PY!"
    goto :py_ready
  )
  call :color_echo "%YELLOW%" "venv\Scripts\python.exe failed import check. Recreate: python -m venv venv"
  set "PY=python"
)

if exist ".venv\Scripts\python.exe" (
  set "PY=!CD!\.venv\Scripts\python.exe"
  "!PY!" -c "import sys" 2>nul
  if not errorlevel 1 (
    call :color_echo "%BLUE%" "Using .venv Python: !PY!"
    goto :py_ready
  )
  call :color_echo "%YELLOW%" ".venv\Scripts\python.exe failed import check. Recreate: python -m venv .venv"
  set "PY=python"
)

if exist "..\venv\Scripts\python.exe" (
  set "PY=!CD!\..\venv\Scripts\python.exe"
  "!PY!" -c "import sys" 2>nul
  if not errorlevel 1 (
    call :color_echo "%BLUE%" "Using parent venv Python: !PY!"
    goto :py_ready
  )
  set "PY=python"
)

if exist "..\.venv\Scripts\python.exe" (
  set "PY=!CD!\..\.venv\Scripts\python.exe"
  "!PY!" -c "import sys" 2>nul
  if not errorlevel 1 (
    call :color_echo "%BLUE%" "Using parent .venv Python: !PY!"
    goto :py_ready
  )
  set "PY=python"
)

where py >nul 2>&1
if not errorlevel 1 (
  py -3 -c "import sys" 2>nul
  if not errorlevel 1 (
    set "PY=py"
    set "PY_EXTRA=-3"
    call :color_echo "%BLUE%" "Using Python launcher: py -3"
    goto :py_ready
  )
)

set "PY=python"
set "PY_EXTRA="
call :color_echo "%YELLOW%" "No dedicated venv found; using PATH python"

:py_ready
echo.

if /i "%~1"=="help" goto :show_help
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="?" goto :show_help
if /i "%~1"=="0" goto :run_schema_snapshot
if /i "%~1"=="snapshot" goto :run_schema_snapshot
if /i "%~1"=="schema-snapshot" goto :run_schema_snapshot

set "SECTION0_STATUS=SKIPPED"
set "SECTION1_STATUS=SKIPPED"
set "SECTION2_STATUS=SKIPPED"
set "SECTION3_STATUS=SKIPPED"
set "SECTION4_STATUS=SKIPPED"
set "SECTION4P_STATUS=SKIPPED"
set "SECTION5_STATUS=SKIPPED"
set "SECTION6_STATUS=SKIPPED"
set "SECTION7_STATUS=SKIPPED"
set "SECTION8_STATUS=SKIPPED"
set "SECTION9_STATUS=SKIPPED"

REM --- [0] Source Inventory ---
if /i "%SKIP_CSS_INVENTORY%"=="1" (
  call :color_echo "%YELLOW%" "[0] Source inventory skipped (SKIP_CSS_INVENTORY=1)"
  set "SECTION0_STATUS=SKIPPED"
  echo.
) else (
  call :color_echo "%CYAN%" "[0] Python source inventory (app / scripts / tests)..."
  echo ----------------------------------------
  if not exist "reports" mkdir reports
  call :color_echo "%BLUE%" "  Output: reports\backend-source-inventory.txt"
  (
    echo PHARMACY FANTASY BACKEND - Python modules
    echo Generated: %DATE% %TIME%
    echo.
    echo === app ===
    dir /s /b app\*.py 2>nul
    echo.
    echo === scripts ===
    dir /s /b scripts\*.py 2>nul
    echo.
    echo === tests ===
    dir /s /b tests\*.py 2>nul
  ) > "reports\backend-source-inventory.txt" 2>&1
  call :color_echo "%GREEN%" "  OK Inventory written"
  set "SECTION0_STATUS=PASSED"
  echo.
)

REM --- [1] Pip Dependencies ---
call :color_echo "%CYAN%" "[1/10] Dependencies (pip)..."
echo ----------------------------------------
if /i "%SKIP_PIP_INSTALL%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_PIP_INSTALL=1)"
  set "SECTION1_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pip install --upgrade pip"
  call "%PY%" %PY_EXTRA% -m pip install --upgrade pip
  if errorlevel 1 (
    set /a WARNING_COUNT+=1
    call :color_echo "%YELLOW%" "  - pip upgrade warning"
  )
  call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pip install --no-warn-script-location -r requirements.txt"
  call "%PY%" %PY_EXTRA% -m pip install --no-warn-script-location -r requirements.txt
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION1_STATUS=FAILED"
    call :color_echo "%RED%" "  X pip install failed"
    goto :summary
  ) else (
    set "SECTION1_STATUS=PASSED"
    call :color_echo "%GREEN%" "  OK Dependencies installed"
  )
)
echo.

REM --- [2] Environment Validation ---
call :color_echo "%CYAN%" "[2/10] Environment validation (preflight)..."
echo ----------------------------------------
if /i "%SKIP_CODEGEN%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_CODEGEN=1) - env preflight skip"
  set "SECTION2_STATUS=SKIPPED"
) else (
  if exist "scripts\validate_env.py" (
    call :color_echo "%BLUE%" "  Running: !PY! !PY_EXTRA! scripts\validate_env.py"
    call "%PY%" %PY_EXTRA% scripts\validate_env.py
    if errorlevel 1 (
      if /i "%ENV_VALIDATE_STRICT%"=="1" (
        set /a ERROR_COUNT+=1
        set "SECTION2_STATUS=FAILED"
        call :color_echo "%RED%" "  X validate_env failed (ENV_VALIDATE_STRICT=1)"
      ) else (
        set /a WARNING_COUNT+=1
        set "SECTION2_STATUS=WARNING"
        call :color_echo "%YELLOW%" "  - validate_env reported issues (warning only; set ENV_VALIDATE_STRICT=1 to fail)"
      )
    ) else (
      set "SECTION2_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Environment validation passed"
    )
  ) else (
    set /a WARNING_COUNT+=1
    set "SECTION2_STATUS=WARNING"
    call :color_echo "%YELLOW%" "  - scripts\validate_env.py not found"
  )
)
echo.

REM --- [3] Type Checking (mypy) ---
call :color_echo "%CYAN%" "[3/10] Type checking (mypy)..."
echo ----------------------------------------
if /i "%SKIP_MYPY%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_MYPY=1)"
  set "SECTION3_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m mypy app/"
  call "%PY%" %PY_EXTRA% -m mypy app/
  if errorlevel 1 (
    if exist ".mypy_cache" (
      call :color_echo "%YELLOW%" "  Retrying mypy after clearing .mypy_cache..."
      rmdir /s /q ".mypy_cache" >nul 2>&1
      call "%PY%" %PY_EXTRA% -m mypy app/
    )
  )
  if errorlevel 1 (
    if /i "%MYPY_STRICT%"=="1" (
      set /a ERROR_COUNT+=1
      set "SECTION3_STATUS=FAILED"
      call :color_echo "%RED%" "  X mypy failed (MYPY_STRICT=1)"
    ) else (
      set /a WARNING_COUNT+=1
      set "SECTION3_STATUS=WARNING"
      call :color_echo "%YELLOW%" "  ! mypy issues (warning only; set MYPY_STRICT=1 to fail)"
    )
  ) else (
    set "SECTION3_STATUS=PASSED"
    call :color_echo "%GREEN%" "  OK mypy passed"
  )
)
echo.

REM --- [4] Formatting checks (black --check) ---
call :color_echo "%CYAN%" "[4/10] Formatting checks (black)..."
echo ----------------------------------------
if /i "%SKIP_FORMAT_CHECK%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_FORMAT_CHECK=1)"
  set "SECTION4_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m black --check app/ scripts/ tests/"
  call "%PY%" %PY_EXTRA% -m black --check app/ scripts/ tests/
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION4_STATUS=FAILED"
    call :color_echo "%RED%" "  X black --check failed - auto-formatted in step 8"
  ) else (
    set "SECTION4_STATUS=PASSED"
    call :color_echo "%GREEN%" "  OK black check passed"
  )
)
echo.

REM --- [4b] Prettier ---
call :color_echo "%CYAN%" "[4b/10] Prettier (Markdown, JSON, YAML, etc.)..."
echo ----------------------------------------
if /i "%SKIP_PRETTIER%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_PRETTIER=1)"
  set "SECTION4P_STATUS=SKIPPED"
) else (
  where npx >nul 2>&1
  if errorlevel 1 (
    set /a WARNING_COUNT+=1
    set "SECTION4P_STATUS=WARNING"
    call :color_echo "%YELLOW%" "  - npx not on PATH - install Node.js or set SKIP_PRETTIER=1"
  ) else (
    call :color_echo "%BLUE%" "  Checking formatting for repo text and configuration files"
    call :color_echo "%YELLOW%" "  Running: npx prettier --check ."
    call npx prettier --check .
    if errorlevel 1 (
      set /a WARNING_COUNT+=1
      set "SECTION4P_STATUS=WARNING"
      call :color_echo "%YELLOW%" "  Prettier issues found - running: npx prettier --write ."
      call npx prettier --write .
      if errorlevel 1 (
        set /a WARNING_COUNT+=1
        set "SECTION4P_STATUS=WARNING"
        call :color_echo "%YELLOW%" "  - Prettier --write had issues"
      ) else (
        call npx prettier --check .
        if errorlevel 1 (
          set /a WARNING_COUNT+=1
          set "SECTION4P_STATUS=WARNING"
        ) else (
          set "SECTION4P_STATUS=WARNING_FIXED"
          call :color_echo "%GREEN%" "  OK Prettier formatted"
        )
      )
    ) else (
      set "SECTION4P_STATUS=PASSED"
      call :color_echo "%GREEN%" "  OK Prettier check passed"
    )
  )
)
echo.

REM --- [5] Linting (ruff) ---
call :color_echo "%CYAN%" "[5/10] Linting (ruff)..."
echo ----------------------------------------
if /i "%SKIP_LINT%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_LINT=1)"
  set "SECTION5_STATUS=SKIPPED"
) else (
  call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m ruff check app/ scripts/ tests/"
  call "%PY%" %PY_EXTRA% -m ruff check app/ scripts/ tests/
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION5_STATUS=FAILED"
    call :color_echo "%RED%" "  X ruff check failed (auto-fix with: python -m ruff check --fix .)"
  ) else (
    set "SECTION5_STATUS=PASSED"
    call :color_echo "%GREEN%" "  OK ruff passed"
  )
)
echo.

REM --- [6] Pytest Suite & Coverage ---
call :color_echo "%CYAN%" "[6/10] Running tests (pytest + coverage)..."
echo ----------------------------------------
if /i "%SKIP_TESTS%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_TESTS=1)"
  set "SECTION6_STATUS=SKIPPED"
  set "SECTION6_COVERAGE_STATUS=SKIPPED"
) else (
  set "PREV_ENV=%APP_ENV%"
  set "PREV_DB=%DATABASE_URL%"
  set "APP_ENV=testing"
  set "DATABASE_URL=sqlite+aiosqlite:///:memory:"
  call :color_echo "%BLUE%" "  APP_ENV=testing (isolated memory SQLite database)"
  if /i "%SKIP_TEST_COVERAGE%"=="1" (
    call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pytest tests/ -q --tb=short (SKIP_TEST_COVERAGE=1)"
    call "%PY%" %PY_EXTRA% -m pytest tests/ -q --tb=short
    set "SECTION6_COVERAGE_STATUS=SKIPPED"
  ) else (
    if not exist "reports" mkdir reports
    call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pytest tests/ -q --tb=short --cov=app --cov-report=term-missing --cov-report=xml"
    call "%PY%" %PY_EXTRA% -m pytest tests/ -q --tb=short --cov=app --cov-report=term-missing --cov-report=xml
    set "SECTION6_COVERAGE_STATUS=PASSED"
  )
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    set "SECTION6_STATUS=FAILED"
    if /i not "%SKIP_TEST_COVERAGE%"=="1" set "SECTION6_COVERAGE_STATUS=FAILED"
    call :color_echo "%RED%" "  X Tests failed"
  ) else (
    set "SECTION6_STATUS=PASSED"
    if /i "%SKIP_TEST_COVERAGE%"=="1" (
      call :color_echo "%GREEN%" "  OK Tests passed"
    ) else (
      call :color_echo "%GREEN%" "  OK Tests passed with coverage"
    )
  )
  if defined PREV_ENV (set "APP_ENV=%PREV_ENV%") else (set "APP_ENV=")
  if defined PREV_DB (set "DATABASE_URL=%PREV_DB%") else (set "DATABASE_URL=")
)
echo.

REM --- [7] Best Practices Audit ---
if /i "%SKIP_BEST_PRACTICES%"=="1" (
  call :color_echo "%YELLOW%" "[7/10] Best practices skipped (SKIP_BEST_PRACTICES=1)"
  set "SECTION7_STATUS=SKIPPED"
  echo.
  goto :step7_done
)

call :color_echo "%CYAN%" "[7/10] API best-practices checklist..."
echo ----------------------------------------
call :color_echo "%BLUE%" "  scripts\check_best_practices.py - config .api-checker-config.json"
call :color_echo "%BLUE%" "  Output: reports\check_report_bat.json"

if not exist "scripts\check_best_practices.py" (
  set /a WARNING_COUNT+=1
  set "SECTION7_STATUS=WARNING"
  call :color_echo "%YELLOW%" "  - scripts\check_best_practices.py not found"
  echo.
  goto :step7_done
)

set "BP_FMT=both"
if /i "%BEST_PRACTICES_FORMAT%"=="text" set "BP_FMT=text"
if /i "%BEST_PRACTICES_FORMAT%"=="json" set "BP_FMT=json"
if /i "%BEST_PRACTICES_FORMAT%"=="both" set "BP_FMT=both"

set "BP_CMD_ARGS=--output reports\check_report_bat.json --format %BP_FMT%"
if not "%BEST_PRACTICES_THRESHOLD%"=="" set "BP_CMD_ARGS=%BP_CMD_ARGS% --threshold %BEST_PRACTICES_THRESHOLD%"
if /i "%BEST_PRACTICES_NO_FAIL%"=="1" set "BP_CMD_ARGS=%BP_CMD_ARGS% --no-fail"

call :color_echo "%YELLOW%" "  Running: check_best_practices.py %BP_CMD_ARGS%"
call "%PY%" %PY_EXTRA% scripts\check_best_practices.py %BP_CMD_ARGS%
if errorlevel 1 (
  set /a ERROR_COUNT+=1
  set "SECTION7_STATUS=FAILED"
  call :color_echo "%RED%" "  X Best-practices below threshold or script error"
) else (
  set "SECTION7_STATUS=PASSED"
  call :color_echo "%GREEN%" "  OK Best-practices check passed"
)
echo.
:step7_done

REM --- [8] Final Auto-Format (black apply) ---
if /i "%SKIP_FINAL_FORMAT%"=="1" (
  call :color_echo "%YELLOW%" "[8/10] Final format skipped (SKIP_FINAL_FORMAT=1)"
  set "SECTION8_STATUS=SKIPPED"
  echo.
  goto :step8_done
)

call :color_echo "%CYAN%" "[8/10] Final format (black)..."
echo ----------------------------------------
call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m black app/ scripts/ tests/"
call "%PY%" %PY_EXTRA% -m black app/ scripts/ tests/
if errorlevel 1 (
  set /a WARNING_COUNT+=1
  set "SECTION8_STATUS=WARNING"
  call :color_echo "%YELLOW%" "  - black apply had issues"
) else (
  set "SECTION8_STATUS=PASSED"
  call :color_echo "%GREEN%" "  OK black formatting applied"
  REM If Step 4 failed, it is now self-healed by Step 8
  if /i "!SECTION4_STATUS!"=="FAILED" (
    set "SECTION4_STATUS=FIXED"
    set /a ERROR_COUNT-=1
  )
)
echo.
:step8_done

REM --- [9] Install / Import Integrity ---
call :color_echo "%CYAN%" "[9/10] Install / import integrity..."
echo ----------------------------------------
if /i "%SKIP_BUILD%"=="1" (
  call :color_echo "%YELLOW%" "  Skipped (SKIP_BUILD=1)"
  set "SECTION9_STATUS=SKIPPED"
  echo.
  goto :step9_done
)

call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pip check"
call "%PY%" %PY_EXTRA% -m pip check
if errorlevel 1 (
  set /a WARNING_COUNT+=1
  set "SECTION9_STATUS=WARNING"
  call :color_echo "%YELLOW%" "  - pip check reported conflicts"
) else (
  call :color_echo "%GREEN%" "  OK pip check passed"
)
call :color_echo "%BLUE%" "  Import smoke: from app.main import app"
call "%PY%" %PY_EXTRA% -c "from app.main import app"
if errorlevel 1 (
  set /a ERROR_COUNT+=1
  set "SECTION9_STATUS=FAILED"
  call :color_echo "%RED%" "  X Failed to import app.main (check .env / dependencies)"
) else (
  if not "!SECTION9_STATUS!"=="WARNING" set "SECTION9_STATUS=PASSED"
  call :color_echo "%GREEN%" "  OK app.main import succeeded"
)
echo.
:step9_done

:summary
echo.
call :color_echo "%CYAN%" "========================================"
call :color_echo "%CYAN%" "  SUMMARY"
call :color_echo "%CYAN%" "========================================"
echo.
call :color_echo "%BLUE%" "Section Status:"
echo   [0] Source inventory:              !SECTION0_STATUS!  (reports\backend-source-inventory.txt)
echo   [1] Pip dependencies:              !SECTION1_STATUS!
echo   [2] Environment validate:          !SECTION2_STATUS!
echo   [3] mypy:                          !SECTION3_STATUS!
echo   [4] black --check:                 !SECTION4_STATUS!
echo   [4b] Prettier:                     !SECTION4P_STATUS!
echo   [5] ruff check:                    !SECTION5_STATUS!
echo   [6] pytest:                        !SECTION6_STATUS!
echo   [6b] pytest coverage:              !SECTION6_COVERAGE_STATUS!
echo   [7] Best practices (check_*.py):  !SECTION7_STATUS!
echo   [8] black (apply):                 !SECTION8_STATUS!
echo   [9] pip check + import app:        !SECTION9_STATUS!
echo.

if %ERROR_COUNT% EQU 0 (
    call :color_echo "%GREEN%" "  OK All blocking checks passed!"
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
    if /i "%SKIP_DEV_SERVER%"=="1" goto :end
    if /i "%SKIP_DEV_PROMPT%"=="1" goto :end
    call :color_echo "%CYAN%" "  Start API server? (Y/N)"
    choice /C YN /N /M ""
    if errorlevel 2 goto :end
    if errorlevel 1 goto :dev_server
    goto :end
)
goto :end

:print_next_steps
setlocal EnableDelayedExpansion
set "NEXT_TIP_COUNT=0"
call :color_echo "%CYAN%" "========================================"
call :color_echo "%CYAN%" "  NEXT STEPS"
call :color_echo "%CYAN%" "========================================"
echo.

if /i "!SECTION0_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [0] Source inventory warning:"
  echo       Open reports/backend-source-inventory.txt
  echo.
) else if /i "!SECTION0_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [0] Source inventory failed:"
  echo       Open reports/backend-source-inventory.txt
  echo.
)

if /i "!SECTION1_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [1] Pip install failed:"
  echo       Recreate venv if needed: python -m venv venv
  echo       Then: pip install -r requirements.txt
  echo.
)

if /i "!SECTION2_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [2] Environment validate warning:"
  echo       Run: python scripts/validate_env.py
  echo       Fix missing env vars, or set SKIP_CODEGEN=1 for local-only
  echo.
) else if /i "!SECTION2_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [2] Environment validate failed:"
  echo       Run: python scripts/validate_env.py
  echo       Fix missing or invalid env vars (or set ENV_VALIDATE_STRICT=0)
  echo.
)

if /i "!SECTION3_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [3] mypy failed:"
  echo       Run: python -m mypy app/
  echo       Clear .mypy_cache if corrupted, then re-run
  echo.
) else if /i "!SECTION3_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [3] mypy warning:"
  echo       Run: python -m mypy app/
  echo       Fix type issues, or set MYPY_STRICT=1 to fail
  echo.
)

if /i "!SECTION4_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [4] black --check failed:"
  echo       Run: python -m black app/ scripts/ tests/
  echo.
)

if /i "!SECTION5_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [5] ruff check failed:"
  echo       Run: python -m ruff check app/ scripts/ tests/
  echo       Auto-fix: python -m ruff check --fix app/ scripts/ tests/
  echo.
)

if /i "!SECTION6_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [6] pytest failed:"
  echo       Run: python -m pytest tests/ -q --tb=short
  echo.
)

if /i "!SECTION7_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [7] Best practices failed:"
  echo       Open reports/check_report_bat.json
  echo       Raise score, or set BEST_PRACTICES_NO_FAIL=1 for local development
  echo.
) else if /i "!SECTION7_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [7] Best practices warning:"
  echo       Open reports/check_report_bat.json and review checklist items
  echo.
)

if /i "!SECTION8_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [8] black apply warning:"
  echo       Re-run: python -m black app/ scripts/ tests/
  echo.
)

if /i "!SECTION9_STATUS!"=="FAILED" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%RED%" "  [9] pip check / import failed:"
  echo       Run: python -m pip check
  echo       Run: python -c "from app.main import app"
  echo.
) else if /i "!SECTION9_STATUS!"=="WARNING" (
  set /a NEXT_TIP_COUNT+=1
  call :color_echo "%YELLOW%" "  [9] Install integrity warning:"
  echo       Run: python -m pip check
  echo       Review dependency conflicts before deploy
  echo.
)

if !NEXT_TIP_COUNT! EQU 0 (
  if not defined API_PORT set "API_PORT=8000"
  call :color_echo "%GREEN%" "  No blocking follow-ups. Ready to start Uvicorn on :!API_PORT!."
  echo.
)
endlocal
goto :eof

:dev_server
echo.
if not defined API_PORT set "API_PORT=8000"
call :color_echo "%CYAN%" "[10/10] Starting uvicorn (reload)..."
call :color_echo "%BLUE%" "  !PY! !PY_EXTRA! -m uvicorn app.main:app --reload --host 127.0.0.1 --port !API_PORT!"
call :color_echo "%BLUE%" "  GraphQL Playground: http://127.0.0.1:!API_PORT!/graphql"
call :color_echo "%BLUE%" "  Health check:       http://127.0.0.1:!API_PORT!/health"
call :color_echo "%YELLOW%" "  Press Ctrl+C to stop"
echo.
call "%PY%" %PY_EXTRA% -m uvicorn app.main:app --reload --host 127.0.0.1 --port !API_PORT!

:end
echo.
call :color_echo "%CYAN%" "========================================"
call :color_echo "%CYAN%" "  CHECK COMPLETE"
call :color_echo "%CYAN%" "========================================"
echo.
if %ERROR_COUNT% GTR 0 (exit /b 1) else (exit /b 0)

:show_help
echo.
call :color_echo "%CYAN%" "  PHARMACY FANTASY BACKEND codebase.bat"
echo.
echo   codebase.bat              Full state check (inventory, pip, mypy, lint, tests, ...)
echo   codebase.bat 0            Regenerate GraphQL SDL snapshot
echo   codebase.bat snapshot     Same as 0
echo   codebase.bat help         This help
echo.
call :color_echo "%BLUE%" "  Snapshot output: tests\schema_snapshot.graphql"
echo.
exit /b 0

:run_schema_snapshot
call :color_echo "%CYAN%" "[0] GraphQL schema snapshot..."
echo ----------------------------------------
call :color_echo "%BLUE%" "  Writes tests\schema_snapshot.graphql from app.graphql.schema"
if not exist "scripts\regen_schema_snapshot.py" (
  call :color_echo "%RED%" "  X scripts\regen_schema_snapshot.py not found"
  exit /b 1
)
call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! scripts\regen_schema_snapshot.py"
call "%PY%" %PY_EXTRA% scripts\regen_schema_snapshot.py
if errorlevel 1 (
  call :color_echo "%RED%" "  X Failed to generate schema snapshot"
  exit /b 1
)
call :color_echo "%GREEN%" "  OK Snapshot written"
call :color_echo "%YELLOW%" "  Running: !PY! !PY_EXTRA! -m pytest tests/test_schema_snapshot.py -q --tb=short"
set "PREV_ENV=%APP_ENV%"
set "APP_ENV=testing"
call "%PY%" %PY_EXTRA% -m pytest tests/test_schema_snapshot.py -q --tb=short
set "SNAP_TEST_ERR=!errorlevel!"
if defined PREV_ENV (set "APP_ENV=%PREV_ENV%") else (set "APP_ENV=")
if not "!SNAP_TEST_ERR!"=="0" (
  call :color_echo "%RED%" "  X tests/test_schema_snapshot.py failed after regenerate"
  exit /b 1
)
call :color_echo "%GREEN%" "  OK Snapshot test passed"
echo.
call :color_echo "%CYAN%" "  Commit tests\schema_snapshot.graphql with your GraphQL schema changes."
echo.
exit /b 0
