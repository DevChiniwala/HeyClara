import { existsSync, readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";
import { getPaths } from "../utils/paths";
import type { EmployeeInfo } from "../types/employee";

const EMPLOYEES_FILE = "employees.yaml";

function employeesPath(): string {
  return `${getPaths().home}/${EMPLOYEES_FILE}`;
}

function loadEmployees(): EmployeeInfo[] {
  const path = employeesPath();
  if (!existsSync(path)) return [];
  try {
    const doc = yaml.load(readFileSync(path, "utf8"));
    if (Array.isArray(doc)) return doc as EmployeeInfo[];
    return [];
  } catch {
    return [];
  }
}

function saveEmployees(employees: EmployeeInfo[]): void {
  writeFileSync(employeesPath(), yaml.dump(employees, { lineWidth: -1 }));
}

export function getEmployee(name: string): EmployeeInfo | undefined {
  return loadEmployees().find((e) => e.name === name);
}

export function listEmployees(): EmployeeInfo[] {
  return loadEmployees();
}

export function addEmployee(emp: EmployeeInfo): void {
  const employees = loadEmployees();
  if (employees.some((e) => e.name === emp.name)) {
    throw new Error(`Employee "${emp.name}" already exists`);
  }
  employees.push(emp);
  saveEmployees(employees);
}

export function removeEmployee(name: string): boolean {
  const employees = loadEmployees();
  const idx = employees.findIndex((e) => e.name === name);
  if (idx === -1) return false;
  employees.splice(idx, 1);
  saveEmployees(employees);
  return true;
}

export function getEmployeesSummary(): string {
  const employees = listEmployees();
  if (employees.length === 0) return "";
  const lines = employees.map(
    (e) => `- **${e.name}**: ${e.role} @ ${e.project}${e.model ? ` (model: ${e.model})` : ""}`,
  );
  return `## Employees\n${lines.join("\n")}`;
}
