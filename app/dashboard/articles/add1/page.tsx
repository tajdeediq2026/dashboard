"use client";

import { useState, useEffect } from "react";
import { createTodo, getCategories } from "../lib/api";
import { ArticleAll } from "../types/Article";
import { CategoryAll } from "../types/Category";

export default function Home() {
  const [todos, setTodos] = useState<ArticleAll[]>([]);
  const [articleTitle, setTitle] = useState("");
  const [categories, setCategories] = useState<CategoryAll[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">(""); // Changed from number to number | ""
  const [loading, setLoading] = useState(true);
  

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        console.log('Fetched categories:', response); // Debug log
        
        // Validate the response structure
        if (Array.isArray(response)) {
          setCategories(response);
          // Remove this line to prevent auto-selection
          // setCategoryId(response[0].id);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        // Show error to user
        alert('Failed to load categories. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Modified handleSubmit to include categoryId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleTitle.trim() || !categoryId) {
      alert('Please select a category and enter an article title');
      return;
    }

    try {
      const newArticle = await createTodo({
        articleTitle: articleTitle.trim(),
        categoryId: Number(categoryId)
      });

      setTodos(prev => [...prev, newArticle]);
      setTitle("");
      setCategoryId("");
      alert('Article created successfully!');
    } catch (error) {
      console.error("Error creating article:", error);
      alert(error instanceof Error ? error.message : 'Failed to create article');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Article</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={articleTitle}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          <select
            title='Category'
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="p-2 border rounded min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            disabled={loading}
          >
            {loading ? (
              <option>Loading categories...</option>
            ) : categories.length > 0 ? (
              <>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No categories available</option>
            )}
          </select>

          <button
            type="submit"
            className="bg-custom-green hover:bg-custom-green-hover text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Add Article
          </button>
        </div>

        {loading && (
          <div className="text-gray-500 text-sm mt-2">
            Loading categories...
          </div>
        )}
        {!loading && categories.length === 0 && (
          <div className="text-red-500 text-sm mt-2">
            No categories available. Please add some categories first.
          </div>
        )}
      </form>

      {/* Display created articles */}
      <div className="mt-8">
        {/* <h2 className="text-xl font-semibold mb-4">Created Articles</h2> */}
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 bg-white rounded shadow"
            >
              <span className="font-medium">{todo.articleTitle}</span>
              <span className="text-sm text-gray-500">
                Category: {todo.category?.name || 'Unknown'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
