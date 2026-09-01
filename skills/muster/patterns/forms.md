# Forms — fields, input, controls, copy

Thirteen patterns. Cite a violation as `slug#n`.

---

### form-field-states — Form Field States
*Applies when:* the target renders any input, select or textarea.
1. Six states exist: default, focus, error, success, disabled, loading.
2. The label sits above the field and the helper text below — a placeholder is never the label.
3. The focus ring clears 3:1 contrast at minimum.
4. ~12% of users have a colour vision deficiency, so an error carries colour + icon + written message; border-only red is not an error state.
5. Disabled is a greyscale fill with a `not-allowed` cursor, never a faked `opacity: 0.5`.
6. Loading shows an in-field spinner and blocks input.

### form-validation-timing — Form Validation Timing
*Applies when:* the target validates user input.
1. A field validates on blur, once the user has moved on — not on every keystroke, not all at once on submit.
2. After a field errors, that field switches to live validation so the message clears as it is fixed.
3. Correct fields are confirmed with a green check, not only wrong ones flagged in red.

### input-masking — Input Masking
*Applies when:* the target formats a number as it is typed — card, phone, IBAN, date.
1. Long numbers group into fixed chunks of four; a card input takes 16 digits.
2. Brand is detected from the leading digit — 4 Visa, 5 Mastercard, 3 Amex — and the mark shows inline.
3. The caret stays right after the character just typed and never jumps to the end when a separator auto-inserts.
4. A paste is reformatted, not rejected: dashes and spaces are stripped and the value is reformatted to spec.
5. The formatted value is shown and the raw digits are stored — formatting characters are never persisted.
6. Validation runs on blur; nothing is flagged on the first keystroke.

### password-field-ux — Password Field UX
*Applies when:* the target has a password or passphrase input.
1. Strength is entropy, not a checkbox tally — a longer passphrase beats a mandatory symbol.
2. The requirements checklist shows while typing and each rule ticks green before submit; rules are never revealed only after a failed attempt.
3. A live strength meter coaches in real time, because post-submit errors only punish after the fact.
4. An eye toggle unmasks the field — masked dots hide silent typos.
5. Paste is never blocked; password managers fill longer, stronger passwords than hand-typed ones.
6. A one-tap generated password is offered: unique, saved, never reused.

### otp-input — OTP Input
*Applies when:* the target collects a one-time code.
1. The code is modelled as one string, not N independent values: `useState("847291")`, not an array of six.
2. Paste is the primary path: non-digits are stripped with `value.replace(/\D/g, "")` and spread across the boxes.
3. Focus auto-advances as each digit lands; Backspace on an empty box jumps back and clears the previous one.
4. Mobile wires `inputmode="numeric"` and `autocomplete="one-time-code"`.
5. Resend is throttled behind a visible 30s countdown.
6. A wrong code shakes, clears and refocuses instead of sitting silently; a correct one locks each box green with a check and a Verified state.

### range-sliders — Range Sliders
*Applies when:* the target has a slider or a range control.
1. A 4px hairline is not a hit target — the drag target expands to the full row.
2. The track fills and a live readout shows, so the value is legible at a glance.
3. Values snap to steps when clean numbers matter; free continuous dragging produces 47.3.
4. The value floats in a tooltip above the thumb while dragging.
5. A two-thumb range shows a filled band between the handles.
6. Keyboard works: arrows step by one, Home and End jump to the extremes.

### toggle-anatomy — Toggle Anatomy
*Applies when:* the target renders a switch or toggle.
1. The rail is twice the knob diameter, and the knob is padded by its own radius so it is centred in both states.
2. Four properties morph together over ~250ms ease-out — rail colour, knob `translateX`, knob shadow, state label — never an instant snap.
3. The flip is optimistic, a spinner sits inside the knob while pending, and failure rolls back with a shake and an error toast; the toggle is never ambiguous during the request.
4. Space toggles when focused, the focus ring is visible, and `aria-checked` announces the state.

### star-rating — Star Rating
*Applies when:* the target collects or displays a rating.
1. Stars fill ahead of the cursor on hover, with the preview state kept separate from the committed value and never left stuck after the pointer leaves.
2. Averages render fractionally — 4.4 is four full stars plus 44% of the fifth — and are never rounded up.
3. The fill staggers ~30ms per star, left to right, rather than all popping at once.
4. Star input is paired with a summary view: an average ring plus a distribution breakdown.

### color-picker-ux — Color Picker UX
*Applies when:* the target lets a user pick a colour.
1. The picker is a decision tool, not a gradient with a slider.
2. A human-readable format is exposed — OKLCH next to hex.
3. It has memory: recent swatches and saved palettes one tap away.
4. The live contrast ratio shows at pick time with a badge reading red or green.
5. Alpha previews over a checkerboard on both light and dark backgrounds, never only on white.
6. Tints and shades generate from a single hue to produce ten tokens.

### date-pickers — Date Pickers
*Applies when:* the target picks a date or a date range.
1. Presets cover ~90% of cases and lead the UI — Today, Yesterday, Last 7 days, Last 30 days, Last quarter — with custom as the exception.
2. A custom range paints a live preview on hover, the first click locks the start and the second the end, and the edges stay draggable.
3. Desktop shows two months side by side, three on large screens; nearby months never need repeated "next" clicks.
4. Keyboard works throughout: arrows move grid focus, a date can be typed, Enter confirms, Escape closes, Page Up moves a month, Shift+Page Up a year.
5. Mobile gets a full-screen sheet with vertical scroll, today anchored at the top and the confirm button at the bottom in thumb reach — never a shrunken desktop popover.

### file-upload-ux — File Upload UX
*Applies when:* the target accepts a file.
1. Upload is a system of states: drag feedback, honest progress, error recovery, preview, queue.
2. The dropzone answers back on hover — border, glow and copy all shift, three signals before the drop.
3. Percent complete and time remaining show during the upload; a spinner that hides progress is not enough.
4. Inline retry keeps the file loaded for a one-tap resume; the user never re-selects and starts over.
5. Receipt is visual — thumbnail, type and size — not a bare filename.
6. In a multi-file queue every item carries its own progress and its own retry.

### inline-editing — Inline Editing
*Applies when:* the target edits a value in place instead of on a separate screen.
1. Editable text signals its affordance: a pencil icon or a soft background tint on hover.
2. Font, size and padding are identical between the text and input states, so nothing moves on entry.
3. The border transitions from transparent to the accent colour.
4. Enter commits and Escape cancels.
5. Blur behaviour is consistent across the whole app — one save-or-discard rule, not one per screen.
6. The save is optimistic, and a server failure rolls back while preserving the draft.
7. The editing mode matches the cost of a typo: cheap mistakes make every cell editable, expensive ones require an explicit Edit action.

### microcopy — Microcopy
*Applies when:* the target writes a button label, an error, an empty state or any user-facing string.
1. Button labels name the reward, not the mechanic: "Create my free account", not "Submit".
2. Errors become next steps: "Invalid input" becomes "That email is taken — want to log in?".
3. Empty states carry the first actionable step rather than a blank screen.
4. A persistent label sits above the input; placeholder text is never the label.
5. The tone is conversational, never system-speak like "operation failed".
