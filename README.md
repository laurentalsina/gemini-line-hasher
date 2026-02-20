# LINE-HASHER MCP Server

Gemini CLI extension to improve the success rate of source-code changes. Saves time and tokens.

## Description

- on read files, add °abc hashes at the start of each line
- on write files, use the hashes as markers to identify the line precisely, then remove the hashes 

## Usage

- Add this to your GEMINI.md:

   ### Code Editing Protocol
   We use an advanced **Code Anchoring** protocol. All lines follow: `[Line]°[Hash]|[Code]`
   *   **Separator:** The `|` character. Left is the anchor; right is the source code.
   *   **Instructions:**
       REPLACE FROM `9°4s2|` TO `11°s53|` WITH:
       `[New code without prefixes or pipes]`
   ### Do not use shell tools like grep and cat
   Use read_file so the line-hasher extension can provide the anchors you need to modify files reliably.

- Once installed use the CLI as normal and notice the higher success rate of its code edit attempts.

## Installation

Simplest is to activate the extension by linking the local version so changes take effect
   gemini extensions link <path-to>/gemini-line-hasher

List extensions
   gemini extensions list (shows ID and status)

Enable
   gemini extensions enable gemini-line-hasher

Hooks are loaded at the start of a session, restart the CLI for changes to take effect.

## Inspiration & notes

This has Gemini CLI specific improvements, related to its Read-File tool, the treatment of empty lines, a longer hash length, etc.
Note that "Tool execution blocked:" is not a problem, but a side effect of the hook blocking reads to add hashes. 

But the original idea, and batch-testing that suspended his Gemini account... is from:
- https://blog.can.ac/2026/02/12/the-harness-problem/
- https://github.com/offline-ant/pi-hh-read

