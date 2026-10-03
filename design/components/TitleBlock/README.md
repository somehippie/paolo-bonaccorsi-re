# TitleBlock

The real estate license and broker disclosure, drawn like the title block in the corner of a survey drawing.

California requires the salesperson's DRE license number and the responsible broker's identity on advertising; confirm the exact wording with American United Mortgage Corp. This component makes that requirement the most official-looking thing on the page instead of fine print. It appears on every real estate page, in the footer at minimum, and its contents go on every flyer, post and thumbnail end card.

Markup: `.titleblock` holding a `.tb-head` (the ridge mark as an `<img class="mark">`, the name and service area) and a `.tb-grid` of four cells, each with a `.lab` label and a `.val` value. License numbers get `.num` for tabular figures and link to the DRE public lookup.

| Field | Value |
|---|---|
| Salesperson | Paolo Bonaccorsi, CA DRE #02339106 |
| Responsible broker | American United Mortgage Corp, CA DRE #01864229 |
| Area | Fremont and the East Bay |

Square corners (`radius-0`) and solid `re-ink` rules: records are square. Labels are sentence case in `re-ink-faint`. Do not shrink it below 14px text, and do not restyle it per page.
