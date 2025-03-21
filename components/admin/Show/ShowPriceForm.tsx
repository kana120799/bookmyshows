"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

interface SeatData {
  id: string;
  vipPrice: number;
  premiumPrice: number;
  regularPrice: number;
}

const ShowPriceForm = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [seatData, setSeatData] = useState<SeatData>({
    id: "",
    vipPrice: 0,
    premiumPrice: 0,
    regularPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id && typeof id === "string") {
      setSeatData((prev) => ({ ...prev, id }));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeatData((prev) => ({
      ...prev,
      [name]: name === "id" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post("/api/admin/seats", seatData);
      if (response.status === 200) {
        setSuccess(true);
        setMessage(response.data.message || "Prices submitted successfully!");
        setSeatData({
          id: id as string,
          vipPrice: 0,
          premiumPrice: 0,
          regularPrice: 0,
        });
      }
    } catch (err) {
      setError("Failed to submit ticket data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Set Ticket Pricing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event ID */}
          <div>
            <label
              htmlFor="event-id"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Event ID
            </label>
            <input
              id="event-id"
              type="text"
              name="id"
              value={seatData.id}
              onChange={handleChange}
              disabled
              className="w-full h-12 px-4 rounded-md border text-xl border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* VIP Price */}
          <div>
            <label
              htmlFor="vip-price"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              VIP Price (₹)
            </label>
            <input
              id="vip-price"
              type="number"
              name="vipPrice"
              value={seatData.vipPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full h-12 px-4 rounded-md border text-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Premium Price */}
          <div>
            <label
              htmlFor="premium-price"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Premium Price (₹)
            </label>
            <input
              id="premium-price"
              type="number"
              name="premiumPrice"
              value={seatData.premiumPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full h-12 px-4 rounded-md border text-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Regular Price */}
          <div>
            <label
              htmlFor="regular-price"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Regular Price (₹)
            </label>
            <input
              id="regular-price"
              type="number"
              name="regularPrice"
              value={seatData.regularPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full h-12 px-4 rounded-md border text-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-md">
              <p>{message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-lg text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {loading ? "Submitting..." : "Submit Prices"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/show")}
              className="flex-1 px-4 py-3 bg-gray-600 text-lg text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowPriceForm;

// "use client";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useRouter } from "next/navigation";

// interface SeatData {
//   id: string;
//   vipPrice: number;
//   premiumPrice: number;
//   regularPrice: number;
// }

// const ShowPriceForm = () => {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   const [seatData, setSeatData] = useState<SeatData>({
//     id: "",
//     vipPrice: 0,
//     premiumPrice: 0,
//     regularPrice: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [message, setMessage] = useState("");

//   // Update ID when router is ready
//   useEffect(() => {
//     if (id && typeof id === "string") {
//       setSeatData((prev) => ({ ...prev, id }));
//     }
//   }, [id]);

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSeatData((prev) => ({
//       ...prev,
//       [name]: name === "id" ? value : Number(value),
//     }));
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const response = await axios.post("/api/admin/seats", seatData);
//       console.log("sfjsdfsdfsdf", response);
//       if (response.status === 200) {
//         setSuccess(true);
//         setMessage(response.data.message);
//         setSeatData({
//           id: id as string,
//           vipPrice: 0,
//           premiumPrice: 0,
//           regularPrice: 0,
//         });
//         // router.push("/admin/show");
//       }
//     } catch (err) {
//       setError("Failed to submit ticket data. Please try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
//           Ticket Pricing Form
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-xl font-medium text-gray-700 mb-1">
//               Event ID
//             </label>
//             <input
//               type="text"
//               name="id"
//               value={seatData.id}
//               onChange={handleChange}
//               disabled
//               className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <label className="block text-xl font-medium text-gray-700 mb-1">
//               VIP Price (₹)
//             </label>
//             <input
//               type="number"
//               name="vipPrice"
//               value={seatData.vipPrice}
//               onChange={handleChange}
//               min="0"
//               step="0.01"
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xl font-medium text-gray-700 mb-1">
//               Premium Price (₹)
//             </label>
//             <input
//               type="number"
//               name="premiumPrice"
//               value={seatData.premiumPrice}
//               onChange={handleChange}
//               min="0"
//               step="0.01"
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xl font-medium text-gray-700 mb-1">
//               Regular Price (₹)
//             </label>
//             <input
//               type="number"
//               name="regularPrice"
//               value={seatData.regularPrice}
//               onChange={handleChange}
//               min="0"
//               step="0.01"
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {error && <p className="text-red-500 text-xl">{error}</p>}
//           {success && <p className="text-green-500 text-xl">{message}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 px-4 rounded-md text-white font-medium ${
//               loading
//                 ? "bg-indigo-400 cursor-not-allowed"
//                 : "bg-indigo-600 hover:bg-indigo-700"
//             } transition-colors`}
//           >
//             {loading ? "Submitting..." : "Submit Prices"}
//           </button>

//           <button
//             type="button"
//             onClick={() => router.push("/admin/show")}
//             className={`w-full py-2 px-4  bg-indigo-600 text-white rounded-md hover:bg-indigo-700`}
//           >
//             Back
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ShowPriceForm;
