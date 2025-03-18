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

  // Update ID when router is ready
  useEffect(() => {
    if (id && typeof id === "string") {
      setSeatData((prev) => ({ ...prev, id }));
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeatData((prev) => ({
      ...prev,
      [name]: name === "id" ? value : Number(value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post("/api/admin/seats", seatData);
      console.log("sfjsdfsdfsdf", response);
      if (response.status === 200) {
        setSuccess(true);
        setMessage(response.data.message);
        setSeatData({
          id: id as string,
          vipPrice: 0,
          premiumPrice: 0,
          regularPrice: 0,
        });
        // router.push("/admin/show");
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
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Ticket Pricing Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Event ID
            </label>
            <input
              type="text"
              name="id"
              value={seatData.id}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              VIP Price (₹)
            </label>
            <input
              type="number"
              name="vipPrice"
              value={seatData.vipPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Premium Price (₹)
            </label>
            <input
              type="number"
              name="premiumPrice"
              value={seatData.premiumPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Regular Price (₹)
            </label>
            <input
              type="number"
              name="regularPrice"
              value={seatData.regularPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-xl">{error}</p>}
          {success && <p className="text-green-500 text-xl">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } transition-colors`}
          >
            {loading ? "Submitting..." : "Submit Prices"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/show")}
            className={`w-full py-2 px-4  bg-indigo-600 text-white rounded-md hover:bg-indigo-700`}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShowPriceForm;
