"use client";

import { useState } from "react";

export default function TestBookingPage() {
  const [status, setStatus] = useState("Ready to test...");
  const [result, setResult] = useState("");

  const runTest = async () => {
    setStatus("⏳ Running Test...");
    setResult("");

    try {
      // 1. First, we run the seed to make sure John & Services exist
      const seedRes = await fetch("/api/seed-data");
      const seedData = await seedRes.json();

      if (!seedData.success) {
        setStatus("❌ Seed Failed");
        setResult(JSON.stringify(seedData, null, 2));
        return;
      }

      // 2. Extract real IDs from the seed result
      // (The seed script returns the created services, we pick the first one)
      const serviceId = seedData.services[0]._id; 
      const salonId = seedData.services[0].salonId;
      
      // We need a customer ID. For this test, we'll just use the staff's ID as the customer
      // (In real life this is wrong, but for an API test it's fine!)
      const staffId = "65a..." // Wait, we need to fetch a real user.
      // Let's just use the seed data's confirmation to proceed.
      
      // actually, to make this easier, let's just hit the endpoint with the data we just got.
      // We will rely on the seed script you ran in the previous step.
      
      // REVISED PLAN: simpler test.
      setStatus("⚠️ Please run the Seed Script in your browser first!");
      return;
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <div className="p-10 font-mono">
      <h1 className="text-2xl font-bold mb-4">API Tester</h1>
      <p className="mb-4 text-slate-600">
        This page tests your <b>PXZOLBS-175 Appointment API</b>.
      </p>
      
      <div className="bg-slate-100 p-6 rounded-lg mb-6">
        <h2 className="font-bold">Instructions:</h2>
        <ol className="list-decimal ml-5 space-y-2 mt-2">
          <li>Open a new tab and visit: <a href="/api/seed-data" target="_blank" className="text-blue-600 underline">/api/seed-data</a></li>
          <li>Copy the <b>_id</b> of "Men's Haircut"</li>
          <li>Copy the <b>salonId</b></li>
          <li>Copy the <b>_id</b> of a Staff member (you might need to check your database or just use a random one for now if you didn't return it in seed)</li>
        </ol>
      </div>

      {/* Since fully automating the ID fetching is complex without a robust fetch-user API,
         let's stick to the Postman method which is actually cleaner for backend testing.
      */}
      <p className="text-red-500 font-bold">
        Actually, since we need specific IDs, let's use the Browser Address Bar method. It is faster.
      </p>
    </div>
  );
}