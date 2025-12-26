import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RibbonImage from "/public/assets/images/Purple-Bow-Gift-Ribbon.png";
import Rect16 from "/public/assets/images/Rectangle 16.png";
import Rect17 from "/public/assets/images/Rectangle 17.png";
import Rect18 from "/public/assets/images/Rectangle 18.png";
import LeftRings from "/public/assets/images/ring_vector1.png";
import RightRings from "/public/assets/images/ring_vector2.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import CarouselRow from "../components/CarouselRow";
import ProductCard from "../components/ProductCard";
import testimonials from "../data/testimonials.json";
import TestimonialsPage from "./TestimonialsPage.jsx";

const heroCards = [
  { id: "rect-16", image: Rect16, alt: "Shivaji Maharaj statue 1" },
  { id: "rect-17", image: Rect17, alt: "Shivaji Maharaj statue 2" },
  { id: "rect-18", image: Rect18, alt: "Shivaji Maharaj statue 3" },
];

const artisans = [
  {
    id: "aditya-1",
    name: "Aditya Deshmukh",
    role: "Founder & Creative Director",
    bio: "A lifelong admirer of Indian history, Aditya envisioned a platform that celebrates valor and heritage through handcrafted artistry.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aditya-2",
    name: "Aditya Deshmukh",
    role: "Founder & Creative Director",
    bio: "A second-generation craftsman who blends classical details with modern silhouettes to keep India’s legacy alive.",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aditya-3",
    name: "Aditya Deshmukh",
    role: "Founder & Creative Director",
    bio: "A designer rooted in Pune’s artisan lanes, Aditya mentors the studio’s young sculptors and preserves oral craft traditions.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, status } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const shivajiProducts = products.filter(
    (product) => product.categoryId === "shivaji" || product.category?.toLowerCase().includes("shivaji")
  ).slice(0, 4);

  return (
    <main className="bg-white">
      <section className="overflow-hidden bg-gradient-to-b from-[#a23fe0] via-[#bd6cf7] to-[#f5e6ff] pt-24 px-4 md:px-15 lg:px-20 mx-auto">
        <div className="relative container mx-auto w-full">
          <div className="relative mx-auto">
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={LeftRings}
                alt=""
                className="hidden md:block absolute top-[-5%] left-[2%] w-[8%] opacity-90"
              />
              <img
                src={RightRings}
                alt=""
                className="hidden md:block absolute bottom-[-5%] right-[2%] w-[8%] opacity-90"
              />
            </div>
            <div className="bg-white w-full rounded-2xl shadow-[0_30px_90px_rgba(103,25,165,0.25)] px-[10%] lg:px-[15%] py-12 text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
                Where Art Meets Legacy
              </h1>
              <p className="mt-4 text-gray-600 w-[80%] mx-auto text-sm md:text-base leading-relaxed">
                We celebrate India&rsquo;s legacy through handcrafted miniature
                statues - each piece inspired by bravery, divinity, and timeless
                craftsmanship.
              </p>
              <button
                type="button"
                onClick={() => navigate("/filter")}
                className="cursor-pointer mt-6 inline-flex items-center justify-center px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#7b21b0] hover:bg-[#6a199c] transition"
              >
                Explore Collection
              </button>

              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {heroCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-lg border border-purple-100 overflow-hidden shadow-lg"
                  >
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="w-full h-40 xl:h-60 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative w-full flex flex-col items-center top-[10%]">
            <img
              src={RibbonImage}
              alt="Purple ribbon"
              className=" bottom-[-100px] w-[260px] sm:w-[340px] md:w-[70%] z-[9]"
            />
          </div>
        </div>
      </section>

      <section className="px-4 md:px-15 lg:px-20 py-20 bg-gradient-to-b from-[#faf1ff] to-white">
        <div className="container mx-auto w-full">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Meet the Minds Behind the Craft
            </h2>
            <p className="mt-3 text-gray-600 mx-auto text-sm md:text-base">
              Two passionate creators, one shared dream—to bring India&rsquo;s
              art, culture, and pride to every home.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artisans.map((person) => (
              <article
                key={person.id}
                className="relative rounded-[34px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-[360px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="text-3xl font-bold">{person.name}</div>
                  <p className="text-sm text-white/80">{person.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/90">
                    {person.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4e6ff] py-20 px-4 md:px-15 lg:px-20">
        <div className="container mx-auto w-full">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Where Tradition Meets Creation
            </h2>
            <p className="mt-3 text-gray-600 text-sm md:text-base mx-auto">
              High-fidelity Shivaji Maharaj statuettes that celebrate courage,
              guardianship, and timeless craftsmanship.
            </p>
          </div>

          <div className="mt-12">
            <CarouselRow
              items={shivajiProducts}
              renderItem={(product) => <ProductCard product={product} />}
              showIndicators={false}
            />
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => navigate("/filter?category=shivaji")}
              className="cursor-pointer inline-flex items-center justify-center px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#7b21b0] hover:bg-[#6a199c] transition"
            >
              Explore more
            </button>
          </div>
        </div>
      </section>
      <section>
        <TestimonialsPage items={testimonials} />
      </section>
    </main>
  );
}
