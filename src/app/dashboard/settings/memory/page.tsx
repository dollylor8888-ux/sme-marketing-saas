"use client";

import { useState } from "react";
import { Save, Loader2, Plus, Trash2, Check } from "lucide-react";

type Tab = "brand" | "products" | "preferences";

interface BrandMemory {
  name: string;
  tagline: string;
  voice: string;
  avoid: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Preferences {
  defaultTone: string;
  defaultLanguage: string;
  autoSave: boolean;
}

export default function MemorySettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("brand");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [brand, setBrand] = useState<BrandMemory>({
    name: "SoundPro",
    tagline: "Feel the Music",
    voice: "Friendly, professional, conversational",
    avoid: "Technical jargon, hard sell tactics"
  });

  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Wireless Earbuds Pro", description: "Premium audio experience", category: "Electronics" },
    { id: "2", name: "Bluetooth Speaker", description: "Portable, powerful sound", category: "Electronics" }
  ]);

  const [preferences, setPreferences] = useState<Preferences>({
    defaultTone: "Professional",
    defaultLanguage: "English",
    autoSave: true
  });

  const [newProduct, setNewProduct] = useState({ name: "", description: "", category: "" });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addProduct = () => {
    if (!newProduct.name) return;
    setProducts([...products, { id: Date.now().toString(), ...newProduct }]);
    setNewProduct({ name: "", description: "", category: "" });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "brand", label: "Brand", icon: "🏢" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "preferences", label: "Preferences", icon: "⚙️" }
  ];

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Memory Settings</h1>
        <p className="text-slate-400 text-sm lg:text-base">Configure your brand knowledge base</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Brand Tab */}
      {activeTab === "brand" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Brand Name</label>
            <input
              type="text"
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Tagline</label>
            <input
              type="text"
              value={brand.tagline}
              onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Brand Voice</label>
            <textarea
              value={brand.voice}
              onChange={(e) => setBrand({ ...brand, voice: e.target.value })}
              rows={3}
              placeholder="e.g., Friendly, professional, conversational..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            />
            <p className="text-slate-500 text-xs mt-2">Describe your brand&apos;s tone and personality</p>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Avoid Words</label>
            <textarea
              value={brand.avoid}
              onChange={(e) => setBrand({ ...brand, avoid: e.target.value })}
              rows={3}
              placeholder="e.g., Technical jargon, pushy sales language..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            />
            <p className="text-slate-500 text-xs mt-2">Words/phrases the AI should avoid</p>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Add New Product */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Add Product
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Product name"
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="Category"
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Brief description"
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>
            <button
              onClick={addProduct}
              disabled={!newProduct.name}
              className="mt-3 w-full sm:w-auto px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition disabled:opacity-50 text-sm"
            >
              + Add
            </button>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm lg:text-base">{product.name}</div>
                  <div className="text-slate-400 text-xs lg:text-sm">{product.category}</div>
                  <div className="text-slate-500 text-xs mt-1">{product.description}</div>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-6 space-y-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Default Tone</label>
            <select
              value={preferences.defaultTone}
              onChange={(e) => setPreferences({ ...preferences, defaultTone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Casual</option>
              <option>Luxury</option>
              <option>Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Default Language</label>
            <select
              value={preferences.defaultLanguage}
              onChange={(e) => setPreferences({ ...preferences, defaultLanguage: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm lg:text-base"
            >
              <option>English</option>
              <option>Traditional Chinese</option>
              <option>Simplified Chinese</option>
              <option>Cantonese</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-300 text-sm font-medium">Auto-Save History</div>
              <div className="text-slate-500 text-xs">Automatically save all generations</div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, autoSave: !preferences.autoSave })}
              className={`w-12 h-6 rounded-full transition ${
                preferences.autoSave ? "bg-cyan-500" : "bg-slate-600"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                preferences.autoSave ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 sticky bottom-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
