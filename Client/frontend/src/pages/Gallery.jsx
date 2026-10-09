import { ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const TARGET_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2560;
const MIN_IMAGE_DIMENSION = 1200;
const MAX_GALLERY_PHOTOS = 8;

const compressImage = async (file) => {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (
      file.size <= TARGET_IMAGE_SIZE &&
      Math.max(bitmap.width, bitmap.height) <= MAX_IMAGE_DIMENSION
    ) {
      return file;
    }

    let scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    let quality = 0.84;
    let bestBlob = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image compression is unavailable");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const currentQuality = quality;
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", currentQuality),
      );
      if (!blob || blob.type !== "image/webp")
        throw new Error("This image format cannot be compressed in your browser");
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= TARGET_IMAGE_SIZE) break;

      if (attempt === 0) {
        quality = 0.76;
      } else if (attempt === 1) {
        const nextScale = scale * 0.9;
        if (
          Math.max(bitmap.width, bitmap.height) * nextScale <
          MIN_IMAGE_DIMENSION
        ) {
          break;
        }
        scale = nextScale;
        quality = 0.84;
      }
    }

    if (!bestBlob || bestBlob.size >= file.size) return file;

    const compressedName = `${file.name.replace(/\.[^.]+$/, "")}.webp`;
    return new File([bestBlob], compressedName, {
      type: bestBlob.type,
      lastModified: file.lastModified,
    });
  } finally {
    bitmap?.close();
  }
};

const compressImages = async (files) => {
  const photos = new Array(files.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < files.length) {
      const index = nextIndex;
      nextIndex += 1;
      photos[index] = await compressImage(files[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(files.length, 2) }, () => worker()),
  );
  return photos;
};

const emptyForm = {
  place_name: "",
  trip_details: "",
  visited_date: "",
  description: "",
  is_public: false,
  transport: "",
  food: "",
  stays: "",
  highlights: "",
  challenges: "",
  alternatives: "",
  photos: [],
};

const adviceFields = [
  ["transport", "Getting around", "Cheap transport, transit passes, or useful local routes"],
  ["food", "Food and drink", "Affordable meals, local favorites, and places worth trying"],
  ["stays", "Where to stay", "Good areas to stay and accommodation tips"],
  ["highlights", "Best places to visit", "Places and experiences you recommend"],
  ["challenges", "Difficulties faced", "What was inconvenient, costly, or hard to plan"],
  ["alternatives", "Better alternatives", "A better route, option, or plan for next time"],
];

