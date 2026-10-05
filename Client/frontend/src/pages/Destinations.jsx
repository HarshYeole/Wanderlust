import { CalendarDays, BusFront, BedDouble, MapPin, Utensils, Lightbulb, CircleAlert, Heart, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SearchBar from "../components/SearchBar";
import api from "../services/api";

const guideSections = [
  { key: "transport", label: "Getting around", Icon: BusFront },
  { key: "food", label: "Food worth finding", Icon: Utensils },
  { key: "stays", label: "Where to stay", Icon: BedDouble },
  { key: "highlights", label: "Don't miss", Icon: MapPin },
  { key: "challenges", label: "Things to plan for", Icon: CircleAlert },
  { key: "alternatives", label: "Better alternatives", Icon: Lightbulb },
];

const getPlaceKey = (placeName) => placeName.trim().toLowerCase();

const Destinations = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [savedPlaceKeys, setSavedPlaceKeys] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const normalizedQuery = query.trim();

  useEffect(() => {
    let cancelled = false;
    if (normalizedQuery.length < 2) {
      setPosts([]);
      setIsLoading(false);
      return undefined;
    }

    setPosts([]);
    setIsLoading(true);
    const timer = setTimeout(() => {
      api.get("/gallery/discover", { params: { place: normalizedQuery } })
        .then(({ data }) => {
          if (!cancelled) {
            setPosts(data.data || []);
            setLikedPostIds((data.data || []).filter((post) => post.user_liked).map((post) => Number(post.id)));
          }
          if (!cancelled && localStorage.getItem("accessToken")) {
            api.get("/favorites/getAllFavorites")
              .then(({ data: placeResponse }) => {
                if (cancelled) return;
                setSavedPlaceKeys((placeResponse.data || [])
                  .filter((favorite) => favorite.favorite_type === "curated_place")
                  .map((favorite) => getPlaceKey(favorite.name)));
              })
              .catch(() => {});
          }
        })
        .catch((error) => {
          if (!cancelled) toast.error(error.response?.data?.message || "Unable to load public travel posts");
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalizedQuery]);

  const toggleSavedPost = async (post) => {
    if (!localStorage.getItem("accessToken")) {
      toast("Log in to save travel posts.");
      navigate("/login");
      return;
    }

    const placeKey = getPlaceKey(post.place_name);
    const isSaved = savedPlaceKeys.includes(placeKey);
    try {
      if (isSaved) {
        await Promise.all([
          api.delete(`/gallery/discover/${post.id}/favorite`),
          api.delete(`/favorites/removeFavorite/${encodeURIComponent(placeKey)}`),
        ]);
        setSavedPlaceKeys((current) => current.filter((key) => key !== placeKey));
        toast.success("Place removed from favorites");
      } else {
        await Promise.all([
          api.post(`/gallery/discover/${post.id}/favorite`),
          api.post("/favorites/createFavorite", {
            destination_id: placeKey,
            name: post.place_name,
            country: post.country || "",
            image: Array.isArray(post.images) ? post.images[0] : "",
          }),
        ]);
        setSavedPlaceKeys((current) => current.includes(placeKey) ? current : [...current, placeKey]);
        toast.success("Place and post saved to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update favorites");
    }
  };

  const togglePostLike = async (post) => {
    if (!localStorage.getItem("accessToken")) {
      toast("Log in to like travel posts.");
      navigate("/login");
      return;
    }

    const postId = Number(post.id);
    const isLiked = likedPostIds.includes(postId);
    try {
      const { data } = isLiked
        ? await api.delete(`/gallery/discover/${post.id}/like`)
        : await api.post(`/gallery/discover/${post.id}/like`);
      setLikedPostIds((current) => isLiked
        ? current.filter((id) => id !== postId)
        : current.includes(postId) ? current : [...current, postId]);
      setPosts((current) => current
        .map((item) => item.id === post.id
          ? { ...item, like_count: data.data.like_count, user_liked: !isLiked }
          : item)
        .sort((first, second) => Number(second.like_count) - Number(first.like_count)));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update like");
    }
  };

  return (
    <section className="page-shell py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Discover through traveler stories</p>
        <h1 className="mt-3 font-display text-5xl text-slate-900 sm:text-6xl">Find people who've been there.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-slate-600">Search a place to see public travel posts and practical advice shared by people who have visited.</p>
      </div>

      <div className="mt-8 max-w-xl"><SearchBar value={query} onChange={setQuery} /></div>

      {normalizedQuery.length < 2 ? (
        <div className="mt-10 border-y border-slate-200 py-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Try searching for a place</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Goa", "Kyoto", "Bali", "Jaipur", "Manali"].map((place) => (
              <button key={place} type="button" onClick={() => setQuery(place)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800">{place}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Public traveler posts</p><h2 className="mt-1 font-display text-3xl text-slate-900">People who visited {normalizedQuery}</h2></div>
              {!isLoading && <span className="text-sm text-slate-500">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>}
            </div>
            {isLoading ? <p className="mt-6 text-sm text-slate-500">Finding public posts...</p> : posts.length ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {posts.map((post) => {
                  const images = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
                  const activeImageIndex = Math.min(selectedPhotos[post.id] || 0, images.length - 1);
                  const postAdvice = guideSections.filter((section) => post[section.key]?.trim());
                  return (
                    <article key={post.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
                      {images.length > 0 ? (
                        <div className="bg-slate-100 p-2">
                          <img
                            src={images[activeImageIndex]}
                            alt={`${post.place_name}, view ${activeImageIndex + 1} of ${images.length}`}
                            className="h-56 w-full rounded-lg object-cover"
                          />
                          {images.length > 1 && (
                            <div className="mt-2 grid grid-cols-4 gap-2" role="group" aria-label={`${post.place_name} photo thumbnails`}>
                              {images.map((image, index) => (
                                <button
                                  key={`${post.id}-${image}`}
                                  type="button"
                                  onClick={() => setSelectedPhotos((current) => ({ ...current, [post.id]: index }))}
                                  aria-label={`Show photo ${index + 1} of ${images.length}`}
                                  aria-pressed={activeImageIndex === index}
                                  className={`overflow-hidden rounded-md border-2 ${activeImageIndex === index ? "border-emerald-700" : "border-transparent hover:border-emerald-400"}`}
                                >
                                  <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : <div className="grid h-40 place-items-center bg-emerald-50 text-sm font-semibold text-emerald-800">{post.place_name}</div>}
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div><h3 className="font-display text-2xl text-slate-900">{post.place_name}</h3><p className="mt-1 text-sm text-slate-600">Shared by {post.author_name || "Traveler"}</p></div>
                          <div className="flex items-center gap-3">
                            {post.visited_date && <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />{new Date(post.visited_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>}
                            <button type="button" onClick={() => togglePostLike(post)} aria-label={`${likedPostIds.includes(Number(post.id)) ? "Unlike" : "Like"} this trip post, ${Number(post.like_count || 0)} likes`} title={likedPostIds.includes(Number(post.id)) ? "Unlike this post" : "Like this post"} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold transition ${likedPostIds.includes(Number(post.id)) ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                              <ThumbsUp size={15} className={likedPostIds.includes(Number(post.id)) ? "fill-current" : ""} /> {Number(post.like_count || 0)}
                            </button>
                            <button type="button" onClick={() => toggleSavedPost(post)} aria-label={`${savedPlaceKeys.includes(getPlaceKey(post.place_name)) ? "Remove" : "Save"} ${post.place_name} ${savedPlaceKeys.includes(getPlaceKey(post.place_name)) ? "from" : "to"} favorite destinations`} title={savedPlaceKeys.includes(getPlaceKey(post.place_name)) ? "Remove place from favorites" : "Save place to favorites"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-rose-600 transition hover:bg-rose-50">
                              <Heart size={17} className={savedPlaceKeys.includes(getPlaceKey(post.place_name)) ? "fill-current" : ""} />
                            </button>
                          </div>
                        </div>
                        {post.trip_details && <p className="mt-4 text-sm font-semibold text-emerald-800">{post.trip_details}</p>}
                        {post.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{post.description}</p>}
                        {postAdvice.length > 0 && (
                          <details className="mt-5 border-t border-slate-100 pt-4">
                            <summary className="cursor-pointer text-sm font-bold text-emerald-800">
                              Trip planning advice ({postAdvice.length} topics)
                            </summary>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {postAdvice.map(({ key, label, Icon }) => (
                                <div key={key}>
                                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700"><Icon size={14} className="text-emerald-700" />{label}</h4>
                                  <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-600">{post[key]}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : <p className="mt-6 text-sm text-slate-500">No public posts for {normalizedQuery} yet.</p>}
          </section>

        </>
      )}
    </section>
  );
};
export default Destinations;
