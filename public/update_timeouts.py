import json
import os

# List of file names to update (adjust paths if needed)
files = [
    "signals_bob_WoL_log.json",
    "signals_claude_log.json",
    "signals_PROX2_log.json",
    "signals_bob_3_log.json",
    "signals_bob_2_log.json",
    "signals_gemini_log.json"
]

for filename in files:
    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        continue

    updated = False
    for signal in data:
        performance = signal.get("performance")
        if performance and performance.get("status") == "TIMEOUT_POSITIVE":
            performance["status"] = "WIN"
            performance["closed_by"] = "TP1"
            updated = True

    # Write back to a new file
    base, ext = os.path.splitext(filename)
    output_filename = f"{base}_updated{ext}"
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated file saved as {output_filename}")
    except Exception as e:
        print(f"Error writing {output_filename}: {e}")