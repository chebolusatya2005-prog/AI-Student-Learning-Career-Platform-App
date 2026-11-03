# Implementation Plan: Clean Up Trainer Dashboard & Remove Runtime RLS Audit Panel

Remove the Runtime RLS Audit Panel, internal UUID banners, and audit toggle buttons completely from the Trainer Dashboard and Trainer Settings UI. Keep `TrainerRlsAuditPanel.tsx` as an unused component without exposing it to any other dashboard.

## Invariants & Scope

- **Complete Removal from Trainer Views**: The audit panel, "Run RLS Security Audit" button, raw query displays, and internal Trainer UID banners are removed from `TrainerDashboard.tsx` and `TrainerSettingsView.tsx`.
- **No Cross-Dashboard Exposure**: Do not expose or mount `TrainerRlsAuditPanel.tsx` in the Admin Dashboard, Student Dashboard, or anywhere else. It is preserved strictly as an unused component.
- **Zero Functionality Loss**: Assigned student roster, mentee progress charts, risk intervention tables, curriculum recommendations, course cards, and the EduCareer AI assistant remain 100% active and untouched.
- **Zero Database/Backend Changes**: No Supabase policies, database permissions, authentication, roles, student assignments, or student data will be modified.

---

## 1. Modifications Overview

### File 1: `src/components/dashboards/TrainerDashboard.tsx`
- Remove `TrainerRlsAuditPanel` import.
- Remove `showRlsAudit` state variable.
- Remove the Security Notice Banner (lines 345–358) displaying `Trainer ID (UUID)` and the audit toggle button.
- Remove the modal mount block `{showRlsAudit && user && <TrainerRlsAuditPanel ... />}` (lines 360–371).
- Remove `showRlsAudit` and `onToggleRlsAudit` props passed to `<TrainerSettingsView />` (lines 428–432).
- Remove unused `Lock` icon import if no longer needed.

### File 2: `src/components/dashboards/trainer/TrainerSettingsView.tsx`
- Remove `showRlsAudit` and `onToggleRlsAudit` from `TrainerSettingsViewProps`.
- Remove the "Runtime RLS Security Audit Panel" toggle card (lines 38–60).
- Remove unused `ShieldCheck` icon import.
- Retain all mentor notification preferences (High-Risk Alerts, Weekly Summary Email).

### File 3: `src/components/dashboards/TrainerRlsAuditPanel.tsx`
- Left intact as an unused component.

---

## 2. Verification Steps

1. Run production build (`compile_applet`).
2. Run TypeScript checks (`lint_applet`).
3. Verify that the Trainer Dashboard displays only clean faculty mentor content:
   - Header with Trainer Name and Email
   - Mentee KPIs (Assigned Students, High Risk, Placement Ready)
   - Active Mentee Roster, Progress, and Risk views
   - Settings with Mentorship Alerts
   - No RLS Audit Panel, No Raw Query Strings, and No Trainer UID Banner.
