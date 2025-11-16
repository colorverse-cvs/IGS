import React from "react";
import storyCopy from "../data/categoryStory.json";

/**
 * CraftStoryPage Component
 * 
 * Displays a category-specific craft story with an image and descriptive text.
 * The story content and image are loaded from categoryStory.json based on categoryId.
 * 
 * For beginners:
 * - Reads story data from categoryStory.json
 * - Falls back to a default story if category-specific story not found
 * - Displays a split layout: image on left (50%), text on right (50%)
 * - Image has a gradient overlay for better text readability
 * 
 * @param {string} categoryId - The category ID to load the story for
 */
export default function CraftStoryPage({ categoryId }) {
  const story = storyCopy[categoryId] || storyCopy.default;

  let imageUrl = null;
  try {
    imageUrl = new URL(
      story.image || `../assets/story/${categoryId || "god-statues"}.jpg`,
      import.meta.url
    ).href;
  } catch (error) {
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
            <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-semibold mb-4">
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
