import { ArrowLeft, CalendarDays, Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const destinations = {
  dolomites: {
    name: "Dolomites",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=90",
    price: "€145",
    season: "June to September",
    description: "Alpine trails, quiet mountain villages, and high-altitude views make the Dolomites a rewarding base for a slower outdoor escape.",
  },
  santorini: {
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=90",
    price: "€180",
    season: "April to October",
    description: "Whitewashed villages, volcanic beaches, and caldera paths shape a memorable island trip beyond the sunset viewpoints.",
  },
  kyoto: {
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=90",
    price: "€120",
    season: "March to May, October to November",
    description: "Historic streets, temple gardens, and neighborhood food spots reward early starts and time to wander between districts.",
  },
  marrakech: {
    name: "Marrakech",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=90",
    price: "€90",
    season: "March to May, September to November",
    description: "Explore the medina at an unhurried pace, make time for its markets, and balance the city's energy with a garden visit.",
  },
  amalfi: {
    name: "Amalfi Coast",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=90",
    price: "€210",
    season: "May to September",
    description: "Coastal paths, small harbors, and hillside towns make the Amalfi Coast best explored with room in the schedule for local buses and ferries.",
  },
  banff: {
    name: "Banff",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=90",
    price: "€135",
    season: "June to September",
    description: "A mountain base for lake walks, scenic drives, and trail days, with changing weather worth factoring into every plan.",
  },
};

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const destination = destinations[id] || {
    name: id.replaceAll("-", " "),
    country: "",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=90",
    price: "",
    season: "",
    description: "Explore traveler stories and practical tips to help plan your visit.",
  };
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (!localStorage.getItem("accessToken")) {
      setIsFavorite(false);
      return () => {
        isActive = false;
      };
    }

    api.get(`/favorites/isFavorite/${id}`)
      .then(({ data }) => {
        if (isActive) setIsFavorite(Boolean(data.data?.isFavorite));
      })
      .catch(() => {
        if (isActive) setIsFavorite(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  const toggleFavorite = async () => {
    if (!localStorage.getItem("accessToken")) {
      toast.error("Log in to save destinations.");
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/removeFavorite/${id}`);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites/createFavorite", {
          destination_id: id,
          name: destination.name,
          country: destination.country || "",
          image: destination.image,
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update favorites");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="page-shell py-8 sm:py-12">
      <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">
        <ArrowLeft size={17} /> All destinations
      </Link>
      <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <img src={destination.image} alt={destination.name} className="h-[330px] w-full object-cover sm:h-[500px]" />
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {destination.country && <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={15} /> {destination.country}</p>}
                <h1 className="mt-2 font-display text-5xl text-slate-900">{destination.name}</h1>
              </div>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={isSaving}
                className={`grid h-12 w-12 place-items-center rounded-full border transition ${isFavorite ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 text-emerald-800 hover:bg-emerald-50"} disabled:opacity-60`}
                aria-label={isFavorite ? "Remove destination from favorites" : "Save destination to favorites"}
                title={isFavorite ? "Remove from favorites" : "Save to favorites"}
              >
                <Heart size={19} className={isFavorite ? "fill-current" : ""} />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-600">
              <Star size={16} className="fill-amber-500" /> 4.9 <span className="font-normal text-slate-500">Loved by travelers</span>
            </div>
            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600">{destination.description}</p>
          </div>
          <aside className="self-start rounded-2xl bg-[#e2eee5] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Plan your stay</p>
            {destination.price && <><p className="mt-3 font-display text-3xl text-slate-900">From {destination.price}</p><p className="text-sm text-slate-500">per night</p></>}
            {destination.season && <p className="mt-6 flex items-start gap-2 border-t border-emerald-900/10 pt-4 text-sm leading-6 text-slate-700"><CalendarDays size={17} className="mt-1 shrink-0 text-emerald-800" /><span><span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Best time to visit</span>{destination.season}</span></p>}
            <Link to="/profile" className="mt-6 flex w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-900">Plan a trip</Link>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default DestinationDetails;
