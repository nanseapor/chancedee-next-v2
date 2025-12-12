import getAssets from "@/lib/assets";
import { getGlobalMetadata } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
import { headers } from "next/headers";
import { ImageResponse } from "next/og";

export const contentType = "image/png";

export default async function Image({
  params,
}: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = await params;
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  const post = await getPostBySlug(postSlug, {
    fields: ["title", "meta_title", "meta_description", "featured_image"],
  });
  const ogImageSrc = post.open_graph_image
    ? getAssets(post.open_graph_image)
    : global.openGraph.images[0];

  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <img
        src={ogImageSrc}
        alt={global.openGraph.title}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
