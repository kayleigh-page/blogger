"use client";

import useSWR from "swr";
import { useState } from "react";
import Image from "next/image";

import ProtectedRoute from "@/components/ProtectedRoute";


export default function BlogpostsPage() {
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
    query getUserBlogPosts {
      getUserBlogPosts {
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

  // GraphQL query to fetch all sites for the current user.
  const GET_SITES_QUERY = `
    query getSites {
      getSites {
        id
        name
      }
    }
  `;

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
    console.log("GraphQL response: ", json);
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  };

  // Fetch blog posts.
  const {
    data: postsData,
    error: postsError,
    mutate,
  } = useSWR(GET_BLOGPOSTS_QUERY, fetcher);
  // Fetch sites.
  const { data: sitesData, error: sitesError } = useSWR(
    GET_SITES_QUERY,
    fetcher
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
  const handleCancelEdit = () => {
    setEditPost(null);
  };

  // Handle the edit form submission.
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const UPDATE_BLOGPOST_MUTATION = `
      mutation UpdateBlogPost(
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

    const variables = {
      id: editPost.id,
      title: editTitle,
      slug: editSlug,
      siteId: editSiteId,
      content: editContent, // TODO LAST!
      description: editDescription,
      keywords: editKeywords,
      publishTime: editPublishTime,
      publishDate: editPublishDate,
      image: editImage,
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
        // Reset form fields after successful submission
        setEditPost(null);
        await mutate();
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("An error occurred while updating the blog post.");
    }
  };

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
            className={`px-3 py-1 mr-2 rounded ${
              activeSite === "All" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => setActiveSite(site.id)}
              className={`px-3 py-1 mr-2 rounded ${
                activeSite === site.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>

        {/* Display Filtered Blog Posts */}
        <div className="grid grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div className="flex items-center gap-2" key={post.id}>
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${post.image}`}
                alt={post.imageAlternativeHeadline || "Blog post image"}
                width={200}
                height={100}
              />
              <div>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <div className="mt-0">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                      type="text"
                      id="editImage"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
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
                  <textarea
                    type="text"
                    id="editContent"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
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
        <div className="flex items-center justify-center mt-10">
          <div className="bg-gray-50 p-6 rounded shadow-lg w-full max-w-4xl">
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
                  className="w-full border rounded px-3 py-2 h-10"
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
                  className="w-full border rounded px-3 py-2 h-10"
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
                  className="w-full border rounded px-3 py-2 h-10"
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
                className="w-24 mt-7 bg-green-500 text-white py-2 h-10 rounded hover:bg-green-600 transition duration-200"
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
