# LINE-HASHER MCP Server

Gemini CLI extension to improve the success rate of source-code changes.

## Description

- on read files, add °abc hashes at the end of each line
- on write files, use the hashes as markers to identify the line precisely, then remove the hashes 

## Inspiration

- https://blog.can.ac/2026/02/12/the-harness-problem/
- https://github.com/offline-ant/pi-hh-read

This has Gemini-CLI -specific improvements, related to its Read-File tool, etc.
