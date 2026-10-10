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
