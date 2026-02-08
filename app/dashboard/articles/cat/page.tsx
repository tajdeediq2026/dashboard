"use client";

import { useEffect, useState } from "react";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../lib/api";
import { CategoryAll } from "../types/Category";
import EmptyState from "../../../../components/EmptyState";

export default function Home() {
  const [categories, setCategories] = useState<CategoryAll[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newCategory = await createCategory({
        name,
        isActivated: false,
      });
      setCategories([...categories, newCategory]);
      setName("");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    
    try {
      const updatedCategory = await updateCategory(id, {
        name: editingName,
        isActivated: categories.find(cat => cat.id === id)?.isActivated || false
      });
      
      setCategories(prevCategories => 
        prevCategories.map(cat => cat.id === id ? updatedCategory : cat)
      );
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating category:", error);
      // Optionally add user feedback here
      alert("Failed to update category");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleToggleActivation = async (id: number, currentStatus: boolean) => {
    try {
      const updatedCategory = await updateCategory(id, { isActivated: !currentStatus });
      setCategories(categories.map(cat => 
        cat.id === id ? updatedCategory : cat
      ));
    } catch (error) {
      console.error("Error updating category status:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Categories Management</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="border border-gray-300 rounded px-3 py-2 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-custom-green hover:bg-custom-green-hover text-white font-bold py-2 px-4 rounded transition-colors duration-200 whitespace-nowrap"
          >
            Add Category
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          title="لا توجد تصنيفات"
          description="ابدأ بإنشاء تصنيفك الأول لتنظيم المحتوى"
          actionLabel="إضافة تصنيف جديد"
          actionHref="#"
          icon={
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li
                key={`category-${category.id}`}
                className="p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                {editingId === category.id ? (
                  <div className="flex items-center gap-3 flex-wrap" key={`editing-${category.id}`}>
                    <input
                      title="edit"
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 flex-wrap" key={`display-${category.id}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        title="Toggle activation"
                        type="checkbox"
                        checked={category.isActivated}
                        onChange={() =>
                          handleToggleActivation(category.id, category.isActivated)
                        }
                        className="h-4 w-4 text-custom-green focus:ring-custom-green border-gray-300 rounded"
                      />
                      <span className={`text-sm font-medium ${category.isActivated ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
