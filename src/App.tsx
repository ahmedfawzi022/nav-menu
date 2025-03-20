import { useState, useEffect } from "react";
import {
  Menu,
  Settings,
  X,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
} from "lucide-react";
import { Navigation } from "./components/Navigation";
import { NavItem } from "./types";
import { api } from "./api";
import { cn } from "./utils";

interface DashboardCard {
  title: string;
  company: string;
  location: string;
  postedDate: string;
  type: string;
  experience: string;
  categories: string[];
  logo: string;
}

const mockCards: DashboardCard[] = [
  {
    title: "Gaming UI Designer",
    company: "Rockstar Games",
    location: "ElMansoura, Egypt",
    postedDate: "10 days ago",
    type: "Full time",
    experience: "0 - 3y of exp",
    categories: ["Creative / Design", "IT / Software development", "Gaming"],
    logo: "/images/card-1.png",
  },
  {
    title: "Senior UX UI Designer",
    company: "Adobe",
    location: "Cairo, Egypt",
    postedDate: "2 days ago",
    type: "Remote",
    experience: "2 - 5y of exp",
    categories: ["UI/UX", "Product Design", "Software"],
    logo: "/images/card-2.png",
  },
];

function App() {
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [originalNavigation, setOriginalNavigation] = useState<NavItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setError(null);
        const data = await api.getNavigation();
        setNavigation(data);
        setOriginalNavigation(data);
        setIsDemoMode(true);
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
      }
    };

    fetchNavigation();
  }, []);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const handleSave = async () => {
    try {
      setError(null);
      await api.saveNavigation(navigation);
      setIsEditing(false);
      setOriginalNavigation(navigation);
    } catch (error) {
      console.error("Failed to save navigation:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const handleDiscard = () => {
    setNavigation(originalNavigation);
    setIsEditing(false);
    setError(null);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            {isDemoMode && (
              <div className="text-sm text-amber-600 font-medium">
                iZAM
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/*-------- Main Content---------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex gap-8">
          {/* Navigation - Desktop */}
          <aside className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-4 sticky top-24 h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <button
                onClick={toggleEditMode}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={isEditing ? "Exit edit mode" : "Enter edit mode"}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            {error && !isDemoMode && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <Navigation
              items={navigation}
              isEditing={isEditing}
              onUpdateItems={setNavigation}
              onToggleEdit={toggleEditMode}
            />
            {isEditing && (
              <div className="mt-6 flex gap-2 justify-center">
                <img
                  onClick={handleDiscard}
                  src="/images/close.png"
                  alt="close"
                  className="cursor-pointer"
                />

                <img
                  onClick={handleSave}
                  src="/images/save.png"
                  alt="Save"
                  className="flex items-center justify-center gap-2 cursor-pointer"
                />
              </div>
            )}
          </aside>

          {/* ----Main Content Area----- */}
          <main className="flex-1">
            {/* Jobs Header */}
            <div className="bg-customGreen rounded-lg shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    UI Designer in Egypt
                  </h2>
                  <span className="text-emerald-100 text-sm">
                    70 job positions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-100">Set alert</span>
                  <button
                    onClick={() => setAlertEnabled(!alertEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors",
                      alertEnabled ? "bg-white" : "bg-gray-400"
                    )}
                  >
                    <span
                      className={cn(
                        "block w-4 h-4 rounded-full transition-transform",
                        alertEnabled
                          ? "bg-emerald-600 translate-x-6"
                          : "bg-white translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/*--- Job Cards Grid-- */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {mockCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={card.logo}
                        alt={`${card.company} logo`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {card.title}
                        </h3>
                        <p className="text-emerald-600 font-medium mt-1">
                          {card.company}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {card.location}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {card.postedDate}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                            <Clock className="w-4 h-4 mr-1" />
                            {card.type}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {card.experience}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {card.categories.map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ---Mobile Navigation Overlay ----*/}
      <div
        className={cn(
          "fixed inset-0 bg-black transition-opacity duration-300 ease-in-out md:hidden z-30",
          isMobileNavOpen ? "bg-opacity-50" : "bg-opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileNavOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
            isMobileNavOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={toggleEditMode}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600"
                    aria-label="Exit edit mode"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={toggleEditMode}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Enter edit mode"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {error && !isDemoMode && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <Navigation
              items={navigation}
              isEditing={isEditing}
              onUpdateItems={setNavigation}
              onToggleEdit={toggleEditMode}
              isMobile
            />
            {isEditing && (
              <div className="mt-6 flex gap-2 sticky bottom-4 bg-white p-4 -mx-4 border-t justify-center">
                <img
                  onClick={handleDiscard}
                  src="/images/close.png"
                  alt="close"
                  className="cursor-pointer"
                />

                <img
                  onClick={handleSave}
                  src="/images/save.png"
                  alt="Save"
                  className="flex items-center justify-center gap-2 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
