import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guideDir = path.join(rootDir, "guide");
const indexPath = path.join(guideDir, "index.md");
const outputPath = path.join(rootDir, "modern-frontend-guide.md");

const toPosix = (value) => value.split(path.sep).join("/");

const readMarkdown = async (filePath) => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n/g, "\n").trimEnd();
};

const listMarkdownFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    }),
  );

  return nested.flat();
};

const linkToFilePath = (link) => {
  const normalized = link.replace(/\/$/, "/index").replace(/\.md$/, "");
  return path.join(rootDir, `${normalized.slice(1)}.md`);
};

const indexContent = await readMarkdown(indexPath);
const linkedGuidePaths = [...indexContent.matchAll(/\[[^\]]+\]\((\/guide\/[^)#?]+)[^)]*\)/g)]
  .map((match) => linkToFilePath(match[1]));

const allGuidePaths = (await listMarkdownFiles(guideDir)).sort((a, b) =>
  toPosix(path.relative(rootDir, a)).localeCompare(toPosix(path.relative(rootDir, b))),
);

const orderedPaths = [indexPath, ...linkedGuidePaths];
const seen = new Set(orderedPaths.map((filePath) => path.resolve(filePath)));
const unlinkedPaths = allGuidePaths.filter((filePath) => !seen.has(path.resolve(filePath)));
const filesToMerge = [...orderedPaths, ...unlinkedPaths];
const allKnown = new Set(allGuidePaths.map((filePath) => path.resolve(filePath)));
const missingPaths = filesToMerge.filter((filePath) => !allKnown.has(path.resolve(filePath)));

if (missingPaths.length > 0) {
  const missingList = missingPaths
    .map((filePath) => `- ${toPosix(path.relative(rootDir, filePath))}`)
    .join("\n");
  throw new Error(`Guide index links point to missing files:\n${missingList}`);
}

const generatedAt = new Date().toISOString();
const parts = [
  "# 现代前端开发指南合订版",
  "",
  `> Generated from \`guide/**/*.md\` at ${generatedAt}.`,
  "",
];

for (const filePath of filesToMerge) {
  const relativePath = toPosix(path.relative(rootDir, filePath));
  parts.push("---", "", `<!-- Source: ${relativePath} -->`, "", await readMarkdown(filePath), "");
}

if (unlinkedPaths.length > 0) {
  const unlinkedList = unlinkedPaths
    .map((filePath) => `- ${toPosix(path.relative(rootDir, filePath))}`)
    .join("\n");
  console.warn(`Merged guide files not listed in guide/index.md:\n${unlinkedList}`);
}

await writeFile(outputPath, `${parts.join("\n").trimEnd()}\n`, "utf8");

console.log(`Merged ${filesToMerge.length} files into ${toPosix(path.relative(rootDir, outputPath))}`);
