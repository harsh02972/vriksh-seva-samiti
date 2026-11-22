import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, Empty, LoadError, PageHeader } from "@/components/admin/ui";
import { ArrowDown, ArrowUp, Leaf } from "@/components/icons";
import { requireAdmin } from "@/lib/admin/auth";
import { GALLERY_CATEGORIES, labelOf, shortDate, todayIST } from "@/lib/admin/labels";
import { mediaUrl } from "@/lib/supabase/env";
import { addGalleryPhotos, deleteGalleryPhoto, moveGalleryPhoto, toggleHomePhoto, updateGalleryPhoto } from "./actions";
import { AddPhotosForm, EditPhotoForm } from "./GalleryForms";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: photos, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order")
    .order("taken_on", { ascending: false, nullsFirst: false });
  const homeCount = (photos ?? []).filter((p) => p.show_on_home && p.published).length;

  return (
    <>
      <PageHeader
        title="Gallery"
        titleMr="फोटो गॅलरी"
        intro={`वरचा फोटो वेबसाइटवर आधी दिसतो. “Show on Home” असलेले फोटो मुख्य पानावर दिसतात (सध्या ${homeCount}, जास्तीत जास्त ८). · The top photo is shown first. Photos marked “Show on Home” appear on the Home page (now ${homeCount}, max 8 shown).`}
      />

      <Card title="Upload photos · फोटो अपलोड">
        <AddPhotosForm action={addGalleryPhotos} today={todayIST()} />
      </Card>

      <Card title={`All photos · सर्व फोटो (${photos?.length ?? 0})`}>
        {error ? (
          <LoadError what="photos" />
        ) : !photos?.length ? (
          <Empty>No photos yet. Until you upload some, the website shows sample photos.</Empty>
        ) : (
          <ol className="m-0 flex flex-col gap-4">
            {photos.map((p, i) => (
              <li key={p.id} className="flex flex-col gap-4 rounded-2xl border border-line p-3 sm:flex-row sm:p-4">
                <div className="flex shrink-0 flex-col gap-2 sm:w-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                  <img src={mediaUrl(p.storage_path)} alt={p.caption_mr} className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="grey">#{i + 1}</Badge>
                    {p.show_on_home && <Badge>Home</Badge>}
                    {!p.published && <Badge tone="note">Hidden</Badge>}
                    <Badge tone="grey">{labelOf(GALLERY_CATEGORIES, p.category).split(" · ")[0]}</Badge>
                    {p.taken_on && <span className="text-xs text-muted">{shortDate(p.taken_on)}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ConfirmButton action={moveGalleryPhoto.bind(null, p.id, -1)} variant="plain">
                      <ArrowUp size={18} /> <span className="sr-only">Move up</span>
                    </ConfirmButton>
                    <ConfirmButton action={moveGalleryPhoto.bind(null, p.id, 1)} variant="plain">
                      <ArrowDown size={18} /> <span className="sr-only">Move down</span>
                    </ConfirmButton>
                    <ConfirmButton action={toggleHomePhoto.bind(null, p.id, !p.show_on_home)} variant="plain">
                      <Leaf size={18} /> {p.show_on_home ? "Remove from Home" : "Show on Home"}
                    </ConfirmButton>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <EditPhotoForm action={updateGalleryPhoto.bind(null, p.id)} values={p} />
                  <div className="self-start">
                    <ConfirmButton action={deleteGalleryPhoto.bind(null, p.id)} confirmText="Delete this photo from the gallery?" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
