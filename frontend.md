# Frontend design

Design only. Do not implement from this file yet.

This is the product UI for the existing Spring Boot HR API (tenant by hostname, JWT, roles EMPLOYEE, MANAGER, HR_ADMIN). It follows Apple’s interface principles as captured in `frontend/SKILL.md`: instant press feedback, interruptible motion, springs, spatial consistency, translucent materials, system type, wayfinding, and simplicity that is not empty minimalism. No emoji. No dashed borders. No decorative illustration.

The current app fails wayfinding. The sidebar lists almost every route. Profile, Invite, seven reports, and four leave surfaces compete as peers. Child screens have no Back. “Team leave” exists twice. Home is a raw stats dump. Chrome is an opaque black and white grid that does not feel like a product.

The redesign keeps every capability the backend already exposes. It does not invent Kafka, a second API host, or features with no controller. Audit logs exist on the API and have no screen today; they belong here. Leave types are read only on the API and stay a picker, not a settings app. Company bootstrap stays out of the tenant product.

## 1. Feeling

People should feel calm and in control. Work is serious (hours, pay, leave). The UI is quiet, precise, and physically honest. Motion is short and interruptible. Nothing traps the user. Every screen answers: where am I, what can I do, how do I leave.

## 2. Visual language

### Type

Use the platform system stack already on `body` (`system-ui`, San Francisco on Apple). Do not add a display face.

1. Large titles: size around 2rem, weight 700, line height ~1.1, tracking slightly tight (about -0.02em).
2. Section titles: ~1.125rem, weight 600, line height ~1.25.
3. Body and table: ~0.9375rem, weight 400, line height 1.45, tracking near 0.
4. Captions and meta: ~0.8125rem, weight 400, color secondary.
5. Scale spacing with `rem` so Dynamic Type does not smash the layout.

### Color and materials

Light is the default. Dark is a first class companion, not an invert filter.

Light:
1. Canvas: `#F5F5F7` (content sits on a slightly warm gray, not a hard white sheet).
2. Raised surface: `rgba(255,255,255,0.72)` with `backdrop-filter: blur(20px) saturate(180%)`.
3. Sidebar: heavier material, `rgba(246,246,248,0.82)` plus stronger blur. This is structure, not a second light glass stacked on glass.
4. Labels: `#1D1D1F`. Secondary: `#6E6E73`.
5. Accent: system blue `#0071E3` for the single primary action and selected nav. Not used as a page wash.
6. Destructive: system red for Deny, Revoke, Deactivate only.
7. Success is copy (“Saved.”), not a green badge farm.

Dark:
1. Canvas near `#000000`.
2. Surfaces `rgba(28,28,30,0.72)` with the same blur.
3. Text `#F5F5F7`, secondary `#A1A1A6`.
4. Accent `#0A84FF`.

Never stack two light frosted layers. Vibrancy: text on glass is heavier and higher contrast than text on solid canvas. Scroll edges use a short fade into the floating toolbar, not a 1px hairline under every header.

Corner radius: 12px on cards and sheets, 8px on controls, 20px on large sheets. Full square chrome is retired.

### Motion

Default spring: damping 1.0, response 0.3 to 0.4 (critically damped, no bounce).

Drawer and sheet: damping ~0.8, response ~0.3 only when the user flicked. A menu that merely appears must not bounce.

Rules:
1. Highlight on pointer down (`scale(0.97)` in ~100ms). Commit on pointer up.
2. Never lock input during a transition. Grab a closing sheet and it follows the finger.
3. Animate from the live transform, not from the logical target.
4. Enter and exit on the same path. A sheet from the right dismisses to the right. Back navigates with a short edge slide; reduced motion uses a cross fade.
5. Rubber band lists and sheets at the edge.
6. `prefers-reduced-motion: reduce` replaces slides with opacity. `prefers-reduced-transparency: reduce` solidifies glass.

Haptics and sound are not required on web. Do not fake them with extra toasts.

### Controls

