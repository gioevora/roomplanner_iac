"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import RoomPlanner from "../page";
import { furnitureData } from "@/app/data/furnitureData";
import Head from "next/head"; // Import Head for modifying the document's head

const SlugPage = () => {
  const { slug } = useParams(); // Get the slug from the URL parameters

  // Ensure that slug is treated as a string
  const slugString = Array.isArray(slug) ? slug[0] : slug;

  // Retrieve the furniture data based on the slug
  const furniture = furnitureData[slugString as string] || [];

  useEffect(() => {
    // Dynamically change the favicon when the slug changes
    const favicon = `/favicon/${slugString}.ico`; // Dynamic favicon based on slug
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    if (link) {
      link.href = favicon;
    }

    // Set dynamic title
    document.title = ` ${
      slugString ? slugString.toUpperCase() : "Explore Room Planning"
    } Roomplanner`; // Dynamic title
  }, [slugString]); // Re-run the effect when slugString changes

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon/default.ico" />
        {/* Optionally, you can set a default title in case the title hasn't been set dynamically */}
        <title>
          Room Planner -{" "}
          {slugString ? slugString.toUpperCase() : "Explore Room Planning"}
        </title>
      </Head>
      <RoomPlanner /> {/* Pass the furniture data to RoomPlanner as needed */}
    </>
  );
};

export default SlugPage;
