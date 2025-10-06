// lib/markdown.ts
export function normalizeRawg(md: string) {
    // Add missing space after hashes: ###Plot -> ### Plot
    md = md.replace(/^(#{1,6})([^\s#])/gm, (_, h, c) => `${h} ${c}`);
    // Ensure a blank line before headings
    md = md.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    return md.trim();
}
