"use client";
import React from "react";
import MovieAdminList from "./MovieAdminList";

export default function MovieLayout() {
  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10">
        <h1 className="text-xl font-semibold text-gray-800">Movie List</h1>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          // onClick={() => redirect("/admin/movie/create")}
        >
          Add New
        </button>
      </div>
      <MovieAdminList />
    </>
  );
}
