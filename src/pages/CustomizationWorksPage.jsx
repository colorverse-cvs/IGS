import React from "react";
import DesignConsult from "../assets/design-consult.svg";
import CraftCreate from "../assets/craft-create.svg";
import QualityDeliver from "../assets/quality-deliver.svg";

/**
 * CustomizationWorksPage Component
 * 
 * Displays a 3-step process explaining how customization works:
 * 1. Design & Consult
 * 2. Craft & Create
 * 3. Quality & Deliver
 * 
 * For beginners:
 * - Uses StepRow component to display each step with an illustration
 * - reverse prop alternates the layout (left/right positioning)
 * - Illustrations are SVG images imported from assets folder
 */

/**
 * StepRow Component - Displays a single step in the customization process
 * @param {string} title - Step title
 * @param {string} description - Step description
 * @param {React.Component} Illustration - Component that renders the illustration
 * @param {boolean} reverse - If true, reverses the layout (image on left, text on right)
 */
const StepRow = ({ title, description, Illustration, reverse = false }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-center ${
      reverse ? "md:[&>div:first-child]:order-2" : ""
    }`}
  >
    <div>
      <h3 className="text-3xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
    <div className="flex justify-center">
      <div className="w-[80%] h-[80%] bg-brand-50 rounded-2xl">
        <Illustration />
      </div>
    </div>
  </div>
);

/**
 * Illustration Components - Render SVG images
 */
const PeopleIllustration = () => (
  <img
    src={DesignConsult}
    alt="Design & Consult"
    className="w-full h-full object-contain"
  />
);

const CraftIllustration = () => (
  <img
    src={CraftCreate}
    alt="Craft & Create"
    className="w-full h-full object-contain"
  />
);

const DeliverIllustration = () => (
  <img
    src={QualityDeliver}
    alt="Quality & Deliver"
    className="w-full h-full object-contain"
  />
);

/**
 * Main Component - CustomizationWorksPage
 */
export default function CustomizationWorksPage() {
  return (
    <section className="px-4 md:px-15 lg:px-20 py-14">
      <div className="container mx-auto text-left md:text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">
          How Customization Works
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-md mx-auto">
          From concept to creation, we guide you through every step of bringing
          your vision to life
        </p>
      </div>

      <div className="container mx-auto py-6 w-full md:w-[80%]">
        <StepRow
          title="Design & Consult"
          description="Share your unique vision with our design experts. We provide detailed sketches, material options, and a clear consultation to begin your custom artwork."
          Illustration={PeopleIllustration}
        />
        <StepRow
          reverse
          title="Craft & Create"
          description="Master artisans bring your design to life. We use premium materials and time-honored techniques to sculpt and finish your personalized masterpiece with care."
          Illustration={CraftIllustration}
        />
        <StepRow
          title="Quality & Deliver"
          description="Every piece undergoes rigorous quality checks. Your finished masterpiece is carefully packaged for safe, secure delivery right to your door, guaranteed."
          Illustration={DeliverIllustration}
        />
      </div>
    </section>
  );
}
