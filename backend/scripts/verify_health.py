#!/usr/bin/env python3
"""
Health check verification script for Pharmacy Fantasy backend.
"""

import sys
import urllib.request
import json

DEFAULT_HEALTH_URL = "http://localhost:8000/health"


def check_health(url: str = DEFAULT_HEALTH_URL) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthChecker/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                if data.get("status") == "healthy":
                    print(f"OK: Health check passed at {url}: {data}")
                    return True
                print(f"WARN: Health check status not 'healthy': {data}")
                return False
            print(f"ERROR: Received HTTP {response.status} from {url}")
            return False
    except Exception as exc:
        print(f"ERROR: Health check connection failed: {exc}", file=sys.stderr)
        return False


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_HEALTH_URL
    success = check_health(target)
    sys.exit(0 if success else 1)
