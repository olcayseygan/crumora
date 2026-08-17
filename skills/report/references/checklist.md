# Pre-delivery checklist

## Validity of the measurement
- [ ] Which condition each source or record belongs to was confirmed **from the content** (the
      filename was not trusted).
- [ ] Field, column and flag meanings were opened and verified; name and content do not disagree.
- [ ] The primary metric isolates the question asked; differences in sample count, duration and
      volume were normalised.
- [ ] Confounds that could not be normalised are written out explicitly in Notes & Caveats.
- [ ] The measurement range (distance, time, condition) is stated and the choice justified.
- [ ] Sample counts appear in the Appendix table; no claim rests on a single sample.

## Report content
- [ ] Layer one reads on its own and carries the answer, with no jargon and no method.
- [ ] If there is a decision, the `.reco` box exists and rests on a number.
- [ ] The three layers are in order — anyone, then the informed, then engineers — and nothing is said
      twice across them; no section left empty.
- [ ] Every heading names its own content. No "executive summary", "yönetici özeti", "özet",
      "overview", "genel bakış", "TL;DR" or any label that only states an abstraction level.
- [ ] Every chart sits in the layer whose reader can act on it, carries one idea, and appears once.
- [ ] Every chart has a sentence of interpretation under it in `.cap`.
- [ ] Every chart's axes are in the report language and carry units.
- [ ] Headings and boxes are written in the report language and the `lang` attribute matches.
- [ ] Every `{{...}}` placeholder from the template is filled in or deleted.
- [ ] An engineer could reproduce the study from layer three alone (record names, script path present).

## The file
- [ ] Name format `YYYY-MM-DD_<subject>.html`, dated today.
- [ ] Self-contained: no external `<link>`, `<script src>` or remote `<img src>` — every image is
      base64.
- [ ] Opens in a browser; print-to-PDF does not split a chart or table across a page break.
- [ ] Raw PNGs and scripts are in the visible `<subject>-analysis/` folder; the footer shows that path.
- [ ] Source data, project runtime code and its dependencies are unchanged.
- [ ] Naming and style are consistent with older reports in the same folder.

## Afterwards
- [ ] A reusable lesson, if there was one, is written to memory (existing memory updated, no
      duplicate opened).
- [ ] Closing message: report path plus one sentence of conclusion. The report body was not copied
      into the chat.
