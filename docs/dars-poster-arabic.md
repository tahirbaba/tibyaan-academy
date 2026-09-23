# Arabic on dars posters — how to write it, and why a poster comes out blank

Every approved dars gets a poster. If the dars carries an Arabic block, the
poster carries the Arabic. This is the one page to read when that does not
happen.

## How to get Arabic onto a poster

**Two forms work. A blockquote is preferred; a bold line is the fallback.**

### Preferred — a blockquote

```markdown
> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ

The explanation follows here, outside the quote.
```

### Also accepted — a line that is nothing but bold

This is how the dars are written today, so it works as written:

```markdown
## النص العربي

**اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ**

## النطق الصوتي
```

The **whole line** must be the bold span. A bold phrase inside a sentence is
prose, not a marked-out ayah, and is ignored:

```markdown
يقال **اللهم** عند الدخول      <- ignored, and correctly so
```

### Which one is used

1. If the content has a qualifying blockquote, that is used.
2. Otherwise the **first** qualifying bold line is used.

Only ever one. Several bold ayat are never joined together — that would invent
a passage that appears nowhere in the dars. If you want a particular one on
the poster, make it a blockquote, or put it first.

Prose is never scanned for an ayah, and never will be: guessing which span of
a paragraph is scripture is how a truncated ayah ends up on a shareable image.

## The rule that catches people: the block must be Arabic and nothing else

**One Latin character anywhere in the block and the poster renders with no
Arabic at all.** No error on the page, no broken glyph — the Arabic simply is
not there.

That means none of these inside the quote:

| Do not | Instead |
|---|---|
| `> بِسْمِ ٱللَّهِ ... (1:1)` | put `1:1` in the dars **source reference** field |
| `**اللهم افتح (2:255)**` | same — ASCII digits and brackets blank the poster |
| `> ... ٱلرَّحِيمِ [Quran 1:1]` | same — the citation prints on the poster already |
| `> Bismillah — بِسْمِ ٱللَّهِ` | keep transliteration out of the block |
| `> ٱلرَّحِيمِ.` (ASCII full stop) | use Arabic punctuation, or none |

Arabic-Indic digits (`١٢٣`) and Arabic punctuation (`،` `؛` `؟`) are fine.
ASCII digits (`123`) and ASCII punctuation are not.

**Why.** The poster shapes Arabic with a ~39KB subset of the Cairo font that
contains Arabic glyphs only — no Latin. A Latin character has no glyph in it,
which the shaper reports as `.notdef`, and the rule is that any `.notdef`
refuses the whole block. An empty box in the middle of an ayah is not
something that should ever be published, so refusing is deliberate.

The citation line on the poster is rendered separately, in a Latin font, so
references *do* appear on the poster — just from the source-reference field
rather than from inside the quote.

## Other reasons a poster has no Arabic

All of these are intentional, and all of them mean "no Arabic", never partial
Arabic:

- **No blockquote and no bold-only line.** Nothing to render.
- **The block is mixed Arabic and English.** Treated as a translation or a
  commentary, not the ayah.
- **The block is longer than 220 characters.** A long passage would have to be
  cut to fit, and a cut ayah is exactly what this avoids.
- **The block will not fit above 30px.** The line is scaled down to fit the
  poster, but below 30px it is unreadable at share-preview size on a phone, so
  it is dropped instead.
- **`POSTER_ARABIC_ENABLED` is not set.** This is the master switch and it is
  **off on production**. Nothing renders Arabic while it is unset.

## How to tell which one happened

The server logs say so explicitly, naming the cause — `.notdef` (with the
first 80 characters of the offending text), the fit refusal with the size it
needed, or a load failure. Check the logs for the approval that produced the
poster.

## Things not to do

- **Do not swap in a full Cairo font to "fix" the Latin problem.** A different
  build of the font has different glyph ids, and every shaped glyph here is
  referenced by id — the shaping would need verifying against real ayat from
  scratch. The Latin refusal is a content rule, not a font bug.
- **Do not remove the `.notdef` check** to make a stubborn poster render.
- **Do not turn on `POSTER_ARABIC_ENABLED` in production** without rendering
  the proofs in `docs/poster-samples/proofs/` and reading them first.

## Regenerating the proofs

```bash
POSTER_ARABIC_ENABLED=true npx tsx scripts/render-arabic-proofs.mts
```

Three posters land in `docs/poster-samples/proofs/`: a short dua containing
lam-alef, an ayah with full diacritics, and an Arabic block alongside an
English citation. Read them. "It rendered" is not "it is correct" — that
mistake is what put reversed, unjoined Arabic on these posters for months.
