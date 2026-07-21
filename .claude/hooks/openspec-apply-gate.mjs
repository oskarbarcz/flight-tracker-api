import { readFileSync } from 'node:fs';

const APPLY_SKILLS = new Set(['openspec-apply-change', 'opsx:apply']);

const REMINDER = [
  'Gate: before applying this OpenSpec change, a GitHub issue for it MUST already exist in oskarbarcz/flight-tracker-api and be on the Flight Tracker board (project #12, owner oskarbarcz) with status "In progress".',
  'The issue must have a short, verb-led title (e.g. "Implement airport database views for cabin crew", not "Airport database") and a body with EXACTLY three sections and nothing else: ## Context, ## Acceptance criteria, ## Assumptions.',
  'If that issue does not exist yet, create it and set its board status to "In progress" FIRST, then apply. See memory feedback_openspec_apply_needs_board_issue for the exact gh commands.',
].join(' ');

let skill = '';
try {
  skill = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.skill ?? '';
} catch {}

if (APPLY_SKILLS.has(skill)) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: REMINDER,
      },
    }),
  );
}
