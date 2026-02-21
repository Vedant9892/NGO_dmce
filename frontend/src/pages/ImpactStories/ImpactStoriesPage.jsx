import { Link } from "react-router-dom";
import { Heart, Users, Calendar, ArrowRight } from "lucide-react";

export default function ImpactStoriesPage() {
  const stories = [
    {
      id: 1,
      title: "500+ Students Empowered Through Education Drive",
      description:
        "Volunteers collaborated with local NGOs to distribute study materials and conduct mentorship sessions for underprivileged students.",
      image:
        "https://images.unsplash.com/photo-1588072432836-e10032774350",
      impact: "500+ Students Benefited",
    },
    {
      id: 2,
      title: "City Clean-Up Campaign Reduced Waste by 2 Tons",
      description:
        "Coordinated environmental initiative involving 120 volunteers cleaning public spaces and raising awareness.",
      image:
        "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
      impact: "2 Tons Waste Collected",
    },
    {
      id: 3,
      title: "Health Camp Served 800+ Patients",
      description:
        "Free medical check-up and awareness drive organized with healthcare professionals and volunteers.",
      image:
        "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b",
      impact: "800+ Patients Treated",
    },
  ];

  return (
    <div className="bg-[#F8FAFC]">

      {/* HERO */}
      <section className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 px-6 text-white text-center">
        <h1 className="text-5xl font-bold mb-6">
          Impact Stories
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-white/90">
          Real stories of volunteers and NGOs making measurable change
          through structured coordination and collaboration.
        </p>
      </section>

      {/* FEATURED STORY */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac"
            alt="Featured Impact"
            className="h-full w-full object-cover"
          />
          <div className="p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">
              1000+ Volunteer Hours Logged in a Month
            </h2>
            <p className="text-gray-600 mb-6">
              Through ServeSyncâ€™s coordinated event system and attendance tracking,
              NGOs were able to streamline volunteer efforts and collectively
              contribute over 1000 verified hours of community service in just one month.
            </p>
            <div className="flex items-center gap-4 text-emerald-700 font-semibold">
              <Heart size={20} />
              Verified Impact Data
            </div>
          </div>
        </div>
      </section>

      {/* STORIES GRID */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden"
            >
              <img
                src={story.image}
                alt={story.title}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-3">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {story.description}
                </p>
                <div className="text-emerald-700 font-semibold text-sm">
                  {story.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div>
            <Users className="mx-auto text-emerald-700 mb-4" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">10,000+</h3>
            <p className="text-gray-600 mt-2">Volunteers Engaged</p>
          </div>

          <div>
            <Calendar className="mx-auto text-emerald-700 mb-4" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600 mt-2">Events Coordinated</p>
          </div>

          <div>
            <Heart className="mx-auto text-purple-600 mb-4" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">25+</h3>
            <p className="text-gray-600 mt-2">Cities Covered</p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Become Part of the Next Impact Story
        </h2>
        <Link
          to="/events"
          className="px-8 py-4 bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition"
        >
          Explore Events <ArrowRight className="inline ml-2" size={18} />
        </Link>
      </section>

    </div>
  );
}
