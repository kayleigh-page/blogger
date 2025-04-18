"use client";

import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
//import Quill from "quill";
//import "quill/dist/quill.snow.css";
let Quill;

import ProtectedRoute from "@/components/ProtectedRoute";

export default function BlogpostsPage() {
  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;

  // States for adding a new blog post
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [siteId, setSiteId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // States for editing a blog post
  const [editPost, setEditPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSiteId, setEditSiteId] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editPublishTime, setEditPublishTime] = useState("");
  const [editPublishDate, setEditPublishDate] = useState("");
  const [editImage, setEditImage] = useState("");
  const [imageFile, setImageFile] = useState(null); // Image file upload
  const [editImageCaption, setEditImageCaption] = useState("");
  const [editImageAbstract, setEditImageAbstract] = useState("");
  const [editImageAlternativeHeadline, setEditImageAlternativeHeadline] =
    useState("");
  const [editImageKeywords, setEditImageKeywords] = useState("");
  const [editTwitterLabel1, setEditTwitterLabel1] = useState("");
  const [editTwitterData1, setEditTwitterData1] = useState("");
  const [editTwitterLabel2, setEditTwitterLabel2] = useState("");
  const [editTwitterData2, setEditTwitterData2] = useState("");
  const [editArticleSection, setEditArticleSection] = useState("");
  const [editArticleTag1, setEditArticleTag1] = useState("");
  const [editArticleTag2, setEditArticleTag2] = useState("");
  const [editArticleTag3, setEditArticleTag3] = useState("");
  const [editArticleTag4, setEditArticleTag4] = useState("");
  const [editArticleTag5, setEditArticleTag5] = useState("");

  // State to keep track of the currently active site filter.
  const [activeSite, setActiveSite] = useState("All");




  /*
   * GET BLOG POSTS AND SITES
   ***************************/
  // GraphQL query to fetch the current user's blog posts.
  const GET_BLOGPOSTS_QUERY = `
    query getUserBlogPosts($limit: Int, $offset: Int) {
      getUserBlogPosts(limit: $limit, offset: $offset) {
        id
        title
        slug
        siteId
        content
        description
        keywords
        publishTime
        publishDate
        image
        imageCaption
        imageAbstract
        imageAlternativeHeadline
        imageKeywords
        twitterLabel1
        twitterData1
        twitterLabel2
        twitterData2
        articleSection
        articleTag1
        articleTag2
        articleTag3
        articleTag4
        articleTag5
      }
    }
  `;
  // GraphQL query to fetch the count of blog posts for the current user.
  const GET_BLOGPOSTS_COUNT_QUERY = `
    query getUserBlogPostsCount {
      getUserBlogPostsCount
    }
  `;
  // GraphQL query to fetch all sites for the current user.
  const GET_SITES_QUERY = `
    query getSites {
      getSites {
        id
        name
      }
    }
  `;

  // Fetch the total number of blog posts for pagination.
  useEffect(() => {
    const fetchTotalPosts = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query: GET_BLOGPOSTS_COUNT_QUERY }),
      });
      const json = await response.json();
      if (json.data) {
        setTotalPosts(json.data.getUserBlogPostsCount);
      }
    };

    fetchTotalPosts();
  }, [GET_BLOGPOSTS_COUNT_QUERY]);

  // Common fetcher function for SWR.
  const fetcher = async (query) => {
    const token = localStorage.getItem("token");
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ query }),
    });
    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  };

  // Fetch sites.
  const { data: sitesData, error: sitesError } = useSWR(
    GET_SITES_QUERY,
    fetcher
  );

const {
  data: postsData,
  error: postsError,
  mutate,
} = useSWR(
  {
    query: GET_BLOGPOSTS_QUERY,
    variables: {
      limit: postsPerPage,
      offset: (currentPage - 1) * postsPerPage,
    },
  },
  async ({ query, variables }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  }
);

  /*
   * ADD A BLOG POST
   ******************/
  // GraphQL mutation to add a new blog post.
  // This function is called when the form is submitted.
  const handleAddPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const query = `
      mutation addBlogPost($title: String!, $slug: String!, $siteId: String!) {
        addBlogPost(title: $title, slug: $slug, siteId: $siteId) {
          id
          title
          slug
        }
      }
    `;
    const variables = { title, slug, siteId };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query, variables }),
      });

      const json = await response.json();
      if (json.errors) {
        throw new Error(json.errors[0].message);
      } else {
        // Reset form fields after successful submission
        setTitle("");
        setSlug("");
        setSiteId("");
        mutate();
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };




  /*
   * EDIT A BLOG POST
   *******************/
  // Quill editor for rich text editing
  const quillRef = useRef(null);
