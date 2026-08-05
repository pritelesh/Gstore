"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, CheckCircle } from "lucide-react";
import { getCategories, createProduct } from "@/lib/actions/seller";
import { uploadProductImages } from "@/lib/actions/upload";

export default function SellerAddProductPage() {
  const [categories, setCategories] = useState<
    { id: string; name: string; parent_id: string | null }[]
  >([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [parentId, setParentId] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("physical");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
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

  const parents = categories.filter((c) => !c.parent_id);
  const selectedParent = parents.find((p) => p.id === parentId);
  const children = categories.filter((c) => c.parent_id === parentId);
  const selectedCategoryName =
    category || (selectedParent ? selectedParent.name : "") || "";

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
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

    const parseList = (raw: string) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const sizeList = parseList(sizes);
    const colorList = parseList(colors);

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
      sizes: sizeList.length > 0 ? sizeList : undefined,
      colors: colorList.length > 0 ? colorList : undefined,
    });

    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] shadow-[inset_4px_4px_8px_#1a2354,inset_-4px_-4px_8px_#3849ae]";

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#293681] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
          <h2 className="text-xl font-bold text-[#FAFFC4] mb-2">
            Product Submitted for Review
          </h2>
          <p className="text-sm text-[#FAFFC4]/60 mb-6">
            Your product is pending approval. You will be notified once it&apos;s
            reviewed by an admin.
          </p>
          <a
            href="/seller/products"
            className="inline-block px-6 py-3 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors"
          >
            View My Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#293681] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FAFFC4] mb-8">Add Product</h1>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 space-y-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none h-24`}
              placeholder="Describe your product"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
                Price (৳) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
                Discount Price (optional)
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className={inputClass}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
                Product Type
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Category *
            </label>
            <select
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                setCategory("");
              }}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select category</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {parentId && (
            <div>
              <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
                Subcategory {children.length > 0 ? "" : "(optional)"}
              </label>
              {children.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select subcategory</option>
                  {selectedParent && (
                    <option value={selectedParent.name}>
                      Use {selectedParent.name} directly
                    </option>
                  )}
                  {children.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-[#FAFFC4]/50 mt-1">
                  This category has no subcategories — it will be used directly.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Sizes (optional)
            </label>
            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className={inputClass}
              placeholder="e.g. S, M, L, XL or 6, 7, 8, 9"
            />
            <p className="text-xs text-[#FAFFC4]/40 mt-1">
              Comma-separated list of available sizes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Colors (optional)
            </label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className={inputClass}
              placeholder="e.g. Red, Blue, Black or Navy Blue, Maroon"
            />
            <p className="text-xs text-[#FAFFC4]/40 mt-1">
              Comma-separated list of available colors
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4]/70 mb-1">
              Images
            </label>
            <div
              ref={dragRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center w-full h-36 rounded-xl bg-[#293681] border-2 border-dashed border-[#FAFFC4]/20 cursor-pointer hover:border-[#FE7F2D]/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-[#FAFFC4]/30 mb-2" />
              <p className="text-sm text-[#FAFFC4]/30">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-[#FAFFC4]/20 mt-1">PNG, JPG up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#1e2860] group"
                  >
                    <Image
                      src={src}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
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
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_12px_#1a2354,-6px_-6px_12px_#3849ae]"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
