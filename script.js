/* ==========================================================
   PROJET : ND-FLIX-TOK (PRO CLOUD)
   AUTEUR : N'DIAYE ADAMA | PROTOCOLE ND-Z
   ========================================================== */

// CONFIGURATION DES CLÉS (Tes données injectées)
const SB_URL = "https://ghzyltvbjukqgpqoqake.supabase.co";
const SB_KEY = "sb_publishable_7B0X4xXrcBpxYgVanpj-qA_oGghSLcd";
const CLOUDINARY_NAME = "dto0c85yg";

const supabase = exports.supabase.createClient(SB_URL, SB_KEY);

// 1. CHARGEMENT DES VIDÉOS DEPUIS SUPABASE
async function fetchVideos() {
    const { data, error } = await supabase
        .from('videos') // Assure-toi d'avoir une table 'videos' sur ton dashboard Supabase
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error("Erreur ND-DB:", error);
    renderFeed(data);
}

// 2. RENDU DU FEED
function renderFeed(videos) {
    const feed = document.getElementById('video-feed');
    feed.innerHTML = videos.map(vid => `
        <div class="video-card">
            <video loop playsinline muted src="${vid.url}"></video>
            <div class="side-actions">
                <div class="action-item">❤️<span>${vid.likes || 0}</span></div>
                <div class="action-item">💬</div>
                <div class="action-item">🔗</div>
            </div>
            <div class="video-info">
                <h3>@${vid.username || 'User_ND'}</h3>
                <p>${vid.description || 'Projet ND-FLIX-TOK'}</p>
            </div>
        </div>
    `).join('');
    
    initObserver();
}

// 3. WIDGET D'UPLOAD CLOUDINARY
const uploadBtn = document.getElementById('upload-widget-btn');
const myWidget = cloudinary.createUploadWidget({
    cloudName: CLOUDINARY_NAME, 
    uploadPreset: 'ml_default' // Crée un 'unsigned preset' dans tes réglages Cloudinary
}, (error, result) => { 
    if (!error && result && result.event === "success") { 
        saveVideoToSupabase(result.info.secure_url);
    }
});

uploadBtn.onclick = () => myWidget.open();

// 4. ENREGISTREMENT DANS SUPABASE APRÈS UPLOAD
async function saveVideoToSupabase(videoUrl) {
    const { error } = await supabase
        .from('videos')
        .insert([{ url: videoUrl, username: 'N_DIAYE_ADAMA', description: 'Nouveau contenu ND-Z' }]);
    
    if (!error) location.reload();
}

// 5. AUTOPLAY AU SCROLL
function initObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target.querySelector('video');
            if (entry.isIntersecting) v.play();
            else v.pause();
        });
    }, { threshold: 0.7 });

    document.querySelectorAll('.video-card').forEach(card => observer.observe(card));
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', fetchVideos);
document.addEventListener('click', () => {
    document.querySelectorAll('video').forEach(v => v.muted = false);
}, { once: true });
