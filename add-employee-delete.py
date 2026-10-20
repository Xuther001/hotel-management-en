from pathlib import Path
import shutil

app_path = Path("src/App.tsx")
api_path = Path("src/api.ts")
server_path = Path("server/index.ts")

paths = [app_path, api_path, server_path]
for p in paths:
    if not p.exists():
        raise SystemExit(f"ERROR: Cannot find {p}")

app = app_path.read_text(encoding="utf-8")
api = api_path.read_text(encoding="utf-8")
server = server_path.read_text(encoding="utf-8")

# Add API client method.
old_api = "  createEmployee: (data: any) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),"
new_api = old_api + "\n  deleteEmployee: (id: string) => request<any>(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' }),"
if "deleteEmployee:" not in api:
    if old_api not in api:
        raise SystemExit("ERROR: Could not find createEmployee in src/api.ts")
    api = api.replace(old_api, new_api, 1)

# Add persistent backend deletion endpoint.
anchor = "app.get('/api/v1/finance/expenses', (req, res) => res.json(list(readData().expenses, req)));"
endpoint = """app.delete('/api/v1/employees/:id', (req, res) => {
  const d = readData();
  const index = d.employees.findIndex((employee: any) => employee.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Employee not found.' });
  const [deleted] = d.employees.splice(index, 1);
  writeData(d);
  res.json({ data: deleted, message: 'Employee deleted.' });
});
"""
if "app.delete('/api/v1/employees/:id'" not in server:
    if anchor not in server:
        raise SystemExit("ERROR: Could not find the finance route anchor in server/index.ts")
    server = server.replace(anchor, endpoint + anchor, 1)

# Add deletion handler to Employees component.
old_submit = "async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); await api.createEmployee({name:f.get('name'), jobTitle:f.get('jobTitle'), property:f.get('property'), department:f.get('department'), salary:f.get('salary')}); setOpen(false); load(); }"
new_submit = old_submit + """
  async function deleteEmployee(employee: AnyRow) {
    const confirmed = window.confirm(`Delete employee "${employee.name}" (${employee.id})? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.deleteEmployee(employee.id);
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete employee.');
    }
  }"""
if "async function deleteEmployee(employee: AnyRow)" not in app:
    if old_submit not in app:
        raise SystemExit("ERROR: Could not find the employee submit handler in src/App.tsx")
    app = app.replace(old_submit, new_submit, 1)

# Add a Delete column and confirmation-triggering button to each employee row.
old_header = "<th>STATUS</th><th>MONTHLY BASE</th></tr>"
new_header = "<th>STATUS</th><th>MONTHLY BASE</th><th>ACTIONS</th></tr>"
if new_header not in app:
    if old_header not in app:
        raise SystemExit("ERROR: Could not find the employee table headers")
    app = app.replace(old_header, new_header, 1)

old_cell = "<td className=\"amount-cell\">{money(r.salary)}</td></tr>)}</tbody></table>"
new_cell = "<td className=\"amount-cell\">{money(r.salary)}</td><td><Button variant=\"secondary\" onClick={() => deleteEmployee(r)}>Delete</Button></td></tr>)}</tbody></table>"
if new_cell not in app:
    if old_cell not in app:
        raise SystemExit("ERROR: Could not find the employee salary cell")
    app = app.replace(old_cell, new_cell, 1)

# Make backups before writing any changed files.
for p in paths:
    backup = Path(str(p) + ".before-employee-delete")
    if not backup.exists():
        shutil.copy2(p, backup)

app_path.write_text(app, encoding="utf-8")
api_path.write_text(api, encoding="utf-8")
server_path.write_text(server, encoding="utf-8")

print("SUCCESS: Employee deletion and confirmation added.")
print("Backups use the suffix .before-employee-delete.")
