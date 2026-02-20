// Remove line-identifying unique hashes on text getting back out of Gemini-CLI file-editing tools
// Also supports range-based replacement instructions: REPLACE FROM <anchor> TO <anchor> WITH:
const fs = require('fs');

// Match either a 3-char hash OR the "emp" marker
const prefixPattern = /^\d+°([a-z0-9]{3}|emp)\|/gm;
const rangePattern = /^\s*REPLACE FROM\s+(\d+°([a-z0-9]{3}|emp)\|)\s+TO\s+(\d+°([a-z0-9]{3}|emp)\|)\s+WITH:\s*$/i;

function hashLine(line, index) {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  if (trimmed === "") {
    return `${lineNum}°emp|${line}`;
  }

  // Deterministic 32-bit hash
  let hashInt = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hashInt = ((hashInt << 5) - hashInt) + trimmed.charCodeAt(i);
    hashInt |= 0;
  }
  const hashStr = Math.abs(hashInt).toString(36).substring(0, 3).padEnd(3, '0');
  
  return `${lineNum}°${hashStr}|${line}`;
}

function resolveRange(startAnchor, endAnchor, filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const hashed = hashLine(lines[i], i);
      if (hashed.startsWith(startAnchor)) {
        startIndex = i;
      }
      if (hashed.startsWith(endAnchor)) {
        endIndex = i;
        if (startIndex !== -1) break; // Found both
      }
    }

    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      return lines.slice(startIndex, endIndex + 1).join('\n');
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

function clean(text, filePath) {
  if (typeof text !== 'string') return text;
  
  const rangeMatch = text.trim().match(rangePattern);
  if (rangeMatch && filePath) {
    const resolved = resolveRange(rangeMatch[1], rangeMatch[3], filePath);
    if (resolved !== null) return resolved;
  }

  return text.replace(prefixPattern, "");
}

const input = fs.readFileSync(0, 'utf-8');

try {
  const json = JSON.parse(input);
  
  if (json.tool_input) {
    const new_tool_input = { ...json.tool_input };
    const filePath = new_tool_input.file_path;
    let modified = false;

    if (new_tool_input.content) {
      new_tool_input.content = clean(new_tool_input.content, filePath);
      modified = true;
    }
    if (new_tool_input.old_string) {
      new_tool_input.old_string = clean(new_tool_input.old_string, filePath);
      modified = true;
    }
    if (new_tool_input.new_string) {
      new_tool_input.new_string = clean(new_tool_input.new_string, filePath);
      modified = true;
    }

    if (modified) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          tool_input: new_tool_input
        }
      }));
    } else {
      process.stdout.write(JSON.stringify({ decision: "allow" }));
    }
  } else {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
  }
} catch (e) {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
}
