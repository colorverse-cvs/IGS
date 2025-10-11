import React from "react";
import SlideshowStripe from "../components/SlideshowStripe.jsx";
import ProductSection from "../components/ProductSection.jsx";
import carouselData from "../data/carousel.json";
import categoriesData from "../data/categories.json";
import Clippathgroup from "../assets/clip-path-group.svg";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="container mx-auto grid lg:grid-cols-2 gap-10 py-12 ">
        {/* Left Text Block */}
        <div
          className="flex flex-col 
min-height: 100dvh;"
        >
          <h1 className="text-6xl font-bold leading-tight text-gray-900">
            Exquisite Statues for <br /> Every Space
          </h1>
          <p className="text-gray-600 max-w-sm text-sm">
            Discover our collection of handcrafted god statues, motivational
            sculptures, and custom artwork. Transform your space with timeless
            art.
          </p>
          <div className="flex flex-wrap gap-4 py-5">
            <button
              onClick={() => navigate("/filter")}
              className="bg-purple-900 text-white py-1 px-2 rounded-lg font-medium hover:bg-purple-800 transition"
            >
              Explore Collection
            </button>
            <button className="border-2 border-purple-700 text-purple-700  py-1 px-1 rounded-lg font-medium hover:bg-purple-50 transition">
              Custom Order
            </button>
          </div>
          <div className="flex items-center gap-3 mb-5 border rounded-lg px-3 py-1 w-fit shadow-sm">
            <img src={Clippathgroup} alt="Google" className="w-6 h-6" />
            <div>
              <p className="text-gray-800 text-sm font-medium">Google Rating</p>
              <p className="text-sm">
                4.0{" "}
                <span className="text-yellow-500 text-sm font-semibold">★</span>{" "}
                <span className="text-gray-600">(105)</span>
              </p>
            </div>
          </div>
          {/* Stats Section */}
          <div className="container mx-auto xl:pt-20 grid grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden w-full h-52 object-cover">
              <SlideshowStripe
                items={carouselData.items}
                autoplayMs={carouselData.autoplayMs}
                autoplay={true}
                showPrevNext={false}
                showIndicators={false}
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden w-full h-52 object-cover">
              <SlideshowStripe
                items={carouselData.items}
                autoplay={true}
                showPrevNext={false}
                showIndicators={false}
              />
            </div>
          </div>
        </div>
        <div
          className="
min-height: 100dvh;"
        >
          <SlideshowStripe
            items={carouselData.items}
            autoplay={carouselData.autoplay}
            autoplayMs={carouselData.autoplayMs}
            showPrevNext={carouselData.showPrevNext}
            showIndicators={carouselData.showIndicators}
            className="w-full h-160"
          />
        </div>
      </section>

      {/* Main Section Title */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Featured Collection
          </h1>
          <p className="text-gray-600 text-xl">
            Our most popular and highest-rated statues
          </p>
        </div>
      </section>

      {/* Category Sections */}
      {categoriesData.sections.map((section) => (
        <div key={section.id} id={`section-${section.id}`}>
          <ProductSection
            title={section.title}
            subtitle={section.subtitle}
            products={section.products}
            showViewMore={true}
            maxItems={4}
            categoryId={section.id}
          />
        </div>
      ))}
    </div>
  );
}

export default Home;
