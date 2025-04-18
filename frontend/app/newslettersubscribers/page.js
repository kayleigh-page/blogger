"use client";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Image from "next/image";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewsLetterSubscribers() {
  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 200;

  // States for adding a new subscriber
  const [email, setEmail] = useState("");
  const [siteId, setSiteId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Stats for editing a subscriber
  const [editPost, setEditPost] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editSiteId, setEditSiteId] = useState("");
  const [editComment, setEditComment] = useState("");

  // State to keep track of the currently active site filter.
  const [activeSite, setActiveSite] = useState("All");

  /*
   * GET SUBSCRIBERS AND SITES
   ****************************/
  // GraphQL query to fetch subscribers for the current user
  const GET_SUBSCRIBERS_QUERY = `
    query getUserNewsletterSubscribers($limit: Int, $offset: Int) {
      getUserNewsletterSubscribers(limit: $limit, offset: $offset) {
        id
        email
        siteId
        comment
      }
    }
  `;
  // GraphQL query to fetch the count of subscribers for the current user
  const GET_SUBSCRIBERS_COUNT_QUERY = `
    query getUserNewsletterSubscribersCount {
      getUserNewsletterSubscribersCount
    }
  `;
  // GraphQL query to fetch all sites for the current user
  const GET_SITES_QUERY = `
    query getSites {
      getSites {
        id
        name
      }
    }
  `;

  // Fetch the total number of subscribers for pagination
  useEffect(() => {
    const fetchTotalPosts = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query: GET_SUBSCRIBERS_COUNT_QUERY }),
      });
      const json = await response.json();
      if (json.data) {
        setTotalPosts(json.data.getUserNewsletterSubscribersCount);
      }
    };
    fetchTotalPosts();
  }, [GET_SUBSCRIBERS_COUNT_QUERY]);

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
      query: GET_SUBSCRIBERS_QUERY,
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
   * ADD A SUBSCRIBER
   *******************/
  // GraphQL mutation to add a new subscriber.
  // This function is called when the form is submitted.
  const handleAddPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const query = `
      mutation addAuthenticatedNewsletterSubscriber($email: String!, $siteId: String!) {
        addAuthenticatedNewsletterSubscriber(email: $email, siteId: $siteId) {
          id
          email
          siteId
        }
      }
    `;
    const variables = { email, siteId };

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
        setEmail("");
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
   * EDIT A SUBSCRIBER
   ********************/
  // When a subscriber is clicked for editing, pre-populate the form fields with the subscriber's data.
  const handleEditClick = (post) => {
    setEditPost(post);
    setEditEmail(post.email || "");
    setEditSiteId(post.siteId || "");
    setEditComment(post.comment || "");
  };

  // Close the edit modal.
  // This function is called when the user clicks the cancel button in the edit form.
  const handleCancelEdit = () => {
    setEditPost(null);
  };

  // Handle the edit form submission.
  // This function is called when the user submits the edit form.
  // It sends a GraphQL mutation to update the newsletter subscriber.
  // After the update, it resets the form fields and refreshes the newsletter subscribers list.
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // GraphQL mutation to update a subscriber
    const UPDATE_SUBSCRIBER_MUTATION = `
      mutation updateNewsletterSubscriber(
        $id: String!,
        $email: String!,
        $siteId: String!,
        $comment: String,
      ) {
        updateNewsletterSubscriber(
          id: $id,
          email: $email,
          siteId: $siteId,
          comment: $comment
        ) {
          id
          email
          siteId
          comment
        }
      }
    `;

    // Prepare the variables for the mutation
    const variables = {
      id: editPost.id,
      email: editEmail,
      siteId: editSiteId,
      comment: editComment,
    };

    // Send the GraphQL mutation to update the subscriber
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          query: UPDATE_SUBSCRIBER_MUTATION,
          variables,
        }),
      });

      const json = await response.json();
      if (json.errors) {
        throw new Error(json.errors[0].message);
      } else {
        setEditPost(null);
        await mutate();
      }
    } catch (error) {
      console.error("Error updating subscriber:", error);
      alert("An error occurred while updating the subscriber.");
    }
  };

  /*
   * DELETE A SUBSCRIBER
   **********************/
  // This function is called when the user clicks the delete button for a subscriber.
  // It sends a GraphQL mutation to delete the subscriber.
  // After deletion, it refreshes the newsletter subscribers list.
  const handleDelete = async (postId) => {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }

    // GraphQL mutation to delete a subscriber
    try {
      const token = localStorage.getItem("token");
      const query = `
      mutation deleteNewsletterSubscriber($id: String!) {
        deleteNewsletterSubscriber(id: $id)
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

      if (json.data.deleteNewsletterSubscriber) {
        await mutate();
      } else {
        alert("Failed to delete the subscriber.");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("An error occurred while deleting the subscriber.");
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

  const newsletterSubscribers = postsData.getUserNewsletterSubscribers || [];
  const sites = sitesData.getSites || [];

  // Filter subscriber by the currently active site filter.
  const filteredPosts =
    activeSite === "All"
      ? newsletterSubscribers
      : newsletterSubscribers.filter((post) => post.siteId === activeSite);
  
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

        {/* Display Filtered Subscribers */}
        <div className="max-w-3xl mx-auto">
          {filteredPosts.map((post) => (
            <div
              className="items-center border-b-1"
              key={post.id}
            >
              <div className="p-3 grid grid-cols-2">
                <div className="flex items-center">
                  <h2 className="text-xl mr-2">{post.email}</h2>
                  {sites.map(
                    (site) =>
                      post.siteId === site.id && (
                        <p className="mt-1" key={site.id}>
                          ({site.name})
                        </p>
                      )
                  )}
                </div>
                <div className="ml-2">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 cursor-pointer shadow-sm float-end"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 cursor-pointer shadow-sm float-end"
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

        {/* Edit subscriber modal */}
        {editPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full m-4 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4">Edit Subscriber</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4 flex flex-wrap gap-4">
                  <div className="mb-4 w-150">
                    <label htmlFor="editEmail" className="block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="editEmail"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
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
                    <label htmlFor="editComment" className="block mb-1">
                      Comment
                    </label>
                    <textarea
                      type="text"
                      id="editComment"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
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

        {/* Add subscriber form */}
        <div className="flex items-center justify-center mt-20">
          <div className="bg-gray-50 p-8 rounded shadow-lg w-full">
            <h2 className="text-2xl font-medium mb-2 text-center">
              Add a new newsletter subscriber
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleAddPost} className="flex gap-4">
              <div className="w-full">
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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