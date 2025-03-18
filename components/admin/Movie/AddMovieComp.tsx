// // app/movies/create/page.tsx
// "use client";

// import { useState, FormEvent } from "react";
// import api from "@/utils/axios-interceptor";
// import axios from "axios";

// export default function CreateMovie() {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     year: "",
//     actors: "",
//     director: "",
//     durationMins: "",
//     language: "",
//     releaseDate: "",
//     country: "",
//     genre: "",
//     rating: "",
//   });
//   const [poster, setPoster] = useState<File | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setPoster(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const movieData = new FormData();
//       movieData.append("title", formData.title);
//       movieData.append("description", formData.description);
//       movieData.append("year", formData.year);

//       // Append each actor individually
//       formData.actors
//         .split(",")
//         .map((actor) => actor.trim())
//         .forEach((actor) => {
//           movieData.append("actors[]", actor);
//         });

//       // Append each director individually
//       formData.director
//         .split(",")
//         .map((dir) => dir.trim())
//         .forEach((director) => {
//           movieData.append("director[]", director);
//         });

//       movieData.append("durationMins", formData.durationMins);
//       movieData.append("language", formData.language);
//       movieData.append(
//         "releaseDate",
//         new Date(formData.releaseDate).toISOString()
//       );
//       movieData.append("country", formData.country);

//       // Append each genre individually
//       formData.genre
//         .split(",")
//         .map((g) => g.trim())
//         .forEach((genre) => {
//           movieData.append("genre[]", genre);
//         });

//       movieData.append("rating", formData.rating);
//       if (poster) {
//         movieData.append("poster", poster);
//       }
//       console.log("Fdsfjsfksdfs", movieData);
//       await axios.post("/api/movie", movieData);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Create New Movie</h1>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Title
//           </label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Description
//           </label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Year
//           </label>
//           <input
//             type="number"
//             name="year"
//             value={formData.year}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Actors (comma-separated)
//           </label>
//           <input
//             type="text"
//             name="actors"
//             value={formData.actors}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Director (comma-separated)
//           </label>
//           <input
//             type="text"
//             name="director"
//             value={formData.director}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Duration (minutes)
//           </label>
//           <input
//             type="number"
//             name="durationMins"
//             value={formData.durationMins}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Language
//           </label>
//           <input
//             type="text"
//             name="language"
//             value={formData.language}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Release Date
//           </label>
//           <input
//             type="date"
//             name="releaseDate"
//             value={formData.releaseDate}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Country
//           </label>
//           <input
//             type="text"
//             name="country"
//             value={formData.country}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Genre (comma-separated)
//           </label>
//           <input
//             type="text"
//             name="genre"
//             value={formData.genre}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Rating (0-10)
//           </label>
//           <input
//             type="number"
//             name="rating"
//             value={formData.rating}
//             onChange={handleInputChange}
//             min="0"
//             max="10"
//             step="0.1"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Poster Image
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="mt-1 block w-full text-sm text-gray-500
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-full file:border-0
//               file:text-sm file:font-semibold
//               file:bg-indigo-50 file:text-indigo-700
//               hover:file:bg-indigo-100"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
//         >
//           {isLoading ? "Creating..." : "Create Movie"}
//         </button>
//       </form>
//     </div>
//   );
// }
