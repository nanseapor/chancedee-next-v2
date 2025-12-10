import type { Post } from "@/lib/posts";
import { BookmarkButton } from "../ui/bookmark-button";

const BookmarkComponent = ({ blog }: { blog: Post }) => {
  return <BookmarkButton blog={blog} />;
};

export default BookmarkComponent;
