"use client";

import { useState, FormEvent } from "react";
import { redirect, useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";

interface CinemaHallForm {
  id?: string;
  name: string;
  totalSeats: number;
}

interface CinemaForm {
  id: string;
  name: string;
  address: {
    id?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  halls: CinemaHallForm[];
}

export default function EditCinema() {
  const { id } = useParams();
  const [formData, setFormData] = useState<CinemaForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cinema data on mount
  //   useEffect(() => {
  //     const fetchCinema = async () => {
  //       try {
  //         const response = await fetch(`/api/cinema/${id}`);
  //         if (!response.ok) throw new Error("Failed to fetch cinema");
  //         const data = await response.json();
  //         setFormData({
  //           id: data.id,
  //           name: data.name,
  //           address: data.address,
  //           halls: data.halls,
  //         });
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : "An error occurred");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchCinema();
  //   }, [id]);

  const handleHallChange = (
    index: number,
    field: keyof CinemaHallForm,
    value: string | number
  ) => {
    if (!formData) return;
    const newHalls = [...formData.halls];
    newHalls[index] = {
      ...newHalls[index],
      [field]: value,
    };
    setFormData({ ...formData, halls: newHalls });
  };

  const addHall = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      halls: [...formData.halls, { name: "", totalSeats: 0 }],
    });
  };

  const removeHall = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      halls: formData.halls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/cinema/${id}`, formData);

      if (response.statusText === "OK") {
        throw new Error("Failed to update cinema");
      }
      redirect("/cinema");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) return <Loader />;
  if (error && !formData)
    return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Cinema</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cinema Details */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Cinema Name
            </label>
            <input
              type="text"
              id="name"
              value={formData?.name || ""}
              onChange={(e) =>
                setFormData({ ...formData!, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Address Fields */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Address</h2>
            <input
              type="text"
              placeholder="Street"
              value={formData?.address.street || ""}
              onChange={(e) =>
                setFormData({
                  ...formData!,
                  address: { ...formData!.address, street: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={formData?.address.city || ""}
              onChange={(e) =>
                setFormData({
                  ...formData!,
                  address: { ...formData!.address, city: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={formData?.address.state || ""}
              onChange={(e) =>
                setFormData({
                  ...formData!,
                  address: { ...formData!.address, state: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={formData?.address.zipCode || ""}
              onChange={(e) =>
                setFormData({
                  ...formData!,
                  address: { ...formData!.address, zipCode: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Cinema Halls */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Cinema Halls</h2>
          {formData?.halls?.map((hall, index) => (
            <div key={hall.id || index} className="flex space-x-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Hall Name
                </label>
                <input
                  type="text"
                  value={hall.name}
                  onChange={(e) =>
                    handleHallChange(index, "name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700">
                  Total Seats
                </label>
                <input
                  type="number"
                  value={hall.totalSeats}
                  onChange={(e) =>
                    handleHallChange(
                      index,
                      "totalSeats",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="1"
                />
              </div>
              <button
                type="button"
                onClick={() => removeHall(index)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHall}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Hall
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? "Updating..." : "Update Cinema"}
        </button>
      </form>
    </div>
  );
}
