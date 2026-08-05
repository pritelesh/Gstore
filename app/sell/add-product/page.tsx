"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, CheckCircle } from "lucide-react";
import { getCategories, createProduct } from "@/lib/actions/seller";
import { uploadProductImages } from "@/lib/actions/upload";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; parent_id: string | null }[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [parentId, setParentId] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then((res) => {
      if ("categories" in res) setCategories(res.categories);
    });
  }, []);

  const normalCats = categories.filter((c) => !c.parent_id).map((c) => c.name);
  const parents = categories.filter((c) => !c.parent_id);
  const selectedParent = parents.find((p) => p.id === parentId);
  const children = categories.filter((c) => c.parent_id === parentId);
  const selectedCategoryName =
    category || (selectedParent ? selectedParent.name : "") || "";

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    setError("");
    const categoryName = selectedCategoryName;
    if (!name || !price || !categoryName) {
      setError("Name, price, and category are required.");
      return;
    }

    setSubmitting(true);

    let imageUrls: string[] = [];

    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((f, i) => formData.append(`file_${i}`, f));
      const uploadRes = await uploadProductImages(formData);
      if ("error" in uploadRes) {
        setError(uploadRes.error);
        setSubmitting(false);
        return;
      }
      imageUrls = uploadRes.urls;
    }

    const res = await createProduct({
      name,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock) || 0,
      images: imageUrls,
      categoryName,
    });

    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const formInputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  if (submitted) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="neu-flat p-10 text-center">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">Product Submitted for Review</h2>
            <p className="text-sm text-text/60 mb-6">
              Your product has been submitted and is pending admin approval. You will be notified once it&apos;s reviewed.
            </p>
            <button
              onClick={() => router.push("/sell/products")}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            >
              View My Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-8">Add Product</h1>

        <div className="neu-flat p-6 md:p-8 space-y-6">
          <div>
            <label className="text-sm text-text/70 mb-1 block">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formInputClass}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${formInputClass} resize-none h-24`}
              placeholder="Describe your product"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text/70 mb-1 block">Price (৳) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={formInputClass}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm text-text/70 mb-1 block">Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={formInputClass}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Category *</label>
            <select
              value={parentId}
              onChange={(e) => { setParentId(e.target.value); setCategory(""); }}
              className={`${formInputClass} appearance-none`}
            >
              <option value="">Select category</option>
              {normalCats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {parentId && (
            <div>
              <label className="text-sm text-text/70 mb-1 block">Subcategory</label>
              {children.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${formInputClass} appearance-none`}
                >
                  <option value="">Select subcategory</option>
                  {selectedParent && (
                    <option value={selectedParent.name}>
                      Use {selectedParent.name} directly
                    </option>
                  )}
                  {children.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-text/50 mt-1">
                  This category has no subcategories — it will be used directly.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm text-text/70 mb-1 block">Images</label>
            <div
              ref={dragRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center w-full h-36 neu-pressed bg-surface rounded-xl cursor-pointer hover:brightness-110 transition-all border-2 border-dashed border-text/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-text/30 mb-2" />
              <p className="text-sm text-text/30">Drop images here or click to upload</p>
              <p className="text-xs text-text/20 mt-1">PNG, JPG up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden neu-flat group">
                    <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="96px" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {submitting ? "Submitting…" : "Submit for Review"}
          </button>
        </div>
      </div>
    </section>
  );
}
