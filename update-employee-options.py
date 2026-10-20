from pathlib import Path
import json
import shutil

app_path = Path("src/App.tsx")
server_path = Path("server/index.ts")
data_path = Path("server/data.json")

for p in (app_path, server_path, data_path):
    if not p.exists():
        raise SystemExit(f"ERROR: Cannot find {p}. Run this from the project root.")

app = app_path.read_text(encoding="utf-8")
server = server_path.read_text(encoding="utf-8")
data = json.loads(data_path.read_text(encoding="utf-8"))

# Approved department-to-title combinations.
approved = {
    "Front Office": "Receptionist",
    "Housekeeping": "Housekeeper",
    "Management": "Hotel Manager",
    "Finance": "Accountant",
}

# Update the existing employee data without changing other fields.
for employee in data.get("employees", []):
    department = employee.get("department")
    if department in approved:
        employee["jobTitle"] = approved[department]

# Update the employee seed data used by the server.
server = server.replace(
    "jobTitle: 'Front Desk'",
    "jobTitle: 'Receptionist'",
)
server = server.replace(
    "jobTitle: 'Housekeeping'",
    "jobTitle: 'Housekeeper'",
)

# Replace free-text job title and department fields with linked dropdowns.
old_state = (
    "const [rows, setRows] = useState<AnyRow[]>([]); "
    "const [query, setQuery] = useState(''); const [open,setOpen] = useState(false);"
)
new_state = (
    "const [rows, setRows] = useState<AnyRow[]>([]); "
    "const [query, setQuery] = useState(''); const [open,setOpen] = useState(false); "
    "const [department, setDepartment] = useState('Front Office'); "
    "const jobTitleByDepartment: Record<string, string> = { "
    "'Front Office': 'Receptionist', Housekeeping: 'Housekeeper', "
    "Management: 'Hotel Manager', Finance: 'Accountant' };"
)
if old_state not in app:
    raise SystemExit("ERROR: Could not find the expected Employees state declaration.")
app = app.replace(old_state, new_state, 1)

old_fields = (
    '<label>Job title<input name="jobTitle" required placeholder="e.g. Receptionist"/></label>'
    '<label>Department<input name="department" placeholder="e.g. Front Office"/></label>'
)
new_fields = (
    '<label>Department<select name="department" value={department} '
    'onChange={e => setDepartment(e.target.value)} required>'
    '<option value="Front Office">Front Office</option>'
    '<option value="Housekeeping">Housekeeping</option>'
    '<option value="Management">Management</option>'
    '<option value="Finance">Finance</option></select></label>'
    '<label>Job title<select name="jobTitle" value={jobTitleByDepartment[department]} required>'
    '<option value={jobTitleByDepartment[department]}>{jobTitleByDepartment[department]}</option>'
    '</select></label>'
)
if old_fields not in app:
    raise SystemExit("ERROR: Could not find the expected job title and department form fields.")
app = app.replace(old_fields, new_fields, 1)

# Validate the department/title combination on the API, not just in the UI.
old_validation = (
    "const d = readData(); if (!req.body.name || !req.body.jobTitle) "
    "return res.status(400).json({ error: 'Name and role are required.' });"
)
new_validation = (
    "const d = readData(); "
    "if (!req.body.name || !String(req.body.name).trim()) "
    "return res.status(400).json({ error: 'Employee name is required.' }); "
    "const approvedJobTitles: Record<string, string> = { "
    "'Front Office': 'Receptionist', Housekeeping: 'Housekeeper', "
    "Management: 'Hotel Manager', Finance: 'Accountant' }; "
    "if (!req.body.department || !Object.prototype.hasOwnProperty.call(approvedJobTitles, req.body.department) "
    "|| req.body.jobTitle !== approvedJobTitles[req.body.department]) "
    "return res.status(400).json({ error: 'Select a valid department and its approved job title.' });"
)
if old_validation not in server:
    raise SystemExit("ERROR: Could not find the expected employee API validation.")
server = server.replace(old_validation, new_validation, 1)

# Save backups before changing files.
for p in (app_path, server_path, data_path):
    backup = Path(str(p) + ".before-employee-options")
    if not backup.exists():
        shutil.copy2(p, backup)

app_path.write_text(app, encoding="utf-8")
server_path.write_text(server, encoding="utf-8")
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print("SUCCESS: Employee department/title dropdowns and API validation updated.")
print("Backups created with suffix .before-employee-options (where not already present).")
print("Updated employee records:")
for employee in data["employees"]:
    print(f"  {employee.get('id')}: {employee.get('department')} - {employee.get('jobTitle')}")