1. Primary button: filled accent, label in white, one per screen.
2. Secondary: translucent fill, not a heavy black outline.
3. Tertiary: plain text, used for Back, Cancel, Show password.
4. Segmented control: for Mine / Review / Team. This replaces extra sidebar links.
5. Tables stay tables. Rows are tappable. Selected row is a light fill, not inverted black.
6. Empty state: one sentence, then the action if the user can create something.
7. Loading: skeleton blocks that match the final layout, or the word “Loading.” if the fetch is under a few hundred ms. No spinner festival.
8. Errors: inline under the field, or a compact banner that does not push the title off screen. Use the API `message`. Do not remap every 403 to the login deactivation string.

## 3. Shell

Authenticated product lives in `AppLayoutComponent`. Guest routes do not use this shell.

### Sidebar (desktop)

Width ~240px, translucent, content of the page scrolls underneath the blur at the seam.

Top: company name from tenant (human title if the API ever provides it; today the slug, capitalized as a word, e.g. Acme). Not a raw hostname.

Middle: a short list. Only section roots. Labels name the content.

Bottom: nothing except optional collapse. Account does not live here.

Selected item: accent tint plus medium weight. Unselected: secondary label color. No inverted black pill.

HR_ADMIN sees at most six items. MANAGER five. EMPLOYEE four. That is the entire sidebar.

Employee:
1. Home
2. Time
3. Leave
4. Reports

Manager adds:
5. Team

HR adds, instead of Team as a peer of People:
5. People
6. Company

Profile, Invite, Departments, Projects, each report, Time approvals, Team time, Leave approvals, Team leave, and All leave are not sidebar items.

On viewports below ~900px the sidebar becomes a left edge sheet. Open from a leading toolbar button labeled Menu. Drag to dismiss with velocity handoff. Rubber band past the closed rest. Dim the canvas with a scrim only while the sheet is the focus. Do not keep a permanent 220px column on a phone.

### Top bar

Translucent, content scrolls under it.

Leading:
1. On a root section: the large title in the page, not duplicated in the bar; the bar may be empty on the left, or show Menu on small screens.
2. On a child: a Back control. Always leading. Label is the parent name (“Time”, “People”, “Reports”), not a generic “Back” when there is room. Chevron plus word. Keyboard: Escape dismisses a sheet. History: the browser back button and this control do the same thing.

Center: empty on desktop. On small screens, a truncated page title.

Trailing:
1. Text link “Inbox (N)” only if a notifications API exists later. Do not draw a bell. Today the backend has no notifications controller; omit this until it does.
2. Account control: circular initials, press opens a popover anchored to the control (`transform-origin` on the avatar). Menu: name, role in secondary type, company, Profile, Sign out. Sign out is not a top bar button competing with the title.

### Back and hierarchy

Roots: Home, Time, Leave, Reports, Team, People, Company.

Children always have a path back to their root:
1. Time new / edit → Time
2. Leave new → Leave
3. Person / invite / add person → People
4. Report detail → Reports
5. Department and project editors stay on Company as sheets, not orphan routes without chrome

Do not invent a second back control in the page body if the top bar already has one. One Back. Predictable. Top leading.

Sheets: Cancel on the leading edge of the sheet header, primary action trailing (Save, Send invite). Swipe from the leading edge or drag the sheet down (phone) to dismiss, with a confirm only if there is unsaved text.

### What must never be duplicated

1. One Time section. Mine, Review, and Team (or Company for HR) are segments, not three nav rows.
2. One Leave section. Same pattern. HR’s company wide list is the Company segment, not “All leave” in the sidebar.
3. One Reports section. A gallery, then a detail. “Team leave” the report is Insights. “Team leave” the queue is Leave → Team.
4. Invite is an action on People, not a destination in the rail.
5. Profile is an account destination, not a rail item.

## 4. Guest surfaces (no app sidebar)

### Marketing home `/`

Public apex (no tenant host). Quiet marketing, not an empty main.

Header: product name “HRApp”, trailing Log in.

Body: one headline (“Time, leave, and people for one company”), one sentence of support, one primary “Log in”. No feature grid of six cards. No stock photos.

Log in goes to `/login` (company domain step).

### Find company `/login` without tenant

Title: “Find your company”.

Field: company domain with a suffix chip showing the current base (e.g. `.localhost` in dev). Continue is the only primary.

Leading Back to marketing (this is the one guest back). Errors under the field.

