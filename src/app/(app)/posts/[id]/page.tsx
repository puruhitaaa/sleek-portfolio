import { client } from "@/lib/client"
import { PostDetail } from "./_components/PostDetail"
import { PostBreadcrumb } from "./_components/PostBreadcrumb"

export default async function PostDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const post = await client.posts.detail
    .$get({
      id: parseInt(params.id),
    })
    .then((res) => res.json())

  return (
    <div className='space-y-6'>
      <PostBreadcrumb title={post.title} />
      <PostDetail
        title={post.title}
        content={post.content}
        createdAt={new Date(post.createdAt)}
      />
    </div>
  )
}
