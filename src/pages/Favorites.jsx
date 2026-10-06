import { ArrowUpRight, CalendarDays, Heart, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const getImage = (images) => {
  if (Array.isArray(images)) return images[0];
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : images;
    } catch {
      return images;
    }
  }
  return "";
};

const Favorites = () => {
  const [destinations, setDestinations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/favorites/getAllFavorites"),
      api.get("/gallery/favorites"),
    ])
      .then(([destinationResponse, postResponse]) => {
        setDestinations(destinationResponse.data.data || []);
        setPosts(postResponse.data.data || []);
      })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load favorites"))
      .finally(() => setIsLoading(false));
  }, []);

  const removeDestination = async (destination) => {
    try {
      await api.delete(`/favorites/removeFavorite/${destination.destination_id}`);
      setDestinations((current) => current.filter((item) => item.id !== destination.id));
      toast.success("Destination removed from favorites");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove destination");
    }
  };

  const removePost = async (post) => {
    try {
      await api.delete(`/gallery/discover/${post.id}/favorite`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      toast.success("Post removed from favorites");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove post");
    }
  };

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-rose-600">Saved for later</p>
          <h1 className="mt-2 font-display text-4xl text-slate-900">Your favorites</h1>
          <p className="mt-2 text-sm text-slate-500">Places to visit and travel notes worth keeping.</p>
        </div>
        <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">Discover more <ArrowUpRight size={16} /></Link>
      </div>

      {isLoading ? <p className="py-10 text-sm text-slate-500">Loading your favorites...</p> : (
        <>
          <section className="mt-8">
            <div className="flex items-center gap-2"><MapPin size={18} className="text-emerald-700" /><h2 className="font-display text-2xl text-slate-900">Saved places</h2><span className="text-sm text-slate-400">{destinations.length}</span></div>
            {destinations.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <article key={destination.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                  {getImage(destination.images) && <img src={getImage(destination.images)} alt={destination.name} className="h-40 w-full object-cover" />}
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div><h3 className="font-display text-xl text-slate-900">{destination.name}</h3><p className="mt-1 text-sm text-slate-500">{[destination.city, destination.country].filter(Boolean).join(", ")}</p></div>
                    <button type="button" onClick={() => removeDestination(destination)} aria-label={`Remove ${destination.name} from favorites`} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={17} /></button>
                  </div>
                </article>
              ))}
            </div> : <p className="mt-3 text-sm text-slate-500">No saved places yet.</p>}
          </section>

          <section className="mt-10">
            <div className="flex items-center gap-2"><Heart size={18} className="text-rose-600" /><h2 className="font-display text-2xl text-slate-900">Saved traveler posts</h2><span className="text-sm text-slate-400">{posts.length}</span></div>
            {posts.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                  {getImage(post.images) && <img src={getImage(post.images)} alt={`${post.place_name} shared by ${post.author_name || "a traveler"}`} className="h-40 w-full object-cover" />}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl text-slate-900">{post.place_name}</h3><p className="mt-1 text-xs text-slate-500">Shared by {post.author_name || "Traveler"}</p></div><button type="button" onClick={() => removePost(post)} aria-label={`Remove ${post.place_name} post from favorites`} className="p-1 text-rose-600 hover:text-rose-800"><Heart size={17} className="fill-current" /></button></div>
                    {post.visited_date && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />{new Date(post.visited_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</p>}
                    {post.trip_details && <p className="mt-3 text-sm font-semibold text-emerald-800">{post.trip_details}</p>}
                    {post.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>}
                  </div>
                </article>
              ))}
            </div> : <p className="mt-3 text-sm text-slate-500">Save a traveler post from Discover to keep its trip notes here.</p>}
          </section>
        </>
      )}
    </section>
  );
};

export default Favorites;