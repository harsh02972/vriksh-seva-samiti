import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { removeVideo, saveVideo } from "./actions";
import { VideoForm } from "./VideoForm";

export const metadata: Metadata = { title: "Video" };

export default async function VideoAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: v } = await supabase.from("featured_video").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <PageHeader
        title="Featured video"
        titleMr="मुख्य व्हिडिओ"
        intro="मुख्य पानावरील २०–२५ सेकंदांचा व्हिडिओ. · The short video on the Home page."
      />
      {v?.video_path && (
        <p className="m-0 flex flex-wrap gap-2">
          <Badge>{Number(v.duration_sec).toFixed(1)} s</Badge>
          <Badge tone="grey">{((v.video_bytes ?? 0) / 1048576).toFixed(1)} MB</Badge>
          {v.video_width && <Badge tone="grey">{v.video_width}×{v.video_height}</Badge>}
        </p>
      )}
      <Card>
        <VideoForm action={saveVideo} values={v} />
      </Card>
      {v?.video_path && (
        <Card title="Remove video · काढून टाका" className="border-[#F0C9BF]">
          <p className="m-0 mb-3 text-muted">The Home page will go back to the built-in sample video section.</p>
          <ConfirmButton action={removeVideo} confirmText="Remove the video from the website?" />
        </Card>
      )}
    </>
  );
}
