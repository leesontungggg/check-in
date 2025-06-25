"use client";
import React, { useState } from "react";

export default function FormPage() {
  const [form, setForm] = useState({ company: "", name: "", position: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Replace this URL with your API endpoint that saves to your sheet
      const res = await fetch("/api/save-to-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ company: "", name: "", position: "" }); // Reset form
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/background.jpg')] bg-cover bg-center p-6 rounded-lg shadow-lg">
      <div className="max-w-md mx-auto mt-10 text-white">
        <h1 className="text-2xl font-bold mb-4">Check-In Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Company Name</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Position</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {status === "loading" ? "Saving..." : "Submit"}
          </button>
          {status === "success" && (
            <p className="text-green-600 mt-2">Saved successfully!</p>
          )}
          {status === "error" && (
            <p className="text-red-600 mt-2">Error saving data.</p>
          )}
        </form>
      </div>
    </div>
  );
}
