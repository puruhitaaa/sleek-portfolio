import { PostDetail } from "./_components/PostDetail";
import { PostBreadcrumb } from "./_components/PostBreadcrumb";
import { api } from "@/trpc/server";

export default async function PostDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const post = await api.post.detail({ id: params.id });

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
