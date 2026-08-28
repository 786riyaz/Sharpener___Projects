/**
 * Project File Merger
 * -------------------
 * Scans the entire project directory recursively
 * and merges all files into "Merged Files.txt"
 *
 * Supports ignore rules using merge-ignore.txt
 */

const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

const ROOT_DIR = process.cwd();
console.log("Root DIR :: ", ROOT_DIR);

const Combined_Path = ROOT_DIR + `\\00_File_Merger_Tool\\MergeCodeFile`;
console.log("Combined DIR :: ", Combined_Path);

const OUTPUT_FILE = path.join(ROOT_DIR, "Expanse Tracker Complete Code.txt");
const IGNORE_FILE = path.join(Combined_Path, "merge-ignore.txt");

const ig = ignore();

/**
 * Load ignore patterns
 */
function loadIgnoreRules() {
  if (fs.existsSync(IGNORE_FILE)) {
    const content = fs.readFileSync(IGNORE_FILE, "utf8");
    ig.add(content.split(/\r?\n/));
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (ig.ignores(relativePath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else {
      fileList.push(relativePath);
    }
  }

  return fileList;
}

/**
 * Merge files into one output file
 */
function mergeFiles(files) {
  const writeStream = fs.createWriteStream(OUTPUT_FILE);

  for (const file of files) {
    const fullPath = path.join(ROOT_DIR, file);

    try {
      const content = fs.readFileSync(fullPath, "utf8");

      writeStream.write(`\n// ${file}\n`);
      writeStream.write(content);
      writeStream.write("\n====================================================================");
    } catch (err) {
      console.log(`Skipping binary or unreadable file: ${file}`);
    }
  }

  writeStream.end();
}

/**
 * Main Execution
 */
function main() {
  console.log("Loading ignore rules...");
  loadIgnoreRules();

  console.log("Scanning project files...");
  const files = scanDirectory(ROOT_DIR);

  console.log(`Found ${files.length} files`);

  console.log("Merging files...");
  mergeFiles(files);

  console.log("Complete Code.txt created successfully!");
}

main();
