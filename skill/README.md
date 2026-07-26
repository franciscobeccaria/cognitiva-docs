# Cognitiva skill

A Claude Code / Agent skill that turns any input (a topic, markdown, or existing content) into a **Cognitiva Artifact**: a self-contained HTML doc with the 3-column reader layout, scroll-spy TOC, light/dark, and a built-in settings panel (typeface + accent color).

## What's here

- `SKILL.md` - the skill definition (instructions + contract).
- `assets/cognitiva-shell.html` - the reader shell the skill fills with content. Native fonts only, so it works inside the Claude Artifact CSP with no network.

## Install

Copy this folder into your Claude Code skills directory:

```bash
cp -r skill ~/.claude/skills/cognitiva
```

Then, in Claude Code or Claude.ai, ask for a "Cognitiva artifact" of anything and the skill fires.

## Use

- "Make a Cognitiva artifact about X"
- "Turn this markdown into a Cognitiva doc"
- "Wrap this in Cognitiva"

Default output is the Artifact. Ask for "just the markdown" if you want raw markdown instead.