On success: navigate to `{slug}` host `/login`.

### Sign in `/login` with tenant

Title: company name, not the word “Sign In” as a brand.

Fields: work email, password with Show / Hide on pointer down feedback. Remember me stays.

Primary: Continue. Secondary text: “Wrong company?” which sends the user to the apex find flow.

Demo fill may remain in development builds only, visually secondary, never on a production build.

After success: Home.

### Accept invite `/invite?token=`

No sidebar. Centered sheet on the canvas.

If the host has no tenant, explain that the link must be opened on the company address.

If the token is missing: one sentence and a link to Log in.

Form: first name, last name, password (min 6, matching API). Primary: Join {company}. Success: short confirmation, then Sign in (do not auto login unless the API starts returning a JWT).

Errors from the API (expired, used, not found) are the banner. Do not invent a second “invalid invite” page.

## 5. Home `/dashboard`

GET `/users/me/dashboard`. Role aware. This is a launchpad, not a fourth copy of Time and Leave tables.

Layout: large title “Home”, then a two column board on desktop (one column on phone).

Everyone:
1. A greeting using first name.
2. Hours this week and this month as two large numbers (employee stats).
3. Leave balances as compact rows (type, remaining). Tap a row → Leave (new request with type preselected if cheap; otherwise just Leave).
4. Upcoming leave as a short list. Empty: “No upcoming leave.”
5. Recent time: at most five rows. Footer link “Open Time”.

Manager extra:
1. Pending time approvals and pending leave approvals as tappable counts → Time Review / Leave Review.
2. Team on leave today as a count → Leave Team.

HR extra:
1. Active employees count → People.
2. The same pending counts, company scoped as the API already does.

Do not repeat the full recent leave table and the upcoming leave table as two untitled slabs. Upcoming is the useful one; recent leave is a link.

Press on a stat card: scale down slightly on pointer down, navigate on release. Cards are not a rainbow.

## 6. Time

API: `/time-entries/me`, `/stats/me`, create, edit, submit, `/pending`, `/team`, approve, reject, correction.

### Time root `/time`

Large title Time. Trailing primary: Log time.

Segmented control (only the segments the role may see):
1. Mine (all roles)
2. Review (MANAGER, HR_ADMIN) — pending approvals
3. Team (MANAGER) or Company (HR_ADMIN) — GET `/time-entries/team`

Default segment Mine. Changing segment does not add sidebar entries. Deep links `/time/approvals` and `/time/team` still work as the Review and Team segments so bookmarks do not break; they render inside this page.

Mine:
1. Personal stats as a thin summary strip (week hours, average day, top project).
2. Filters in a collapsing “Filters” disclosure, not a permanent four field wall. Defaults: current month.
3. Table: date, in, out, hours, project, status. Row click → edit when the API allows, else a read sheet.
4. Empty: “No time entries.” plus Log time.

Review:
1. Inbox of pending. Approve is the primary on the row (or in a trailing swipe on touch). Deny opens a small sheet asking for a note if the API requires it.
2. Empty: “Nothing to review.”

Team / Company:
1. Same table plus person name. Filters: status, dates, name.
2. This is history and status, not the approval inbox. Do not copy Approve onto every historical row; only pending rows show review actions.

### Log time `/time/new`

Not a full page that feels unrelated. Right sheet on desktop (width ~480px), full screen sheet on phone. Header: Cancel, title “Time entry”, Save.

Fields mapped to `CreateTimeEntryDto` (date, clock in, clock out, project, breaks, notes as the API defines). Inline validation. On success: dismiss to Mine, new row at the top.

### Edit `/time/:id/edit`

Same sheet. Title “Edit entry”. Back / Cancel returns to Time, preserving the segment. If the entry is locked, the sheet is read only with a sentence why (status). Correction request uses the existing correction endpoint as a secondary action, never as a second page in the rail.

## 7. Leave

API: `/leave-requests/me`, create, pending, cancellation pending, team, HR search, approve, deny, cancel. Balances via dashboard and `/reports/leave-balances` for managers. Types via GET `/leave-types`.

### Leave root `/leave`

Large title Leave. Trailing: Request leave.

