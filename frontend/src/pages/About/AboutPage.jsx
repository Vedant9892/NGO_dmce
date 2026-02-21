import { Link } from "react-router-dom";
import { Target, Lightbulb, Users, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC]">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            About ServeSync
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Empowering NGOs and volunteers through technology to create
            measurable, scalable, and meaningful social impact.
          </p>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              The Problem We Identified
            </h2>
            <p className="text-gray-600 leading-relaxed">
              NGOs often struggle to efficiently manage volunteers, coordinate
              events, track attendance, and maintain proper engagement records.
              Communication becomes fragmented across platforms, and impact
              tracking remains inconsistent and manual. Volunteers also lack a
              structured way to track their contribution history and showcase
              their social work portfolio.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-lg">
            <Target className="text-emerald-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To simplify volunteer coordination and create a centralized,
              data-driven ecosystem where social impact can be tracked,
              measured, and scaled efficiently.
            </p>
          </div>

        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <Lightbulb className="text-emerald-700 mx-auto mb-6" size={50} />

          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Our Solution
          </h2>

          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            ServeSync is a centralized Volunteer Management and Event
            Coordination Platform designed to bridge the gap between NGOs and
            volunteers. Our platform enables NGOs to create and manage events,
            define volunteer roles, track registrations, and monitor attendance
            using smart QR-based systems. Volunteers can discover opportunities,
            track their participation history, and build a verified impact
            portfolio â€” all in one place.
          </p>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 px-6 bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div className="bg-white p-10 rounded-2xl shadow-md">
            <Users className="text-emerald-700 mx-auto mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-3">Community First</h3>
            <p className="text-gray-600">
              We believe strong communities are built through collective effort
              and transparent collaboration.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-md">
            <Globe className="text-emerald-700 mx-auto mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-3">Scalable Impact</h3>
            <p className="text-gray-600">
              Technology should amplify social change by making operations
              organized and measurable.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-md">
            <Target className="text-purple-600 mx-auto mb-4" size={40} />
            <h3 className="font-semibold text-lg mb-3">Transparency</h3>
            <p className="text-gray-600">
              Clear data, accurate attendance tracking, and structured
              reporting create trust within the ecosystem.
            </p>
          </div>

        </div>
      </section>

      {/* FUTURE VISION */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Our Vision
          </h2>

          <p className="text-gray-600 leading-relaxed">
            We envision a future where every volunteer contribution is digitally
            recorded, recognized, and valued. ServeSync aims to become a
            scalable solution that NGOs across cities and countries can adopt
            to create structured volunteer ecosystems that drive measurable
            social change.
          </p>

          <div className="mt-10">
            <Link
              to="/events"
              className="px-8 py-4 bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition"
            >
              Explore Opportunities <ArrowRight className="inline ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
