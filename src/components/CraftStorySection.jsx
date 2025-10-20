import React from "react";
import storyCopy from "../data/categoryStory.json";

/**
 * CraftStorySection
 * Displays a category-specific image with gradient and supporting copy.
 * Data flow:
 * - Reads story text and optional image path from categoryStory.json by categoryId.
 * - Falls back to a default story and an inferred image path if none provided.
 */
export default function CraftStorySection({ categoryId }) {
  const story = storyCopy[categoryId] || storyCopy.default;

  let imageUrl = null;
  try {
    imageUrl = new URL(
      story.image || `../assets/story/${categoryId || "god-statues"}.jpg`,
      import.meta.url
    ).href;
  } catch (_) {
    imageUrl = null;
  }

  return (
    <section className="my-12">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative h-[60vh] lg:w-[50%] w-full">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Craft story"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/60 to-white" />
          </div>
          <div className="p-6 lg:p-10 lg:w-[50%] w-full">
            <h2 className="text-4xl md:text-4xl md:text-5xl   font-serif font-semibold mb-4">
              {story.title}
            </h2>
            <p className="text-base leading-7 text-gray-700 mb-2">
              {story.para1}
            </p>
            <p className="text-base leading-7 text-gray-700">{story.para2}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
