const sb = window.supabaseClient;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[m]));

let DATA = {
  projects: [],
  pricing: [],
  site: {}
};

function showPageFromHash(){
  const raw = location.hash.replace('#','').split('?')[0];

  const id = ['home','projects','pricing','about','contact'].includes(raw)
    ? raw
    : 'home';

  document.querySelectorAll('.page').forEach(x => {
    x.classList.toggle('active', x.id === id);
  });

  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle(
      'active',
      a.getAttribute('href') === '#'+id
    );
  });

  const nav = document.querySelector('nav');

  if(nav) {
    nav.classList.remove('open');
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


function projectCard(p){

  const imgs = [
    p.image,
    ...(p.gallery || [])
  ].filter(Boolean);

  const img = imgs[0]
    ? `<img src="${esc(imgs[0])}" alt="${esc(p.title)}" loading="lazy">`
    : `
      <div class="mock">
        <i></i>
        <i style="width:70%"></i>
        <i style="width:90%"></i>
        <i style="width:55%"></i>
      </div>
    `;

  return `
    <article class="card projectCard" data-project="${esc(p.id)}">

      <div class="thumb ${p.theme || 'blue'}">

        ${img}

        ${
          imgs.length > 1
          ? `<span class="photoCount">▧ ${imgs.length} images</span>`
          : ''
        }

      </div>

      <div class="body">

        <h3>${esc(p.title)}</h3>

        <p>${esc(p.description)}</p>

        <div class="tags">

          ${(p.tags || []).map(x => `
            <span>${esc(x)}</span>
          `).join('')}

        </div>

        <div class="projectActions">

          <button
            class="projectView"
            data-project="${esc(p.id)}"
          >
            View Gallery →
          </button>

          ${
            p.link
            ? `
              <a
                class="projectLink"
                href="${esc(p.link)}"
                target="_blank"
                rel="noopener"
              >
                Live Website ↗
              </a>
            `
            : ''
          }

        </div>

      </div>

    </article>
  `;
}


function renderProjects(filter = 'All'){

  const list = DATA.projects || [];

  const featured = list
    .filter(p => p.featured)
    .slice(0,4);

  const home = $('#homeProjects');
  const all = $('#allProjects');

  if(home){

    home.innerHTML =
      featured.map(projectCard).join('')
      ||
      '<p class="empty">No featured projects yet.</p>';

  }

  if(all){

    all.innerHTML =
      list
        .filter(p =>
          filter === 'All' ||
          p.type === filter ||
          (p.tags || []).includes(filter)
        )
        .map(projectCard)
        .join('')
      ||
      '<p class="empty">No projects found.</p>';

  }

}


function renderPricing(){

  const el = $('#pricingGrid');

  if(!el) return;

  el.innerHTML =
    (DATA.pricing || [])
      .filter(p => p.active !== false)
      .map(p => `

        <article class="price ${p.popular ? 'pop' : ''}">

          ${
            p.popular
            ? '<label>MOST POPULAR</label>'
            : ''
          }

          <h3>${esc(p.name)}</h3>

          <small>
            ${esc(p.description || '')}
          </small>

          <strong>
            ${esc(p.price)}
          </strong>

          <ul>

            ${(p.features || []).map(x => `
              <li>${esc(x)}</li>
            `).join('')}

          </ul>

          <a
            class="btn ${p.popular ? 'primary' : 'outline'}"
            href="#contact"
          >
            Get Started
          </a>

        </article>

      `)
      .join('')
    ||
    '<p class="empty">No pricing plans available.</p>';

}


function renderSite(){

  const s = DATA.site || {};

  document.title =
    `${s.brand || 'Ambesh.dev'} — ${s.tagline || ''}`;

  const set = (id,v) => {

    const e = $('#'+id);

    if(e) {
      e.textContent = v ?? '';
    }

  };

  set('brandName', s.brand);
  set('brandTagline', s.tagline);
  set('heroText', s.hero_text);
  set('aboutText', s.about);

  [
    ['heroProjects', s.projects_completed],
    ['heroClients', s.clients],
    ['statProjects', s.projects_completed],
    ['statClients', s.clients],
    ['statRating', s.rating],
    ['statExperience', s.experience],
    ['contactEmail', s.email],
    ['contactPhone', s.phone],
    ['contactLocation', s.location],
    ['contactResponse', s.response]
  ].forEach(([id,v]) => set(id,v));

  [
    ['linkedin', s.linkedin],
    ['instagram', s.instagram],
    ['youtube', s.youtube],
    ['github', s.github]
  ].forEach(([id,url]) => {

    const e = $('#'+id);

    if(e) {
      e.href =
        url && url !== '#'
        ? url
        : '#';
    }

  });

  const h = $('#heroTitle');

  if(h){

    const title = esc(
      s.hero_title ||
      'Turning Ideas Into Digital Reality.'
    );

    h.innerHTML =
      title.replace(
        'Digital Reality.',
        '<em>Digital Reality.</em>'
      );

  }

}


function openProject(id){

  const p =
    DATA.projects.find(x => x.id === id);

  if(!p) return;

  $('#projectModalTitle').textContent =
    p.title;

  $('#projectModalDesc').textContent =
    p.description || '';

  $('#projectModalTags').innerHTML =
    (p.tags || [])
      .map(x => `
        <span>${esc(x)}</span>
      `)
      .join('');

  const live = $('#projectLive');

  if(p.link){

    live.href = p.link;
    live.style.display = 'inline-flex';

  }else{

    live.style.display = 'none';

  }

  const imgs = [
    p.image,
    ...(p.gallery || [])
  ].filter(Boolean);

  $('#projectGallery').innerHTML =
    imgs.length
    ?
    imgs.map((u,i) => `
      <button
        class="galleryItem"
        data-img="${esc(u)}"
      >

        <img
          src="${esc(u)}"
          alt="${esc(p.title)} screenshot ${i+1}"
          loading="lazy"
        >

      </button>
    `).join('')
    :
    '<p class="galleryEmpty">No screenshots uploaded for this project.</p>';

  $('#projectModal').classList.add('show');

  $('#projectModal')
    .setAttribute('aria-hidden','false');

}


async function load(){

  if(!sb){

    console.error(
      'Supabase is not configured. Check supabase-config.js.'
    );

    return;
  }

  try{

    const [
      pr,
      pc,
      st
    ] = await Promise.all([

      sb
        .from('projects')
        .select('*')
        .order('created_at',{
          ascending:false
        }),

      sb
        .from('pricing')
        .select('*')
        .eq('active',true)
        .order('created_at'),

      sb
        .from('site_settings')
        .select('*')
        .eq('id',1)
        .maybeSingle()

    ]);

    if(pr.error)
      console.error('Projects:',pr.error);

    if(pc.error)
      console.error('Pricing:',pc.error);

    if(st.error)
      console.error('Settings:',st.error);

    DATA.projects =
      pr.data || [];

    DATA.pricing =
      pc.data || [];

    DATA.site =
      st.data || {};

    renderSite();

    renderProjects();

    renderPricing();

    showPageFromHash();

  }
  catch(err){

    console.error(
      'Public data load failed:',
      err
    );

    showPageFromHash();

  }

}


document.addEventListener('click', e => {

  const navLink =
    e.target.closest('nav a');

  if(navLink){
    showPageFromHash();
  }


  const p =
    e.target.closest('[data-project]');

  if(p){
    openProject(
      p.dataset.project
    );
  }


  const g =
    e.target.closest('[data-img]');

  if(g){

    $('#lightboxImg').src =
      g.dataset.img;

    $('#lightbox')
      .classList.add('show');

  }


  if(
    e.target.closest(
      '[data-close-project]'
    )
  ){

    $('#projectModal')
      .classList.remove('show');

  }


  if(
    e.target.closest(
      '[data-close-lightbox]'
    )
  ){

    $('#lightbox')
      .classList.remove('show');

  }


  if(e.target.id === 'themeBtn'){

    document.body.classList.toggle('dark');

    const dark =
      document.body.classList.contains('dark');

    localStorage.setItem(
      'ambesh_theme',
      dark
      ? 'dark'
      : 'light'
    );

    e.target.textContent =
      dark
      ? '☀'
      : '☾';

  }


  if(e.target.matches('[data-f]')){

    document
      .querySelectorAll('[data-f]')
      .forEach(x =>
        x.classList.remove('active')
      );

    e.target.classList.add('active');

    renderProjects(
      e.target.dataset.f
    );

  }


  if(e.target.id === 'menu'){

    document
      .querySelector('nav')
      ?.classList.toggle('open');

  }

});


window.addEventListener(
  'hashchange',
  showPageFromHash
);


$('#form')?.addEventListener(
  'submit',
  async e => {

    e.preventDefault();

    if(!sb){

      $('#note').textContent =
        'Service is not configured.';

      return;

    }

    const f =
      new FormData(e.target);

    const r =
      await sb
        .from('enquiries')
        .insert({
          name: f.get('name'),
          email: f.get('email'),
          type: f.get('type'),
          message: f.get('message')
        });

    $('#note').textContent =
      r.error
      ? 'Could not send. Please try again.'
      : 'Thank you! Your enquiry has been received.';

    if(!r.error)
      e.target.reset();

  }
);


const saved =
  localStorage.getItem(
    'ambesh_theme'
  );

if(saved === 'dark'){

  document.body.classList.add('dark');

  if($('#themeBtn'))
    $('#themeBtn').textContent = '☀';

}


showPageFromHash();

load();