# Project Wiki (local copy)

This folder contains a local copy of the repository's wiki pages. You can edit these files here and then publish them to the GitHub wiki remote if you want the pages visible as the project's GitHub Wiki.

Why keep a local copy?
- Easier code review in PRs before publishing to the public wiki.
- Keep documentation versioned alongside code.
- CI can verify docs or build a docs site from these sources.

How this folder maps to the GitHub wiki
- The GitHub wiki is its own git repository at `https://github.com/<owner>/<repo>.wiki.git`.
- To publish these files, clone the wiki repo, copy the files from this folder into it, commit and push. See `PUBLISH_TO_GITHUB_WIKI.md` for exact commands.

Structure
- Home.md — Overview and links
- Getting-Started.md — Local dev setup and common commands
- Architecture.md — High-level architecture and conventions
- Image-Upload.md — ImageService usage, validation and controller patterns
- Cache-Management.md — CacheService usage and cache key patterns
- Testing.md — Running tests, the new avatar upload tests

Please review and update content before publishing.
