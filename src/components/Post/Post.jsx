import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { DeleteForever, Report, Save, Share, ThumbDown } from "@material-ui/icons"
import { FaHeart, FaLock } from "react-icons/fa";
import {
  PostContainer,
  PostWrapper,
  PostTop,
  PostCenter,
  PostTopLeft,
  PostTopRight,
  ProfileUsername,
  PostDate,
  PostText,
  PostImage,
  PostBottom,
  PostBottomLeft,
  PostBottomRight,
  CommentHeader,
  LikeCounter,
  PostVideo,
  PostSidebar,
  PostSidebarWrapper,
  PostSidebarItem,
  PostSidebarText,
  SpammedPost,
  SpamText,
} from "./PostStyles";
import { format } from "timeago.js"
import { getUser } from "../services/userService";
import postapi from "../services/PostsService";
import axios from "axios";
import PostComments from "./PostComments";
import comment from "../services/Comments";
import DottedMenu from "../common/DottedMenu";
import { Link, useLocation } from "react-router-dom";
import logger from "../services/logger";
import asyncErrors from "../middleware/AsyncErrors";
import { getStorage, ref, deleteObject } from "firebase/storage";

const Post = ({ post, reportPost, theme, currentuser }) => {
  const { _id, userId, description, media, likes, createdAt, spam } = post

  const admin = currentuser._id === userId;

  const [postLikes, setLikes] = useState(likes.length);
  const [user, setUser] = useState([]);
  const [liked, setLiked] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [comments, setComments] = useState([]);
  const location = useLocation().pathname.split("/")[1];
  const path = location === "/savedposts";
  const path1 = location === "profile";


  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const getData = asyncErrors(async () => {
      const { data: user } = await getUser(userId, { cancelToken: cancelToken.token });
      setUser(user);
    }
    )
    getData();

    return () => {
      cancelToken.cancel();
    }

  }, [userId]);


  useEffect(() => {
    function checkDbLike() {
      setLiked(() => {
        return likes.find((like) => like === currentuser._id);
      });
    }
    checkDbLike();
  }, [likes, currentuser._id])


  useEffect(() => {
    let unsubscribed = false;

    const populateComments = asyncErrors(async () => {
      if (!unsubscribed) {
        const { data } = await comment.postComments(_id);
        setComments(data);
      }
    })
    populateComments();




    return () => {
      unsubscribed = true
    }



  }, [_id])


  //delete comment

  const deleteComment = async (id) => {
    try {
      setComments(comments.filter(comment => comment._id !== id));
      await comment.deleteComment(id);
    } catch (error) {
      setComments(comments);
      logger.log(error);
    }
  }

  //savePost
  const savePost = asyncErrors(async () => {
    setOpenSidebar(false);
    await postapi.savePost(_id, currentuser._id);
    toast.info("Post saved successfully");
  })



  const handleLike = async () => {
    if (liked) {
      setLikes(postLikes - 1);
      setLiked(false);
      try {
        await postapi.unlikePost(_id, currentuser._id);
      } catch (error) {
        logger.log(error);
      }
    } else if (!liked) {
      setLiked(true);
      setLikes(postLikes + 1);
      try {
        await postapi.likePost(_id, currentuser._id);
      } catch (error) {
        logger.log(error);
      }
    }
  };

  //delete post 
  const handleDelete = asyncErrors(async (post) => {
    if (admin) {
      await postapi.deletePost(post._id);

      if (post.media) {


        const storage = getStorage();


        // Create a reference to the file to delete
        const desertRef = ref(storage, media.file);

        // Delete the file
        deleteObject(desertRef).then(() => {
          // File deleted successfully


        }).catch((error) => {
          // Uh-oh, an error occurred!
        });

      }
    } else {
      await postapi.deleteSavedPost(post._id, currentuser._id);
    }

    window.location.reload();
  })
  //delete shared post 
  const removeSharedPost = asyncErrors(async (id) => {

    await postapi.deletesharedPost(id, currentuser._id);

    window.location.reload();

  })

  //share post 
  const sharePost = asyncErrors(async (post) => {
    await postapi.sharePost(_id, currentuser._id);
    toast.success("post shared successfully");
  })




  console.count('postComponent');
  return (
    <PostContainer className={`${theme}`} id={_id}>
      {openSidebar && <PostSidebar theme={theme}>
        <PostSidebarWrapper>
          {(!path && !admin) && <PostSidebarItem onClick={savePost}><Save />
            <PostSidebarText>
              Save Post
            </PostSidebarText>
          </PostSidebarItem>}
          {(!path && !admin) && <PostSidebarItem onClick={() => reportPost(_id)}><Report />
            <PostSidebarText>
              Report this Post
            </PostSidebarText>
          </PostSidebarItem>}
          {!admin && <PostSidebarItem onClick={sharePost}><Share />
            <PostSidebarText>
              Share Post
            </PostSidebarText>
          </PostSidebarItem>}
          {admin && <PostSidebarItem onClick={() => handleDelete(post)}><DeleteForever />
            <PostSidebarText>
              Delete Post
            </PostSidebarText>
          </PostSidebarItem>}
          {path && <PostSidebarItem onClick={() => handleDelete(post)}><DeleteForever />
            <PostSidebarText>
              Remove this post
            </PostSidebarText>
          </PostSidebarItem>}
          {(path1 && !admin) && <PostSidebarItem onClick={() => removeSharedPost(_id)}><DeleteForever />
            <PostSidebarText>
              Remove this post
            </PostSidebarText>
          </PostSidebarItem>}
        </PostSidebarWrapper>
      </PostSidebar>
      }
      <PostWrapper>
        <PostTop>
          <PostTopLeft>
            <Link to={`/profile/${user._id}`} className='link'>
              <img
                className="profileImg"
                src={user.profilePicture}
                alt={user.username}
              />
              <ProfileUsername>{user.username}</ProfileUsername>
            </Link>
            <PostDate>{format(createdAt)}</PostDate>
          </PostTopLeft>
          <PostTopRight onClick={() => setOpenSidebar(!openSidebar)}>
            <DottedMenu theme={theme} />
          </PostTopRight>
        </PostTop>
        <PostCenter onClick={() => setOpenSidebar(false)} >

          <PostText>{description}</PostText>
          {spam ? <SpammedPost><FaLock /><SpamText>This media is reported to be nuisance</SpamText></SpammedPost> :
            <div>
              {media && <div>


                {media.name === "video" ? (
                  <PostVideo src={media.file} controls></PostVideo>
                ) : (
                  <PostImage src={media.file} alt={media.name} />
                )}
              </div>}
            </div>}
        </PostCenter>
        <PostBottom onClick={() => setOpenSidebar(false)} >
          <PostBottomLeft>
            <div className="icons-cover">

              <ThumbDown onClick={handleLike}
                style={{ color: "orangered", fontSize: "20px", cursor: "pointer" }} />
            </div>

            <div className="icons-cover m-1">

              <FaHeart onClick={handleLike} style={{
                color: "red",
                margin: "10px",
                fontSize: "20px",
                cursor: "pointer",
              }} />
            </div>
            <LikeCounter>
              {postLikes > 0 ? postLikes : null}
            </LikeCounter>
          </PostBottomLeft>
          <PostBottomRight>
            <CommentHeader theme={theme} onClick={() => setOpenComment(!openComment)}>{comments?.length > 0 && comments?.length} comments</CommentHeader>
          </PostBottomRight>
        </PostBottom>

        {openComment && <PostComments currentuser={currentuser} theme={theme} id={_id} onClick={() => setOpenSidebar(!openSidebar)} comments={comments} setComments={setComments} onDelete={deleteComment} spam={spam} />}
      </PostWrapper>

    </PostContainer>
  );
};

export default Post;
