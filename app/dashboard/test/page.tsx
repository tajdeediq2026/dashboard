
"use client";

import { useState, useEffect } from "react";

// interface User {
//   id: number;
//   name: string;
//   email: string;
// }
interface Article {
  id: number;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  isPublished:boolean;
}

export default function Posts() {
  //const [users, setUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getUsers() {
    try {
      // const response = await fetch(
      //   "https://jsonplaceholder.typicode.com/users"
      // );
      const response = await fetch('/api/proxy/api/Articles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    }
  }

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users.length) return <div>No users found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Articles</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{user.articleTitle}</h2>
            <p className="text-gray-600">{user.articleSummary}</p>
            {/* <Image/> */}
          </div>
        ))}
      </div>
    </div>
  );
}
