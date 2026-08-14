import { PostDetail } from "./_components/PostDetail";
import { PostBreadcrumb } from "./_components/PostBreadcrumb";
import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function PostDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, params.id))
    .limit(1)
    .then((res) => res[0]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PostBreadcrumb title={post.title} />
      <PostDetail
        title={post.title}
        content={post.content}
        createdAt={new Date(post.createdAt)}
      />
    </div>
  );
}
