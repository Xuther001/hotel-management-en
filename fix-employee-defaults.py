from pathlib import Path
import shutil

p = Path("src/App.tsx")
s = p.read_text(encoding="utf-8")

old_state = "const [department, setDepartment] = useState('Front Office');"
new_state = "const [department, setDepartment] = useState('');"

old_department = '''<label>Department<select name="department" value={department} onChange={e => setDepartment(e.target.value)} required><option value="Front Office">Front Office</option><option value="Housekeeping">Housekeeping</option><option value="Management">Management</option><option value="Finance">Finance</option></select></label>'''

new_department = '''<label>Department<select name="department" value={department} onChange={e => setDepartment(e.target.value)} required><option value="">Select department</option><option value="Front Office">Front Office</option><option value="Housekeeping">Housekeeping</option><option value="Management">Management</option><option value="Finance">Finance</option></select></label>'''

old_title = '''<label>Job title<select name="jobTitle" value={jobTitleByDepartment[department]} required><option value={jobTitleByDepartment[department]}>{jobTitleByDepartment[department]}</option></select></label>'''

new_title = '''<label>Job title<select name="jobTitle" value={department ? jobTitleByDepartment[department] : ""} required disabled={!department}><option value="">Select department first</option>{department && <option value={jobTitleByDepartment[department]}>{jobTitleByDepartment[department]}</option>}</select></label>'''

if old_state not in s:
    raise SystemExit("ERROR: Department state did not match; no changes saved.")
if old_department not in s:
    raise SystemExit("ERROR: Department dropdown did not match; no changes saved.")
if old_title not in s:
    raise SystemExit("ERROR: Job title dropdown did not match; no changes saved.")

backup = Path(str(p) + ".before-neutral-defaults")
if not backup.exists():
    shutil.copy2(p, backup)

s = s.replace(old_state, new_state, 1)
s = s.replace(old_department, new_department, 1)
s = s.replace(old_title, new_title, 1)
p.write_text(s, encoding="utf-8")

print("SUCCESS: Department and job title now require an explicit department selection.")
