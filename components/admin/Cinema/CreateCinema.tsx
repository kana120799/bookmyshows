"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Seat {
  id: string;
  type: "REGULAR" | "PREMIUM" | "VIP";
}

interface SeatLayout {
  seats: {
    [row: string]: (Seat | null)[];
  };
  totalSeats: number;
}

interface CinemaHallForm {
  name: string;
  seats: SeatLayout | null;
}

interface CinemaForm {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  halls: CinemaHallForm[];
}

export default function CreateCinema() {
  const [formData, setFormData] = useState<CinemaForm>({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    halls: [{ name: "", seats: null }],
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHallChange = (
    index: number,
    field: keyof CinemaHallForm,
    value: string | SeatLayout | null
  ) => {
    const newHalls = [...formData.halls];
    newHalls[index] = {
      ...newHalls[index],
      [field]: value,
    };
    setFormData({ ...formData, halls: newHalls });
  };

  const handleFileChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData: SeatLayout = JSON.parse(
            event.target?.result as string
          );
          // Validate the JSON structure
          if (jsonData.seats && typeof jsonData.totalSeats === "number") {
            handleHallChange(index, "seats", jsonData);
          } else {
            setError(
              "Invalid JSON format. Must contain 'seats' and 'totalSeats'."
            );
          }
        } catch (err) {
          setError(
            `Failed to parse JSON file. Please upload a valid JSON. ${err}`
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const addHall = () => {
    setFormData({
      ...formData,
      halls: [...formData.halls, { name: "", seats: null }],
    });
  };

  const removeHall = (index: number) => {
    setFormData({
      ...formData,
      halls: formData.halls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/admin/cinema", formData);
      if (response.status === 200) {
        setFormData({
          name: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          halls: [{ name: "", seats: null }],
        });
        // router.push("/admin/cinema");
        router.push("/admin/cinema");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-xl mt-10 ">
      <h1 className="text-2xl font-bold mb-6">Create New Cinema</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              id="name"
              placeholder="Cinema Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <h2 className=" font-semibold mt-3 text-xl">Address</h2>
            <input
              type="text"
              placeholder="Street"
              value={formData.address.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value },
                })
              }
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={formData.address.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value },
                })
              }
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={formData.address.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value },
                })
              }
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.address.zipCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value },
                })
              }
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className=" font-semibold text-2xl">Cinema Halls</h2>
          {formData.halls.map((hall, index) => (
            <div key={index} className="flex space-x-4 items-end mb-3">
              <div className="flex-1">
                <label className="block text-xl font-medium text-gray-700">
                  Hall Name
                </label>
                <input
                  type="text"
                  value={hall.name}
                  onChange={(e) =>
                    handleHallChange(index, "name", e.target.value)
                  }
                  className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="w-64">
                <label className="block text-xl font-medium text-gray-700">
                  Seat Layout (JSON File)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileChange(index, e)}
                  className="mt-1 block w-full h-12 text-xl text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xl file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
                {hall.seats && (
                  <p className="text-xl text-green-600 mt-1">
                    Uploaded: {hall.seats.totalSeats} seats
                  </p>
                )}
              </div>
              {formData.halls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHall(index)}
                  className="px-3 py-2 text-xl text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addHall}
            className="px-4 py-2 mt-5 bg-green-500 text-white rounded-md hover:bg-green-600"
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
          {loading ? "Creating..." : "Create Cinema"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            router.push("/admin/cinema");
          }}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          Back
        </button>
      </form>
    </div>
  );
}
