// 1. Initialize Supabase Connection
// Make sure your values are wrapped perfectly inside " " quotes
const SUPABASE_URL = "https://qtffdxfxdgzxyqnemdql.supabase.co/rest/v1/";; 
const SUPABASE_KEY = "sb_publishable_GTTl5uiVe9cbQhMKF16ANw_mia7cyDQ"; 

// This row reads the values above safely
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global state variables
let allAssets = [];
let activeCategory = 'All';

// 2. Fetch Categories and Resources when the page loads
async function initializeApp() {
    await fetchCategories();
    await fetchAssets();
}

// Fetch filter tags from Supabase
async function fetchCategories() {
    const { data, error } = await _supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) return console.error(error);
    
    const container = document.getElementById('category-tags');
    if(container) {
        container.innerHTML = data.map(cat => `
            <button onclick="filterCategory('${cat.name}')" id="btn-${cat.name}" class="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer">
                ${cat.name}
            </button>
        `).join('');
        updateActiveFilterUI();
    }
}

// Fetch all elements from the assets table
async function fetchAssets() {
    const { data, error } = await _supabase.from('assets').select('*').order('id', { ascending: false });
    if (error) {
        document.getElementById('assets-grid').innerHTML = `<div class="text-red-500 col-span-full text-center">Failed to fetch database data.</div>`;
        return;
    }
    allAssets = data;
    renderAssets(allAssets);
}

// 3. Render HTML Layout Cards dynamically
function renderAssets(items) {
    const grid = document.getElementById('assets-grid');
    if (!grid) return;
    
    if (items.length === 0) {
        grid.innerHTML = `<div class="text-center col-span-full py-12 text-gray-400">No design assets found. Add a row in your Supabase dashboard!</div>`;
        return;
    }

    grid.innerHTML = items.map(asset => `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <img src="${asset.preview_image_url}" alt="${asset.title}" class="w-full h-48 object-cover bg-gray-50">
            <div class="p-5">
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600">${asset.category_name}</span>
                <h3 class="font-bold text-lg text-gray-900 mt-1 mb-2">${asset.title}</h3>
                <p class="text-gray-500 text-sm mb-4">${asset.description || 'Premium design asset template.'}</p>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span class="text-xs text-gray-400 font-medium">📥 ${asset.download_count || 0} Downloads</span>
                    <button onclick="triggerDownload(${asset.id}, '${asset.download_file_url}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition cursor-pointer">
                        Download Free
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. Client Filtering and Search Logic
function filterCategory(category) {
    activeCategory = category;
    updateActiveFilterUI();
    applyFilters();
}

function handleSearch() {
    applyFilters();
}

function applyFilters() {
    const searchBar = document.getElementById('search-bar');
    const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
    let filtered = allAssets;

    if (activeCategory !== 'All') {
        filtered = filtered.filter(a => a.category_name === activeCategory);
    }
    if (searchTerm) {
        filtered = filtered.filter(a => a.title.toLowerCase().includes(searchTerm) || a.description?.toLowerCase().includes(searchTerm));
    }
    renderAssets(filtered);
}

function updateActiveFilterUI() {
    document.querySelectorAll('#category-tags button').forEach(btn => {
        btn.className = "px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer";
    });
    const activeBtn = document.getElementById(`btn-${activeCategory}`);
    if (activeBtn) {
        activeBtn.className = "px-4 py-1.5 rounded-full bg-blue-600 text-white border border-blue-600 cursor-pointer";
    }
}

// 5. Download Trigger & Analytics Counter Incrementor
async function triggerDownload(id, url) {
    window.open(url, '_blank');
    const targetAsset = allAssets.find(a => a.id === id);
    if (targetAsset) {
        const currentCount = targetAsset.download_count || 0;
        await _supabase.from('assets').update({ download_count: currentCount + 1 }).eq('id', id);
        fetchAssets(); 
    }
}

// Boot up everything seamlessly
document.addEventListener("DOMContentLoaded", initializeApp);
