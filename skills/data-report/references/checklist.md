# Pre-delivery checklist

## Measurement
- [ ] Each source's condition and each field's meaning confirmed **from the content**, not the name.
- [ ] Primary metric isolates the question; sample count, duration and volume normalised.
- [ ] Confounds that could not be normalised are written out in the limits section.
- [ ] Measurement range stated and justified.
- [ ] Sample counts appear in the layer-three data table; no claim rests on a single sample.

## Content
- [ ] Layer one carries the answer on its own; decision study → `.reco` box resting on a number.
- [ ] Three layers in order, nothing said twice across them, no section left empty.
- [ ] Every heading names its own content; none from the banned list in `SKILL.md`.
- [ ] Every chart: one layer, appears once, `.cap` under it, axes in the report language with units.
- [ ] Headings, boxes and fixed labels (meta line, table headers, footer) in the report language;
      `lang` attribute matches.
- [ ] Every `{{...}}` placeholder filled in or deleted.
- [ ] Layer three alone is enough to reproduce the study (record names, script path).

## File
- [ ] Filename per the rule in `SKILL.md` Deliver, dated today.
- [ ] Self-contained: no external `<link>`, `<script src>` or remote `<img src>`.
- [ ] Print-to-PDF does not split a chart or table across a page break.
- [ ] Raw PNGs and scripts in the analysis folder from `paths.md`; footer shows that path.
- [ ] Source data, project runtime code and its dependencies unchanged.
- [ ] Style consistent with older reports in the same folder.

## Afterwards
- [ ] Reusable lesson written to memory (existing memory updated, no duplicate).
- [ ] Closing message: report path plus one sentence of conclusion, not the report body.
