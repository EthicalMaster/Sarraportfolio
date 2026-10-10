# Portfolio studio — local editing preview

This is the first review stage, not a production CMS. No sign-in, remote storage,
live publishing, or synchronisation with public project pages is enabled yet.

## Open it

Run `npm run dev` and append `/admin` to the local address printed by Vite.
Keep the development server bound to localhost; do not expose this unauthenticated
preview server to a public network. A production build returns 503 at `/admin`
and does not render the editor. There are no editing APIs in this version.

## Review the workflow

1. Choose **Try an example project** or **Add project**.
2. Edit the introduction, cover, role, overview, and approach.
3. Add sections: full image, paired images, text/image, drawing, or gallery.
4. Add JPG, PNG, or WebP files. Each input is limited to 20 MB. Raster uploads are
   prepared in the browser as WebP: 1,920 px longest edge for photographs, 3,200 px
   for drawing sections. Check small drawing labels before accepting the result.
   These are review defaults, not a final archival-original strategy.
5. Add captions and alternative descriptions; reorder sections/images using arrows.
6. Save draft, then preview. Open drawings for zoom controls, touch pinch and panning
   by scrolling the viewer. Images do not load into the live public gallery.
7. Try archive/restore, homepage selections, media overview, and backup export/import.

Drafts and prepared images live in IndexedDB on this browser and origin (including
port). Use the same localhost address each time. Nothing is uploaded. Clearing site
storage deletes these local copies. Account & backup exports saved drafts plus images
as JSON. Import adds independent drafts rather than overwriting existing work.
Export before clearing browser data. Original source images are not kept by the
preview; keep originals outside the editor. Uploading and drafting on a second device
will not show the first device's content.

The sidebar, typography and layout are deliberately related to the public portfolio.
Motion is limited to feedback. Responsive CSS is included; actual device visual review
is outstanding because the remote review browser cannot reach the local dev server.

## Before production editing is enabled

- Choose and configure the content backend, durable image storage, and recovery policy.
- Configure Sarra's verified account and any explicitly authorised maintenance account.
- Enforce permissions on the server and storage layer, not just the admin page.
- Store working drafts separately from published versions; expose no draft media publicly.
- Add safe private previews, publish/archive operations, and recoverable version history.
- Connect published content to Home, Work and project routes, with atomic publishing.
- Produce separate thumbnails, display images, and higher-resolution drawing assets.
- Finalise custom editor block rendering on public pages and its image viewer.
- Add server-side validation, upload constraints, concurrency checks, and referenced-media cleanup.
- Test unauthorised access, account recovery, quota errors, publishing rollback, and backups.

Do not describe this first-stage preview as a secure online dashboard or a completed CMS.

## Replacing the initial sample projects

Choose **Import existing projects** on the Projects screen. This copies the eight
public sample slots into editable local drafts, retaining their ordering, featured
selection, category, facts and text. Generated placeholder artwork is intentionally
not copied: add actual covers and project images in the editor.

A replacement draft records its original `sourceSlug`, separately from its editable
new title and proposed URL name. This will let the future publishing layer replace
that slot instead of adding a ninth project. Renaming a draft does not lose the link.
The final publishing implementation must also handle redirects if its URL changes.

Import is additive and repeat-safe: edited or archived replacement drafts are not
reset. **Start with blank content** clears a draft's text and images while preserving
its slot assignment. Otherwise edit the sample content and use **Mark sample details
replaced** after reviewing it. Both require Save draft to persist the changes.

Copies do not inherit replacement assignments. Backup imports retain a source
assignment only when no other local draft already owns that slot; conflicting copies
are detached. Export backups before moving devices or clearing browser storage.
Saving a draft still does not change any public page. Secure storage and live
publishing remain the next implementation stage.
