import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "One Size"];

export const COLOR_OPTIONS = [
  { name: "Black", hex: "#18181B" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Charcoal", hex: "#3F3F46" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Navy", hex: "#1E293B" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Red", hex: "#B91C1C" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Emerald", hex: "#065F46" },
  { name: "Brown", hex: "#78350F" },
  { name: "Cream", hex: "#FBF7EE" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Sand", hex: "#D4B996" },
  { name: "Champagne", hex: "#F7E6BD" }
];

const cleanValues = (values) => [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];

const ProductVariantFields = ({ sizes = [], colors = [], onChange }) => {
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");

  const toggleValue = (field, value) => {
    const selectedValues = cleanValues(field === "sizes" ? sizes : colors);
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange(field, nextValues);
  };

  const addCustomValue = (field) => {
    const value = (field === "sizes" ? customSize : customColor).trim();
    if (!value) return;

    const selectedValues = cleanValues(field === "sizes" ? sizes : colors);
    if (!selectedValues.some((item) => item.toLowerCase() === value.toLowerCase())) {
      onChange(field, [...selectedValues, value]);
    }

    if (field === "sizes") setCustomSize("");
    else setCustomColor("");
  };

  const renderSelected = (field, values) => (
    <div className="mt-4 min-h-10 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 p-2.5">
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 shadow-sm">
              {field === "colors" && <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: COLOR_OPTIONS.find((color) => color.name === value)?.hex || value }} />}
              {value}
              <button type="button" onClick={() => toggleValue(field, value)} aria-label={`Remove ${value}`} className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer">
                <FiX aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="px-1 py-0.5 text-xs text-stone-400">No options selected yet.</p>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/50 p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">Variants shown to customers</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">Only the sizes and colours selected here appear on this product’s detail page and in the shop filters.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Available sizes <span className="text-rose-500">*</span></label>
            <span className="text-[11px] text-stone-400">{sizes.length} selected</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {SIZE_OPTIONS.map((size) => (
              <button key={size} type="button" onClick={() => toggleValue("sizes", size)} className={`min-h-10 rounded-lg border px-2 text-xs font-medium transition-colors cursor-pointer ${sizes.includes(size) ? "border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500"}`}>
                {size}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={customSize} onChange={(event) => setCustomSize(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomValue("sizes"); } }} placeholder="Custom size" className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-100" />
            <button type="button" onClick={() => addCustomValue("sizes")} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
              <FiPlus /> Add
            </button>
          </div>
          {renderSelected("sizes", sizes)}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">Available colours <span className="text-rose-500">*</span></label>
            <span className="text-[11px] text-stone-400">{colors.length} selected</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button key={color.name} type="button" onClick={() => toggleValue("colors", color.name)} aria-pressed={colors.includes(color.name)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer ${colors.includes(color.name) ? "border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500"}`}>
                <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                {color.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={customColor} onChange={(event) => setCustomColor(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomValue("colors"); } }} placeholder="Custom colour" className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-100" />
            <button type="button" onClick={() => addCustomValue("colors")} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
              <FiPlus /> Add
            </button>
          </div>
          {renderSelected("colors", colors)}
        </div>
      </div>
    </section>
  );
};

export default ProductVariantFields;
