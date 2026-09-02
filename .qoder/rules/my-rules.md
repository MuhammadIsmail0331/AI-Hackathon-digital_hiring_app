---
trigger: always_on
---
# Digital Hiring App - Development Rules

## Project Goal
Build a secure, mobile-friendly digital marketplace for Pakistani people that connects daily-wage workers with people who need labour.

## Target Users
- The primary users are people in Pakistan.
- The app must be extremely easy to use for daily-wage workers, including users with little or no digital/technical knowledge.
- Design for users with different levels of literacy and digital experience.
- The application must be mobile-first.

## Language
- Provide a clear language switch between English and Urdu.
- Important user-facing content should support both English and Urdu.
- Use simple and familiar words.
- Avoid unnecessary technical terminology.

## Easy Visual Interaction - VERY IMPORTANT
- Do not depend on users typing long sentences or paragraphs.
- Prefer structured visual controls whenever information can be selected from known options.
- Use dropdown menus, pop-up selectors, calendars, time pickers, number selectors, buttons, checkboxes, icons and other visual controls instead of free-text fields where appropriate.
- Each important input should preferably appear as a clearly separated box/card/field.
- Use clear labels above or inside each input box.

### Examples
- Worker type → dropdown/popup selection.
- Job category → visual category selection.
- Number of workers → number selector/dropdown.
- Date → calendar/date picker.
- Start time → separate hour, minute and AM/PM selectors.
- End time → separate hour, minute and AM/PM selectors.
- Job duration → predefined duration options when appropriate.
- Tools required → selectable list with icons and checkboxes.
- Wage → clear numeric input with currency shown as PKR/Rs.
- Location → map/location selector where practical.
- Availability → simple visual toggle.
- Job status → clear visual status cards.

- For predictable values, do NOT make users type the value manually.
- Allow manual text input only where it is genuinely useful, such as additional job details or special instructions.
- Keep the number of required fields low and make the process step-by-step where appropriate.

## Accessibility & Visual Guidance
- Use large, readable text.
- Use large buttons and touch-friendly controls.
- Use icons, illustrations and simple avatars to communicate meaning.
- Important actions should be understandable from visual cues even when the user has difficulty reading.
- Where useful, show an icon together with the text, e.g. a painter icon + "Painter".
- Do not rely only on color to communicate important information.
- Use confirmation screens before important actions such as accepting a job or confirming payment.
- Provide simple visual guidance/tooltips where users may be confused.

## UI/UX
- The UI should be modern, clean, friendly and professional.
- Prioritize simplicity over visual complexity.
- The application should feel designed for Pakistani workers and employers.
- Use a consistent design throughout the application.
- Make wage, location, date, time, job type and worker availability immediately visible.
- Minimize the number of steps needed to create or accept a job.
- Design for both mobile and desktop browsers.
- Avoid crowded screens.

## AI
- AI should assist with job understanding, recommendations and worker-job matching.
- AI should primarily work behind the scenes rather than requiring users to communicate through a chatbot.
- The normal job-creation flow should use simple structured fields and visual selectors.
- AI may convert optional natural-language or Urdu descriptions into structured requirements when a user chooses to provide them.
- AI should rank workers based on relevant factors such as skills, location, availability, experience, ratings and wage expectations.
- AI-generated recommendations must be clearly distinguishable from confirmed user decisions.
- AI must not make irreversible decisions without user confirmation.
- Do not send unnecessary personal information to external AI APIs.

## Privacy & Security
- Treat all user data as private and sensitive.
- Never expose passwords, authentication tokens, API keys or private user data.
- Never hard-code API keys or secrets in source code.
- Store secrets using environment variables.
- Passwords must be securely hashed; never store plain-text passwords.
- Validate and sanitize all user inputs.
- Implement proper authentication and authorization.
- Users must only access information they are authorized to access.
- Do not publicly expose unnecessary personal information such as phone numbers or exact home locations.
- Minimize collection and storage of personal data.
- Do not use real personal data for testing.
- Do not store real payment credentials in the MVP.
- Protect sensitive API endpoints against unauthorized access.- Apply least-privilege access: every API operation must verify the logged-in user's role and ownership of the requested resource.
- Never trust user IDs, roles or permissions supplied by the client.
- Do not return unnecessary private fields from APIs.
- Protect against common web vulnerabilities including unauthorized access, XSS, injection and CSRF where applicable.
- Log errors safely without exposing passwords, tokens, API keys or other sensitive information.

## Payment / Escrow
- The MVP uses simulated escrow/payment states only.
- Never claim that real money has been transferred when it has not.
- Planned flow:
  Employer secures payment → Worker accepts → Job starts → Job completed → Employer confirms → Payment released.
- Cancellation and penalty rules may be added after the core workflow is stable.
- Future real payment integration must use a legitimate payment provider and appropriate security/compliance measures.

## Core MVP
The first working version should prioritize:

### Worker
- Registration/login
- Worker profile
- Worker type/skills
- Experience
- Location
- Availability
- Expected wage
- Receive job offers
- Accept/decline offers
- View active and completed jobs

### Employer
- Registration/login
- Create a job
- Select worker type
- Select required number of workers
- Select date
- Select start/end time
- Enter/select wage
- Select required tools
- Select location
- Review matched workers
- Hire a worker
- Confirm job completion

### Hiring
- AI-assisted worker matching
- Job offer
- Worker acceptance/decline
- Job status tracking

### Payment Simulation
- Payment secured
- Payment held
- Payment released after completion

## Development Workflow
- Build and test one feature at a time.
- Do not rewrite working parts unnecessarily.
- Before making major architectural changes, explain the change.
- Keep validation and error handling in place.
- Test important user flows before moving to the next feature.

## Technical Implementation - IMPORTANT
- Prioritize working, reliable functionality over visual appearance alone.
- Implement features end-to-end: UI → validation → API/server logic → database → result shown in UI.
- Do not create placeholder buttons or fake functionality unless explicitly marked as demo/simulation.
- Keep the architecture simple and maintainable; avoid unnecessary complexity or microservices.
- Reuse existing components, utilities and logic instead of duplicating code.
- Use TypeScript properly and avoid `any` unless genuinely necessary.
- Keep business logic separate from UI components where practical.
- Validate important operations on the server, not only in the browser.
- Handle loading, success, error and empty states for important operations.
- Do not break previously working features when adding new features.
- After implementing a feature, test the complete user flow in the local browser.
- Before moving to the next phase, verify that the implemented feature actually works, not merely that the code compiles.
## Local Browser Preview - REQUIRED
- After every significant development task, run the application locally.
- Show the result in a local browser before considering the task complete.
- Prefer a URL such as http://localhost:<port>.
- Visually check the UI after each significant task.
- Test both desktop and mobile-sized layouts where practical.
- If the application does not run, diagnose and fix the problem before continuing whenever practical.
- After fixing an issue, restart the application and verify it again.

## Testing
- Test the actual UI, not only source code.
- Test English and Urdu.
- Test mobile layouts.
- Test worker and employer workflows.
- Test authentication and authorization.
- Test invalid inputs and edge cases.
- Test that users cannot access another user's private information.
- Never use real credentials or real payment information for testing.

## Hackathon Scope
- The registered project name remains Digital Hiring App.
- The core scope remains connecting daily-wage workers with people who need labour.
- Be honest about implemented features, limitations, risks, data and future functionality.
- Clearly distinguish working features from planned/future features.
- Give a concise completion summary after each phase, including:
- What was implemented
- Files/components changed
- Features verified
- Tests performed
- Any known limitations
- Present the phase summary in the project's Canvas/summary area when that feature is available.