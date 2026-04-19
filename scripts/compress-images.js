const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT_DIR = path.join(__dirname, "..", "images-to-compress");
const OUTPUT_DIR = path.join(INPUT_DIR, "compressed");
const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
const SKIP_BELOW_BYTES = 1024 * 1024;
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = fs.readdirSync(INPUT_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => EXTS.has(path.extname(name).toLowerCase()));

  if (files.length === 0) {
    console.log("No images to process.");
    return;
  }

  let processed = 0;
  let skipped = 0;
  for (const name of files) {
    const srcPath = path.join(INPUT_DIR, name);
    const base = path.basename(name, path.extname(name));
    const destPath = path.join(OUTPUT_DIR, `${base}.jpg`);

    const srcSize = fs.statSync(srcPath).size;

    if (srcSize < SKIP_BELOW_BYTES) {
      console.log(
        `${name}  ${formatBytes(srcSize)}  — skipped (already under 1 MB)`
      );
      skipped++;
      continue;
    }

    try {
      await sharp(srcPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(destPath);
    } catch (err) {
      console.error(`  ${name}: failed — ${err.message}`);
      continue;
    }

    const destSize = fs.statSync(destPath).size;
    const savingPct = ((1 - destSize / srcSize) * 100).toFixed(1);
    console.log(
      `${name}  ${formatBytes(srcSize)} -> ${formatBytes(
        destSize
      )}  (${savingPct}% saved)`
    );
    processed++;
  }

  console.log(
    `\nProcessed ${processed}/${files.length} image(s). Skipped ${skipped}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
