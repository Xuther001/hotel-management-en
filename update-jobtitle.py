
from pathlib import Path
import json
import re
import sys

app_path = Path("src/App.tsx")
server_path = Path("server/index.ts")
data_path = Path("server/data.json")

for path in (app_path, server_path, data_path):
    if not path.exists():
        sys.exit(f"ERROR: Missing file: {path}")

app = app_path.read_text(encoding="utf-8")
server = server_path.read_text(encoding="utf-8")
data = json.loads(data_path.read_text(encoding="utf-8"))

if not isinstance(data.get("employees"), list):
    sys.exit("ERROR: Employee records were not found.")

# Rename existing employee fields in persistent data.
for employee in data["employees"]:
    if "role" in employee and "jobTitle" in employee:
        sys.exit(f"ERROR: {employee.get('id')} has both role and jobTitle.")
    if "role" in employee:
        employee["jobTitle"] = employee.pop("role")

# Update only the employee seed data.
match = re.search(r"(employees:\s*\[)(.*?)(\n\s*\])", server, re.S)
if not match:
    sys.exit("ERROR: Employee seed data not found.")

block = match.group(2)
block, count = re.subn(
    r"(\bid:\s*'EMP-\d+'\s*,[^{}\n]*?)\brole\s*:",
    r"\1jobTitle:",
    block
)
if count == 0:
    sys.exit("ERROR: Employee seed fields were not found.")

server = server[:match.start(2)] + block + server[match.end(2):]

# Update employee creation API.
old = "if (!req.body.name || !req.body.role)"
if old not in server:
    sys.exit("ERROR: Employee validation was not found.")
server = server.replace(old, "if (!req.body.name || !req.body.jobTitle)", 1)

old = "role: req.body.role"
if old not in server:
    sys.exit("ERROR: Employee creation field was not found.")
server = server.replace(old, "jobTitle: req.body.jobTitle", 1)

# Update employee form and directory.
replacements = [
    ("role:f.get('role')", "jobTitle:f.get('jobTitle')"),
    ('Job title<input name="role"', 'Job title<input name="jobTitle"'),
    (
        '<strong>{r.role}</strong><span className="cell-sub">{r.department}</span>',
        '<strong>{r.jobTitle}</strong><span className="cell-sub">{r.department}</span>'
    ),
]

for old, new in replacements:
    if old not in app:
        sys.exit(f"ERROR: Expected frontend code not found: {old}")
    app = app.replace(old, new, 1)

# Preserve original files before writing any changes.
for path in (app_path, server_path, data_path):
    backup = Path(str(path) + ".before-jobtitle")
    if not backup.exists():
        backup.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")

# Save all updates.
data_path.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)
server_path.write_text(server, encoding="utf-8")
app_path.write_text(app, encoding="utf-8")

print("SUCCESS: Employee job titles now use jobTitle.")
print("Updated: src/App.tsx, server/index.ts, server/data.json")
print("Backups created with the suffix .before-jobtitle")
print("Employee records updated:", len(data["employees"]))
