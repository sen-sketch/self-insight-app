"use client";

import dynamic from "next/dynamic";

const PostPage = dynamic(
  () => import("@/components/post/PostPage").then((mod) => mod.PostPage),
  { ssr: false }
);

export default function Page() {
  return <PostPage />;
}
