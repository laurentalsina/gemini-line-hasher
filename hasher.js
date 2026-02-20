// Uniquely mark every line of source code getting into Gemini-CLI file reading tools.
// Intercepting in BeforeTool allows us to provide a clean, unblocked response.
const fs = require('fs');
const path = require('path');

function hashLine(line, lineNum) {
  const trimmed = line.trim();
  if (trimmed === "") return `${lineNum}°emp|${line}`; 
  let hashInt = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hashInt = ((hashInt << 5) - hashInt) + trimmed.charCodeAt(i);
    hashInt |= 0;
  }
  const hashStr = Math.abs(hashInt).toString(36).substring(0, 3).padEnd(3, '0');
  return `${lineNum}°${hashStr}|${line}`;
}

const input = fs.readFileSync(0, 'utf-8');
try {
  const json = JSON.parse(input);
  const tool = json.tool_name;
  const args = json.tool_input;

  if (tool === 'read_file') {
    const filePath = args.file_path;
    if (!fs.existsSync(filePath)) {
        process.stdout.write(JSON.stringify({ decision: "allow" }));
        process.exit(0);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const allLines = content.split(/\r?\n/);
    const totalLines = allLines.length;
    
    const offset = args.offset || 0;
    const limit = args.limit || totalLines;
    const end = Math.min(offset + limit, totalLines);
    const linesToShow = allLines.slice(offset, end);

    let output = "";
    if (end < totalLines || offset > 0) {
        output += `IMPORTANT: The file content has been truncated.\n`;
        output += `Status: Showing lines ${offset + 1}-${end} of ${totalLines} total lines.\n`;
        output += `Action: To read more of the file, you can use the 'offset' and 'limit' parameters in a subsequent 'read_file' call.\n\n`;
        output += `--- FILE CONTENT (truncated) ---\n`;
    }

    output += linesToShow.map((line, i) => hashLine(line, offset + i + 1)).join('\n');

    // Return as a denial in BeforeTool to skip the real tool and provide our hashed version.
    // In many CLI versions, this is the only way to transform without "blocked" if done correctly.
    process.stdout.write(JSON.stringify({
      decision: "deny",
      reason: output
    }));
  } else {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
  }
} catch (e) {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
}