/*
  // Set up the Quill editor when the component mounts or when editPost changes.
  useEffect(() => {
    const editorContainer = document.querySelector("#quillEditor");

    // Destroy the existing Quill instance if it exists
    if (quillRef.current) {
      quillRef.current.off("text-change"); // Remove the event listener
      quillRef.current = null; // Reset the reference
    }

    if (editorContainer) {
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"], // Formatting buttons
              [{ header: [2, 3, 4, 5, 6, false] }], // Header levels
              [{ list: "ordered" }, { list: "bullet" }], // Lists
              ["link", "image"], // Link and image buttons
            ],
            handlers: {
              image: () => handleImageUpload(quill),
            },
          },
        },
      });

      quill.on("text-change", () => {
        setEditContent(quill.root.innerHTML); // Save HTML content to state
      });

      quillRef.current = quill;
    }

    // Set the initial content for the editor
    if (quillRef.current) {
      quillRef.current.root.innerHTML = editContent || "<p><br></p>";
    }
  }, [editPost]);*/

  useEffect(() => {
    const setupQuill = async () => {
      const QuillModule = (await import("quill")).default;
      await import("quill/dist/quill.snow.css");

      const editorContainer = document.querySelector("#quillEditor");

      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }

      if (editorContainer) {
        const quill = new QuillModule(editorContainer, {
          theme: "snow",
          modules: {
            toolbar: {
              container: [
                ["bold", "italic", "underline", "strike"],
                [{ header: [2, 3, 4, 5, 6, false] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
              ],
              handlers: {
                image: () => handleImageUpload(quill),
              },
            },
          },
        });

        quill.on("text-change", () => {
          setEditContent(quill.root.innerHTML);
        });

        quillRef.current = quill;
        if (editContent) {
          quill.root.innerHTML = editContent;
        }
      }
    };

    setupQuill();
  }, [editPost]);

  // Image upload for Quill editor
  // This function is called when the user clicks the image button in the toolbar.
  // It opens a file input dialog, and when the user selects an image, it uploads the image to the server.
  // After the upload is complete, it inserts the image into the Quill editor.
  const handleImageUpload = async (quill) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();
          if (response.ok) {
            const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${data.filename}`;
            const range = quill.getSelection();
            quill.insertEmbed(range.index, "image", imageUrl); // Insert image into editor
          } else {
            console.error("Image upload failed:", data.message);
            alert("Image upload failed.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("An error occurred while uploading the image.");
        }
      }
    };
  };

  // Handle image upload for metadata image in form
  // This function is called when the user selects an image file for the blog post.
  // It sets the imageFile state with the selected file.
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Upload the image to the server and return the filename.
  // This function is called in the handleEditSubmit function when the user submits the edit form.
  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        return data.filename; // Assuming the backend returns the filename
      } else {
        console.error("Image upload failed:", data.message);
        alert("Image upload failed.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image.");
      return null;
    }
  };

  // When a blog post is clicked for editing, pre-populate the form fields with the post's data.
  const handleEditClick = (post) => {
    setEditPost(post);
    setEditTitle(post.title || "");
    setEditSlug(post.slug || "");
    setEditSiteId(post.siteId || "");
    setEditContent(post.content || "");
    setEditDescription(post.description || "");
    setEditKeywords(post.keywords || "");
    setEditPublishTime(post.publishTime || "");
    setEditPublishDate(post.publishDate || "");
    setEditImage(post.image || "");
    setEditImageCaption(post.imageCaption || "");
    setEditImageAbstract(post.imageAbstract || "");
    setEditImageAlternativeHeadline(post.imageAlternativeHeadline || "");
    setEditImageKeywords(post.imageKeywords || "");
    setEditTwitterLabel1(post.twitterLabel1 || "");
    setEditTwitterData1(post.twitterData1 || "");
    setEditTwitterLabel2(post.twitterLabel2 || "");
    setEditTwitterData2(post.twitterData2 || "");
    setEditArticleSection(post.articleSection || "");
    setEditArticleTag1(post.articleTag1 || "");
    setEditArticleTag2(post.articleTag2 || "");
    setEditArticleTag3(post.articleTag3 || "");
    setEditArticleTag4(post.articleTag4 || "");
    setEditArticleTag5(post.articleTag5 || "");
  };

  // Close the edit modal.
  // This function is called when the user clicks the cancel button in the edit form.
  const handleCancelEdit = () => {
    setEditPost(null);
  };

  // Handle the edit form submission.
  // This function is called when the user submits the edit form.
  // It uploads the image (if any), and then sends a GraphQL mutation to update the blog post.
  // After the update, it resets the form fields and refreshes the blog posts list.
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Upload the image and get the filename
    let uploadedFilename = editImage;
    if (imageFile) {
      uploadedFilename = await uploadImage();
      if (!uploadedFilename) {
        setLoading(false);
        return;
      }
    }

    // GraphQL mutation to update a blog post
    const UPDATE_BLOGPOST_MUTATION = `
      mutation updateBlogPost(
        $id: String!,
        $title: String!,
        $slug: String!,
        $siteId: String!,
        $content: String,
        $description: String,
        $keywords: String,
        $publishTime: String,
        $publishDate: String,
        $image: String,
        $imageCaption: String,
        $imageAbstract: String,
        $imageAlternativeHeadline: String,
        $imageKeywords: String,
        $twitterLabel1: String,
        $twitterData1: String,
        $twitterLabel2: String,
        $twitterData2: String,
        $articleSection: String,
        $articleTag1: String,
        $articleTag2: String,
        $articleTag3: String,
        $articleTag4: String,
        $articleTag5: String
      ) {
        updateBlogPost(
          id: $id,
          title: $title,
          slug: $slug,
          siteId: $siteId,
          content: $content,
          description: $description,
          keywords: $keywords,
          publishTime: $publishTime,
          publishDate: $publishDate,
          image: $image,
          imageCaption: $imageCaption,
          imageAbstract: $imageAbstract,
          imageAlternativeHeadline: $imageAlternativeHeadline,
          imageKeywords: $imageKeywords,
          twitterLabel1: $twitterLabel1,
          twitterData1: $twitterData1,
          twitterLabel2: $twitterLabel2,
          twitterData2: $twitterData2,
          articleSection: $articleSection,
          articleTag1: $articleTag1,
          articleTag2: $articleTag2,
          articleTag3: $articleTag3,
          articleTag4: $articleTag4,
          articleTag5: $articleTag5
        ) {
          id
          title
          slug
          siteId
          content
          description
          keywords
          publishTime
          publishDate
          image
          imageCaption
          imageAbstract
          imageAlternativeHeadline
          imageKeywords
          twitterLabel1
          twitterData1
          twitterLabel2
          twitterData2
          articleSection
          articleTag1
          articleTag2
          articleTag3
          articleTag4
          articleTag5
        }
      }
    `;

    // Prepare the variables for the mutation
    const variables = {
      id: editPost.id,
      title: editTitle,
      slug: editSlug,
      siteId: editSiteId,
      content: editContent,
      description: editDescription,
      keywords: editKeywords,
      publishTime: editPublishTime,
      publishDate: editPublishDate,
      image: uploadedFilename,
      imageCaption: editImageCaption,
      imageAbstract: editImageAbstract,
      imageAlternativeHeadline: editImageAlternativeHeadline,
      imageKeywords: editImageKeywords,
      twitterLabel1: editTwitterLabel1,
      twitterData1: editTwitterData1,
      twitterLabel2: editTwitterLabel2,
      twitterData2: editTwitterData2,
      articleSection: editArticleSection,
      articleTag1: editArticleTag1,
      articleTag2: editArticleTag2,
      articleTag3: editArticleTag3,
      articleTag4: editArticleTag4,
      articleTag5: editArticleTag5,
    };

    // Send the GraphQL mutation to update the blog post
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query: UPDATE_BLOGPOST_MUTATION, variables }),
      });

      const json = await response.json();
      if (json.errors) {
        throw new Error(json.errors[0].message);
      } else {
        setEditPost(null);
        await mutate();
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("An error occurred while updating the blog post.");
    }
  };




  /*
   * DELETE A BLOG POST
   *********************/
  // This function is called when the user clicks the delete button for a blog post.
  // It sends a GraphQL mutation to delete the blog post.
  // After deletion, it refreshes the blog posts list.
  const handleDelete = async (postId) => {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }
    
    // GraphQL mutation to delete a blog post
    try {
      const token = localStorage.getItem("token");
      const query = `
      mutation deleteBlogPost($id: String!) {
        deleteBlogPost(id: $id)
      }
    `;
      const variables = { id: postId };

      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query, variables }),
      });

      const json = await response.json();
      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      if (json.data.deleteBlogPost) {
        await mutate();
      } else {
        alert("Failed to delete the blog post.");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("An error occurred while deleting the blog post.");
    }
  };




  /*
   * RENDERING
   ************/
  // Check for errors and loading states
  // If there's an error fetching the blog posts or sites, display an error message.
  // If the data is still loading, display a loading message.
  if (postsError || sitesError) return <div>Error loading data.</div>;
  if (!postsData || !sitesData) return <div>Loading...</div>;

  const blogPosts = postsData.getUserBlogPosts || [];
  const sites = sitesData.getSites || [];

  // Filter blog posts by the currently active site filter.
  const filteredPosts =
    activeSite === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.siteId === activeSite);

  return (
    <ProtectedRoute>
      <main className="p-4">
        {/* Tab Navigation */}
        <div className="mb-4">
          <button
            key="all"
            onClick={() => setActiveSite("All")}
            className={`px-3 py-1 mr-2 rounded shadow-sm ${
              activeSite === "All"
                ? "bg-pink-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
            }`}
          >
            All
          </button>
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => setActiveSite(site.id)}
              className={`px-3 py-1 mr-2 rounded shadow-sm ${
                activeSite === site.id
                  ? "bg-pink-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>

        {/* Display Filtered Blog Posts */}
        <div className="grid grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div
              className="flex items-center bg-pink-50 rounded-md shadow-md"
              key={post.id}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${post.image}`}
                alt={post.imageAlternativeHeadline || "Blog post image"}
                className="h-[172px] w-auto"
              />
              <div className="p-3">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p>{post.description}</p>
                <div className="mt-2">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 cursor-pointer shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 cursor-pointer shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200 cursor-pointer"
          >
            Previous
          </button>
          <span className="mx-4">
            Page {currentPage} of {Math.ceil(totalPosts / postsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(totalPosts / postsPerPage) ? prev + 1 : prev
              )
            }
            disabled={currentPage === Math.ceil(totalPosts / postsPerPage)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200 cursor-pointer"
          >
            Next
          </button>
        </div>

        {/* Edit blog post modal */}
        {editPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full m-4 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4">Edit Blog Post</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4 flex flex-wrap gap-4">
                  <div className="mb-4 w-150">
                    <label htmlFor="editTitle" className="block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="editTitle"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4 w-100">
                    <label htmlFor="editSlug" className="block mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="editSlug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editSiteId" className="block mb-1">
                      Site
                    </label>
                    <select
                      id="editSiteId"
                      name="editSiteId"
                      value={editSiteId}
                      required
                      className="w-full border rounded px-3 py-2 h-10"
                      onChange={(e) => setEditSiteId(e.target.value)}
                    >
                      <option value="">--Select a site--</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editPublishDate" className="block mb-1">
                      Publish date
                    </label>
                    <input
                      type="text"
                      id="editPublishDate"
                      value={editPublishDate}
                      onChange={(e) => setEditPublishDate(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editPublishTime" className="block mb-1">
                      Publish time
                    </label>
                    <input
                      type="text"
                      id="editPublishTime"
                      value={editPublishTime}
                      onChange={(e) => setEditPublishTime(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="editDescription" className="block mb-1">
                      Description
                    </label>
                    <textarea
                      type="text"
                      id="editDescription"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editKeywords" className="block mb-1">
                      Keywords
                    </label>
                    <textarea
                      type="text"
                      id="editKeywords"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="editImage" className="block mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editImageCaption" className="block mb-1">
                      Image Caption
                    </label>
                    <textarea
                      type="text"
                      id="editImageCaption"
                      value={editImageCaption}
                      onChange={(e) => setEditImageCaption(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editImageAbstract" className="block mb-1">
                      Image Abstract
                    </label>
                    <textarea
                      type="text"
                      id="editImageAbstract"
                      value={editImageAbstract}
                      onChange={(e) => setEditImageAbstract(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="editImageAlternativeHeadline"
                      className="block mb-1"
                    >
                      Image Alternative Headline
                    </label>
                    <textarea
                      type="text"
                      id="editImageAlternativeHeadline"
                      value={editImageAlternativeHeadline}
                      onChange={(e) =>
                        setEditImageAlternativeHeadline(e.target.value)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editImageKeywords" className="block mb-1">
                      Image Keywords
                    </label>
                    <textarea
                      type="text"
                      id="editImageKeywords"
                      value={editImageKeywords}
                      onChange={(e) => setEditImageKeywords(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editTwitterLabel1" className="block mb-1">
                      Twitter Label 1
                    </label>
                    <input
                      type="text"
                      id="editTwitterLabel1"
                      value={editTwitterLabel1}
                      onChange={(e) => setEditTwitterLabel1(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editTwitterData1" className="block mb-1">
                      Twitter Data 1
                    </label>
                    <input
                      type="text"
                      id="editTwitterData1"
                      value={editTwitterData1}
                      onChange={(e) => setEditTwitterData1(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editTwitterLabel2" className="block mb-1">
                      Twitter Label 2
                    </label>
                    <input
                      type="text"
                      id="editTwitterLabel2"
                      value={editTwitterLabel2}
                      onChange={(e) => setEditTwitterLabel2(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editTwitterData2" className="block mb-1">
                      Twitter Data 2
                    </label>
                    <input
                      type="text"
                      id="editTwitterData2"
                      value={editTwitterData2}
                      onChange={(e) => setEditTwitterData2(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleSection" className="block mb-1">
                      Article Section
                    </label>
                    <input
                      type="text"
                      id="editArticleSection"
                      value={editArticleSection}
                      onChange={(e) => setEditArticleSection(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleTag1" className="block mb-1">
                      Article Tag 1
                    </label>
                    <input
                      type="text"
                      id="editArticleTag1"
                      value={editArticleTag1}
                      onChange={(e) => setEditArticleTag1(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleTag2" className="block mb-1">
                      Article Tag 2
                    </label>
                    <input
                      type="text"
                      id="editArticleTag2"
                      value={editArticleTag2}
                      onChange={(e) => setEditArticleTag2(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleTag3" className="block mb-1">
                      Article Tag 3
                    </label>
                    <input
                      type="text"
                      id="editArticleTag3"
                      value={editArticleTag3}
                      onChange={(e) => setEditArticleTag3(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleTag4" className="block mb-1">
                      Article Tag 4
                    </label>
                    <input
                      type="text"
                      id="editArticleTag4"
                      value={editArticleTag4}
                      onChange={(e) => setEditArticleTag4(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editArticleTag5" className="block mb-1">
                      Article Tag 5
                    </label>
                    <input
                      type="text"
                      id="editArticleTag5"
                      value={editArticleTag5}
                      onChange={(e) => setEditArticleTag5(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="editContent" className="block mb-1">
                    Content
                  </label>
                  <div
                    id="quillEditor"
                    className="w-full border rounded h-[750px]"
                  ></div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="mr-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add blog post form */}
        <div className="flex items-center justify-center mt-20">
          <div className="bg-gray-50 p-8 rounded shadow-lg w-full">
            <h2 className="text-2xl font-medium mb-2 text-center">
              Add a new blog post
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleAddPost} className="flex gap-4">
              <div className="w-full">
                <label htmlFor="title" className="block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 h-10 shadow-sm"
                />
              </div>
              <div className="w-full">
                <label htmlFor="slug" className="block mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 h-10 shadow-sm"
                />
              </div>
              <div className="w-full">
                <label htmlFor="siteId" className="block mb-1">
                  Site
                </label>
                <select
                  id="siteId"
                  name="siteId"
                  value={siteId}
                  required
                  className="w-full border rounded px-3 py-2 h-10 shadow-sm"
                  onChange={(e) => setSiteId(e.target.value)}
                >
                  <option value="">--Select a site--</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-24 mt-7 bg-green-500 text-white py-2 px-4 h-10 rounded hover:bg-green-600 transition duration-200 cursor-pointer shadow-sm"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
