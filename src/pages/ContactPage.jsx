import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import backgroundContact from "/assets/images/background-contact-vector.png";
import backgroundContactForm from "/assets/images/contact_form_bg.png";
import getInTouchBg from "/assets/images/Rectangle 35.png";
import testimonials from "../data/testimonials.json";
import TestimonialsPage from "./TestimonialsPage.jsx";
import { sendContactMessage } from "../utils/contactApi";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subjectType: "customization",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("idle"); // idle | submitting | success | error
  const [statusMessage, setStatusMessage] = React.useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setStatusMessage("Sending....");
    try {
      await sendContactMessage(form);
      setStatus("success");
      setStatusMessage("Thank you! Your message has been sent.");
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        "Something went wrong while sending your message. Please try again."
      );
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <main className="bg-white">
      {/* Contact Form Section */}
      <section>
        <div
          className="bg-no-repeat bg-cover bg-center py-[3rem] md:py-[5rem] px-4 md:px-15 lg:px-20"
          style={{ backgroundImage: `url(${backgroundContact})` }}
        >
          {/* Outer white card */}
          <div className="bg-white rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.15)] overflow-hidden grid grid-cols-1 md:grid-cols-[1.1fr_2fr] p-2.5">
            {/* Left contact info panel */}
            <div
              className="relative text-white p-8 md:p-10 flex flex-col justify-between rounded-lg bg-cover bg-[center_80%]"
              style={{ backgroundImage: `url(${backgroundContactForm})` }}
            >
              <div>
                <div className="text-4xl !font-semibold my-5">
                  Contact Information
                </div>
                <p className="text-sm text-white/80">
                  Say something to start a live chat!
                </p>
                <div className="text-sm flex flex-col gap-10 my-10">
                  <div className="flex items-center gap-3">
                    <Phone size={18} />
                    <span>+91 987 654 3210</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <span>info@ishitagallery.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="mt-1" />
                    <span>Andheri West, Mumbai, Maharashtra</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-lg">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                  <a
                    target="_blank"
                    href="https://facebook.com/"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="p-1" />
                  </a>
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                  <a
                    target="_blank"
                    href="https://instagram.com/"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="p-1" />
                  </a>
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                  <a
                    target="_blank"
                    href="https://x.com/"
                    rel="noopener noreferrer"
                  >
                    𝕏
                  </a>
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                  <a
                    target="_blank"
                    href="https://linkedin.com/"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="p-1" />
                  </a>
                </span>
              </div>
            </div>

            {/* Right form */}
            <div className="bg-white p-8 md:p-10">
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          ""
                        );
                        setForm((prev) => ({ ...prev, firstName: value }));
                      }}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-brand-500"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          ""
                        );
                        setForm((prev) => ({ ...prev, lastName: value }));
                      }}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-brand-500"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      value={form.email}
                      onChange={handleChange("email")}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-brand-500"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setForm((prev) => ({ ...prev, phone: value }));
                      }}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-brand-500"
                      placeholder="+91 987 654 3210"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Select Subject?
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="subjectType"
                        value="customization"
                        checked={form.subjectType === "customization"}
                        onChange={handleChange("subjectType")}
                      />
                      <span>Customization Inquiry</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="subjectType"
                        value="other"
                        checked={form.subjectType === "other"}
                        onChange={handleChange("subjectType")}
                      />
                      <span>Other Inquiry</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={handleChange("message")}
                    rows={4}
                    className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-brand-500 resize-none"
                    placeholder="Write your message..."
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {status !== "idle" && statusMessage && (
                    <p
                      className={`text-xs ${
                        status === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="ml-auto inline-flex items-center justify-center px-6 py-3 rounded-md text-sm font-semibold text-white bg-[#7b21b0] hover:bg-[#6a199c] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Get In Touch banner */}
      <section
        className="flex justify-center  h-[350px] bg-cover bg-[center_80%]"
        style={{ backgroundImage: `url(${getInTouchBg})` }}
      >
        <div className="inset-0 bg-brand-900/30" />
        <div className="mx-auto text-center">
          <h2 className="text-8xl md:text-[6rem] lg:text-[8rem] xl:text-[10rem] !font-semibold opacity-[50%] text-white/90 tracking-wide pt-[2rem]">
            Get In Touch
          </h2>
        </div>
      </section>

      <section>
        {/* Testimonials strip (same component as About page) */}
        <TestimonialsPage items={testimonials} />
      </section>
    </main>
  );
}
