# Content studio: cloud workflow

This guide supersedes the browser-only storage and publishing descriptions in studio-preview.md. Authentication setup remains in studio-auth-setup.md.

## Review this bundle

Keep your existing `.env.local`. Install with `npm ci`, run `npm run dev`, and open `/admin`. Use your existing Sarra account. No password or service-role key is included in this bundle.

The cloud schema and cleanup migrations have already been applied to the connected Supabase project. Do not reapply them. No real projects or images were published during implementation.

1. Create a test project and upload a cover and a drawing. Save draft, reload, and confirm both remain.
2. Complete its title, URL name, overview and image descriptions. Turn off the sample-content flag after reviewing the content.
3. Preview, then explicitly publish. Open `/work` and its detail page; check drawing zoom and mobile layout.
4. Edit and save the title. The public version should retain the old title until you publish again.
5. Archive the test project. It should disappear from public pages while its draft remains available.

Publishing changes the shared cloud database immediately, including any other deployment connected to it. The current static main branch will use cloud content only after this code is deployed. Review locally before merging or deploying.

## Upload correction and guided editor

The upload completion check now reads the installed Storage SDK’s top-level `size` and `contentType` fields. Previously, valid uploaded files were rejected because the check looked only inside `metadata`. The corrected check still rejects missing files, mismatched sizes and unsupported types. Existing failed uploads remain private and can later be removed through unused-upload cleanup.

Project entry now uses four steps: Basics, Cover, Story and Images. Switching steps retains working values but does not save them; use Save draft. Per-image descriptions, captions and display controls are collapsed until opened.

## Everyday editing

- **Save draft** stores private working content and prepared images in the cloud. It does not update a published snapshot.
- **Publish changes** copies the saved draft into the public version. Save first. Concurrent edits from another tab are rejected rather than silently overwritten.
- **Import existing projects** creates editable drafts linked to the existing placeholder slots. Publish each reviewed replacement when ready.
- **Account & backup → import browser drafts** copies older drafts from this browser into cloud storage. Original browser data is retained; existing cloud IDs are skipped.
- **Archive** hides the published project, including its original placeholder slot. Restore returns it to a draft; publish explicitly to show it again.
- **Delete** removes an unpublished draft permanently. Archive published projects first. Removing a replacement does not resurrect the original sample slot.
- **Clean unused uploads** permanently removes up to 100 unreferenced uploads older than two hours. Images referenced by any saved draft or active publication are retained. Save ongoing edits first.

## Images and architecture projects

Maximum: 40 images per project including the cover. Each input image must be JPG, PNG or WebP, below 20 MB and 80 megapixels. Preparation normally produces WebP; browsers without WebP encoding support may fall back to PNG. Files are uploaded to Supabase storage, not committed to Git.

Photographs and renders are resized to at most 1,920 pixels on the longest edge. Drawings use at most 3,200 pixels and higher encoding quality. Keep original files separately. Fine architectural text must be checked at the prepared resolution; this is not an original-resolution archival system.

Suggested story: exterior cover → brief → exterior/interior renders → plans → sections/elevations → closing view. Choose drawing mode for plans, sections and elevations to preserve the whole sheet and enable the detailed viewer. Sections can use full-width, paired, gallery, drawing, or text-and-image layouts. No fixed image count is required beyond the cover for publishing.

Images load lazily where appropriate; responsive image derivatives are not generated in this version. Backup exports embed image data. Backup import currently accepts files up to 40 MB, so large collections should also retain their source assets outside the studio.

## Access and operational notes

Only the configured verified account with a studio_editors membership can use the studio. Draft database records and unreferenced images are private. Public snapshots and their referenced images are intentionally readable without login. Temporary signed image URLs can remain usable for up to five minutes after archiving; previously downloaded copies cannot be revoked.

Production requires the same three environment settings documented in studio-auth-setup.md. Do not expose passwords or service-role keys. Password recovery and MFA are not implemented in this studio interface.

Supabase's security advisor currently reports leaked-password protection disabled. Review this setting before production use: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Database and storage checks reported no other security advisories at implementation time.

Validation completed: production build, automated tests, and rolled-back database checks covering draft privacy, publication snapshots, stale revisions, archive visibility and unrelated-user access. A signed-in browser upload/publish cycle still requires the owner's review; no password was requested or used.