Segments:
1. Mine
2. Review (manager, HR) — pending plus cancellation pending as two stacked sections on one scroll, not two routes
3. Team (manager) or Company (HR, today’s `/leave/all`)

Mine:
1. Balance chips at the top (from dashboard or balances endpoint).
2. List of requests: type, dates, status. Empty: “No leave requests.”
3. Upcoming visually first.

Review:
1. Approve / Deny with notes sheet for deny.
2. Cancellation requests as a second section titled “Cancellations”.

Team / Company:
1. Directory of others’ leave with filters (status, dates, person for HR).
2. Distinct from the Team leave report (that report lives under Reports).

### Request leave `/leave/new`

Sheet. Title “Leave request”. Type picker from `/leave-types`. Dates, notes. Remaining balance for the selected type shown under the picker. Save submits. Dismiss to Mine.

No separate edit route unless the API gains one; cancellation is an action on the row.

## 8. Team `/team`

MANAGER and HR_ADMIN. GET `/users/team`.

This is people, not time and not leave. Title “Team”. No extra sidebar children.

Table: name, role, department. Row opens a read sheet: contact, role, department. HR may jump to the People editor for that user. Manager does not get the HR People editor.

Do not embed team time or team leave tables here. Links: “Time for this team” sets Time to Team; “Leave for this team” sets Leave to Team.

HR may hide this item because People is the company directory. Prefer: HR uses People only; Manager uses Team. That removes another duplicate. If HR still hits `/users/team`, People search is enough.

## 9. People (HR)

API: paginated `/users`, create, update, get by id, invite create/revoke.

### List `/people`

Title “People”. Trailing: Invite. Secondary: Add person (direct create when HR must skip email).

Filters in a disclosure: name, department, role, active.

Table: name, email, role, department, active. Entire row opens the person. Pagination at the bottom, compact.

Empty: “No people.” plus Invite.

### Person `/people/:id`

Child of People. Top bar Back “People”. Title is the person’s name.

Sections:
1. Profile fields (name, email read only if the API says so, role, department, manager, active).
2. Save trailing in the header when dirty.
3. Destructive: deactivate only with a confirmation sheet (“This person will not be able to sign in.”). No confirm for ordinary Save.

Do not duplicate Invite on this page unless sending a new invite to this email is an API action.

### Add person `/people/new`

Sheet or child with Back “People”. Fields from `CreateUserRequestDto`. Primary: Create. Success: go to the new person.

### Invite `/people/invite`

Child or sheet. Back “People”. Fields from `CreateInvitationRequestDto`: email, role, department, manager. Primary: Send invite.

Success: stay on a brief confirmation (“Invite sent to {email}.”) with Done. Do not dump a raw token on screen in production. If the API still returns a token for local mailless testing, show it behind a disclosure labeled “Invite link (development)”.

Revoke lives on a future invite list if the API is listed; until a list endpoint is used in the UI, skip a dedicated Invites rail item.

## 10. Company (HR)

New root. Replaces Departments and Projects as sidebar peers. Optional third pane: Activity from `/audit-logs`.

Title “Company”. Three cards or a segmented control:
1. Departments
2. Projects
3. Activity

### Departments `/departments`

Child of Company, Back “Company”. List of departments. Create and rename in a small sheet. Delete / merge only if the API allows; otherwise omit. Empty: “No departments.”

### Projects `/projects`

Same pattern. Code and name as the model already uses. Used by time entry project pickers.

### Activity `/company/activity` (new route)

GET `/audit-logs`. Table: time, actor, action, target. Row → GET `/audit-logs/{id}` in a read sheet. Empty: “No activity yet.” HR only. This is the missing backend screen, not a new product idea.

## 11. Reports

One rail item. Hub at `/reports` (add this route). Today every report is a sidebar link; that is the long rail.

Hub: title “Reports”. A gallery of cards. Each card: report name, one line what it answers, who can see it. Tap opens the detail with Back “Reports”.

Employee sees:
1. My time (`/reports/employee-time` with implicit self `userId`)

Manager also:
2. Team leave (`/reports/team-leave`)
3. Leave balances (`/reports/leave-balances`)