const getImages = (images) => {
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
    } catch {
      return images ? [images] : [];
    }
  }
  return [];
};

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const { data } = await api.get("/gallery");
        setGallery(data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load your gallery");
      }
    };

    loadGallery();
  }, []);

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  const selectPhotos = async (event) => {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files || []);
    const files = selectedFiles.slice(0, MAX_GALLERY_PHOTOS);
    if (!files.length) return;
    if (selectedFiles.length > MAX_GALLERY_PHOTOS) {
      toast.error(`You can upload up to ${MAX_GALLERY_PHOTOS} photos.`);
    }

    setIsCompressing(true);
    try {
      const photos = await compressImages(files);
      setForm((current) => ({ ...current, photos }));
    } catch (error) {
      toast.error(error.message || "Unable to prepare the selected images");
    } finally {
      setIsCompressing(false);
      input.value = "";
    }
  };

  const openCreateForm = () => {
    setEditingEntry(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (entry) => {
    setEditingEntry(entry);
    setForm({
      place_name: entry.place_name || "",
      trip_details: entry.trip_details || "",
      visited_date: entry.visited_date ? entry.visited_date.slice(0, 10) : "",
      description: entry.description || "",
      is_public: Boolean(entry.is_public),
      transport: entry.transport || "",
      food: entry.food || "",
      stays: entry.stays || "",
      highlights: entry.highlights || "",
      challenges: entry.challenges || "",
      alternatives: entry.alternatives || "",
      photos: [],
    });
    setIsFormOpen(true);
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    if (!editingEntry && !form.photos.length)
      return toast.error("Add at least one photo.");
    setIsSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "photos") payload.append(key, value);
      });
      form.photos.forEach((photo) => payload.append("photos", photo));
      const { data } = editingEntry
        ? await api.put(`/gallery/${editingEntry.id}`, payload, { timeout: 180000 })
        : await api.post("/gallery", payload, { timeout: 180000 });
      setGallery((current) =>
        editingEntry
          ? current.map((entry) =>
              entry.id === editingEntry.id ? data.data : entry,
            )
          : [data.data, ...current],
      );
      setForm(emptyForm);
      setEditingEntry(null);
      setIsFormOpen(false);
      toast.success(editingEntry ? "Gallery memory updated" : "Memory added to your gallery");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (error.request
            ? "The upload connection was interrupted. Your photos are still selected; please try again."
            : "Unable to add gallery memory"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeEntry = async (entry) => {
    if (!window.confirm(`Delete the memory from ${entry.place_name}? This cannot be undone.`)) return;

    try {
      await api.delete(`/gallery/${entry.id}`);
      setGallery((current) => current.filter((item) => item.id !== entry.id));
      toast.success("Gallery memory removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove gallery memory");
    }
  };

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
            Your memories
          </p>
          <h1 className="mt-2 font-display text-4xl text-slate-900">
            Personal gallery
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white"
        >
          <ImagePlus size={17} /> Add memory
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Your gallery is empty. Add photos from a place you visited.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((entry) => (
            <article
              key={entry.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5"
            >
              <button
                type="button"
                onClick={() => setViewingEntry(entry)}
                className="grid h-48 shrink-0 grid-cols-2 grid-rows-2 gap-1 bg-slate-100 text-left"
                aria-label={`View photos from ${entry.place_name}`}
              >
                {getImages(entry.images).slice(0, 4).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={entry.place_name}
                    className="h-full min-h-0 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </button>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-1 font-display text-2xl text-slate-900">
                      {entry.place_name}
                    </h2>
                    <p className="mt-1 min-h-4 text-xs text-slate-500">
                      {entry.visited_date
                        ? new Date(entry.visited_date).toLocaleDateString()
                        : "Date not added"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(entry)}
                      aria-label={`Edit ${entry.place_name} memory`}
                      className="text-slate-400 hover:text-emerald-700"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry)}
                      aria-label={`Delete ${entry.place_name} memory`}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 min-h-5 line-clamp-1 text-sm text-slate-600">
                  {entry.trip_details || "Trip details not added"}
                </p>
                <p className="mt-2 min-h-[72px] line-clamp-3 text-sm leading-6 text-slate-500">
                  {entry.description}
                </p>
                <p className={`mt-3 text-xs font-bold ${entry.is_public ? "text-emerald-700" : "text-slate-400"}`}>
                  {entry.is_public ? "Shared in Discover" : "Private memory"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4">
          <form
            onSubmit={saveEntry}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                  Travel post
                </p>
                <h2 className="mt-2 font-display text-3xl text-slate-900">
                  {editingEntry ? "Edit travel memory" : "Add a travel memory"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close gallery form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={selectPhotos}
                disabled={isCompressing || isSaving}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-bold file:text-emerald-800"
                required={!editingEntry && form.photos.length === 0}
              />
              <p className="text-xs text-slate-500">
                You can upload up to {MAX_GALLERY_PHOTOS} photos per memory.
              </p>
              {isCompressing && (
                <p className="text-xs text-slate-500">Compressing large images...</p>
              )}
              {form.photos.length > 0 && !isCompressing && (
                <p className="text-xs text-slate-500">
                  {form.photos.length} {form.photos.length === 1 ? "photo" : "photos"} ready to upload
                </p>
              )}
              <input
                value={form.place_name}
                onChange={updateField("place_name")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Place name, e.g. Goa"
                required
              />
              <input
                value={form.trip_details}
                onChange={updateField("trip_details")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Trip details"
              />
              <input
                type="date"
                value={form.visited_date}
                onChange={updateField("visited_date")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <textarea
                value={form.description}
                onChange={updateField("description")}
                className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Tell other travelers about your experience"
              />
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-800">Help someone plan this trip</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Add as many practical tips as you like. They will be grouped into a guide on the place page.</p>
              </div>
              {adviceFields.map(([field, label, placeholder]) => (
                <label key={field} className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
                  <textarea
                    value={form[field]}
                    onChange={updateField(field)}
                    className="min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    placeholder={placeholder}
                  />
                </label>
              ))}
              <label className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(event) => setForm({ ...form, is_public: event.target.checked })}
                  className="mt-1 h-4 w-4 accent-emerald-800"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">Share this post publicly in Discover</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Your name, visit date, photos, story, and tips will be visible to other visitors. You can change this any time.</span>
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="mt-6 w-full rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white"
            >
              {isSaving
                ? editingEntry
                  ? "Updating..."
                  : "Uploading..."
                : editingEntry
                  ? "Update memory"
                  : "Save memory"}
            </button>
          </form>
        </div>
      )}

      {viewingEntry && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/80 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${viewingEntry.place_name} photos`}
          onClick={() => setViewingEntry(null)}
        >
          <div
            className="mx-auto max-w-5xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                  Travel memory
                </p>
                <h2 className="mt-2 font-display text-3xl text-slate-900">
                  {viewingEntry.place_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingEntry(null)}
                aria-label="Close photo viewer"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {getImages(viewingEntry.images).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt={viewingEntry.place_name}
                  className="max-h-[70vh] w-full rounded-2xl bg-slate-100 object-contain"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
