import React from "react";
import SlideshowStripe from "../components/SlideshowStripe.jsx";
import carouselData from "../data/carousel.json";
import Clippathgroup from "../assets/clip-path-group.svg";
import { useNavigate } from "react-router-dom";
import Collections from "./Collections.jsx";
import CategoryMosaic from "../components/CategoryMosaic.jsx";
import HowCustomizationWorks from "../components/HowCustomizationWorks.jsx";
import Testimonials from "../components/Testimonials.jsx";
import testimonials from "../data/testimonials.json";
import Breadcrumb from "../components/Breadcrumb.jsx";

function Home() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Home" }];

  return (
    <>
      <div className="py-1 px-4 md:px-15 lg:px-20">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="bg-white px-4 md:px-15 lg:px-20">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col lg:flex-row gap-8 py-12">
          {/* Left Text Block */}
          <div className="flex flex-col justify-between w-full lg:w-[40%]">
            <div>
              <h2 className="text-4xl md:text-5xl pb-4  xl:text-6xl font-bold leading-tight text-gray-900">
                Exquisite Statues for Every Space
              </h2>
              <p className="text-gray-600 text-sm">
                Discover our collection of handcrafted god statues, motivational
                sculptures, and custom artwork. Transform your space with
                timeless art.
              </p>
              <div className="flex flex-wrap gap-4 py-5">
                <button
                  onClick={() => navigate("/filter")}
                  className="bg-brand-900 text-white py-1 px-2 rounded-lg font-medium hover:bg-brand-800 transition"
                >
                  Explore Collection
                </button>
                <button className="border-2 border-brand-700 text-purple-700  py-1 px-1 rounded-lg font-medium hover:bg-brand-50 transition">
                  Custom Order
                </button>
              </div>
              <div className="flex items-center gap-3 mb-5 border border-gray-300 rounded-lg px-3 py-1 w-fit shadow-sm">
                <img src={Clippathgroup} alt="Google" className="w-6 h-6" />
                <div>
                  <p className="text-gray-800 text-sm font-medium">
                    Google Rating
                  </p>
                  <p className="text-sm">
                    4.0{" "}
                    <span className="text-yellow-500 text-sm font-semibold">
                      ★
                    </span>{" "}
                    <span className="text-gray-600">(105)</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Stats Section */}
            <div className="container hidden mx-auto md:grid grid-cols-2 gap-2">
              <div className="relative rounded-2xl overflow-hidden w-full object-cover">
                <SlideshowStripe
                  items={carouselData.itemsLeftTop || carouselData.items}
                  autoplayMs={carouselData.autoplayMs}
                  autoplay={true}
                  showPrevNext={false}
                  showIndicators={false}
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden w-full object-cover">
                <SlideshowStripe
                  items={carouselData.itemsLeftBottom || carouselData.items}
                  autoplay={true}
                  showPrevNext={false}
                  showIndicators={false}
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[60%]">
            <SlideshowStripe
              items={carouselData.items}
              autoplay={carouselData.autoplay}
              autoplayMs={carouselData.autoplayMs}
              showPrevNext={carouselData.showPrevNext}
              showIndicators={carouselData.showIndicators}
              className="w-full h-full"
            />
          </div>
        </section>
      </div>
      <div>
        <Collections />
      </div>
      <div className="bg-brand-50">
        <div className="px-4 md:px-15 lg:px-20">
          <div className="container pt-6 pb-20 mx-auto">
            <CategoryMosaic />
          </div>
        </div>
        {/* New Mosaic Section below collections */}
      </div>

      {/* Called sections from separate components */}
      <HowCustomizationWorks />
      <Testimonials items={testimonials} />
    </>
  );
}

export default Home;
