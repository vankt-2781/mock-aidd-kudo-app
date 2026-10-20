# Feature List

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: route-view (web); pages `/`, `/login`, `/todo` and `GET /auth/callback`; partition derived from user-stories, screen-list, route-list, data-model, behavior-logic, permissions-matrix drafts

**Code Format**: All codes MUST follow `F###_NameSlug` format (e.g., F001_Auth, F002_UserProfile)
**Screen Code Format**: All screen codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm)
**User Story Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login)
**Background Logic Code Format**: All BL codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport)
**Permission Code Format**: All PERM codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports)

**Feature Types**:
- `ui` - Feature has UI screens (SCR###)
- `background` - Feature only has background logic (BL###, no SCR###)
- `mixed` - Feature has both UI screens and background logic

**Related Screens column format**: Accepts `SCR###`, `SCR###/REG###`, or mixed comma-separated. No composite screens exist in this project (all atomic, no REG###).

**Cross-reference**: See ScreenList. No regions detected.

## Feature Hierarchy

**Note**: Features are sorted by priority from highest to lowest (P0 → P1 → P2 → P3). Priority levels:
- **P0**: Core functionality, blocking issues, or essential features
- **P1**: High priority, significant features
- **P2**: Medium priority, standard features
- **P3**: Low priority, nice-to-have features

| Code | Name | Type | Language | Workspace | Priority |
|------|------|------|----------|-----------|----------|
| F001_LoginWithGoogle | Login with Google | mixed | TypeScript | . (repo root) | P1 |
| F002_StarterHomePage | Starter Home Page | ui | TypeScript | . (repo root) | P3 |

## Feature Details

### F001_LoginWithGoogle: Login with Google

**Type**: mixed
**Description**: Google OAuth sign-in via Supabase on `/login` (with VN/EN language selector and localized OAuth-error message), the OAuth code-exchange callback, the proxy-based route guard/session refresh, the authenticated `/todo` placeholder (avatar, name, email) and Logout. Owns every auth, session, locale and guard behavior in the app.

**Workspace**: . (repo root)
**Languages**: TypeScript
**Components**: 13

**Related Screens**:
- SCR002_Login: Login
- SCR003_Todo: Todo

**Related User Stories**:
- US001_LoginWithGoogle: Login with Google
- US002_OpenLanguageMenu: Open Language Menu
- US003_SelectLanguage: Select Language
- US004_Logout: Logout

**Related APIs/Routes**:
- (GET) /auth/callback [ROUTE001]
- (PAGE) /login
- (PAGE) /todo
- (ACTION) signOutAction (server action, from /todo)
- (ACTION) setLocaleAction (server action, from /login)

**Related Data Models**:
- MODEL001_User
- MODEL002_DisplayUser
- MODEL003_LocalePreference
- MODEL004_LoginMessages
- MODEL005_ProxySession
- MODEL006_CallbackOutcome

**Related Background Logic**:
- BL001_SupabaseBrowserClient: SupabaseBrowserClient
- BL002_SupabaseServerClient: SupabaseServerClient
- BL003_ProxyRequestChain: ProxyRequestChain
- BL004_ProxySessionRefresh: ProxySessionRefresh
- BL005_OAuthCallbackHandler: OAuthCallbackHandler

**Related Permissions**:
- PERM001_GuardTodoArea: GuardTodoArea
- PERM002_BounceSignedInFromLogin: BounceSignedInFromLogin
- PERM003_TodoServerUserCheck: TodoServerUserCheck
- PERM004_OwnProfileOnly: OwnProfileOnly
- PERM005_StartGoogleSignIn: StartGoogleSignIn
- PERM006_SignOut: SignOut
- PERM007_OAuthCallbackPublic: OAuthCallbackPublic
- PERM009_LocaleSwitchPublic: LocaleSwitchPublic
- PERM010_LoginCopyByLocale: LoginCopyByLocale
- PERM011_SupabaseEnvRequired: SupabaseEnvRequired

---

### F002_StarterHomePage: Starter Home Page

**Type**: ui
**Description**: Unmodified create-next-app scaffold boilerplate at `/` (Next.js logo, getting-started hint, external Templates/Learning/Deploy/Documentation links). Static, unguarded, no service calls, not part of the product's login flow; kept as its own small feature solely so SCR001_Home has an owner. Whether it should redirect to `/login` or be replaced is unresolved.

**Workspace**: . (repo root)
**Languages**: TypeScript
**Components**: 5

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US005_OpenTemplatesLink: Open Templates Link
- US006_OpenLearningLink: Open Learning Link
- US007_OpenDeployLink: Open Deploy Link
- US008_OpenDocumentationLink: Open Documentation Link

**Related APIs/Routes**:
- (PAGE) /

**Related Data Models**:
- None

**Related Background Logic**:
- None

**Related Permissions**:
- PERM008_HomePublic: HomePublic

---

## Summary

- **Total Features**: 2
- **Total Screens**: 3
- **Total User Stories**: 8
- **Total Routes**: 4 (1 backend + 3 pages; plus 2 server actions, not counted)
- **Total Data Models**: 6
- **Total Background Logic**: 5
- **Total Permissions**: 11
- **Languages Detected**: TypeScript

## Cross-Reference Validation

- [x] All F### codes are unique
- [x] All F### codes are referenced in UserStories.md
- [x] All screen references are valid (SCR001-SCR003, no REG)
- [x] All user story references are valid (US001-US008)
- [x] All route references are valid (ROUTE001 in RouteList)
- [x] All data model references are valid (MODEL001-006)
- [x] All behavior logic references are valid (BL001-005)
- [x] All permission references are valid (PERM001-011)
- [x] Every US has a parent feature (US001-004 → F001; US005-008 → F002)
- [x] Every screen has a parent feature (SCR002, SCR003 → F001; SCR001 → F002)
- [x] Every route maps to a feature (/auth/callback, /login, /todo → F001; / → F002)
- [x] Every data model maps to a feature (MODEL001-006 → F001)
- [x] Every background logic maps to a feature (BL001-005 → F001)
- [x] Every permission maps to a feature (PERM001-007, 009-011 → F001; PERM008 → F002)
