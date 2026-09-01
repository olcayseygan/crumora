# The 73 patterns — trigger index

Source: <https://designmotionhq.com/patterns>. Every pattern lives in one of eight files in this
directory. Read the **Trigger** column against the target; load a file only when at least one of its
patterns fires. Cite violations as `slug#n`.

## foundation.md — 13

| Pattern | Trigger in the target |
| --- | --- |
| design-tokens | any colour, spacing or type value is declared |
| design-system-kit | a stylesheet, theme file or component library |
| grid-system | a page, shell or multi-column region is laid out |
| golden-ratio | a spacing/type scale is derived, or a two-pane split |
| border-radius | `border-radius` is set |
| dark-mode | a dark theme or theme toggle ships |
| color-accessibility | text colour is set, or state is encoded in colour |
| gradient-design | a gradient is declared |
| shadow-elevation | `box-shadow` is set on a surface |
| depth-layers | depth is added to a flat surface, or layers move on scroll |
| icon-design-rules | an icon set is drawn or sized |
| visual-hierarchy | a screen, section or card holds more than one element |
| z-index-mastery | `z-index` is set, or an overlay renders behind something |

## layout.md — 8

| Pattern | Trigger in the target |
| --- | --- |
| proximity-rule | sibling elements are placed with gaps |
| gestalt-laws | many elements are arranged, or an overlay sits over content |
| serial-position | a list, nav, flow or page of sections is ordered |
| von-restorff | comparable options are presented, or one action must win |
| landing-page-skeleton | the target is a marketing or landing page |
| perfect-card | a card surface is rendered |
| card-hover-anatomy | a card responds to hover |
| stepper-wizard | many fields are collected, or a task splits into steps |

## motion.md — 4

| Pattern | Trigger in the target |
| --- | --- |
| animation-timing | a `transition`, `animation` or duration is set |
| easing-curves | an easing function is named |
| doherty-threshold | a user action waits on work |
| scroll-driven-animations | motion is tied to scroll position |

## forms.md — 13

| Pattern | Trigger in the target |
| --- | --- |
| form-field-states | any input, select or textarea |
| form-validation-timing | user input is validated |
| input-masking | a number is formatted as it is typed |
| password-field-ux | a password or passphrase input |
| otp-input | a one-time code is collected |
| range-sliders | a slider or range control |
| toggle-anatomy | a switch or toggle |
| star-rating | a rating is collected or displayed |
| color-picker-ux | a user picks a colour |
| date-pickers | a date or date range is picked |
| file-upload-ux | a file is accepted |
| inline-editing | a value is edited in place |
| microcopy | a label, error, empty state or user-facing string is written |

## overlays.md — 9

| Pattern | Trigger in the target |
| --- | --- |
| modal-hierarchy | anything opens over the page |
| bottom-sheets | a panel opens on a phone-sized viewport |
| dropdown-design | a select, menu button or listbox |
| context-menu | a menu opens at the cursor or on long press |
| tooltip-design | a tooltip is attached to a trigger |
| toast-notifications | a transient message — toast, snackbar, flash |
| notification-system | more than one kind of alert is delivered |
| accordion-disclosure | a panel expands and collapses |
| tabs-system | panels switch from a row of tabs |

## data.md — 8

| Pattern | Trigger in the target |
| --- | --- |
| data-table | rows and columns of records are rendered |
| bulk-actions | many rows are acted on at once |
| pagination | records page, load more, or scroll infinitely |
| filter-chips | a result set is filtered from chips or toggles |
| search-experience-system | a search field |
| command-palette | a Cmd+K style launcher |
| charts-that-lie | a chart is drawn |
| empty-states | a list, table or result set can come back empty |

## feedback.md — 11

| Pattern | Trigger in the target |
| --- | --- |
| loading-states-system | anything is waited on before render |
| skeleton-loading | a placeholder renders while content loads |
| optimistic-ui | state updates behind a network call |
| behind-the-button | a button triggers a write, purchase or multi-table change |
| error-states | the target can fail in front of the user |
| autosave-ux | saving happens without an explicit save action |
| undo-ux | an action a user might regret |
| destructive-actions | something can be deleted, revoked or destroyed |
| disabled-buttons | a control is disabled |
| peak-end-rule | a flow with a beginning and an end |
| zeigarnik-effect | progress toward a goal is shown |

## interaction.md — 7

| Pattern | Trigger in the target |
| --- | --- |
| focus-states | anything focusable — always true |
| hover-trap | behaviour is attached to hover |
| swipe-actions | a row or card responds to a swipe |
| drag-and-drop | an item moves by dragging |
| navigation-patterns | a nav, shell or more than one destination |
| settings-system | a settings, preferences or account screen |
| live-cursors | other people are shown present in real time |
