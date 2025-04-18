"use client";

import useSWR from "swr";
import { useState } from "react";
import Image from "next/image";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function SitesPage() {
  // states for adding a new site
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // states for editing a site
  const [editSite, setEditSite] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPicture, setEditPicture] = useState("");




  /* 
   * GET SITES
   ************/
  // GraphQL query to get all sites
  const GET_SITES_QUERY = `
    query getSites {
      getSites {
        id
        name
        url
        description
        picture
      }
    }
  `;
  // Fetcher function to make the GraphQL request
  // This function is used by SWR to fetch data
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
    //console.log("GraphQL response:", json);
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  };
  // Use SWR to fetch the data
  const { data, error_getSites, mutate } = useSWR(GET_SITES_QUERY, fetcher);




  /*
   * ADD A SITE
   *************/
  // GraphQL mutation to add a new site
  // This function is called when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const query = `
      mutation AddSite($name: String!, $url: String!) {
        addSite(name: $name, url: $url) {
          id
          name
          url
        }
      }
    `;
    const variables = { name, url };

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
        setError(json.errors[0].message || "Error adding site");
      } else {
        mutate();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };




  /*
   * DELETE A SITE
   ****************/
  // GraphQL mutation to delete a site
  // This function is called when the delete button is clicked
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this site?"
    );
    if (!confirmed) return;

    const DELETE_SITE_MUTATION = `
      mutation DeleteSite($id: String!) {
        deleteSite(id: $id)
      }
    `;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          query: DELETE_SITE_MUTATION,
          variables: { id },
        }),
      });
      const json = await response.json();
      if (json.errors) {
        alert("Error deleting site: " + json.errors[0].message);
      } else {
        mutate();
      }
    } catch (err) {
      console.error("Error deleting site:", err);
      alert("An error occurred while deleting the site.");
    }
  };




  /*
   * EDIT A SITE
   **************/
  // When a site is clicked for editing, pre-populate the edit form with its data.
  const handleEditClick = (site) => {
    setEditSite(site);
    setEditName(site.name || "");
    setEditUrl(site.url || "");
    setEditDescription(site.description || "");
    setEditPicture(site.picture || "");
  };

  // Close the edit modal.
  const handleCancelEdit = () => {
    setEditSite(null);
  };

  // Handle the edit form submission.
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const UPDATE_SITE_MUTATION = `
      mutation UpdateSite(
        $id: String!, 
        $name: String!, 
        $url: String!, 
        $description: String, 
        $picture: String
      ) {
        updateSite(
          id: $id, 
          name: $name, 
          url: $url, 
          description: $description, 
          picture: $picture
        ) {
          id
          name
          url
          description
          picture
        }
      }
    `;

    const variables = {
      id: editSite.id,
      name: editName,
      url: editUrl,
      description: editDescription,
      picture: editPicture,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ query: UPDATE_SITE_MUTATION, variables }),
      });
      const json = await response.json();
      if (json.errors) {
        alert("Error updating site: " + json.errors[0].message);
      } else {
        await mutate();
        setEditSite(null);
      }
    } catch (err) {
      console.error("Error updating site:", err);
      alert("An error occurred while updating the site.");
    }
  };

  // If there's an error fetching the sites, display it.
  // If the data is still loading, show a loading message.
  // If the data is successfully fetched, display the sites.
  if (error_getSites)
    return (
      <div className="p-4 text-red-500">Error: {error_getSites.message}</div>
    );
  if (!data) return <div className="p-4">Loading...</div>;

  const sites = data.getSites || [];

  return (
    <ProtectedRoute>
      <main className="p-4">
        {sites.length === 0 ? (
          <p>No sites found. Please add one below.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {sites.map((site) => (
              <li
                key={site.id}
                className="rounded p-4 shadow-lg transition duration-200 bg-pink-100 hover:bg-pink-50"
              >
                <h2 className="text-2xl font-medium mb-2">{site.name}</h2>
                <div className="h-72">
                  {site.picture && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${site.picture}`}
                      alt={site.name}
                      className="mb-2"
                    />
                  )}
                </div>
                {site.description && (
                  <p className="mt-2 text-gray-700 h-16">{site.description}</p>
                )}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-500 hover:underline"
                >
                  {site.url}
                </a>
                <div className="mt-4">
                  <button
                    onClick={() => handleEditClick(site)}
                    className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Site Modal */}
        {editSite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Site</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label htmlFor="editName" className="block mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editUrl" className="block mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    id="editUrl"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editDescription" className="block mb-1">
                    Description
                  </label>
                  <textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editPicture" className="block mb-1">
                    Picture URL
                  </label>
                  <input
                    type="text"
                    id="editPicture"
                    value={editPicture}
                    onChange={(e) => setEditPicture(e.target.value)}
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

        {/* Add Site Form */}
        <div className="flex items-center justify-center mt-10">
          <div className="bg-gray-50 p-6 rounded shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-medium mb-2 text-center">
              Add a New Site
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="w-full">
                <label htmlFor="name" className="block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 h-10"
                />
              </div>
              <div className="w-full">
                <label htmlFor="url" className="block mb-1">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 h-10"
                />
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
