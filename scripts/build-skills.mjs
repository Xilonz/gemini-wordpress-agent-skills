import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const SKILLS_DEST = path.join(REPO_ROOT, "skills");

function parseArgs(argv) {
    const args = { source: null };
    for (const a of argv) {
        if (a.startsWith("--source=")) args.source = a.slice("--source=".length);
    }
    return args;
}

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(content).digest("hex");
}

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const ent of entries) {
        const srcPath = path.join(src, ent.name);
        const destPath = path.join(dest, ent.name);

        if (ent.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (ent.isFile()) {
            // Simple hash check to avoid touching files if unchanged (preserves mtime)
            if (fs.existsSync(destPath)) {
                const srcHash = getFileHash(srcPath);
                const destHash = getFileHash(destPath);
                if (srcHash === destHash) continue;
            }
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.source) {
        console.error("Usage: node scripts/build-skills.mjs --source=<path-to-agent-skills-repo/skills>");
        process.exit(1);
    }

    const sourceSkillsDir = path.resolve(process.cwd(), args.source);

    console.log(`Building skills from: ${sourceSkillsDir}`);
    console.log(`Destination: ${SKILLS_DEST}`);

    if (!fs.existsSync(sourceSkillsDir)) {
        console.error(`Source directory not found: ${sourceSkillsDir}`);
        process.exit(1);
    }

    // Get list of valid skills (folders with SKILL.md)
    const skillDirs = fs.readdirSync(sourceSkillsDir, { withFileTypes: true })
        .filter(ent => ent.isDirectory() && fs.existsSync(path.join(sourceSkillsDir, ent.name, "SKILL.md")))
        .map(ent => ent.name);

    if (!fs.existsSync(SKILLS_DEST)) {
        fs.mkdirSync(SKILLS_DEST);
    }

    // Sync Skills
    for (const skillName of skillDirs) {
        const src = path.join(sourceSkillsDir, skillName);
        const dest = path.join(SKILLS_DEST, skillName);
        copyDir(src, dest);
    }

    // Cleanup Stale Skills
    if (fs.existsSync(SKILLS_DEST)) {
        const existingDestSkills = fs.readdirSync(SKILLS_DEST);
        for (const skillName of existingDestSkills) {
            if (!skillDirs.includes(skillName)) {
                console.log(`Removing stale skill: ${skillName}`);
                fs.rmSync(path.join(SKILLS_DEST, skillName), { recursive: true, force: true });
            }
        }
    }

    console.log("Build complete.");
}

main();