HR also:
4. Payroll (`/reports/payroll`) including CSV download as a trailing action, not a separate page
5. Department hours (`/reports/department-utilization`)
6. Project hours (`/reports/project-hours`)
7. Compliance (`/reports/compliance`)

Manager may open employee time for a direct report via a person picker; HR for anyone. The picker is on the detail, not a hub duplicate.

### Report detail (shared chrome)

Back “Reports”. Title of the report. Date range (and year / department when the API uses them) in a compact filter bar. Apply is implicit on change after a short debounce, or an explicit Apply if the query is heavy.

Body: summary numbers first, then the table. Empty: “No rows for this range.” Error banner from the API.

Do not build seven different page headers. One report layout component. CSV only where the API has `format=csv` (payroll).

Team leave the report: aggregated insight. Team leave the Leave segment: operational list. Copy on the card: “Time off patterns for your team.” so it cannot be confused with the queue.

## 12. Profile `/profile`

Opened from the account popover. Back may return to the previous root (Home if unknown). Title “Profile”.

Fields: first name, last name. Email and role as read only meta. Save in the header. “Saved.” as completion feedback, not a modal.

Sign out stays in the account popover, not on this form.

## 13. Role maps (what each person actually sees)

Employee: Home, Time (Mine only), Leave (Mine only), Reports (My time), Profile.

Manager: Home with approval counts, Time (Mine, Review, Team), Leave (Mine, Review, Team), Team, Reports (My time, Team leave, Leave balances), Profile.

HR: Home with company counts, Time (Mine, Review, Company), Leave (Mine, Review, Company), People (list, person, invite, add), Company (departments, projects, activity), Reports (all HR reports), Profile.

## 14. States that every page shares

1. First paint: title and chrome immediately; body skeletons. Do not block the shell on data.
2. Empty: sentence plus optional action. Never a blank table chrome with no explanation.
3. Forbidden: if a role hits a URL they cannot use, send them to Home with no stack dump.
4. Tenant missing on an app URL: guest find company flow.
5. 401: existing interceptor, Sign in.
6. Destructive: one confirmation sheet, title a specific verb (“Revoke invite?”, “Deny leave?”), Cancel leading, destructive trailing. Never confirm Save.

## 15. Responsive

Desktop: sidebar + scrolling canvas. Sheets from the trailing edge.

Tablet: sidebar may collapse to icons with tooltips; prefer the Menu sheet if space is tight.

Phone: no persistent sidebar. Bottom bar with the same roots (Home, Time, Leave, Reports, plus More for Team / People / Company). More opens an Apple style grouped list. Top leading Back on children. Primary create actions stay trailing in the top bar.

Bottom bar selected state uses the accent. Five items maximum; HR’s extra roots live in More.

## 16. Mapping from today’s routes

Keep existing URLs where they already match a child, so nothing 404s.

1. Sidebar Home becomes Home.
2. Sidebar Time, Time approvals, and Team time become Time segments.
3. Sidebar Leave, Leave approvals, Team leave, and All leave become Leave segments.
4. Sidebar Profile becomes the account popover.
5. Sidebar Team stays Team, managers only.
6. Sidebar People and Invite become People with an Invite action.
7. Sidebar Departments and Projects become Company.
8. Seven sidebar reports become the Reports hub plus details.
9. Missing today: Company Activity from audit logs.
10. `/time/new`, `/leave/new`, `/people/new`, `/people/invite` become sheets or titled children with Back.

## 17. Explicit non goals

1. Do not restyle by adding color badges, emoji, gradients, or dashed rules.
2. Do not add a notifications bell until a notifications API ships.
3. Do not add leave type administration (API is GET active types).
4. Do not add a bootstrap / create company wizard in the tenant app.
5. Do not duplicate tables on Home that already have a dedicated section.
6. Do not put Log time and Request leave in the sidebar.

## 18. Implementation note for later

When coding starts: one layout, one page header component (leading Back, title, trailing primary), one segmented control, one sheet, one report frame. Feature pages stop inventing their own headers. Motion uses a spring library; do not fake gesture sheets with CSS only keyframes.

The measure of success is a manager who can approve time without hunting a twelfth sidebar row, and an employee who always knows how to get back.
