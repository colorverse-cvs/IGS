import React, { useEffect, useState } from "react";
import SlideshowStripe from "../components/SlideshowStripe.jsx";
import carouselData from "../data/carousel.json";
import Clippathgroup from "../assets/clip-path-group.svg";
import { useNavigate, useLocation } from "react-router-dom";
import CollectionPage from "./CollectionPage.jsx";
import ExploreCollections from "./ExploreCollections.jsx";
import CustomizationWorksPage from "./CustomizationWorksPage.jsx";
import TestimonialsPage from "./TestimonialsPage.jsx";
import testimonials from "../data/testimonials.json";
import CustomOrderModal from "../components/CustomOrderModal.jsx";
// import useAuth from "../hooks/useAuth";


export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
  // const { isAuthenticated, user } = useAuth();

  // console.log("HomePage Auth Status:", { isAuthenticated, user });

  // When there's a hash in the URL (e.g. /#section-<id>), scroll to the section
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    // Longer delay to ensure elements are rendered after navigation
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const nav = document.querySelector("nav");
        const offset = nav && nav.offsetHeight ? nav.offsetHeight : 80;
        const top =
          el.getBoundingClientRect().top + window.scrollY - offset - 12;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 150);
    return () => clearTimeout(t);
  }, [location]);

  const breadcrumbItems = [{ label: "Home" }];

  return (
    <>
      <div className="bg-white px-4 md:px-15 lg:px-20">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8 py-12">
          {/* Left Text Block */}
          <div className="flex flex-col justify-between w-full lg:w-[40%]">
            <div>
              <h1 className="text-4xl md:text-5xl pb-4  xl:text-6xl font-bold leading-tight text-gray-900">
                Exquisite Statues for Every Space
              </h1>
              <p className="text-gray-600 text-sm">
                Discover our collection of handcrafted god statues, motivational
                sculptures, and custom artwork. Transform your space with
                timeless art.
              </p>
              <div className="flex flex-col md:flex-row flex-wrap gap-4 py-5">
                <button
                  onClick={() => navigate("/filter")}
                  className="cursor-pointer bg-brand-900 text-white py-1 px-4 rounded-md font-medium hover:bg-purple-800 transition"
                >
                  Explore Collection
                </button>
                <button
                  onClick={() => setIsCustomOrderModalOpen(true)}
                  className="cursor-pointer border-2 border-brand-700 text-brand-700  py-1 px-4 rounded-md font-medium hover:bg-purple-50 transition"
                >
                  Custom Order
                </button>
              </div>
              <div className="flex items-center gap-3 mb-5 border-gray-300 rounded-lg px-3 py-1 w-fit shadow-sm">
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
            <div className="container mx-auto grid md:grid-cols-2 gap-6 md:gap-2 m-6 lg:mb-0 lg:mt-2 xl:mt-10">
              <div className="relative rounded-2xl overflow-hidden w-full object-cover">
                <SlideshowStripe
                  items={carouselData.itemsLeftTop || carouselData.items}
                  autoplayMs={carouselData.autoplayMs}
                  autoplay={true}
                  showPrevNext={false}
                  showIndicators={false}
                  className="w-full h-[150px] lg:h-full"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden w-full object-cover">
                <SlideshowStripe
                  items={carouselData.itemsLeftBottom || carouselData.items}
                  autoplayMs={carouselData.autoplayMs}
                  autoplay={true}
                  showPrevNext={false}
                  showIndicators={false}
                  className="w-full h-[150px] lg:h-full"
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
              className="w-full h-[500px] md:h-full"
            />
          </div>
        </section>
      </div>
      <div>
        <CollectionPage />
      </div>
      <div className="bg-brand-50">
        <div className="px-4 md:px-15 lg:px-20">
          <div className="container py-20 mx-auto">
            <ExploreCollections />
          </div>
        </div>
      </div>

      <CustomizationWorksPage />
      <section className="bg-brand-50">
        <TestimonialsPage items={testimonials} />
      </section>
      <CustomOrderModal
        isOpen={isCustomOrderModalOpen}
        onClose={() => setIsCustomOrderModalOpen(false)}
      />
    </>
  );
}
