import Comment from "../models/CommentModel"
import Post from "../models/PostModel"

export const getUserPosts = async (userId: string) => {
  const result: any[] = []
  try {
    const posts = await Post.find({ userId: userId })

    await Promise.all(
      (posts as Array<any>).map(async (post) => {
        const comments = await Comment.find({
          postId: post._id,
        }).sort({ createdAt: -1 })
        const postData = post._doc
        result.push({
          ...postData,
          comments,
        })
      })
    )
  } catch (error) {
    console.log(error)
  }
  return result
}
